# HomeTown Hub

A community networking platform that enables people from the same city or village to connect digitally, share updates, organize events, and strengthen community bonding.

## Features

### User Features
- User registration & login
- Create or join city/village communities
- Community feed for posts and updates
- Post text, images, and announcements
- Like, comment, and share posts
- Create and join community events
- Receive notifications for community updates
- User profile with hometown details

### Community Admin / Moderator Features
- Approve or reject member requests
- Manage community rules and guidelines
- Moderate posts and comments
- Pin important announcements
- Manage events and discussions

### Platform Admin Features
- Approve community creation requests
- Manage users and moderators
- Monitor platform activity
- Handle abuse reports and disputes

## Technology Stack

### Frontend
- React.js with Vite
- Tailwind CSS
- React Router DOM
- Axios for API calls
- React Icons
- date-fns for date formatting

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Project Structure

```
HomeTown-Hub/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context providers
│   │   ├── services/     # API service
│   │   └── App.jsx       # Main app component
│   └── package.json
├── backend/           # Node.js backend application
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Custom middleware
│   └── server.js      # Server entry point
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd HomeTown-Hub
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Set up environment variables

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hometown-hub
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

5. Start MongoDB
Make sure MongoDB is running on your system.

6. Start the backend server
```bash
cd backend
npm run dev
```

7. Start the frontend development server
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Communities
- `GET /api/communities` - Get all approved communities
- `GET /api/communities/my` - Get user's communities (protected)
- `GET /api/communities/:id` - Get community details (protected)
- `POST /api/communities` - Create new community (protected)
- `POST /api/communities/:id/join` - Join community (protected)

### Posts
- `GET /api/posts/feed` - Get user's feed (protected)
- `POST /api/posts` - Create new post (protected)
- `POST /api/posts/:id/like` - Like/unlike post (protected)
- `POST /api/posts/:id/comments` - Add comment (protected)

### Events
- `GET /api/events/upcoming` - Get upcoming events (protected)
- `GET /api/events/:id` - Get event details (protected)
- `POST /api/events` - Create new event (protected)
- `POST /api/events/:id/attend` - Attend/leave event (protected)

### Admin
- `GET /api/admin/stats` - Get platform statistics (admin only)
- `GET /api/admin/communities/pending` - Get pending communities (admin only)
- `PUT /api/admin/communities/:id/approve` - Approve community (admin only)
- `PUT /api/admin/communities/:id/reject` - Reject community (admin only)

## Default Admin User

To create an admin user, you can use MongoDB shell or a database client:

```javascript
// In MongoDB shell or database client
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or register a user normally and then update their role in the database.

## Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
npm run dev
```

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```

The build files will be in the `frontend/dist` directory.

### Backend
```bash
cd backend
npm start
```

## Features in Development

- [ ] Image upload functionality
- [ ] Real-time notifications
- [ ] Advanced search and filters
- [ ] Community moderation tools
- [ ] Event RSVP system
- [ ] User profile customization
- [ ] Mobile responsive improvements

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@hometownhub.com or create an issue in the repository.






