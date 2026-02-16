import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Community from './pages/Community'
import CreateCommunity from './pages/CreateCommunity'
import MyCommunities from './pages/MyCommunities'
import DiscoverCommunities from './pages/DiscoverCommunities'
import Events from './pages/Events'
import Profile from './pages/Profile'
import EventDetails from './pages/EventDetails'
import AdminDashboard from './pages/AdminDashboard'
import CommunityAdminDashboard from './pages/CommunityAdminDashboard'
import SuggestedCommunities from './pages/SuggestedCommunities'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Inbox from './pages/Inbox'
import Chat from './pages/Chat'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  // Minimal fallback UI to verify React is rendering
  // If you still see a completely blank page after this change,
  // the problem is outside the router/components.
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/communities"
            element={
              <PrivateRoute>
                <MyCommunities />
              </PrivateRoute>
            }
          />
          <Route
            path="/discover"
            element={
              <PrivateRoute>
                <DiscoverCommunities />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/events"
            element={
              <PrivateRoute>
                <Events />
              </PrivateRoute>
            }
          />
          <Route
            path="/community/:id"
            element={
              <PrivateRoute>
                <Community />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-community"
            element={
              <PrivateRoute>
                <CreateCommunity />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/event/:id"
            element={
              <PrivateRoute>
                <EventDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/community-admin"
            element={
              <PrivateRoute>
                <CommunityAdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/suggested-communities"
            element={
              <PrivateRoute>
                <SuggestedCommunities />
              </PrivateRoute>
            }
          />
          <Route
            path="/inbox"
            element={
              <PrivateRoute>
                <Inbox />
              </PrivateRoute>
            }
          />
          <Route
            path="/inbox/:communityId"
            element={
              <PrivateRoute>
                <Inbox />
              </PrivateRoute>
            }
          />
          <Route
            path="/inbox/:communityId/chat/:receiverId"
            element={
              <PrivateRoute>
                <Inbox />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App





