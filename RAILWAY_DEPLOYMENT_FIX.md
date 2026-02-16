# Railway Deployment Fix - Login Route Not Found

## Issue
Getting "Route not found" error when accessing `/api/auth/login` on Railway deployment.

## Quick Fixes

### 1. Verify Railway Environment Variables
Make sure these are set in Railway:
- `PORT` (Railway sets this automatically, but verify it exists)
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL` (your Vercel frontend URL)
- `NODE_ENV=production`

### 2. Check Railway Logs
1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Check the logs for:
   - "✓ Auth routes registered at /api/auth"
   - "✓ All API routes registered successfully"
   - "🚀 Server running on port XXXX"
   - Any error messages

### 3. Force Redeploy
If routes aren't registering:
1. In Railway dashboard, go to your service
2. Click "Settings"
3. Scroll down and click "Redeploy"
4. Or make a small change to trigger redeploy (add a comment to server.js)

### 4. Verify the Route is Working
Test the endpoint directly:
```bash
# Replace YOUR_RAILWAY_URL with your actual Railway URL
curl -X POST https://YOUR_RAILWAY_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"test@example.com","password":"test123"}'
```

Or test the health endpoint:
```bash
curl https://YOUR_RAILWAY_URL/api/health
```

### 5. Check Vercel Environment Variable
In Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Verify `VITE_API_URL` is set to: `https://YOUR_RAILWAY_URL/api`
   - **Important**: Include `/api` at the end!
   - Example: `https://hometown-hub-production.up.railway.app/api`

### 6. Common Issues

#### Issue: Routes not registering
**Solution**: Check Railway logs for import errors. Make sure all route files exist and export correctly.

#### Issue: Wrong PORT
**Solution**: Railway sets PORT automatically. Don't override it. The code uses `process.env.PORT || 5000` which is correct.

#### Issue: CORS blocking requests
**Solution**: Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly (including https://)

#### Issue: Database connection failing
**Solution**: Verify `MONGODB_URI` is correct and MongoDB Atlas allows connections from Railway IPs (0.0.0.0/0)

## Debug Steps

1. **Check Railway Logs** - Look for route registration messages
2. **Test Health Endpoint** - `/api/health` should work
3. **Test Test Endpoint** - `/api/test` should return route info
4. **Check Browser Console** - Look for the actual URL being called
5. **Check Network Tab** - Verify the request is going to the right URL

## Expected Logs on Startup

When Railway starts your server, you should see:
```
Registering API routes...
✓ Auth routes registered at /api/auth
✓ All API routes registered successfully
Available auth routes:
  - POST /api/auth/login
  - POST /api/auth/register
  ...
🚀 Server running on port XXXX
📡 Environment: production
🌐 CORS allowed origins: ...
✅ Server ready to accept requests
```

If you don't see these logs, the routes aren't being registered properly.

## Still Not Working?

1. **Redeploy Railway** - Force a fresh deployment
2. **Check GitHub** - Make sure latest code is pushed
3. **Verify Railway is using latest commit** - Check deployment source
4. **Contact Support** - Share Railway logs and error messages
