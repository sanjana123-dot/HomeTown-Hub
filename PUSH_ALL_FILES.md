# Push All Files to New GitHub Repository

## Step-by-Step Instructions

### Option 1: Using GitHub Desktop (Easiest - Recommended)

1. **Download GitHub Desktop**: https://desktop.github.com/
2. **Install and open** GitHub Desktop
3. **Sign in** with your GitHub account
4. **File → Add Local Repository**
5. **Click "Choose"** and select: `C:\Users\91991\OneDrive\Desktop\HomeTown-Hub`
6. **If it asks to initialize**, click "Yes" (or it might detect existing git)
7. **You'll see all your files** listed as changes
8. **Write commit message**: 
   ```
   Initial commit: HomeTown Hub - Complete community networking platform
   ```
9. **Click "Commit to main"**
10. **Click "Publish repository"** (or "Push origin" if already published)
11. **Select your new repository**: `sanjana123-dot/HomeTown-Hub`
12. **Done!** ✅

### Option 2: Using Command Line

**First, remove lock files:**

1. **Close all programs** (Cursor, file explorer, terminals)
2. **Open File Explorer** → Navigate to: `C:\Users\91991\OneDrive\Desktop\HomeTown-Hub\.git`
3. **Delete any `.lock` files** you see:
   - `index.lock`
   - `config.lock`
   - Any other files ending in `.lock`

**Then run these commands:**

```bash
cd c:\Users\91991\OneDrive\Desktop\HomeTown-Hub

# Remove old remote (if exists)
git remote remove origin

# Add your new repository
git remote add origin https://github.com/sanjana123-dot/HomeTown-Hub.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: HomeTown Hub - Complete community networking platform

Features:
- User registration and authentication
- Profile management with full editing
- Community creation and management
- Posts, comments, and events
- Account deletion functionality
- Password reset functionality
- Deployment configurations (Vercel, Railway, Render)"

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option 3: Upload via GitHub Web Interface (If lock files persist)

1. **Go to your repository**: https://github.com/sanjana123-dot/HomeTown-Hub
2. **Click "uploading an existing file"**
3. **Drag and drop** your entire project folder
4. **Write commit message**
5. **Click "Commit changes"**

⚠️ **Note**: This method doesn't create a proper git repository locally, so future updates will be harder.

## Recommended: Use GitHub Desktop

GitHub Desktop is the easiest and handles all the lock file issues automatically!
