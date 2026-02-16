# Roles Guide: Platform Admin, Community Admin, and Users

This document explains the three distinct roles in HomeTown Hub and their respective features.

---

## 🎭 Three Roles Overview

### 1. **Regular Users** 👤
- **Who**: All registered members of the platform
- **Access**: Basic features for community participation
- **Dashboard**: `/dashboard` (User Dashboard)

### 2. **Community Admins** 🛡️
- **Who**: Creators and moderators of specific communities
- **Access**: Management features for their communities
- **Dashboard**: `/community-admin` (Community Admin Dashboard)

### 3. **Platform Admins** ⚙️
- **Who**: System administrators with platform-wide control
- **Access**: Full platform management capabilities
- **Dashboard**: `/admin` (Platform Admin Dashboard)

---

## 👤 Regular Users - Features

### What Users Can Do:

1. **Profile Management**
   - Register and login
   - Update profile (name, hometown, avatar)
   - View their profile

2. **Community Participation**
   - Discover communities
   - Join communities (or request to join if approval required)
   - View community posts and events
   - Leave communities

3. **Content Creation**
   - Create posts (text, images, videos, files) in communities they're members of
   - Add captions to media posts
   - Like and comment on posts
   - Share posts

4. **Events**
   - View upcoming events
   - Join/register for events
   - View event details

5. **Notifications**
   - Receive notifications for:
     - New posts in their communities
     - Likes and comments on their posts
     - New events
     - Community announcements

6. **Feed**
   - View personalized feed from all their communities
   - See posts from communities they're members of

---

## 🛡️ Community Admins - Features

### Who Are Community Admins?

- **Creators**: Users who created a community
- **Moderators**: Users assigned as moderators by creators or platform admins
- **Platform Admins**: Automatically have community admin privileges for all communities

### What Community Admins Can Do:

1. **Community Management**
   - Edit community rules
   - Update community settings
   - Toggle "Require Approval" for new members
   - View community statistics

2. **Member Management**
   - Approve or reject join requests (if approval required)
   - Remove members from their community
   - View all members and pending requests
   - Cannot remove the community creator

3. **Content Moderation**
   - Pin/unpin posts in their community
   - Delete posts in their community
   - Delete comments in their community

4. **Event Management**
   - Create events for their community
   - Delete events from their community

5. **Access**
   - Access Community Admin Dashboard at `/community-admin`
   - See all communities they manage in one place
   - Quick actions for member approval/rejection

### How to Become a Community Admin:

1. **Create a Community**: When you create a community, you automatically become its creator/admin
2. **Be Assigned as Moderator**: A creator or platform admin can assign you as a moderator

---

## ⚙️ Platform Admins - Features

### Who Are Platform Admins?

- Users with `role: 'admin'` in the database
- Created using the admin creation script (see `ADMIN_SETUP.md`)

### What Platform Admins Can Do:

1. **Platform-Wide Control**
   - Approve or reject new community creation requests
   - View platform statistics and analytics
   - Monitor platform activity

2. **User Management**
   - View all users with search and filters
   - Suspend users (temporary restriction)
   - Unsuspend users
   - Ban users (permanent restriction)
   - Unban users
   - View user details and activity

3. **Community Management**
   - Approve/reject community creation requests
   - View all communities
   - Assign moderators to communities
   - Revoke moderator roles
   - Communities created by platform admins are auto-approved

4. **Admin Management**
   - Create new platform admin accounts
   - View all platform admins
   - Manage admin access

5. **Monitoring & Analytics**
   - View platform statistics:
     - Total users, communities, posts, events
     - Pending community approvals
     - Suspended/banned users
     - Recent activity

6. **Abuse Handling**
   - Review reports (if implemented)
   - Resolve disputes
   - Take action against abusive users

7. **Content Organization**
   - Manage categories and tags (if implemented)
   - Keep platform content organized

### Access:

- **Platform Admin Dashboard**: `/admin`
- **User Dashboard**: `/dashboard` (still accessible for regular user activities)
- **Community Admin Dashboard**: `/community-admin` (if they created/manage communities)

### How to Create a Platform Admin:

See `ADMIN_SETUP.md` for detailed instructions.

---

## 🔐 Role Separation & Access Control

### Role Hierarchy:

```
Platform Admin (highest)
    ↓ (can do everything below)
Community Admin
    ↓ (can do everything below)
Regular User (base level)
```

### Access Rules:

1. **Platform Admins**:
   - Can access Platform Admin Dashboard (`/admin`)
   - Can access Community Admin Dashboard (`/community-admin`) if they manage communities
   - Can access User Dashboard (`/dashboard`) for regular activities
   - Have community admin privileges automatically

2. **Community Admins**:
   - Can access Community Admin Dashboard (`/community-admin`)
   - Can access User Dashboard (`/dashboard`) for regular activities
   - Cannot access Platform Admin Dashboard (`/admin`)

3. **Regular Users**:
   - Can only access User Dashboard (`/dashboard`)
   - Cannot access admin dashboards

### Visual Indicators:

- **Sidebar**: Shows role badges (User, Community Admin, Platform Admin)
- **Dashboards**: Clear labels indicating which dashboard you're viewing
- **UI Elements**: Admin-only features are hidden from regular users

---

## 📍 Navigation

### Sidebar Menu Items:

**All Users:**
- Dashboard (User Dashboard)
- My Communities
- Discover Communities
- Events
- Create Community

**Community Admins (additional):**
- Community Admin (link to Community Admin Dashboard)

**Platform Admins (additional):**
- Platform Admin (link to Platform Admin Dashboard)

---

## 🎯 Quick Reference

| Feature | Regular User | Community Admin | Platform Admin |
|---------|-------------|-----------------|----------------|
| Create posts | ✅ | ✅ | ✅ |
| Join communities | ✅ | ✅ | ✅ |
| Create communities | ✅ | ✅ | ✅ |
| Approve join requests | ❌ | ✅ (their communities) | ✅ (all communities) |
| Remove members | ❌ | ✅ (their communities) | ✅ (all communities) |
| Pin/delete posts | ❌ | ✅ (their communities) | ✅ (all communities) |
| Suspend/ban users | ❌ | ❌ | ✅ |
| Approve communities | ❌ | ❌ | ✅ |
| Assign moderators | ❌ | ❌ | ✅ |
| View platform stats | ❌ | ❌ | ✅ |

---

## 🚀 Getting Started

1. **As a Regular User**: Register → Login → Join communities → Create posts
2. **As a Community Admin**: Create a community → Manage members → Moderate content
3. **As a Platform Admin**: Use admin creation script → Login → Access Platform Admin Dashboard

For detailed setup instructions, see `ADMIN_SETUP.md`.
