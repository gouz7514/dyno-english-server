require('dotenv').config()

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import appRoute from './router/index'
import { Client } from 'pg'

declare global {
  namespace Express {
    interface Request {
      dbClient: Client
    }
  }
}

const app = express()

const dbClient = new Client({
  user: process.env.POSTGRESS_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PW,
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
})

dbClient.connect()

app.use((req: Request, res: Response, next: NextFunction) => {
  req.dbClient = dbClient
  next()
})

app.use(express.json())
app.use(cors())
app.use('/api', appRoute)

app.get('/welcome', (req: Request, res: Response, next: NextFunction) => {
  res.send('welcome!')
})

app.listen('1234', () => {
  console.log(`
  ################################################
  🛡️  Server listening on port: 1234🛡️
  ################################################
`)
})