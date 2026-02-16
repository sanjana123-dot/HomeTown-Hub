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

// Log allowed origins for debugging (remove in production if needed)
console.log('Allowed CORS origins:', allowedOrigins)
console.log('FRONTEND_URL:', process.env.FRONTEND_URL)

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Request with no origin - allowing')
      return callback(null, true)
    }
    
    console.log('CORS check - Origin:', origin)
    console.log('CORS check - Allowed origins:', allowedOrigins)
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS: Origin allowed (exact match)')
      return callback(null, true)
    }
    
    // Allow Vercel preview deployments (any subdomain of vercel.app)
    if (origin.includes('.vercel.app')) {
      console.log('CORS: Origin allowed (Vercel deployment)')
      return callback(null, true)
    }
    
    // Development mode - allow all
    if (process.env.NODE_ENV === 'development') {
      console.log('CORS: Development mode - allowing all')
      return callback(null, true)
    }
    
    // Production mode - strict check
    console.log('CORS: Origin NOT allowed:', origin)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`)
  next()
})

// Serve static files from uploads directory
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API Routes - Add logging to verify routes are registered
try {
  console.log('Registering API routes...')
  app.use('/api/auth', authRoutes)
  console.log('✓ Auth routes registered at /api/auth')
  
  app.use('/api/communities', communityRoutes)
  app.use('/api/posts', postRoutes)
  app.use('/api/events', eventRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/notifications', notificationRoutes)
  app.use('/api/messages', messageRoutes)
  app.use('/api/announcements', announcementRoutes)
  
  console.log('✓ All API routes registered successfully')
  console.log('Available auth routes:')
  console.log('  - POST /api/auth/login')
  console.log('  - POST /api/auth/register')
  console.log('  - GET /api/auth/me')
  console.log('  - POST /api/auth/forgot-password')
  console.log('  - POST /api/auth/reset-password')
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

// 404 handler - log the request for debugging
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl)
  console.log('Available routes include: /api/auth/login, /api/auth/register, /api/health')
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
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🌐 CORS allowed origins: ${allowedOrigins.join(', ')}`)
      console.log(`✅ Server ready to accept requests`)
      console.log(`🔗 Test endpoint: http://localhost:${port}/api/health`)
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

