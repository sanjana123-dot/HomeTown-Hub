# Fix CORS Error - Railway Backend

## Error Message:
```
Access to XMLHttpRequest at 'https://hometown-hub-production.up.railway.app/api/auth/login' 
from origin 'https://home-town-7shzj089j-sanjana-s-projects-ae7862ed.vercel.app' 
has been blocked by CORS policy
```

## Solution: Update Railway Environment Variables

### Step 1: Add FRONTEND_URL to Railway

1. Go to Railway dashboard → Your backend service
2. Click **"Variables"** tab (or "Environment" tab)
3. Add/Update the `FRONTEND_URL` variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://home-town-7shzj089j-sanjana-s-projects-ae7862ed.vercel.app`
   - **Important**: Include `https://` and the full domain

4. Also verify these variables exist:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `NODE_ENV` - Should be `production` (or leave empty, code handles it)

### Step 2: Redeploy Railway

After adding/updating `FRONTEND_URL`:
1. Go to **"Deployments"** tab
2. Click **three dots (⋯)** on latest deployment
3. Click **"Redeploy"**
4. Wait 2-5 minutes for deployment

### Step 3: Verify CORS is Working

After redeploy, check Railway logs:
1. Go to **"Deployments"** → Latest deployment → **"View Logs"**
2. Look for:
   ```
   Allowed CORS origins: [ 'http://localhost:3000', 'http://localhost:5173', 'https://home-town-7shzj089j-sanjana-s-projects-ae7862ed.vercel.app' ]
   FRONTEND_URL: https://home-town-7shzj089j-sanjana-s-projects-ae7862ed.vercel.app
   ```

3. When you try to login, you should see:
   ```
   CORS check - Origin: https://home-town-7shzj089j-sanjana-s-projects-ae7862ed.vercel.app
   CORS: Origin allowed (exact match)
   ```

## Code Changes Made

I've updated `backend/server.js` to:
1. ✅ Allow all Vercel deployments (any `.vercel.app` subdomain)
2. ✅ Better CORS headers for preflight requests
3. ✅ More detailed logging for debugging

## Important Notes

### Vercel URL Format
Vercel URLs can change:
- Preview deployments: `https://home-town-7shzj089j-sanjana-s-projects-ae7862ed.vercel.app`
- Production: `https://your-custom-domain.com` (if you set one)

**Solution**: The code now allows **any** `.vercel.app` subdomain automatically, so preview deployments will work even if the URL changes.

### If You Have a Custom Domain
If you set up a custom domain in Vercel (like `hometown-hub.com`):
1. Add it to Railway `FRONTEND_URL`: `https://hometown-hub.com`
2. Or update the code to allow your custom domain

## Quick Checklist

- [ ] Added `FRONTEND_URL` to Railway environment variables
- [ ] Value is: `https://home-town-7shzj089j-sanjana-s-projects-ae7862ed.vercel.app`
- [ ] Redeployed Railway service
- [ ] Checked Railway logs for CORS messages
- [ ] Tested login from Vercel frontend
- [ ] No CORS errors in browser console

## Still Getting CORS Error?

1. **Check Railway logs** - Look for "CORS: Origin NOT allowed" messages
2. **Verify FRONTEND_URL** - Make sure it matches your Vercel URL exactly
3. **Check browser console** - See the exact origin being sent
4. **Clear browser cache** - Sometimes cached CORS errors persist
5. **Try incognito mode** - Rule out browser extensions interfering

## Expected Behavior After Fix

✅ Login should work without CORS errors
✅ Registration should work
✅ All API calls from frontend should work
✅ Railway logs show "CORS: Origin allowed"
