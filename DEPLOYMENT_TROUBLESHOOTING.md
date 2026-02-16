# Deployment Troubleshooting Guide

## Login/Registration Failed - Debugging Steps

### Step 1: Check Browser Console

1. **Open your Vercel frontend URL**
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Try to login/register**
5. **Look for errors** - they will tell you what's wrong

Common errors you might see:
- `Network Error` - Backend not reachable
- `CORS error` - Backend CORS not configured correctly
- `401 Unauthorized` - Authentication issue
- `404 Not Found` - Wrong API URL

### Step 2: Check Network Tab

1. **Open Developer Tools** (F12)
2. **Go to Network tab**
3. **Try to login/register**
4. **Look for the API request** (should be to `/api/auth/login` or `/api/auth/register`)
5. **Check**:
   - What URL is it calling? (Should be your Railway URL)
   - What's the status code? (200 = success, 4xx/5xx = error)
   - Click on the request to see response details

### Step 3: Verify Environment Variables

#### In Vercel:
1. Go to your project → Settings → Environment Variables
2. Check `VITE_API_URL` exists
3. Verify the value is your Railway backend URL (e.g., `https://your-app.up.railway.app`)
4. Make sure it doesn't have a trailing slash
5. Make sure it includes `https://`

#### In Railway:
1. Go to your project → Variables tab
2. Verify these are set:
   - `MONGODB_URI` ✅
   - `JWT_SECRET` ✅
   - `FRONTEND_URL` ✅ (should be your Vercel URL)
   - `NODE_ENV` = `production` ✅

### Step 4: Test Backend Directly

Test if your backend is working:

```bash
# Test health endpoint
curl https://your-railway-url.up.railway.app/api/health

# Should return: {"status":"OK","message":"Server is running"}
```

If this fails, your backend isn't running properly.

### Step 5: Check Railway Logs

1. **Go to Railway dashboard**
2. **Click on your backend service**
3. **Go to "Logs" tab**
4. **Look for errors**:
   - Database connection errors?
   - Missing environment variables?
   - Port issues?
   - Application crashes?

### Step 6: Common Issues & Fixes

#### Issue 1: "Network Error" or "Failed to fetch"
**Problem**: Frontend can't reach backend
**Fix**:
- Check `VITE_API_URL` in Vercel is correct
- Verify Railway backend is running (check logs)
- Make sure Railway URL doesn't have trailing slash
- Redeploy frontend after fixing

#### Issue 2: CORS Error
**Problem**: Backend blocking frontend requests
**Fix**:
- In Railway, check `FRONTEND_URL` is set to your Vercel URL
- Make sure it's exactly: `https://home-town-hub.vercel.app`
- Redeploy backend after fixing

#### Issue 3: "401 Unauthorized" or "Invalid credentials"
**Problem**: Backend is reachable but authentication failing
**Fix**:
- Check `JWT_SECRET` is set correctly in Railway
- Check MongoDB connection is working
- Check Railway logs for specific errors

#### Issue 4: "404 Not Found"
**Problem**: Wrong API endpoint
**Fix**:
- Check `VITE_API_URL` includes full URL: `https://your-app.up.railway.app`
- Make sure it doesn't end with `/api`
- Should be: `https://your-app.up.railway.app` (frontend adds `/api` automatically)

### Step 7: Verify API URL Format

**Correct Format**:
```
VITE_API_URL=https://your-app.up.railway.app
```

**Wrong Formats**:
```
❌ VITE_API_URL=https://your-app.up.railway.app/  (trailing slash)
❌ VITE_API_URL=https://your-app.up.railway.app/api  (don't add /api)
❌ VITE_API_URL=your-app.up.railway.app  (missing https://)
```

### Step 8: Check Backend CORS Configuration

Your backend code should allow your Vercel domain. Check Railway logs to see if CORS is blocking requests.

---

## Quick Debug Checklist

- [ ] Browser console shows what error?
- [ ] Network tab shows what URL is being called?
- [ ] Railway backend logs show any errors?
- [ ] `VITE_API_URL` in Vercel is correct?
- [ ] `FRONTEND_URL` in Railway is correct?
- [ ] Backend health endpoint works: `curl https://your-backend/api/health`
- [ ] Both frontend and backend are deployed and running?

---

## Still Not Working?

Share these details:
1. Browser console error message
2. Network tab - what URL is being called?
3. Network tab - what's the response status code?
4. Railway logs - any errors?
5. Your Railway backend URL
6. Your Vercel frontend URL
