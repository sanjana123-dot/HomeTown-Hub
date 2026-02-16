# Fix Git "Could not resolve host: github.com" Error

## Quick Fixes (Try in Order)

### 1. Flush DNS Cache
Open PowerShell as Administrator and run:
```powershell
ipconfig /flushdns
```

### 2. Try Using SSH Instead of HTTPS
If HTTPS isn't working, switch to SSH:

```bash
# Check if you have SSH keys set up
ssh -T git@github.com

# If SSH works, change remote URL:
git remote set-url origin git@github.com:sanjana123-dot/HomeTown-Hub.git

# Then try pushing:
git push -u origin main
```

### 3. Use GitHub CLI (Alternative)
If Git still doesn't work, use GitHub CLI:
```bash
# Install GitHub CLI if not installed
# Then authenticate:
gh auth login

# Push using GitHub CLI:
gh repo sync
```

### 4. Check Your Internet Connection
- Make sure you're connected to the internet
- Try accessing github.com in your browser
- Check if you're behind a firewall/proxy

### 5. Temporarily Disable VPN/Proxy
If you're using a VPN or proxy, try disabling it temporarily.

### 6. Use GitHub Desktop (Easiest Solution)
1. Download GitHub Desktop: https://desktop.github.com/
2. Sign in with your GitHub account
3. Open your repository
4. Click "Push origin" button

GitHub Desktop handles network issues better than command line Git.

### 7. Check Git Configuration
```bash
# Check Git version
git --version

# Check remote URL
git remote -v

# If URL looks wrong, set it again:
git remote set-url origin https://github.com/sanjana123-dot/HomeTown-Hub.git
```

### 8. Try Different DNS Servers
If DNS is the issue, try using Google DNS:
1. Open Network Settings
2. Change DNS to: 8.8.8.8 and 8.8.4.4
3. Flush DNS: `ipconfig /flushdns`

### 9. Check Windows Firewall
Make sure Windows Firewall isn't blocking Git:
1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Make sure Git is allowed

## Most Likely Solutions

**For Windows users, the most common fixes are:**
1. **Flush DNS** (`ipconfig /flushdns` as Administrator)
2. **Use GitHub Desktop** (handles network issues automatically)
3. **Switch to SSH** (more reliable than HTTPS)

## Still Not Working?

If none of these work, the issue might be:
- Corporate firewall blocking GitHub
- ISP DNS issues
- Temporary GitHub outage

In that case, wait a few minutes and try again, or use GitHub Desktop which handles these issues better.
