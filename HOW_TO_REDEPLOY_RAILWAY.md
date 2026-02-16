# How to Redeploy on Railway

## Where to Find Redeploy Button

The redeploy button is **NOT** in the settings pages (Networking, Scale, Build, Deploy, Config-as-code).

### Method 1: From Deployments Tab (Easiest)

1. **Go back to your service main page**
   - Click on your service name at the top (or use the breadcrumb navigation)
   - You should see tabs like: "Overview", "Deployments", "Metrics", "Logs", etc.

2. **Click on "Deployments" tab**
   - This shows a list of all your deployments

3. **Find the latest deployment**
   - Look for the most recent deployment (usually at the top)

4. **Click the three dots (⋯) menu** on the latest deployment
   - Or look for a "Redeploy" button directly on the deployment card

5. **Click "Redeploy"**
   - This will trigger a new deployment with your latest code

### Method 2: From Service Overview

1. **Go to your service main page**
   - Click on "hometown-hub" service name

2. **Look for "Deployments" section**
   - Usually shows recent deployments with a "View All" or "Redeploy" button

3. **Click "Redeploy"** or go to Deployments tab

### Method 3: Trigger via GitHub Push (Automatic)

If you have GitHub connected:
- Just push to your main branch
- Railway will automatically redeploy
- Check the "Deployments" tab to see the new deployment starting

## Visual Guide:

```
Railway Dashboard
  └── Your Project
      └── hometown-hub (service)
          ├── Overview (main page)
          ├── Deployments ← CLICK HERE
          │   └── [Latest Deployment]
          │       └── ⋯ (three dots) → "Redeploy"
          ├── Metrics
          ├── Logs
          └── Settings (Networking, Scale, Build, etc.)
```

## Quick Steps:

1. **Exit Settings** - Click your service name or "Overview" to go back
2. **Click "Deployments" tab** - Should be near the top
3. **Find latest deployment** - Usually shows "Active" or "Success"
4. **Click three dots (⋯)** - On the deployment card
5. **Click "Redeploy"** - Confirm if asked

## Alternative: Force Redeploy via Settings

If you can't find the redeploy button:

1. Go to **Settings** → **Deploy** (the page you were viewing)
2. Make a small change (like add a space to the start command and remove it)
3. Save - This might trigger a redeploy
4. Or better: Just push a new commit to GitHub (even a small change)

## After Redeploy:

1. Wait 2-5 minutes for deployment to complete
2. Check "Deployments" tab - Should show "Building" → "Deploying" → "Active"
3. Click on the new deployment → "View Logs"
4. Look for the route registration messages we added

---

**TL;DR**: Go to **"Deployments" tab** (not Settings), find latest deployment, click **three dots (⋯)**, click **"Redeploy"**.
