import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import pinoHttp from 'pino-http'
import { logger } from '@/lib/logger'
import authRouter from '@/routes/auth'
import statsRouter from '@/routes/stats'

const app = express()
const PORT = process.env.PORT ?? 8000

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
})

export default app
