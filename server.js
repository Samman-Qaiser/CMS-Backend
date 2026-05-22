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
import categoryRoutes from './routes/categoryRoutes.js'
import tagRoutes from './routes/tagRoutes.js'
import blogRoutes from './routes/blogRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import menuRoutes from './routes/menuRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import emailRoutes from './routes/emailRoutes.js'
import subscriberRoutes from './routes/subscriberRoutes.js'
import siteConfigRoutes from './routes/siteConfigRoutes.js'
import configurationRoutes from './routes/configurationRoutes.js'
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
app.use('/api/categories', categoryRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/menus', menuRoutes)
app.use('/api/contacts', contactRoutes)
app.use('/api/emails', emailRoutes)
app.use('/api/subscribers', subscriberRoutes)

app.use('/api/site-config', siteConfigRoutes)
app.use('/api/configurations', configurationRoutes)
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