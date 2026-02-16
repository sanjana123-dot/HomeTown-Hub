import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoadingSpinner from './components/LoadingSpinner'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

// Lazy load pages for code splitting and faster initial load
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Community = lazy(() => import('./pages/Community'))
const CreateCommunity = lazy(() => import('./pages/CreateCommunity'))
const MyCommunities = lazy(() => import('./pages/MyCommunities'))
const DiscoverCommunities = lazy(() => import('./pages/DiscoverCommunities'))
const Events = lazy(() => import('./pages/Events'))
const Profile = lazy(() => import('./pages/Profile'))
const EventDetails = lazy(() => import('./pages/EventDetails'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const CommunityAdminDashboard = lazy(() => import('./pages/CommunityAdminDashboard'))
const SuggestedCommunities = lazy(() => import('./pages/SuggestedCommunities'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Inbox = lazy(() => import('./pages/Inbox'))
const Chat = lazy(() => import('./pages/Chat'))

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
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
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App





