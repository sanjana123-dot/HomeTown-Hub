# Admin Account Setup Guide

This guide explains how to create admin accounts and restrict admin dashboard access to only authorized personnel.

## Method 1: Using the Admin Creation Script (Recommended)

### Step 1: Create Your First Admin

Run the admin creation script from the backend directory:

```bash
cd backend
node scripts/createAdmin.js <email> <name> [hometown] [city] [state]
```

**Example:**
```bash
node scripts/createAdmin.js admin@example.com "Admin User" "New York" "New York" "NY"
```

The script will:
- Create a new admin user
- Generate a secure random password
- Display the password (save it securely!)

**Output:**
```
✓ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: admin@example.com
Name: Admin User
Password: xyz123abc456A1!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANT: Save this password securely!
   The user should change it after first login.
```

### Step 2: Login and Change Password

1. Go to http://localhost:3000/login
2. Login with the email and temporary password
3. Change the password immediately (you can add a password change feature)

## Method 2: Using MongoDB Directly

### Option A: Create New Admin User

```javascript
// In MongoDB shell or MongoDB Compass
use hometown-hub

db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$...", // Use bcrypt hash (or let the app hash it)
  hometown: "New York",
  city: "New York",
  state: "NY",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Option B: Update Existing User to Admin

```javascript
// In MongoDB shell or MongoDB Compass
use hometown-hub

db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

## Method 3: Using Admin Dashboard (After First Admin is Created)

Once you have at least one admin account:

1. Login as an admin
2. Go to Admin Dashboard
3. Click "Create Admin" button
4. Fill in the admin details
5. A temporary password will be generated and displayed
6. Share the password securely with the new admin

## Security Features

### 1. Role-Based Access Control

- **Backend Protection**: All admin routes are protected by `admin` middleware
- **Frontend Protection**: `AdminRoute` component redirects non-admins
- **API Protection**: Admin endpoints check `user.role === 'admin'`

### 2. Admin-Only Features

Only users with `role: 'admin'` can:
- Access `/admin` route
- View platform statistics
- Approve/reject communities
- Create new admin accounts
- View list of all admins

### 3. Restricted Admin Creation

- **Script Method**: Requires direct database/server access
- **Dashboard Method**: Only existing admins can create new admins
- **No Public Registration**: Regular registration always creates `role: 'user'`

## Best Practices

### 1. Limit Admin Accounts

- Only create admin accounts for trusted personnel
- Keep the number of admins minimal
- Regularly review admin list in Admin Dashboard

### 2. Secure Admin Passwords

- Use strong, unique passwords
- Change passwords regularly
- Never share admin credentials publicly
- Use password managers for secure storage

### 3. Monitor Admin Activity

- Regularly check the admin list in Admin Dashboard
- Review community approvals/rejections
- Monitor platform statistics

### 4. Remove Admin Access

To remove admin access from a user:

```javascript
// In MongoDB shell or MongoDB Compass
use hometown-hub

db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "user" } }
)
```

## Troubleshooting

### Can't Access Admin Dashboard

1. **Check User Role**: Verify `role: 'admin'` in database
2. **Check Token**: Logout and login again to refresh token
3. **Check Route**: Ensure you're accessing `/admin` not `/dashboard`

### Admin Script Not Working

1. **Check MongoDB Connection**: Ensure MongoDB is running
2. **Check Environment Variables**: Verify `.env` file has correct `MONGODB_URI`
3. **Check Node Version**: Ensure Node.js v16+ is installed

### Forgot Admin Password

1. Use MongoDB to reset password (requires bcrypt hash)
2. Or delete the admin user and create a new one
3. Or add a password reset feature to the application

## Environment Variables

Make sure your `.env` file includes:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hometown-hub
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
```

## Platform Admin Features

Once logged in as a platform admin, you have access to:

### 1. **Community Control**
- **Approve/Reject Communities**: Review and approve new community creation requests
- **Auto-Approval**: Communities created by admins are automatically approved
- **Prevent Duplicates**: Review communities before they go live

### 2. **User & Moderator Management**
- **View All Users**: Search and filter users by role, status, etc.
- **Suspend Users**: Temporarily suspend users who violate rules (with reason)
- **Ban Users**: Permanently ban abusive users (with reason)
- **Assign Moderators**: Assign moderator roles to users for specific communities
- **Revoke Moderators**: Remove moderator roles from users

### 3. **Monitoring & Analytics**
- **Platform Statistics**: View total users, communities, posts, and more
- **Activity Metrics**: See suspended/banned users, moderators count, recent signups
- **User Search**: Search users by name or email
- **Filter Users**: Filter by role (user/moderator/admin), suspension status, ban status

### 4. **Admin Management**
- **Create Admins**: Create new platform admin accounts
- **View Admins**: See all current platform admins
- **Temporary Passwords**: Generated passwords for new admins (must be changed on first login)

## How to Login as Platform Admin

### Step 1: Create Your First Admin Account

**Option A: Using the Script (Recommended)**
```bash
cd backend
node scripts/createAdmin.js admin@example.com "Admin Name" "Hometown" "City" "State"
```

The script will output:
```
✓ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: admin@example.com
Name: Admin Name
Password: xyz123abc456A1!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANT: Save this password securely!
```

**Option B: Using MongoDB**
```javascript
use hometown-hub
db.users.insertOne({
  name: "Admin Name",
  email: "admin@example.com",
  password: "$2a$10$...", // bcrypt hash
  hometown: "Hometown",
  city: "City",
  state: "State",
  role: "admin"
})
```

### Step 2: Login Normally

1. Go to `http://localhost:3000/login`
2. Enter your admin email and the temporary password
3. Click "Login"
4. You'll be redirected to your dashboard

### Step 3: Access Admin Dashboard

After logging in as an admin:
- You'll see an **"Admin Dashboard"** link in the sidebar
- Or navigate directly to `http://localhost:3000/admin`
- The Admin Dashboard has tabs for:
  - **Overview**: Platform statistics and metrics
  - **User Management**: Search, suspend, ban users
  - **Community Approvals**: Approve/reject pending communities
  - **Admin Management**: Create new admin accounts

## Important Notes

- **No Special Login Page**: Platform admins use the same login page as regular users
- **Auto-Recognition**: The system recognizes you as admin based on your `role: 'admin'` in the database
- **Access Control**: Only users with `role: 'admin'` can access `/admin` routes
- **Auto-Approved Communities**: Communities you create are automatically approved (no need to approve your own)

## Summary

- **First Admin**: Use the script or MongoDB directly
- **Additional Admins**: Use Admin Dashboard (after first admin exists)
- **Login**: Use the normal login page with admin email/password
- **Security**: Role-based access control protects all admin features
- **Access Control**: Only users with `role: 'admin'` can access admin features
- **Platform Admin Powers**: Community approval, user management (suspend/ban), analytics, moderator assignment


