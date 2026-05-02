import { Router, Request, Response } from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/middleware/auth'
import { syncUser } from '@/services/syncService'
import { logger } from '@/lib/logger'

const router = Router()

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000'
const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = '7d'

router.get('/github', (_req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: 'read:user user:email repo',
    allow_signup: 'true',
  })
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`)
})

router.get('/github/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/auth/callback?error=missing_code`)
  }

  try {
    const tokenRes = await axios.post<{ access_token: string; error?: string }>(
      'https://github.com/login/oauth/access_token',
      { client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code },
      { headers: { Accept: 'application/json' } }
    )

    const accessToken = tokenRes.data.access_token
    if (!accessToken || tokenRes.data.error) {
      return res.redirect(`${FRONTEND_URL}/auth/callback?error=github_token_failed`)
    }

    const { data: ghUser } = await axios.get<{
      id: number
      login: string
      name: string | null
      email: string | null
      avatar_url: string
    }>('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
    })

    const user = await prisma.user.upsert({
      where: { githubId: ghUser.id },
      update: {
        username: ghUser.login,
        email: ghUser.email,
        avatarUrl: ghUser.avatar_url,
        displayName: ghUser.name,
        accessToken,
      },
      create: {
        githubId: ghUser.id,
        username: ghUser.login,
        email: ghUser.email,
        avatarUrl: ghUser.avatar_url,
        displayName: ghUser.name,
        accessToken,
      },
    })

    const token = jwt.sign(
      { userId: user.id, githubId: user.githubId, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
    // fire-and-forget — don't block redirect on sync
    syncUser(user.id).catch((err) => logger.error({ err }, 'initial sync failed'))

    const isProd = process.env.NODE_ENV === 'production'
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.redirect(`${FRONTEND_URL}/dashboard`)
  } catch (err) {
    logger.error({ err }, 'github callback error')
    return res.redirect(`${FRONTEND_URL}/auth/callback?error=server_error`)
  }
})

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      displayName: true,
      lastSynced: true,
      createdAt: true,
    },
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.json(user)
})

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token')
  res.json({ ok: true })
})

export default router
