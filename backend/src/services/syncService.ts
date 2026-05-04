import axios, { AxiosInstance } from 'axios'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const PER_REPO_TIMEOUT_MS = 90_000  // 90s per repo — skip if GitHub hangs
const TOTAL_SYNC_TIMEOUT_MS = 15 * 60_000  // 15min total — mark FAILED, unblock future syncs

// ── GitHub API types ──────────────────────────────────────────────────────────

interface GHRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  default_branch: string
  stargazers_count: number
  forks_count: number
  open_issues_count: number
}

interface GHCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  author: { login: string } | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ghClient(token: string): AxiosInstance {
  return axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    timeout: 30_000,
  })
}

async function fetchPages<T>(
  client: AxiosInstance,
  path: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const results: T[] = []
  let page = 1
  while (true) {
    const { data } = await client.get<T[]>(path, {
      params: { per_page: 100, page, ...params },
    })
    if (!Array.isArray(data) || data.length === 0) break
    results.push(...data)
    if (data.length < 100) break
    page++
  }
  return results
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms)
    ),
  ])
}

// ── Per-repo sync (isolated so timeout wraps everything cleanly) ───────────────

async function syncRepo(
  gh: AxiosInstance,
  r: GHRepo,
  repoId: string,
  userId: string,
  username: string,
  oneYearAgo: Date
): Promise<void> {
  const dbRepo = await prisma.repository.findUnique({
    where: { id: repoId },
    select: { lastSyncedAt: true },
  })
  const since = (dbRepo?.lastSyncedAt ?? oneYearAgo).toISOString()

  const ghCommits = await fetchPages<GHCommit>(gh, `/repos/${r.full_name}/commits`, {
    author: username,
    since,
  })

  if (ghCommits.length > 0) {
    await prisma.commit.createMany({
      data: ghCommits.map((c) => ({
        userId,
        repositoryId: repoId,
        sha: c.sha,
        message: c.commit.message.slice(0, 2000),
        authorName: c.commit.author.name,
        authorEmail: c.commit.author.email,
        authorLogin: c.author?.login ?? username,
        committedAt: new Date(c.commit.author.date),
      })),
      skipDuplicates: true,
    })
  }

  const { data: langs } = await gh.get<Record<string, number>>(
    `/repos/${r.full_name}/languages`
  )
  const totalBytes = Object.values(langs).reduce((s, b) => s + b, 0)

  if (totalBytes > 0) {
    await prisma.repoLanguage.deleteMany({ where: { repositoryId: repoId } })
    await prisma.repoLanguage.createMany({
      data: Object.entries(langs).map(([language, bytes]) => ({
        repositoryId: repoId,
        language,
        bytes: BigInt(bytes),
        percentage: Math.round((bytes / totalBytes) * 1000) / 10,
      })),
    })
  }

  await prisma.repository.update({
    where: { id: repoId },
    data: { lastSyncedAt: new Date() },
  })
}

// ── Core sync ─────────────────────────────────────────────────────────────────

export async function syncUser(userId: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, username: true, accessToken: true },
  })

  if (!user.accessToken) throw new Error('No access token for user')

  const log = await prisma.syncLog.create({
    data: { userId, status: 'RUNNING', startedAt: new Date() },
  })

  const gh = ghClient(user.accessToken)
  const deadline = Date.now() + TOTAL_SYNC_TIMEOUT_MS
  let totalTimeoutFired = false

  // Total sync timeout — marks log FAILED so future syncs aren't blocked
  const totalTimer = setTimeout(async () => {
    totalTimeoutFired = true
    logger.warn({ userId }, 'total sync timeout (15min), marking FAILED')
    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errorDetails: 'Sync exceeded 15-minute limit. Partial data saved; next sync resumes from last completed repo.',
      },
    })
  }, TOTAL_SYNC_TIMEOUT_MS)

  try {
    // 1 — fetch all repos
    const ghRepos = await fetchPages<GHRepo>(gh, '/user/repos', {
      affiliation: 'owner,collaborator,organization_member',
      sort: 'pushed',
    })

    // 2 — upsert repos, build internal id map
    const repoIdMap = new Map<number, string>()

    for (const r of ghRepos) {
      const repo = await prisma.repository.upsert({
        where: { githubRepoId: r.id },
        update: {
          name: r.name,
          fullName: r.full_name,
          description: r.description,
          isPrivate: r.private,
          defaultBranch: r.default_branch,
          stars: r.stargazers_count,
          forks: r.forks_count,
          openIssues: r.open_issues_count,
        },
        create: {
          userId,
          githubRepoId: r.id,
          name: r.name,
          fullName: r.full_name,
          description: r.description,
          isPrivate: r.private,
          defaultBranch: r.default_branch,
          stars: r.stargazers_count,
          forks: r.forks_count,
          openIssues: r.open_issues_count,
        },
        select: { id: true },
      })
      repoIdMap.set(r.id, repo.id)
    }

    // 3 — per-repo: commits + languages
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    let completed = 0
    let skipped = 0

    for (const r of ghRepos) {
      // Stop if total timeout already fired
      if (totalTimeoutFired) break

      // Stop if we're past deadline (timer may not have fired yet on slow event loop)
      if (Date.now() > deadline) break

      const repoId = repoIdMap.get(r.id)!

      try {
        await withTimeout(
          syncRepo(gh, r, repoId, userId, user.username, oneYearAgo),
          PER_REPO_TIMEOUT_MS
        )
        completed++
      } catch (repoErr) {
        const status = axios.isAxiosError(repoErr) ? repoErr.response?.status : null
        // 409 = empty repo, 404 = no access — expected, skip silently
        if (status === 409 || status === 404) { skipped++; continue }

        const msg = repoErr instanceof Error ? repoErr.message : String(repoErr)
        if (msg === 'TIMEOUT') {
          logger.warn({ repo: r.full_name }, 'repo sync timed out (90s), skipping — will retry next sync')
        } else {
          logger.warn({ repo: r.full_name, err: msg }, 'repo sync failed')
        }
        skipped++
      }
    }

    // Don't overwrite FAILED status set by total timeout
    if (!totalTimeoutFired) {
      clearTimeout(totalTimer)

      await prisma.user.update({
        where: { id: userId },
        data: { lastSynced: new Date() },
      })

      await prisma.syncLog.update({
        where: { id: log.id },
        data: {
          status: 'SUCCESS',
          completedAt: new Date(),
          message: `Synced ${completed} repos (${skipped} skipped)`,
        },
      })

      logger.info({ userId, completed, skipped, total: ghRepos.length }, 'sync complete')
    }
  } catch (err) {
    clearTimeout(totalTimer)
    if (!totalTimeoutFired) {
      const msg = err instanceof Error ? err.message : String(err)
      await prisma.syncLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', completedAt: new Date(), errorDetails: msg },
      })
    }
    throw err
  }
}
