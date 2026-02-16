# Fix Image Display Issue

## Problem
Images uploaded to posts are not displaying. The post shows `[Photo]` placeholder and filename, but the actual image doesn't render.

## Root Cause
When the frontend (Vercel) and backend (Railway) are on different domains, relative image URLs like `/uploads/filename.png` don't work. The frontend needs absolute URLs pointing to the Railway backend.

## Solution Applied

### 1. Created Image URL Utility (`frontend/src/utils/imageUrl.js`)
- Converts relative upload URLs (`/uploads/filename.png`) to absolute URLs (`https://railway-url/uploads/filename.png`)
- Uses `VITE_API_URL` environment variable to construct the backend URL
- Handles both development (relative) and production (absolute) URLs

### 2. Updated Components to Use Utility
Updated all components that display images:
- ✅ `PostCard.jsx` - Post images and files
- ✅ `Chat.jsx` - Message images and files  
- ✅ `ChatPanel.jsx` - Message images and files

## Next Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Fix image display by converting relative URLs to absolute URLs"
git push -u origin main
```

### 2. Redeploy Frontend (Vercel)
- Vercel should auto-deploy when you push to GitHub
- Or manually redeploy: Vercel Dashboard → Your Project → Deployments → Redeploy

### 3. Verify Vercel Environment Variable
Make sure `VITE_API_URL` in Vercel is set to:
```
https://hometown-hub-production.up.railway.app/api
```
(Include `/api` at the end)

### 4. Test Image Display
1. Create a new post with an image
2. Verify the image displays correctly
3. Check browser console (F12) for any errors
4. Check Network tab to see if image requests are going to Railway URL

## How It Works

**Before:**
- Backend stores: `/uploads/photo123.png`
- Frontend tries to load: `https://vercel-url/uploads/photo123.png` ❌ (doesn't exist)

**After:**
- Backend stores: `/uploads/photo123.png`
- Frontend converts to: `https://railway-url/uploads/photo123.png` ✅ (correct!)

## Troubleshooting

### Images Still Not Showing?

1. **Check Vercel Environment Variable**
   - Go to Vercel → Settings → Environment Variables
   - Verify `VITE_API_URL` = `https://YOUR_RAILWAY_URL/api`

2. **Check Browser Console**
   - Press F12 → Console tab
   - Look for 404 errors on image URLs
   - Verify the image URL is pointing to Railway, not Vercel

3. **Check Network Tab**
   - Press F12 → Network tab
   - Try loading a post with an image
   - Click on the image request
   - Verify the URL is: `https://railway-url/uploads/...`

4. **Verify Railway Static Files**
   - Test directly: `https://YOUR_RAILWAY_URL/uploads/filename.png`
   - Should return the image file
   - If 404, check Railway logs for static file serving

5. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or use incognito mode

## Expected Behavior

✅ Images uploaded to posts display correctly
✅ Images in messages display correctly  
✅ Videos display correctly
✅ File downloads work correctly
✅ Works in both development and production
