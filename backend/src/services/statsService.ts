import { prisma } from '@/lib/prisma'

export interface UserStats {
  overview: {
    totalCommits30d: number
    activeDays30d: number
    currentStreak: number
    longestStreak: number
  }
  heatmap: Array<{ date: string; count: number }>
  languages: Array<{ language: string; bytes: number; percentage: number }>
  topRepos: Array<{ name: string; fullName: string; commitCount: number }>
  comparison: {
    thisMonth: { commits: number; activeDays: number }
    lastMonth: { commits: number; activeDays: number }
  }
  activeTime: Array<{ weekday: number; hour: number; count: number }>
  lastSyncedAt: string | null
  lastSyncStatus: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING' | null
  lastSyncError: string | null
}

export async function buildUserStats(userId: string): Promise<UserStats> {
  const now = new Date()

  const startOf365 = new Date(now)
  startOf365.setDate(now.getDate() - 364)
  startOf365.setHours(0, 0, 0, 0)

  const startOf30 = new Date(now)
  startOf30.setDate(now.getDate() - 29)
  startOf30.setHours(0, 0, 0, 0)

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    commits365,
    commits30,
    commitsThisMonth,
    commitsLastMonth,
    topRepos,
    languages,
    lastSync,
    lastSyncAny,
  ] = await Promise.all([
    prisma.commit.findMany({
      where: { userId, committedAt: { gte: startOf365 } },
      select: { committedAt: true },
      orderBy: { committedAt: 'asc' },
    }),
    prisma.commit.findMany({
      where: { userId, committedAt: { gte: startOf30 } },
      select: { committedAt: true },
    }),
    prisma.commit.count({
      where: { userId, committedAt: { gte: thisMonthStart } },
    }),
    prisma.commit.count({
      where: { userId, committedAt: { gte: lastMonthStart, lt: lastMonthEnd } },
    }),
    prisma.commit.groupBy({
      by: ['repositoryId'],
      where: { userId, committedAt: { gte: startOf30 } },
      _count: { sha: true },
      orderBy: { _count: { sha: 'desc' } },
      take: 10,
    }),
    prisma.repoLanguage.findMany({
      where: { repository: { userId } },
      select: { language: true, bytes: true },
    }),
    prisma.syncLog.findFirst({
      where: { userId, status: 'SUCCESS' },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    }),
    prisma.syncLog.findFirst({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      select: { status: true, errorDetails: true },
    }),
  ])

  // heatmap — zero-filled 365 days
  const countByDate = new Map<string, number>()
  for (const c of commits365) {
    const key = c.committedAt.toISOString().slice(0, 10)
    countByDate.set(key, (countByDate.get(key) ?? 0) + 1)
  }
  const heatmap: { date: string; count: number }[] = []
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    heatmap.push({ date: key, count: countByDate.get(key) ?? 0 })
  }

  // streaks
  const activeDates = new Set(countByDate.keys())
  function streak(dates: Set<string>): { current: number; longest: number } {
    let run = 0
    let longest = 0
    let current = 0
    const today = now.toISOString().slice(0, 10)
    for (let i = 0; i <= 364; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      if (dates.has(key)) {
        run++
        if (i === 0 || (i === 1 && !dates.has(today))) current = run
      } else {
        if (i === 0) current = 0
        longest = Math.max(longest, run)
        run = 0
      }
    }
    longest = Math.max(longest, run)
    if (dates.has(today) && current === 0) current = run
    return { current, longest }
  }
  const { current: currentStreak, longest: longestStreak } = streak(activeDates)

  // 30d active days
  const activeDays30 = new Set(
    commits30.map((c) => c.committedAt.toISOString().slice(0, 10))
  ).size

  // active time grid
  const timeMap = new Map<string, number>()
  for (const c of commits365) {
    const d = c.committedAt
    const key = `${d.getDay()}-${d.getHours()}`
    timeMap.set(key, (timeMap.get(key) ?? 0) + 1)
  }
  const activeTime: { weekday: number; hour: number; count: number }[] = []
  for (let w = 0; w < 7; w++) {
    for (let h = 0; h < 24; h++) {
      activeTime.push({ weekday: w, hour: h, count: timeMap.get(`${w}-${h}`) ?? 0 })
    }
  }

  // languages
  const langMap = new Map<string, bigint>()
  for (const l of languages) {
    langMap.set(l.language, (langMap.get(l.language) ?? 0n) + l.bytes)
  }
  const totalBytes = [...langMap.values()].reduce((s, b) => s + b, 0n)
  const langStats = [...langMap.entries()]
    .map(([language, bytes]) => ({
      language,
      bytes: Number(bytes),
      percentage: totalBytes > 0n ? Math.round((Number(bytes) / Number(totalBytes)) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 8)

  // top repos
  const repoIds = topRepos.map((r) => r.repositoryId)
  const repoMeta = await prisma.repository.findMany({
    where: { id: { in: repoIds } },
    select: { id: true, name: true, fullName: true },
  })
  const metaMap = new Map(repoMeta.map((r) => [r.id, r]))
  const topRepoStats = topRepos.map((r) => ({
    name: metaMap.get(r.repositoryId)?.name ?? r.repositoryId,
    fullName: metaMap.get(r.repositoryId)?.fullName ?? r.repositoryId,
    commitCount: r._count.sha,
  }))

  // monthly active days
  const [commitsThisMonthDays, commitsLastMonthDays] = await Promise.all([
    prisma.commit.findMany({
      where: { userId, committedAt: { gte: thisMonthStart } },
      select: { committedAt: true },
    }),
    prisma.commit.findMany({
      where: { userId, committedAt: { gte: lastMonthStart, lt: lastMonthEnd } },
      select: { committedAt: true },
    }),
  ])
  const activeDaysThisMonth = new Set(
    commitsThisMonthDays.map((c) => c.committedAt.toISOString().slice(0, 10))
  ).size
  const activeDaysLastMonth = new Set(
    commitsLastMonthDays.map((c) => c.committedAt.toISOString().slice(0, 10))
  ).size

  return {
    overview: {
      totalCommits30d: commits30.length,
      activeDays30d: activeDays30,
      currentStreak,
      longestStreak,
    },
    heatmap,
    languages: langStats,
    topRepos: topRepoStats,
    comparison: {
      thisMonth: { commits: commitsThisMonth, activeDays: activeDaysThisMonth },
      lastMonth: { commits: commitsLastMonth, activeDays: activeDaysLastMonth },
    },
    activeTime,
    lastSyncedAt: lastSync?.completedAt?.toISOString() ?? null,
    lastSyncStatus: lastSyncAny?.status ?? null,
    lastSyncError: lastSyncAny?.errorDetails ?? null,
  }
}
