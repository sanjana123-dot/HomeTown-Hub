# Login Guide: Platform Admin & Community Admin

This guide explains how to login as a Platform Admin and how to become/access Community Admin features.

---

## 🔐 Important: There is NO Separate Login Page

**Both Platform Admins and Community Admins use the SAME login page** (`/login`). The system automatically recognizes your role and grants appropriate access.

---

## ⚙️ How to Login as Platform Admin

### Step 1: Create a Platform Admin Account

You need to create an admin account first. There are 3 methods:

#### Method 1: Using the Admin Creation Script (Recommended)

1. **Open terminal** in your project root
2. **Navigate to backend directory**:
   ```bash
   cd backend
   ```
3. **Run the admin creation script**:
   ```bash
   node scripts/createAdmin.js <email> <name> [hometown] [city] [state]
   ```
   
   **Example:**
   ```bash
   node scripts/createAdmin.js admin@hometownhub.com "Admin User" "New York" "New York" "NY"
   ```

4. **Save the password** that's displayed:
   ```
   ✓ Admin user created successfully!
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Email: admin@hometownhub.com
   Name: Admin User
   Password: xyz123abc456A1!
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   ⚠️  IMPORTANT: Save this password securely!
   ```

#### Method 2: Using MongoDB Directly

1. **Open MongoDB Compass** or MongoDB shell
2. **Connect to your database** (usually `hometown-hub`)
3. **Run this command**:
   ```javascript
   use hometown-hub
   
   db.users.insertOne({
     name: "Admin User",
     email: "admin@hometownhub.com",
     password: "$2a$10$...", // You'll need to hash the password with bcrypt
     hometown: "New York",
     city: "New York",
     state: "NY",
     role: "admin",
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```
   
   **Note**: For password hashing, you can use the script method instead, or use an online bcrypt generator.

#### Method 3: Update Existing User to Admin

If you already have a user account, you can make it an admin:

```javascript
// In MongoDB
use hometown-hub

db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Step 2: Login as Platform Admin

1. **Go to the login page**: `http://localhost:3000/login`
2. **Enter your admin credentials**:
   - Email: The email you used when creating the admin account
   - Password: The password from the script (or your existing password if you updated an existing user)
3. **Click "Login"**
4. **You'll be redirected to the User Dashboard**

### Step 3: Access Platform Admin Dashboard

After logging in as a platform admin:

1. **Look in the sidebar** - You'll see a **"Platform Admin"** link
2. **OR navigate directly** to: `http://localhost:3000/admin`
3. **You'll see the Platform Admin Dashboard** with tabs for:
   - Overview (platform statistics)
   - User Management (suspend/ban users)
   - Community Approvals (approve/reject communities)
   - Admin Management (create more admins)

### Visual Indicators:

- **Sidebar**: Shows "Platform Admin" badge and link
- **Dashboard**: Shows "Platform Admin" link in header
- **Access**: You can access `/admin` route

---

## 🛡️ How to Login as Community Admin

### Important: Community Admin is NOT a Separate Login!

**Community Admin status is automatic** - you become a community admin when you:
1. **Create a community** (you become the creator/admin)
2. **Are assigned as a moderator** by a creator or platform admin

### Step 1: Login as a Regular User

1. **Go to the login page**: `http://localhost:3000/login`
2. **Login with your regular user credentials**
3. **You'll be redirected to the User Dashboard**

### Step 2: Become a Community Admin

**Option A: Create a Community**

1. **Click "Create Community"** in the sidebar
2. **Fill out the community form**:
   - Name
   - Description
   - City, State
   - Rules (optional)
   - Require Approval toggle (optional)
3. **Click "Create Community"**
4. **You're now a Community Admin!** (as the creator)

**Option B: Be Assigned as Moderator**

1. A community creator or platform admin assigns you as a moderator
2. You'll receive a notification
3. **You're now a Community Admin!** (as a moderator)

### Step 3: Access Community Admin Dashboard

After becoming a community admin:

1. **Look in the sidebar** - You'll see a **"Community Admin"** link appear
2. **OR navigate directly** to: `http://localhost:3000/community-admin`
3. **You'll see the Community Admin Dashboard** showing:
   - All communities you manage
   - Pending join requests
   - Current members
   - Community settings

### Visual Indicators:

- **Sidebar**: Shows "Community Admin" badge and link (only if you manage communities)
- **Community Page**: Shows admin controls when viewing your communities
- **Access**: You can access `/community-admin` route

---

## 📊 Role Comparison

| Feature | Regular User | Community Admin | Platform Admin |
|---------|-------------|-----------------|----------------|
| **Login Page** | `/login` | `/login` (same) | `/login` (same) |
| **How to Get Role** | Register normally | Create community OR be assigned moderator | Use admin script OR MongoDB |
| **Dashboard Access** | `/dashboard` | `/dashboard` + `/community-admin` | `/dashboard` + `/community-admin` + `/admin` |
| **Sidebar Links** | Basic links | + "Community Admin" | + "Community Admin" + "Platform Admin" |

---

## 🔍 Quick Checklist

### To Login as Platform Admin:
- [ ] Create admin account using script or MongoDB
- [ ] Go to `/login`
- [ ] Enter admin email and password
- [ ] Click "Login"
- [ ] See "Platform Admin" link in sidebar
- [ ] Click it to access Platform Admin Dashboard

### To Become/Login as Community Admin:
- [ ] Login as regular user at `/login`
- [ ] Create a community OR be assigned as moderator
- [ ] See "Community Admin" link appear in sidebar
- [ ] Click it to access Community Admin Dashboard

---

## 🚨 Troubleshooting

### "I don't see Platform Admin link in sidebar"

**Check:**
1. Is your user role set to `"admin"` in the database?
2. Did you logout and login again after changing role?
3. Check MongoDB: `db.users.findOne({ email: "your-email" })` - should show `role: "admin"`

### "I don't see Community Admin link in sidebar"

**Check:**
1. Have you created a community? (Check `/dashboard/communities`)
2. Are you assigned as a moderator? (Check with community creator)
3. Try refreshing the page
4. Check if communities exist: `db.communities.find({ $or: [{ creator: yourUserId }, { moderators: yourUserId }] })`

### "I can't access `/admin` route"

**Check:**
1. Your role must be `"admin"` in database
2. Logout and login again
3. Check browser console for errors
4. Verify backend is running

### "I can't access `/community-admin` route"

**Check:**
1. You must be creator or moderator of at least one community
2. Check if community exists: `db.communities.find({ creator: yourUserId })`
3. Try creating a new community first

---

## 📝 Example Workflow

### Creating Your First Platform Admin:

```bash
# Terminal
cd backend
node scripts/createAdmin.js admin@test.com "Test Admin" "Test City" "Test City" "TS"

# Output shows password - save it!
# Then go to http://localhost:3000/login
# Login with admin@test.com and the password
# See "Platform Admin" link in sidebar
```

### Becoming a Community Admin:

```
1. Login as regular user
2. Click "Create Community"
3. Fill form and submit
4. See "Community Admin" link appear in sidebar
5. Click it to manage your community
```

---

## 💡 Pro Tips

1. **Platform Admins** can also be Community Admins if they create communities
2. **Community Admins** can manage multiple communities (if they created multiple or are moderator of multiple)
3. **You can have multiple roles** - a Platform Admin who creates communities will see both admin links
4. **Role badges** in sidebar show all your roles clearly
5. **No special login needed** - just use the regular login page!

---

## 🎯 Summary

- **Platform Admin Login**: Create admin account → Login normally → Access `/admin`
- **Community Admin Login**: Login normally → Create community → Access `/community-admin`
- **Same Login Page**: Both use `/login` - no separate login pages
- **Automatic Recognition**: System recognizes your roles automatically
- **Visual Indicators**: Sidebar shows your roles and provides links to dashboards
