import { Router, Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/middleware/auth'
import { syncUser } from '@/services/syncService'
import { buildUserStats } from '@/services/statsService'
import { logger } from '@/lib/logger'

const router = Router()

// GET /api/dashboard/stats  (authenticated)
router.get('/dashboard/stats', requireAuth, async (req: Request, res: Response) => {
  const stats = await buildUserStats(req.user!.userId)
  res.json(stats)
})

// GET /api/u/:username  (public)
router.get('/u/:username', async (req: Request, res: Response) => {
  const user = await prisma.user.findFirst({
    where: { username: { equals: req.params.username, mode: 'insensitive' } },
    select: { id: true, username: true, displayName: true, avatarUrl: true },
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const stats = await buildUserStats(user.id)
  res.json({
    user: {
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
    stats,
  })
})

// POST /api/sync  (authenticated)
router.post('/sync', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId

  const running = await prisma.syncLog.findFirst({
    where: { userId, status: 'RUNNING' },
    select: { id: true, startedAt: true },
  })
  if (running) {
    res.status(409).json({ error: 'Sync already in progress', startedAt: running.startedAt })
    return
  }

  const lastSuccess = await prisma.syncLog.findFirst({
    where: { userId, status: 'SUCCESS' },
    orderBy: { completedAt: 'desc' },
    select: { completedAt: true },
  })
  if (lastSuccess?.completedAt) {
    const elapsed = Date.now() - lastSuccess.completedAt.getTime()
    if (elapsed < 5 * 60 * 1000) {
      const retryAfter = Math.ceil((5 * 60 * 1000 - elapsed) / 1000)
      res.setHeader('Retry-After', retryAfter)
      res.status(429).json({ error: 'Synced recently', retryAfterSeconds: retryAfter })
      return
    }
  }

  syncUser(userId).catch((err) => logger.error({ err, userId }, 'manual sync failed'))
  res.status(202).json({ ok: true, message: 'Sync started' })
})

export default router
