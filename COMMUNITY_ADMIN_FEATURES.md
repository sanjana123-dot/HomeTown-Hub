# Community Admin Features Added

## Features Implemented

### 1. ✅ Platform Admins Can Delete Any Community
- **Backend:** Added `deleteCommunity` function in `adminController.js`
- **Route:** `DELETE /api/admin/communities/:communityId`
- **Cascading Deletes:** When a community is deleted, all associated data is removed:
  - All posts in the community
  - All comments on those posts
  - All events in the community
  - All messages related to the community
  - All notifications related to the community
  - All announcements in the community
  - The community itself

- **Frontend:** Added delete button in Admin Dashboard → Communities tab
- **Confirmation:** Requires confirmation before deletion (with warning about permanent deletion)

### 2. ✅ Community Admins Can Edit Community Name
- **Backend:** Updated `updateCommunitySettings` in `communityController.js`
- **Route:** `PATCH /api/communities/:id/settings`
- **Validation:** Checks if name already exists (excluding current community)
- **Authorization:** Only community creators and moderators can edit

- **Frontend:** Added edit name functionality in Community Admin Dashboard
- **UI:** Click edit icon next to community name → Edit → Save/Cancel

## How to Use

### For Platform Admins (Delete Communities):

1. Go to **Platform Admin Dashboard** (`/admin`)
2. Click **"Community Approvals"** tab
3. Scroll down to **"All Communities"** section
4. Find the community you want to delete
5. Click **"Delete"** button (red button with trash icon)
6. Confirm deletion in the dialog
7. Community and all its data will be permanently deleted

### For Community Admins (Edit Community Name):

1. Go to **Community Admin Dashboard** (`/community-admin`)
2. Find your community in the list
3. Click the **edit icon** (pencil) next to the community name
4. Edit the name in the input field
5. Click **"Save"** or **"Cancel"**
6. If name already exists, you'll see an error message

## API Endpoints

### Delete Community (Platform Admin Only)
```
DELETE /api/admin/communities/:communityId
Authorization: Bearer <admin_token>
```

### Update Community Settings (Community Admin)
```
PATCH /api/communities/:id/settings
Authorization: Bearer <token>
Body: {
  name: "New Community Name",  // Optional
  rules: "Community rules",    // Optional
  requiresApproval: true        // Optional
}
```

## Security

- ✅ Platform admin deletion requires admin role
- ✅ Community name editing requires community admin/creator role
- ✅ Name uniqueness validation prevents duplicates
- ✅ Cascading deletes ensure data consistency
- ✅ Confirmation dialog prevents accidental deletions

## Next Steps

1. **Push changes:**
   ```bash
   git add .
   git commit -m "Add: Platform admin delete community, Community admin edit name"
   git push
   ```

2. **Deploy:**
   - Railway will auto-deploy backend
   - Vercel will auto-deploy frontend

3. **Test:**
   - Test deleting a community as platform admin
   - Test editing community name as community admin

## Files Modified

### Backend:
- `backend/controllers/adminController.js` - Added `deleteCommunity` and `getAllCommunities`
- `backend/routes/admin.js` - Added delete route
- `backend/controllers/communityController.js` - Updated `updateCommunitySettings` to allow name editing

### Frontend:
- `frontend/src/pages/AdminDashboard.jsx` - Added delete UI and confirmation dialog
- `frontend/src/pages/CommunityAdminDashboard.jsx` - Added edit name UI

## Notes

- Deletion is **permanent** - cannot be undone
- All associated data is deleted (posts, events, messages, etc.)
- Community name editing validates uniqueness
- Both features require proper authorization
