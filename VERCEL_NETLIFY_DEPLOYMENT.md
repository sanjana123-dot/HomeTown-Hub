# Deployment Guide: Vercel (Frontend) + Netlify (Backend)

## ⚠️ Important Note About Netlify

**Netlify is NOT ideal for Express.js backends.** It's designed for:
- Static sites
- Serverless functions (small, stateless)
- JAMstack apps

**Your Express.js backend needs:**
- Persistent server
- Long-running processes
- File uploads
- Database connections

**Better alternatives for backend:**
- ✅ **Railway** (Recommended - easiest, free tier)
- ✅ **Render** (Free tier available)
- ✅ **Fly.io** (Good free tier)

However, if you still want to use Netlify, I'll show you how below, but **strongly recommend Railway or Render instead**.

---

## Part 1: Frontend Deployment on Vercel ✅

### Step 1: Prepare Frontend

Your frontend is already configured! The `vercel.json` file is ready.

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Easiest)

1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click "Add New Project"**
4. **Import your GitHub repository** (`sanjana123-dot/HomeTown-Hub`)
5. **Configure Project**:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `frontend` ⚠️ Important!
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

6. **Environment Variables** (Add AFTER backend is deployed):
   - Click "Environment Variables"
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://your-backend-url.com
     ```
   - (You'll get this URL after deploying backend)

7. **Click "Deploy"**
8. **Wait for deployment** (2-3 minutes)
9. **Copy your Vercel URL** (e.g., `https://hometown-hub.vercel.app`)

#### Option B: Using Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel
# Follow prompts
```

---

## Part 2: Backend Deployment

### ⚠️ Option 1: Railway (STRONGLY RECOMMENDED) ✅

Railway is perfect for Express.js backends and much easier than Netlify.

#### Steps:

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `sanjana123-dot/HomeTown-Hub`
6. **Configure**:
   - **Root Directory**: `backend` ⚠️ Important!
   - Railway will auto-detect Node.js

7. **Add Environment Variables**:
   - Click on your service → Variables tab
   - Add these:
     ```
     MONGODB_URI=mongodb+srv://sanjanapasam_db_user:6tFsWvoc39g3RUSp@cluster0.kzcc42m.mongodb.net/hometown-hub?appName=Cluster0
     JWT_SECRET=5fc7ce5ea1e9285af3e0f9a767f77f75413b00ea89621adb0b132e9d18c749c7
     NODE_ENV=production
     FRONTEND_URL=https://your-vercel-app.vercel.app
     ```
   - (Replace `your-vercel-app` with your actual Vercel URL)

8. **Deploy**:
   - Railway automatically detects Node.js
   - Runs `npm install` and `npm start`
   - Deploys your backend

9. **Get Backend URL**:
   - Railway provides a URL like: `https://your-app.up.railway.app`
   - Copy this URL

10. **Update Frontend Environment Variable**:
    - Go back to Vercel
    - Settings → Environment Variables
    - Update `VITE_API_URL` to your Railway URL
    - Redeploy frontend

**Done!** ✅

---

### Option 2: Render (Alternative to Railway)

1. **Go to**: https://render.com
2. **Sign up** with GitHub
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure**:
   - **Name**: `hometown-hub-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend` ⚠️ Important!

6. **Add Environment Variables** (same as Railway above)

7. **Deploy**

8. **Get URL**: `https://your-app.onrender.com`

---

### Option 3: Netlify (NOT RECOMMENDED - Complex)

Netlify requires converting Express routes to serverless functions. This is complex and not ideal.

#### If You Still Want Netlify:

**Step 1: Convert Express to Netlify Functions**

You'll need to create a `netlify/functions/server.js` file that wraps your Express app. This is complex and requires significant refactoring.

**Step 2: Create `netlify.toml`**

```toml
[build]
  command = "cd backend && npm install"
  functions = "netlify/functions"
  publish = "backend"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/:splat"
  status = 200
```

**Step 3: Refactor Your Express App**

You'll need to modify your Express app to work as a serverless function, which means:
- No persistent connections
- Stateless functions
- Different request/response handling

**This is why Railway or Render are better options!**

---

## Part 3: Update CORS in Backend

Make sure your backend allows requests from Vercel frontend.

The backend code already has CORS configured to use `FRONTEND_URL` environment variable, so just make sure you set it correctly in Railway/Render.

---

## Part 4: Final Steps

### 1. Update Environment Variables

**Frontend (Vercel)**:
```
VITE_API_URL=https://your-backend-url.com
```

**Backend (Railway/Render)**:
```
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### 2. Test Deployment

**Test Backend**:
```bash
curl https://your-backend-url.com/api/health
```
Should return: `{"status":"OK","message":"Server is running"}`

**Test Frontend**:
- Visit your Vercel URL
- Try logging in
- Check browser console for errors

---

## Recommended Deployment Stack

✅ **Frontend**: Vercel (Perfect for React/Vite)
✅ **Backend**: Railway (Perfect for Express.js)
❌ **Backend**: Netlify (Not suitable for Express.js)

---

## Quick Summary

1. **Deploy Frontend to Vercel**:
   - Import GitHub repo
   - Set root directory to `frontend`
   - Deploy

2. **Deploy Backend to Railway** (Recommended):
   - Import GitHub repo
   - Set root directory to `backend`
   - Add environment variables
   - Deploy

3. **Connect Them**:
   - Update `VITE_API_URL` in Vercel with Railway URL
   - Update `FRONTEND_URL` in Railway with Vercel URL
   - Redeploy frontend

4. **Test Everything**

---

## Need Help?

If you encounter issues:
- Check deployment logs in Vercel/Railway dashboard
- Verify environment variables are set correctly
- Check CORS settings
- Test backend health endpoint first
