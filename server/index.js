import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'db.json')

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return { users: [], tasks: [] }
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

app.get('/api/data', (req, res) => {
  res.json(readDb())
})

app.post('/api/data', (req, res) => {
  const { users, tasks } = req.body
  if (!Array.isArray(users) || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'Invalid data' })
  }
  writeDb({ users, tasks })
  res.json({ ok: true })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`API server: http://localhost:${PORT}`)
})
