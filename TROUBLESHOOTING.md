# Troubleshooting Guide

## 401 Unauthorized Error on `/api/auth/login`

### What Was Fixed
The axios interceptor was sending Authorization headers (with potentially invalid tokens) to login/register endpoints, which could cause issues. Now, auth endpoints (`/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`) don't receive Authorization headers.

### If You Face This Error Again

#### 1. Check Browser Console & Network Tab
- Open browser DevTools (F12)
- Go to **Network** tab
- Try logging in again
- Click on the failed `/api/auth/login` request
- Check:
  - **Status Code**: Should be 401, 400, or 500
  - **Response**: Look at the error message
  - **Request Payload**: Verify email/username and password are being sent

#### 2. Common Causes & Solutions

##### A. Invalid Credentials (401)
**Error Message**: `"Invalid email/username or password"`

**Solutions**:
- Verify the email/username and password are correct
- Check if the user exists in the database
- Ensure password hasn't been changed
- Try resetting password if needed

**How to Check**:
```bash
# Connect to MongoDB and check users
# In MongoDB shell or Compass:
db.users.find({ email: "user@example.com" })
```

##### B. Missing Request Body (400)
**Error Message**: `"Please provide email/username and password"`

**Solutions**:
- Check frontend form is submitting correctly
- Verify `emailOrUsername` and `password` fields are being sent
- Check browser console for JavaScript errors

##### C. Server Error (500)
**Error Message**: Various server errors

**Solutions**:
- Check backend console for error logs
- Verify MongoDB connection is working
- Check if JWT_SECRET is set in `.env` file
- Ensure all dependencies are installed

**Check Backend Logs**:
```bash
cd backend
npm run dev
# Look for error messages in the console
```

##### D. Database Connection Issues
**Symptoms**: 500 errors, "User not found" even when user exists

**Solutions**:
- Verify MongoDB is running
- Check `MONGODB_URI` in `backend/.env` is correct
- Test database connection:
  ```bash
  cd backend
  node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
  ```

##### E. CORS Issues
**Symptoms**: Request fails before reaching server, CORS errors in console

**Solutions**:
- Verify backend CORS is configured correctly
- Check if frontend URL matches CORS allowed origins
- Ensure backend server is running

#### 3. Quick Diagnostic Steps

1. **Clear Browser Storage**:
   ```javascript
   // In browser console:
   localStorage.clear()
   // Then try logging in again
   ```

2. **Check Backend is Running**:
   ```bash
   curl http://localhost:4000/api/health
   # Should return: {"status":"OK","message":"Server is running"}
   ```

3. **Verify Environment Variables**:
   ```bash
   cd backend
   # Check .env file exists and has:
   # - PORT
   # - MONGODB_URI
   # - JWT_SECRET
   # - NODE_ENV
   ```

4. **Test Login Endpoint Directly**:
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"emailOrUsername":"test@example.com","password":"testpassword"}'
   ```

#### 4. Prevention Tips

1. **Always Clear Tokens on Logout**:
   - The frontend already handles this, but ensure logout clears localStorage

2. **Handle Token Expiration**:
   - The app should redirect to login if token is invalid
   - Check `AuthContext.jsx` for token validation

3. **Monitor Backend Logs**:
   - Keep backend console open during development
   - Look for error messages that indicate issues

4. **Test Regularly**:
   - Test login/logout flow after major changes
   - Verify database connectivity

#### 5. Debugging Checklist

- [ ] Backend server is running
- [ ] MongoDB is connected
- [ ] `.env` file has all required variables
- [ ] User exists in database
- [ ] Credentials are correct
- [ ] No CORS errors in browser console
- [ ] Network request shows correct payload
- [ ] Backend logs show the request was received
- [ ] No JavaScript errors in browser console

#### 6. Common Error Messages Reference

| Error Message | Status | Cause | Solution |
|--------------|--------|-------|----------|
| "Invalid email/username or password" | 401 | Wrong credentials | Check username/password |
| "Please provide email/username and password" | 400 | Missing fields | Check form submission |
| "Not authorized, no token" | 401 | Token missing (wrong endpoint) | Shouldn't happen on login |
| "JWT_SECRET is not set" | 500 | Missing env variable | Add JWT_SECRET to .env |
| "MongoDB connection failed" | 500 | Database issue | Check MongoDB connection |

### Getting Help

If the error persists:
1. Check backend console logs for detailed error messages
2. Check browser Network tab for request/response details
3. Verify all environment variables are set correctly
4. Ensure database is accessible and user exists
5. Try clearing browser cache and localStorage

### Related Files

- Frontend API Service: `frontend/src/services/api.js`
- Login Controller: `backend/controllers/authController.js`
- Auth Routes: `backend/routes/auth.js`
- Auth Middleware: `backend/middleware/auth.js`
- Environment Config: `backend/.env`
