# Quick Start Guide

## Prerequisites
- Node.js (v16 or higher) installed
- MongoDB installed and running locally, or MongoDB Atlas account

## Step-by-Step Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Configure Backend Environment

1. Copy the example environment file:
```bash
cd backend
cp env.example .env
```

2. Edit `.env` and update the following:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hometown-hub
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
Replace `MONGODB_URI` with your Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hometown-hub
```

### 3. Start MongoDB

**Local MongoDB:**
- Make sure MongoDB service is running
- On Windows: MongoDB should start automatically if installed as a service
- On Mac/Linux: `sudo systemctl start mongod` or `brew services start mongodb-community`

**MongoDB Atlas:**
- No local setup needed, just use your connection string

### 4. Start the Backend Server

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:5000`

### 5. Start the Frontend Development Server

Open a new terminal:
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

### 6. Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health

## Creating Your First Admin User

1. Register a user through the frontend at http://localhost:3000/register
2. Open MongoDB Compass or use MongoDB shell
3. Find your user in the `users` collection
4. Update the user's `role` field to `"admin"`

**Using MongoDB Shell:**
```javascript
use hometown-hub
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

**Using MongoDB Compass:**
- Connect to your database
- Navigate to `users` collection
- Find your user document
- Edit the `role` field and change it to `"admin"`
- Save the document

## Testing the Application

1. **Register a new user:**
   - Go to http://localhost:3000/register
   - Fill in the registration form
   - Submit

2. **Create a community:**
   - After login, click "Create Community" in the sidebar
   - Fill in community details
   - Submit (will be pending admin approval)

3. **Approve the community (as admin):**
   - Login as admin user
   - Go to Admin Dashboard
   - Approve the pending community

4. **Join the community:**
   - Browse communities
   - Click "Join Community"

5. **Create a post:**
   - Go to Dashboard
   - Write a post in the "Create Post" section
   - Select a community
   - Submit

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `.env` file
- For Atlas, ensure your IP is whitelisted

### Port Already in Use
- Backend: Change `PORT` in `.env` file
- Frontend: Vite will automatically use the next available port

### CORS Errors
- Make sure backend is running before starting frontend
- Check that backend URL in `vite.config.js` matches your backend port

### Module Not Found Errors
- Run `npm install` in both frontend and backend directories
- Delete `node_modules` and `package-lock.json`, then reinstall

## Next Steps

- Customize the design in `frontend/src/index.css`
- Add more features as per your requirements
- Deploy to production (Vercel for frontend, Heroku/Railway for backend)

## Need Help?

Check the main README.md for detailed documentation and API endpoints.






