import nodemailer from 'nodemailer'

// Create transporter for sending emails. Returns { transporter, isMock }.
const createTransporter = () => {
  // For development, use Gmail or configure your SMTP server
  // You'll need to set these in your .env file:
  // EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
  
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    return {
      transporter: nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }),
      isMock: false,
    }
  }

  // Fallback: Use Gmail with app password (for development)
  // Set EMAIL_USER and EMAIL_PASS in .env
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return {
      transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Use App Password, not regular password
        },
      }),
      isMock: false,
    }
  }

  // If no email config, return a mock transporter that logs to console
  console.warn('⚠️  Email configuration not found. Password reset emails will be logged to console only.')
  return {
    transporter: {
      sendMail: async (options) => {
        console.log('\n📧 Password Reset Email (Mock):')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('To:', options.to)
        console.log('Subject:', options.subject)
        console.log('Reset Link:', options.html.match(/href="([^"]+)"/)?.[1] || 'Not found')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
        return { messageId: 'mock-message-id' }
      },
    },
    isMock: true,
  }
}

/**
 * Sends password reset email. Returns { mock: true } when email is not configured (dev mode).
 */
export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const { transporter, isMock } = createTransporter()

  const mailOptions = {
    from: `"HomeTown Hub" <${process.env.EMAIL_USER || 'noreply@hometownhub.com'}>`,
    to: email,
    subject: 'Password Reset Request - HomeTown Hub',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 HomeTown Hub</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${name},</p>
              <p>You requested to reset your password for your HomeTown Hub account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} HomeTown Hub. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request - HomeTown Hub
      
      Hello ${name},
      
      You requested to reset your password for your HomeTown Hub account.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
      
      © ${new Date().getFullYear()} HomeTown Hub. All rights reserved.
    `,
  }

  await transporter.sendMail(mailOptions)
  return { mock: isMock }
}
