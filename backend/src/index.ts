import 'dotenv/config'
import express from 'express'
import cors from 'cors'

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

// Routes will be mounted here per phase

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT} (${process.env.NODE_ENV ?? 'development'})`)
})

export default app
