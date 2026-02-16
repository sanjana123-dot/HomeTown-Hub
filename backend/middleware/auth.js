import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' })
      }

      // Check if user is banned
      if (req.user.isBanned) {
        return res.status(403).json({ 
          message: 'Your account has been banned',
          reason: req.user.banReason 
        })
      }

      // Check if user is suspended
      if (req.user.isSuspended) {
        return res.status(403).json({ 
          message: 'Your account has been suspended',
          reason: req.user.suspensionReason 
        })
      }
      
      next()
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' })
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' })
  }
}

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Not authorized as admin' })
  }
}



