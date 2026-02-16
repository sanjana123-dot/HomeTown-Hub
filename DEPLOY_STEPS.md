# Step-by-Step Deployment Guide

## ⚠️ CRITICAL: Netlify is NOT Suitable for Express.js Backends

**Netlify** is designed for:
- Static websites
- Serverless functions (small, stateless)
- JAMstack applications

**Your Express.js backend needs**:
- Persistent server running 24/7
- Long-running processes
- File uploads
- Database connections
- WebSocket support

**Netlify Functions** would require:
- Converting every Express route to a separate serverless function
- Major code refactoring
- No persistent connections
- Cold starts (slow first request)

**✅ Use Railway or Render instead** - They're FREE and perfect for Express.js!

---

## Part 1: Deploy Frontend to Vercel ✅

### Step 1: Push Code to GitHub First

Make sure all your code is pushed to GitHub (we already did this).

### Step 2: Deploy to Vercel

1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click "Add New Project"** (or "New Project")
4. **Import Git Repository**:
   - Select: `sanjana123-dot/HomeTown-Hub`
   - Click "Import"

5. **Configure Project Settings**:
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT!**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

6. **Environment Variables** (Add LATER after backend is deployed):
   - Click "Environment Variables" section
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://your-backend-url.com
     ```
   - (We'll add this after backend deployment)

7. **Click "Deploy"**
8. **Wait 2-3 minutes** for deployment
9. **Copy your Vercel URL** (e.g., `https://hometown-hub.vercel.app`)

✅ **Frontend deployed!**

---

## Part 2: Deploy Backend

### ✅ Option 1: Railway (RECOMMENDED - Easiest)

#### Step 1: Deploy to Railway

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `sanjana123-dot/HomeTown-Hub`
6. **Configure**:
   - Railway will show your repo
   - Click on it to configure
   - **Root Directory**: `backend` ⚠️ **IMPORTANT!**
   - Railway auto-detects Node.js

7. **Add Environment Variables**:
   - Click on your deployed service
   - Go to "Variables" tab
   - Click "New Variable"
   - Add these one by one:
     
     ```
     Variable: MONGODB_URI
     Value: mongodb+srv://sanjanapasam_db_user:6tFsWvoc39g3RUSp@cluster0.kzcc42m.mongodb.net/hometown-hub?appName=Cluster0
     ```
     
     ```
     Variable: JWT_SECRET
     Value: 5fc7ce5ea1e9285af3e0f9a767f77f75413b00ea89621adb0b132e9d18c749c7
     ```
     
     ```
     Variable: NODE_ENV
     Value: production
     ```
     
     ```
     Variable: FRONTEND_URL
     Value: https://your-vercel-app.vercel.app
     ```
     (Replace with your actual Vercel URL from Step 1)

8. **Deploy**:
   - Railway automatically:
     - Detects Node.js
     - Runs `npm install`
     - Runs `npm start`
     - Deploys your backend

9. **Get Backend URL**:
   - Railway provides a URL like: `https://your-app.up.railway.app`
   - Click "Settings" → "Generate Domain" if needed
   - Copy this URL

10. **Update Frontend Environment Variable**:
    - Go back to Vercel dashboard
    - Your project → Settings → Environment Variables
    - Edit `VITE_API_URL`:
      - Change value to: `https://your-app.up.railway.app`
    - Go to "Deployments" tab
    - Click "Redeploy" (or it auto-redeploys)

✅ **Backend deployed on Railway!**

---

### Option 2: Render (Alternative)

1. **Go to**: https://render.com
2. **Sign up** with GitHub
3. **Click "New +" → "Web Service"**
4. **Connect Repository**: `sanjana123-dot/HomeTown-Hub`
5. **Configure**:
   - **Name**: `hometown-hub-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend` ⚠️ **IMPORTANT!**

6. **Add Environment Variables** (same as Railway above)

7. **Deploy**

8. **Get URL**: `https://your-app.onrender.com`

---

### ❌ Option 3: Netlify (NOT RECOMMENDED)

**Why Netlify Won't Work Well:**

Netlify requires converting your Express.js app to serverless functions. This means:

1. **Each route becomes a separate function** - You'd need to create:
   - `netlify/functions/auth.js`
   - `netlify/functions/posts.js`
   - `netlify/functions/communities.js`
   - etc.

2. **Major code refactoring** - Your entire Express app structure needs to change

3. **No persistent connections** - Database connections can't persist between requests

4. **Cold starts** - First request after inactivity is slow (5-10 seconds)

5. **File uploads are complex** - Netlify Functions have size limits

**If you still want to try Netlify**, you'd need to:
- Convert Express routes to Netlify Functions
- Refactor your entire backend architecture
- Handle database connections differently
- Deal with timeout limits

**This is why Railway or Render are MUCH better options!**

---

## Part 3: Connect Frontend and Backend

### Step 1: Update Frontend Environment Variable

1. **Go to Vercel Dashboard**
2. **Your Project → Settings → Environment Variables**
3. **Edit `VITE_API_URL`**:
   - Value: `https://your-backend-url.com` (Railway or Render URL)
4. **Save**
5. **Redeploy** (or wait for auto-redeploy)

### Step 2: Verify Backend CORS

Your backend already has CORS configured to use `FRONTEND_URL` environment variable. Make sure you set it correctly in Railway/Render.

---

## Part 4: Test Your Deployment

### Test Backend:
```bash
curl https://your-backend-url.com/api/health
```
Should return: `{"status":"OK","message":"Server is running"}`

### Test Frontend:
1. Visit your Vercel URL
2. Try registering a new account
3. Try logging in
4. Check browser console (F12) for any errors

---

## Summary

✅ **Frontend**: Vercel (Perfect!)
✅ **Backend**: Railway (Recommended) or Render
❌ **Backend**: Netlify (Not suitable - requires major refactoring)

**Recommended Stack:**
- Frontend: Vercel
- Backend: Railway

Both have free tiers and are perfect for your Express.js backend!

---

## Quick Checklist

- [ ] Push code to GitHub
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway (or Render)
- [ ] Set environment variables in both platforms
- [ ] Update `VITE_API_URL` in Vercel with backend URL
- [ ] Update `FRONTEND_URL` in Railway with frontend URL
- [ ] Test backend health endpoint
- [ ] Test frontend login/registration
- [ ] Check browser console for errors

---

## Need Help?

- Check deployment logs in Vercel/Railway dashboards
- Verify all environment variables are set
- Test backend endpoint directly first
- Check CORS settings match your frontend URL
