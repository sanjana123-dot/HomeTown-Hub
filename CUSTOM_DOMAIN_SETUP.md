# Custom Domain Setup Guide

## Overview
This guide will help you set up a custom domain (like `hometownhub.com`) for your Vercel deployment instead of the default `*.vercel.app` URL.

---

## Step 1: Buy a Domain (If You Don't Have One)

### Recommended Domain Registrars:
1. **Namecheap** (https://www.namecheap.com) - Popular, good prices
2. **Google Domains** (https://domains.google) - Simple interface
3. **GoDaddy** (https://www.godaddy.com) - Well-known
4. **Cloudflare** (https://www.cloudflare.com/products/registrar) - Good security

### Domain Name Ideas:
- `hometownhub.com`
- `myhometown.app`
- `hometown-connect.com`
- `community-hub.net`
- `hometown-social.com`

**Cost:** Usually $10-15/year for `.com` domains

---

## Step 2: Add Domain to Vercel

### 2.1 Go to Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Click on your project: **HomeTown-Hub** (or whatever you named it)

### 2.2 Navigate to Domains Settings
1. Click **"Settings"** tab (top navigation)
2. Click **"Domains"** in the left sidebar
3. You'll see your current domain: `home-town-*.vercel.app`

### 2.3 Add Your Custom Domain
1. Click **"Add Domain"** button
2. Enter your domain (e.g., `hometownhub.com`)
3. Click **"Add"**

### 2.4 Vercel Will Show DNS Instructions
Vercel will display:
- **Type:** `A` or `CNAME`
- **Name:** `@` or `www`
- **Value:** An IP address or CNAME value

**Example:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**OR**

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Step 3: Configure DNS at Your Domain Registrar

### 3.1 Log into Your Domain Registrar
- Go to your domain registrar's website
- Log in to your account
- Find "DNS Management" or "DNS Settings"

### 3.2 Add DNS Records

#### Option A: Root Domain (hometownhub.com)
Add an **A record**:
- **Type:** `A`
- **Name/Host:** `@` (or leave blank, or `hometownhub.com`)
- **Value:** `76.76.21.21` (Vercel will provide the exact IP)
- **TTL:** `3600` (or default)

#### Option B: WWW Subdomain (www.hometownhub.com)
Add a **CNAME record**:
- **Type:** `CNAME`
- **Name/Host:** `www`
- **Value:** `cname.vercel-dns.com` (Vercel will provide exact value)
- **TTL:** `3600` (or default)

#### Option C: Both (Recommended)
Add **both**:
1. A record for `@` → `76.76.21.21`
2. CNAME record for `www` → `cname.vercel-dns.com`

This way both `hometownhub.com` and `www.hometownhub.com` work!

### 3.3 Save DNS Records
- Click "Save" or "Add Record"
- Wait for DNS propagation (5-30 minutes, sometimes up to 48 hours)

---

## Step 4: Verify Domain in Vercel

### 4.1 Check Domain Status
1. Go back to Vercel → Settings → Domains
2. You'll see your domain with status:
   - ⏳ **Pending** - DNS is propagating
   - ✅ **Valid** - Domain is ready!
   - ❌ **Invalid** - Check DNS settings

### 4.2 Wait for DNS Propagation
- Usually takes 5-30 minutes
- Can take up to 48 hours in rare cases
- You can check status: https://dnschecker.org

---

## Step 5: Update Backend CORS Settings

Once your custom domain is working, update Railway to allow it:

### 5.1 Get Your Custom Domain URL
- Your new domain: `https://hometownhub.com` (or whatever you chose)

### 5.2 Update Railway Environment Variables
1. Go to Railway Dashboard: https://railway.app/
2. Click on your backend service
3. Click **"Variables"** tab
4. Find `FRONTEND_URL`
5. Update it to: `https://hometownhub.com` (your custom domain)
6. Click **"Save"**

### 5.3 Redeploy Railway (Optional)
- Railway will auto-update, but you can manually redeploy if needed

---

## Step 6: Test Your Custom Domain

### 6.1 Test Frontend
1. Open your browser
2. Go to: `https://hometownhub.com`
3. Should see your HomeTown Hub website!

### 6.2 Test Login/API
1. Try logging in
2. Check browser console (F12) for any CORS errors
3. If you see CORS errors, verify `FRONTEND_URL` in Railway

### 6.3 Test Both URLs
- `https://hometownhub.com` ✅
- `https://www.hometownhub.com` ✅ (if you set up www)

---

## Troubleshooting

### Domain Not Working?

1. **Check DNS Propagation:**
   - Go to: https://dnschecker.org
   - Enter your domain
   - Check if DNS records are propagated globally

2. **Verify DNS Records:**
   - Go back to your domain registrar
   - Make sure records match exactly what Vercel provided
   - Check for typos

3. **Check Vercel Domain Status:**
   - Vercel → Settings → Domains
   - Look for error messages
   - Vercel will tell you what's wrong

4. **Wait Longer:**
   - DNS can take up to 48 hours
   - Be patient!

### CORS Errors After Adding Domain?

1. **Update Railway `FRONTEND_URL`:**
   - Make sure it matches your custom domain exactly
   - Include `https://`
   - No trailing slash

2. **Redeploy Railway:**
   - Force a redeploy after updating environment variable

3. **Check Backend Logs:**
   - Railway → Logs
   - Look for CORS error messages

### SSL Certificate Issues?

- Vercel automatically provides SSL certificates
- Usually takes a few minutes after domain is verified
- If you see "Not Secure" warning, wait a bit longer

---

## Quick Reference

### Current Setup:
- **Frontend:** `home-town-*.vercel.app`
- **Backend:** `hometown-hub-production.up.railway.app`
- **Custom Domain:** Not set

### After Setup:
- **Frontend:** `hometownhub.com` ✅
- **Backend:** `hometown-hub-production.up.railway.app` (stays same)
- **Custom Domain:** `hometownhub.com` ✅

---

## Summary Checklist

- [ ] Buy a domain (if needed)
- [ ] Add domain to Vercel
- [ ] Configure DNS at registrar
- [ ] Wait for DNS propagation
- [ ] Verify domain in Vercel
- [ ] Update Railway `FRONTEND_URL`
- [ ] Test custom domain
- [ ] Test login/API functionality

---

## Need Help?

If you get stuck:
1. Check Vercel documentation: https://vercel.com/docs/concepts/projects/domains
2. Check your domain registrar's DNS documentation
3. Verify DNS records match Vercel's requirements exactly

**You're all set!** Once DNS propagates, your custom domain will be live! 🎉
