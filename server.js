// backend/server.js
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
import courseCategoryRoutes from './routes/courseCategoryRoutes.js'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const URL = process.env.MONGODB_URL

// Global mongoose connection cache for serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('✅ Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 5,
      minPoolSize: 1,
      family: 4
    };

    console.log('🔄 Connecting to MongoDB...');
    cached.promise = mongoose.connect(URL, opts).then((mongoose) => {
      console.log('✅ Database Connected Successfully');
      return mongoose;
    }).catch((err) => {
      console.error('❌ Database Connection Error:', err);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

// Middleware to ensure DB connection for each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('DB Connection Middleware Error:', error);
    res.status(503).json({ 
      success: false, 
      message: 'Database connection issue. Please try again.' 
    });
  }
});

app.use(express.json())        
app.use(cookieParser())
app.use(cors())

app.get('/', (req, res) => {
  res.send("API Started working great")
})

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting', 
    3: 'disconnecting'
  };
  
  res.json({ 
    status: 'ok', 
    database: states[state] || 'unknown',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes)
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

app.use('/api/course-categories', courseCategoryRoutes)
connectCloudinary()

// For local development only
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    const server = http.createServer(app)
    server.listen(PORT, () => {
      console.log(`Server started running successfully on ${PORT} Port`)
    })
  }).catch((error) => {
    console.log(`Error occurred in Database Connection ${error}`)
  });
}

export default app