# Platform Admin Direct Login Guide

The platform admin account is **pre-configured** and does **NOT** require sign-up. You can login directly using the fixed credentials.

---

## 🔐 Platform Admin Credentials

**Username:** `platformadmin1234`  
**Email:** `platformadmin1234@example.com`  
**Password:** `6A129gb3ha06JE`

---

## 🚀 One-Time Setup (First Time Only)

Before you can login, you need to create the platform admin account in the database **once**. Run this command:

```bash
cd backend
node scripts/createPlatformAdminFixed.js
```

This will:
- Create the platform admin account in the database
- Set up the fixed credentials
- Display confirmation message

**You only need to run this ONCE** - after that, the account exists permanently.

---

## 🔑 How to Login

### Step 1: Go to Login Page
Navigate to: `http://localhost:3000/login`

### Step 2: Enter Credentials
You can login using **EITHER**:

**Option A: Username**
- Enter: `platformadmin1234`
- Password: `6A129gb3ha06JE`

**Option B: Email**
- Enter: `platformadmin1234@example.com`
- Password: `6A129gb3ha06JE`

### Step 3: Click Login
You'll be redirected to the dashboard.

### Step 4: Access Platform Admin Dashboard
- Look for **"Platform Admin"** link in the sidebar
- OR navigate directly to: `http://localhost:3000/admin`

---

## ✅ Important Notes

1. **No Sign-Up Required**: The platform admin account is pre-created - you don't need to register
2. **Fixed Credentials**: These credentials are hardcoded and always the same
3. **One-Time Setup**: Run the script once to create the account, then login anytime
4. **Login Options**: You can use either username OR email to login
5. **Permanent Account**: Once created, the account persists in the database

---

## 🔄 If Account Already Exists

If you run the script again and the account already exists:
- The script will **update** the existing account
- Ensures username, email, password, and role are correct
- No duplicate accounts will be created

---

## 🛠️ Troubleshooting

### "Invalid email/username or password"
- Make sure you ran the setup script first
- Verify you're using the exact credentials (case-sensitive password)
- Try logging in with email instead of username (or vice versa)

### "User not found"
- Run the setup script: `node backend/scripts/createPlatformAdminFixed.js`
- Check that MongoDB is running
- Verify database connection in `.env` file

### Script Errors
- Ensure MongoDB is running
- Check `.env` file has correct `MONGODB_URI`
- Verify Node.js is installed and working

---

## 📝 Summary

1. **Run setup script once**: `node backend/scripts/createPlatformAdminFixed.js`
2. **Login directly**: Use username `platformadmin1234` or email `platformadmin1234@example.com`
3. **Password**: `6A129gb3ha06JE`
4. **Access admin dashboard**: Click "Platform Admin" in sidebar or go to `/admin`

**No registration needed - just login!** 🎉
