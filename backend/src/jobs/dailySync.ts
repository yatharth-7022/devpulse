import cron from 'node-cron'
import { prisma } from '@/lib/prisma'
import { syncUser } from '@/services/syncService'
import { logger } from '@/lib/logger'

export function startDailySyncJob(): void {
  // 2 PM UTC daily
  cron.schedule('0 14 * * *', async () => {
    logger.info('daily sync job: started')

    const users = await prisma.user.findMany({
      where: { accessToken: { not: null } },
      select: { id: true, username: true, lastSynced: true },
    })

    logger.info({ userCount: users.length }, 'daily sync job: processing users')

    for (const user of users) {
      // Skip if a sync is already running for this user
      const running = await prisma.syncLog.findFirst({
        where: { userId: user.id, status: 'RUNNING' },
        select: { id: true },
      })
      if (running) {
        logger.info({ userId: user.id, username: user.username }, 'daily sync: skip — already running')
        continue
      }

      // Skip if synced within last 20 hours (guards against double-fire near schedule boundary)
      if (user.lastSynced) {
        const hoursSince = (Date.now() - new Date(user.lastSynced).getTime()) / (1000 * 60 * 60)
        if (hoursSince < 20) {
          logger.info({ userId: user.id, username: user.username, hoursSince: Math.round(hoursSince) }, 'daily sync: skip — synced recently')
          continue
        }
      }

      try {
        logger.info({ userId: user.id, username: user.username }, 'daily sync: syncing user')
        await syncUser(user.id)
        logger.info({ userId: user.id, username: user.username }, 'daily sync: user done')
      } catch (err) {
        logger.error({ userId: user.id, username: user.username, err }, 'daily sync: user failed')
        // Continue to next user — one failure must not block others
      }
    }

    logger.info('daily sync job: finished')
  })

  logger.info('daily sync job scheduled — 14:00 UTC daily')
}
