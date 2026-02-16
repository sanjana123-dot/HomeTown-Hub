import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/database.js'
import { errorHandler } from './middleware/errorHandler.js'

// Routes
import authRoutes from './routes/auth.js'
import communityRoutes from './routes/communities.js'
import postRoutes from './routes/posts.js'
import eventRoutes from './routes/events.js'
import userRoutes from './routes/users.js'
import adminRoutes from './routes/admin.js'
import notificationRoutes from './routes/notifications.js'
import messageRoutes from './routes/messages.js'
import announcementRoutes from './routes/announcements.js'

dotenv.config()

const app = express()

// CORS configuration - allow frontend URLs
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from uploads directory
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/communities', communityRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/announcements', announcementRoutes)
console.log('✓ Routes registered: POST /api/announcements (create), GET /api/announcements/community/:communityId (list)')

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handler (must be last)
app.use(errorHandler)

const PORT = parseInt(process.env.PORT, 10) || 5000
const FALLBACK_PORTS = [5001, 4001, 5002]

function startServer(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`)
      if (port !== PORT) {
        console.log(`(Port ${PORT} was in use. If using frontend proxy, set target to http://localhost:${port} in vite.config.js)`)
      }
      resolve(server)
    })
    server.on('error', reject)
  })
}

function tryStartServer(tryPort, fallbacks) {
  return startServer(tryPort).catch((err) => {
    if (err.code === 'EADDRINUSE' && fallbacks.length > 0) {
      const next = fallbacks[0]
      console.log(`Port ${tryPort} in use, trying ${next}...`)
      return tryStartServer(next, fallbacks.slice(1))
    }
    throw err
  })
}

// Connect to database and start server
connectDB()
  .then(() => {
    console.log('✓ MongoDB connected successfully')
  })
  .catch((error) => {
    console.warn('⚠ MongoDB connection failed:', error.message)
    console.warn('⚠ Server will start without database connection')
  })
  .finally(() => {
    tryStartServer(PORT, FALLBACK_PORTS).catch((error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\nPort ${PORT} and fallbacks are in use. Stop the other process or set PORT in backend/.env`)
        process.exit(1)
      }
      console.error('Failed to start server:', error.message)
      process.exit(1)
    })
  })

