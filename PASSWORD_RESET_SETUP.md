# Password Reset Setup Guide

This guide explains how to set up the password reset functionality with email sending.

---

## 📧 Email Configuration

The password reset feature requires email configuration to send reset links to users. You have several options:

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Add to `.env` file**:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
FRONTEND_URL=http://localhost:3000
```

### Option 2: Custom SMTP Server

If you have your own SMTP server (like SendGrid, Mailgun, etc.):

```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-smtp-password
FRONTEND_URL=http://localhost:3000
```

### Option 3: Development Mode (Console Logging)

If no email configuration is provided, the system will log reset links to the console instead of sending emails. This is useful for development.

---

## 🔧 Backend Setup

1. **Install nodemailer** (if not already installed):
```bash
cd backend
npm install nodemailer
```

2. **Add environment variables** to `backend/.env`:
```env
# Email Configuration (choose one option above)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Or for custom SMTP:
# EMAIL_HOST=smtp.your-provider.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@yourdomain.com
# EMAIL_PASS=your-smtp-password

# Frontend URL (for reset links)
FRONTEND_URL=http://localhost:3000

# Other existing variables...
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
```

3. **Restart the backend server**

---

## 🔄 How It Works

### For Users:

1. **Click "Forgot Password?"** on the login page
2. **Enter email or username** → System finds the account
3. **Enter registered email** → Confirms identity
4. **Receive email** with reset link
5. **Click reset link** → Opens reset password page
6. **Enter new password** → Password is reset
7. **Login** with new password

### Flow:

```
Login Page
    ↓
Click "Forgot Password?"
    ↓
Enter Email/Username
    ↓
Enter Registered Email (if username was used)
    ↓
Email Sent with Reset Link
    ↓
Click Link in Email
    ↓
Reset Password Page
    ↓
Enter New Password
    ↓
Password Reset Success
    ↓
Login with New Password
```

---

## 🔐 Security Features

1. **Token Expiration**: Reset tokens expire after 1 hour
2. **One-Time Use**: Tokens are deleted after successful password reset
3. **Hashed Tokens**: Tokens are hashed before storing in database
4. **Email Verification**: Requires registered email for username-based resets
5. **No User Enumeration**: Doesn't reveal if email exists or not

---

## 📝 API Endpoints

### POST `/auth/forgot-password`

**Request Body:**
```json
{
  "emailOrUsername": "user@example.com" // or "username123"
}
```

**Response (if email needed):**
```json
{
  "message": "Please provide your registered email to reset password",
  "requiresEmail": true,
  "maskedEmail": "us****@example.com"
}
```

**Request Body (step 2):**
```json
{
  "emailOrUsername": "username123",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent successfully. Please check your inbox."
}
```

### POST `/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "newPassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

---

## 🧪 Testing

### Test Password Reset Flow:

1. **Go to login page**: `http://localhost:3000/login`
2. **Click "Forgot Password?"**
3. **Enter a registered username or email**
4. **If username entered**: Enter registered email
5. **Check email** (or console logs if no email config)
6. **Click reset link** from email
7. **Enter new password**
8. **Login** with new password

### Without Email Configuration:

If email is not configured, reset links will be logged to the console:
```
📧 Password Reset Email (Mock):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: user@example.com
Subject: Password Reset Request - HomeTown Hub
Reset Link: http://localhost:3000/reset-password/abc123...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Copy the reset link from console and use it to test.

---

## ⚠️ Troubleshooting

### Email Not Sending

1. **Check `.env` file**: Ensure EMAIL_USER and EMAIL_PASS are set
2. **Check Gmail App Password**: Make sure you're using App Password, not regular password
3. **Check SMTP settings**: Verify EMAIL_HOST and EMAIL_PORT are correct
4. **Check console logs**: Look for email errors in backend console

### Reset Link Not Working

1. **Check token expiration**: Links expire after 1 hour
2. **Check URL format**: Should be `/reset-password/:token`
3. **Check backend logs**: Look for token validation errors

### "User not found" Error

- Make sure the email/username exists in the database
- Check for typos in email/username

---

## 📋 Summary

- ✅ Password reset via email
- ✅ Username or email support
- ✅ Email confirmation for username-based resets
- ✅ Secure token-based reset
- ✅ 1-hour token expiration
- ✅ Works with Gmail or custom SMTP
- ✅ Console logging fallback for development

---

## 🚀 Quick Start

1. Add email credentials to `backend/.env`
2. Install nodemailer: `npm install nodemailer` (in backend folder)
3. Restart backend server
4. Test the flow from login page

That's it! Password reset is ready to use.
