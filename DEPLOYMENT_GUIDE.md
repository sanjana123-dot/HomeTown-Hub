# Deployment Guide: HomeTown Hub

## Overview
- **Frontend**: Deploy to Vercel ✅ (Perfect for React/Vite)
- **Backend**: Deploy to Railway/Render ✅ (Better than Netlify for Express.js)

⚠️ **Important**: Netlify is NOT ideal for Express.js backends. Use Railway or Render instead.

---

## Part 1: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Production

1. **Update API configuration** to use environment variable:
   - The frontend code already uses `/api` as baseURL
   - We'll set environment variable in Vercel

2. **Build the frontend locally to test**:
   ```bash
   cd frontend
   npm run build
   ```
   This creates a `dist` folder with production files.

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to frontend folder**:
   ```bash
   cd frontend
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   - Follow prompts:
     - Set up and deploy? **Yes**
     - Which scope? **Your account**
     - Link to existing project? **No**
     - Project name? **hometown-hub-frontend** (or your choice)
     - Directory? **./** (current directory)
     - Override settings? **No**

5. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project on Vercel
   - Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://your-backend-url.com
     ```
   - Redeploy after adding variables

#### Option B: Using Vercel Dashboard (Easier)

1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click "Add New Project"**
4. **Import your GitHub repository**
5. **Configure**:
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Add Environment Variable**:
   - Go to Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com`
   - (You'll get this after deploying backend)

7. **Deploy**

### Step 3: Update Frontend API Configuration

Update `frontend/src/services/api.js` to use environment variable:

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})
```

---

## Part 2: Backend Deployment

### ⚠️ Important: Netlify vs Better Options

**Netlify** is designed for:
- Static sites
- Serverless functions (small, stateless)
- JAMstack apps

**Your Express.js backend needs**:
- Persistent server
- Long-running processes
- File uploads
- WebSocket support (if needed)

### Recommended: Railway (Easiest) ✅

#### Step 1: Prepare Backend

1. **Create `railway.json`** (optional):
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Ensure `package.json` has start script** (already has it):
   ```json
   "scripts": {
     "start": "node server.js"
   }
   ```

#### Step 2: Deploy to Railway

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**
6. **Select the `backend` folder** as root
7. **Add Environment Variables**:
   - `PORT` = (Railway will set this automatically)
   - `MONGODB_URI` = `mongodb+srv://sanjanapasam_db_user:6tFsWvoc39g3RUSp@cluster0.kzcc42m.mongodb.net/hometown-hub?appName=Cluster0`
   - `JWT_SECRET` = `5fc7ce5ea1e9285af3e0f9a767f77f75413b00ea89621adb0b132e9d18c749c7`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://your-vercel-app.vercel.app` (your frontend URL)

8. **Deploy** - Railway will automatically:
   - Detect Node.js
   - Install dependencies
   - Start your server

9. **Get your backend URL**:
   - Railway will provide a URL like: `https://your-app.up.railway.app`
   - Copy this URL

10. **Update Frontend Environment Variable**:
    - Go back to Vercel
    - Update `VITE_API_URL` to your Railway URL
    - Redeploy frontend

### Alternative: Render (Free Tier Available)

#### Step 1: Deploy to Render

1. **Go to**: https://render.com
2. **Sign up** with GitHub
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure**:
   - Name: `hometown-hub-backend`
   - Environment: **Node**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `backend`

6. **Add Environment Variables**:
   - `MONGODB_URI` = (your MongoDB URI)
   - `JWT_SECRET` = (your JWT secret)
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = (your Vercel frontend URL)

7. **Deploy**

8. **Get your backend URL**: `https://your-app.onrender.com`

### If You Still Want Netlify (Not Recommended)

Netlify requires converting Express to serverless functions. This is complex and not ideal for your use case.

**Better to use Railway or Render** - they're free and designed for Node.js backends.

---

## Part 3: Update CORS in Backend

Make sure your backend allows requests from your frontend domain:

In `backend/server.js`, update CORS:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000', // Local development
    'https://your-vercel-app.vercel.app', // Production frontend
  ],
  credentials: true
}))
```

---

## Part 4: Environment Variables Summary

### Frontend (Vercel)
- `VITE_API_URL` = `https://your-backend-url.com`

### Backend (Railway/Render)
- `PORT` = (auto-set by platform)
- `MONGODB_URI` = (your MongoDB connection string)
- `JWT_SECRET` = (your JWT secret)
- `NODE_ENV` = `production`
- `FRONTEND_URL` = `https://your-vercel-app.vercel.app`

---

## Part 5: Testing Deployment

1. **Test Backend**:
   ```bash
   curl https://your-backend-url.com/api/health
   ```
   Should return: `{"status":"OK","message":"Server is running"}`

2. **Test Frontend**:
   - Visit your Vercel URL
   - Try logging in/registering
   - Check browser console for errors

---

## Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_URL` is set correctly in Vercel
- Check CORS settings in backend
- Check backend URL is accessible

### Backend errors
- Check environment variables are set correctly
- Check MongoDB connection string
- Check logs in Railway/Render dashboard

### Build errors
- Make sure all dependencies are in `package.json`
- Check Node.js version compatibility
- Review build logs

---

## Quick Start Commands

### Railway (Recommended)
```bash
# Install Railway CLI (optional)
npm i -g @railway/cli

# Login
railway login

# Deploy
cd backend
railway init
railway up
```

### Vercel
```bash
cd frontend
vercel
```

---

## Cost Estimate

- **Vercel**: Free tier (generous limits)
- **Railway**: Free tier (500 hours/month) or $5/month
- **Render**: Free tier (spins down after inactivity) or $7/month
- **MongoDB Atlas**: Free tier (512MB)

**Total**: Free for small projects! 🎉

---

## Next Steps After Deployment

1. ✅ Update frontend API URL
2. ✅ Test all features
3. ✅ Set up custom domains (optional)
4. ✅ Enable HTTPS (automatic on both platforms)
5. ✅ Set up monitoring/alerts
