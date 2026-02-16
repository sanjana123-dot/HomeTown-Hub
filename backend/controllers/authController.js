import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import dns from 'dns'
import { promisify } from 'util'
import User from '../models/User.js'
import { sendPasswordResetEmail } from '../utils/emailService.js'

const resolveMx = promisify(dns.resolveMx)

// Valid email format: local@domain.tld (same rules as frontend)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9][a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/

function isValidEmailFormat(email) {
  if (!email || typeof email !== 'string') return false
  const trimmed = email.trim()
  if (trimmed.length > 254 || trimmed.length < 8) return false
  const atIndex = trimmed.indexOf('@')
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return false
  const domainPart = trimmed.slice(atIndex + 1)
  if (!domainPart.includes('.') || domainPart.length < 4) return false
  return EMAIL_REGEX.test(trimmed)
}

async function emailDomainAcceptsMail(email) {
  const domain = email.split('@')[1]
  if (!domain) return false
  try {
    const mx = await resolveMx(domain)
    return Array.isArray(mx) && mx.length > 0
  } catch (_) {
    return false
  }
}

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not set in server .env file. Add JWT_SECRET=your-secret-key to backend/.env')
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  })
}

export const register = async (req, res) => {
  try {
    const { name, username, email, password, hometown, city, state } = req.body

    const normalizedEmail =
      typeof email === 'string' ? email.toLowerCase().trim() : email
    const normalizedUsername =
      typeof username === 'string' ? username.toLowerCase().trim() : username

    // Validation
    if (!name || !normalizedUsername || !normalizedEmail || !password || !hometown || !city || !state) {
      return res.status(400).json({ message: 'Please provide all required fields' })
    }

    // Password validation: minimum 8 characters (can be letters, numbers, or symbols)
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long',
      })
    }

    if (!isValidEmailFormat(normalizedEmail)) {
      return res.status(400).json({
        message: 'Invalid email or email does not exist. Please use a real email address.',
      })
    }

    const domainAcceptsMail = await emailDomainAcceptsMail(normalizedEmail)
    if (!domainAcceptsMail) {
      return res.status(400).json({
        message: 'Invalid email or email does not exist. Please use a real email address.',
      })
    }

    // Check if username already exists
    const usernameExists = await User.findOne({ username: normalizedUsername })
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already exists' })
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email: normalizedEmail })
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const user = await User.create({
      name,
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      hometown,
      city,
      state,
    })

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          hometown: user.hometown,
          city: user.city,
          state: user.state,
          role: user.role,
        },
      })
    } else {
      res.status(400).json({ message: 'Invalid user data' })
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message })
    }
    res.status(500).json({ message: error.message })
  }
}

export const login = async (req, res) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c3308474-b3b6-4331-8075-82b2b19d924e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authController.js:login:entry',message:'Login request received',data:{hasEmailOrUsername:!!req.body?.emailOrUsername,hasPassword:!!req.body?.password},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  try {
    const { emailOrUsername, password } = req.body

    // Validation
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Please provide email/username and password' })
    }

    const normalizedInput =
      typeof emailOrUsername === 'string' ? emailOrUsername.toLowerCase().trim() : emailOrUsername

    // Try to find user by email or username
    const user = await User.findOne({
      $or: [
        { email: normalizedInput },
        { username: normalizedInput }
      ]
    })

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c3308474-b3b6-4331-8075-82b2b19d924e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authController.js:login:afterFindOne',message:'User lookup result',data:{userFound:!!user},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          hometown: user.hometown,
          city: user.city,
          state: user.state,
          role: user.role,
        },
      })
    } else {
      res.status(401).json({ message: 'Invalid email/username or password' })
    }
  } catch (error) {
    console.error('Login error:', error.message)
    res.status(500).json({
      message: error.message || 'Login failed. Check server console for details.',
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const forgotPassword = async (req, res) => {
  try {
    const { emailOrUsername, email } = req.body

    // If emailOrUsername is provided but email is not, ask for email
    if (emailOrUsername && !email) {
      // Try to find user by emailOrUsername
      const normalizedInput =
        typeof emailOrUsername === 'string' ? emailOrUsername.toLowerCase().trim() : emailOrUsername

      const user = await User.findOne({
        $or: [
          { email: normalizedInput },
          { username: normalizedInput }
        ]
      }).select('email name')

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Return user's email (partially masked) to confirm
      const maskedEmail = user.email.replace(/(.{2})(.*)(@.*)/, (match, p1, p2, p3) => {
        return p1 + '*'.repeat(Math.min(p2.length, 4)) + p3
      })

      return res.json({
        message: 'Please provide your registered email to reset password',
        requiresEmail: true,
        maskedEmail: maskedEmail,
      })
    }

    // If email is provided, proceed with password reset
    if (!email) {
      return res.status(400).json({ message: 'Please provide email' })
    }

    const normalizedEmail =
      typeof email === 'string' ? email.toLowerCase().trim() : email

    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Save token and expiration (1 hour)
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000 // 1 hour
    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`

    try {
      const result = await sendPasswordResetEmail(user.email, user.name, resetUrl)
      // When email is not configured (mock mode), return the link so user can still reset in development
      if (result?.mock) {
        return res.json({
          message: 'Email is not configured on the server. Use the link below to reset your password (development only).',
          developmentMode: true,
          resetLink: resetUrl,
        })
      }
      res.json({
        message: 'Password reset email sent successfully. Please check your inbox.',
      })
    } catch (emailError) {
      // Reset token if email fails
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save()

      console.error('Email error:', emailError)
      res.status(500).json({
        message: 'Failed to send email. Please try again later.',
      })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: 'Please provide token and new password' })
    }

    // Password validation: minimum 8 characters (can be letters, numbers, or symbols)
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long',
      })
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    // Set new password
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    res.json({
      message: 'Password reset successfully. You can now login with your new password.',
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}



