# Quick Fix: Login/Registration Failed After Deployment

## Most Common Issues & Quick Fixes

### Issue 1: Wrong API URL Format ⚠️ MOST COMMON

**Check in Vercel Environment Variables:**
- Go to Vercel → Your Project → Settings → Environment Variables
- Check `VITE_API_URL` value

**Correct Format:**
```
VITE_API_URL=https://your-app.up.railway.app
```

**Common Mistakes:**
```
❌ https://your-app.up.railway.app/  (trailing slash - WRONG)
❌ https://your-app.up.railway.app/api  (don't add /api - WRONG)
❌ your-app.up.railway.app  (missing https:// - WRONG)
```

**Fix**: Update `VITE_API_URL` to correct format, then redeploy.

---

### Issue 2: CORS Error (Backend blocking frontend)

**Check in Railway:**
- Go to Railway → Your Service → Variables
- Check `FRONTEND_URL` is set to: `https://home-town-hub.vercel.app`
- Make sure it matches your Vercel URL exactly

**Fix**: Set `FRONTEND_URL` correctly, then redeploy backend.

---

### Issue 3: Backend Not Running

**Test Backend:**
Open in browser or use curl:
```
https://your-railway-url.up.railway.app/api/health
```

Should return: `{"status":"OK","message":"Server is running"}`

If it doesn't work:
- Check Railway logs for errors
- Verify environment variables are set
- Check if backend service is running

---

### Issue 4: Environment Variable Not Applied

**After adding/updating environment variables:**
- **Vercel**: Must redeploy for changes to take effect
- **Railway**: Usually auto-redeploys, but check logs

---

## Step-by-Step Debugging

### Step 1: Check Browser Console
1. Open your Vercel site: `https://home-town-hub.vercel.app`
2. Press **F12** (Developer Tools)
3. Go to **Console** tab
4. Try to login
5. **What error do you see?**
   - "Network Error" → Backend not reachable
   - "CORS error" → Backend CORS issue
   - "404" → Wrong API URL
   - "401" → Authentication issue

### Step 2: Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Try to login
3. Find the `/auth/login` request
4. **Check**:
   - What URL is it calling? (Should be Railway URL)
   - Status code? (200 = success, 4xx/5xx = error)
   - Click request → Response tab → What's the error message?

### Step 3: Verify Environment Variables

**In Vercel:**
```
VITE_API_URL = https://your-railway-url.up.railway.app
```

**In Railway:**
```
MONGODB_URI = mongodb+srv://...
JWT_SECRET = your-secret
FRONTEND_URL = https://home-town-hub.vercel.app
NODE_ENV = production
```

### Step 4: Test Backend Directly

Open this URL in your browser:
```
https://your-railway-url.up.railway.app/api/health
```

If it works → Backend is running ✅
If it doesn't → Backend has issues ❌

---

## Quick Fixes

### Fix 1: Update VITE_API_URL Format
1. Vercel → Settings → Environment Variables
2. Edit `VITE_API_URL`
3. Make sure it's: `https://your-railway-url.up.railway.app` (no trailing slash, no /api)
4. Save
5. Redeploy

### Fix 2: Update FRONTEND_URL in Railway
1. Railway → Your Service → Variables
2. Edit `FRONTEND_URL`
3. Set to: `https://home-town-hub.vercel.app`
4. Save (auto-redeploys)

### Fix 3: Check Railway Logs
1. Railway → Your Service → Logs tab
2. Look for errors:
   - Database connection failed?
   - Missing environment variable?
   - Port already in use?
   - Application crashed?

---

## What to Share for Help

If still not working, share:
1. **Browser Console Error** (exact message)
2. **Network Tab**: What URL is being called?
3. **Network Tab**: Status code and response
4. **Railway Logs**: Any errors?
5. **Your Railway Backend URL**
6. **Your Vercel Frontend URL**
