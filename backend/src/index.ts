import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import pinoHttp from 'pino-http'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import authRouter from '@/routes/auth'
import statsRouter from '@/routes/stats'
import { startDailySyncJob } from '@/jobs/dailySync'

const app = express()
const PORT = process.env.PORT ?? 8000

// Mark any RUNNING syncs as FAILED on startup (handles server crash / restart mid-sync)
prisma.syncLog
  .updateMany({
    where: { status: 'RUNNING' },
    data: { status: 'FAILED', completedAt: new Date(), errorDetails: 'Server restarted mid-sync' },
  })
  .then(({ count }) => {
    if (count > 0) logger.warn({ count }, 'cleared stale RUNNING sync logs on startup')
  })
  .catch((err) => logger.error({ err }, 'failed to clear stale sync logs'))

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }))

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/auth', authRouter)
app.use('/api', statsRouter)

app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV ?? 'development' }, 'server started')
  startDailySyncJob()
})

export default app
