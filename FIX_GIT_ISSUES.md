# Fix Git Issues - Lock Files & Authentication

## Issue 1: Lock File Error
**Error**: `unable to unlink '.git/config.lock': Invalid argument`

**Cause**: OneDrive is syncing the `.git` folder, causing lock file conflicts.

## Solutions:

### Option A: Exclude .git from OneDrive (Recommended)
1. Open OneDrive settings
2. Go to "Sync and backup" → "Advanced settings"
3. Add `.git` folder to exclusion list
4. Or pause OneDrive sync temporarily while pushing

### Option B: Delete Lock File Manually
1. Close all Git applications (Git Bash, VS Code, GitHub Desktop)
2. Navigate to: `C:\Users\91991\OneDrive\Desktop\HomeTown-Hub\.git\`
3. Delete `config.lock` file if it exists
4. Try Git commands again

### Option C: Use GitHub Desktop (Easiest)
GitHub Desktop handles lock files automatically:
1. Download: https://desktop.github.com/
2. Sign in with GitHub
3. Open your repository
4. Click "Push origin"

---

## Issue 2: Authentication Error
**Error**: `could not read Username for 'https://github.com'`

**Solution**: Use a Personal Access Token instead of password:

### Step 1: Create GitHub Personal Access Token
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name it: "HomeTown-Hub"
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Use Token for Authentication

**Option A: Use Token in URL (One-time)**
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/sanjana123-dot/HomeTown-Hub.git
```

**Option B: Use Git Credential Manager (Recommended)**
```bash
# When Git asks for username, enter your GitHub username
# When Git asks for password, paste your Personal Access Token
git push -u origin main
```

**Option C: Store Credentials**
```bash
# Store credentials (Windows Credential Manager)
git config --global credential.helper wincred

# Then push (will prompt once, then remember)
git push -u origin main
```

---

## Complete Fix Steps:

1. **Delete lock file** (if exists):
   - Close all Git apps
   - Delete `.git/config.lock`
   - Delete `.git/index.lock` (if exists)

2. **Create Personal Access Token** on GitHub

3. **Push with token**:
   ```bash
   git push -u origin main
   # Username: sanjana123-dot
   # Password: [paste your Personal Access Token]
   ```

4. **Or use GitHub Desktop** - handles everything automatically!

---

## Quick Fix (If in a hurry):

**Use GitHub Desktop:**
1. Download and install GitHub Desktop
2. Sign in with GitHub
3. File → Add Local Repository → Select your folder
4. Click "Push origin" button
5. Done! ✅

GitHub Desktop handles:
- Lock files automatically
- Authentication automatically
- Network issues better
- OneDrive conflicts better
