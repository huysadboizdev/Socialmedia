import type { Request, Response } from 'express'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import session from 'express-session'
import passport from 'passport'

import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import fs from 'fs'

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads')
}

// load GoogleStrategy (passport.use)
import './config/passportGoogle.js'

import userRouter from './routes/userRoute.js'
import adminRouter from './routes/adminRoute.js'
import googleRouter from './routes/authGoogle.js'

const app = express()

// middlewares
app.use(express.json())
app.use(cors())

// session login google
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? 'secret',
    resave: false,
    saveUninitialized: true
  })
)

// passport
app.use(passport.initialize())
app.use(passport.session())

// test root
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running with TypeScript!')
})

// Google OAuth routes
app.use('/', googleRouter)

// API routes
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)

const PORT = process.env.PORT ?? 4000

// connect services
await connectDB()
await connectCloudinary()

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
server.setTimeout(300000);
