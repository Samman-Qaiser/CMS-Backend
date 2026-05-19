import express from 'express'
import cors from 'cors'
import http from 'http'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import connectCloudinary from './config/cloudinary.js'
import authRoutes from './routes/authRoutes.js'  
import userRoutes from './routes/userRoutes.js'
import pageRoutes from './routes/pageRoutes.js'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const URL = process.env.MONGODB_URL

app.use(express.json())        
app.use(cookieParser())
app.use(cors())


app.get('/', (req, res) => {
  res.send("API Started working great")
})
app.use('/api/auth', authRoutes)  // ← add
app.use('/api/users', userRoutes)

app.use('/api/pages', pageRoutes)
connectCloudinary()

mongoose.connect(URL,{
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('Database Connected Successfully')
    const server = http.createServer(app)
    server.listen(PORT, () => {
      console.log(`Server started running successfully on ${PORT} Port`)
    })
  })
  .catch((error) => {
    console.log(`Error occured in Database Connection ${error}`)
  })


export default app