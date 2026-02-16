# Fix Git Lock File Issue

## Quick Fix Steps

The `.git/config.lock` file is locked by OneDrive. Here's how to fix it:

### Method 1: Manual Delete (Try This First)

1. **Close all programs** that might be using the folder:
   - VS Code / Cursor
   - File Explorer windows
   - Any terminals

2. **Open File Explorer** and navigate to:
   ```
   C:\Users\91991\OneDrive\Desktop\HomeTown-Hub\.git
   ```

3. **Delete the file** `config.lock` manually:
   - Right-click on `config.lock`
   - Select "Delete"
   - If it says "File is in use", continue to Method 2

4. **Then run in terminal:**
   ```bash
   git remote add origin https://github.com/sanjana123-dot/HomeTown-Hub.git
   git branch -M main
   git push -u origin main
   ```

### Method 2: Pause OneDrive Temporarily

1. **Right-click OneDrive icon** in system tray (bottom right)
2. Click **"Pause syncing"** → **"2 hours"**
3. Wait 30 seconds for sync to pause
4. **Delete the lock file** manually from File Explorer
5. **Run your git commands**
6. **Resume OneDrive** when done

### Method 3: Use GitHub Desktop (Easiest)

1. Download: https://desktop.github.com/
2. Open GitHub Desktop
3. File → Add Local Repository
4. Select: `C:\Users\91991\OneDrive\Desktop\HomeTown-Hub`
5. It will detect your existing git setup
6. Click "Publish repository" button
7. Done! It handles everything automatically

### Method 4: Edit Config File Directly

If you can't delete the lock file, manually edit the config:

1. Navigate to: `C:\Users\91991\OneDrive\Desktop\HomeTown-Hub\.git\`
2. Open `config` file in Notepad
3. Add these lines at the end:
   ```
   [remote "origin"]
       url = https://github.com/sanjana123-dot/HomeTown-Hub.git
       fetch = +refs/heads/*:refs/remotes/origin/*
   ```
4. Save and close
5. Then run:
   ```bash
   git branch -M main
   git push -u origin main
   ```

## Recommended: Use GitHub Desktop

GitHub Desktop is the easiest solution and handles OneDrive sync issues automatically.
