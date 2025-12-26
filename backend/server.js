import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import adminRouter from './routes/adminRoute.js'

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Server is running')
})

// routes
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)

const PORT = process.env.PORT || 4000

connectDB()
connectCloudinary()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
