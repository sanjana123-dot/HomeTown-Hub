import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import compression from 'compression'
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

// Enable compression for all responses (reduces response size significantly)
app.use(compression())

// CORS configuration - allow frontend URLs
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) // Remove undefined values

// Log allowed origins for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Allowed CORS origins:', allowedOrigins)
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL)
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Request with no origin - allowing')
      }
      return callback(null, true)
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true)
    }
    
    // Allow Vercel preview deployments (any subdomain of vercel.app)
    if (origin.includes('.vercel.app')) {
      return callback(null, true)
    }
    
    // Development mode - allow all
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true)
    }
    
    // Production mode - strict check
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Log all incoming requests for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`)
    next()
  })
}

// Add caching headers for static assets
app.use((req, res, next) => {
  // Cache static files for 1 year
  if (req.path.startsWith('/uploads/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  }
  next()
})

// Serve static files from uploads directory
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API Routes
try {
  if (process.env.NODE_ENV === 'development') {
    console.log('Registering API routes...')
  }
  app.use('/api/auth', authRoutes)
  app.use('/api/communities', communityRoutes)
  app.use('/api/posts', postRoutes)
  app.use('/api/events', eventRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/notifications', notificationRoutes)
  app.use('/api/messages', messageRoutes)
  app.use('/api/announcements', announcementRoutes)
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✓ All API routes registered successfully')
  }
} catch (error) {
  console.error('❌ Error registering routes:', error)
  throw error
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Test route to verify routes are working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Routes are working!',
    timestamp: new Date().toISOString(),
    routes: {
      auth: '/api/auth/login, /api/auth/register',
      health: '/api/health'
    }
  })
})

// 404 handler
app.use((req, res) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('404 - Route not found:', req.method, req.originalUrl)
  }
  res.status(404).json({ message: 'Route not found', path: req.originalUrl, method: req.method })
})

// Error handler (must be last)
app.use(errorHandler)

const PORT = parseInt(process.env.PORT, 10) || 5000
const FALLBACK_PORTS = [5001, 4001, 5002]

function startServer(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`)
      if (process.env.NODE_ENV === 'development') {
        console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
        console.log(`🌐 CORS allowed origins: ${allowedOrigins.join(', ')}`)
        console.log(`✅ Server ready to accept requests`)
        console.log(`🔗 Test endpoint: http://localhost:${port}/api/health`)
      }
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

