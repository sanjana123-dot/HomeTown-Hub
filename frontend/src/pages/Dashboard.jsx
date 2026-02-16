import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import CommunityCard from '../components/CommunityCard'
import EventCard from '../components/EventCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { FiSettings, FiAlertCircle } from 'react-icons/fi'
import api from '../services/api'

const Dashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const openPostId = location.state?.openPostId
  const [posts, setPosts] = useState([])
  const [communities, setCommunities] = useState([])
  const [events, setEvents] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [location.pathname]) // Refresh when navigating to dashboard

  const fetchDashboardData = async () => {
    try {
      const requests = [
        api.get('/posts/feed'),
        api.get('/communities/my'),
        api.get('/events/upcoming'),
      ]
      
      // If user is admin, also fetch pending communities count
      if (user?.role === 'admin') {
        requests.push(api.get('/admin/stats'))
      }
      
      const results = await Promise.all(requests)
      setPosts(results[0].data)
      setCommunities(results[1].data)
      setEvents(results[2].data)
      
      if (user?.role === 'admin' && results[3]) {
        setPendingCount(results[3].data.pendingCommunities || 0)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
        <Navbar />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-dark dark:text-white">
                  User Dashboard
                </h1>
                <p className="text-gray-700 dark:text-gray-300 mt-1 font-medium">
                  Your personal feed, communities, and events
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {user?.role === 'admin' && (
                  <>
                    {pendingCount > 0 && (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
                        <FiAlertCircle />
                        <span className="font-semibold">{pendingCount} Pending Approval{pendingCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    <button
                      onClick={() => navigate('/admin')}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <FiSettings />
                      <span>Platform Admin</span>
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <CreatePost onPostCreated={fetchDashboardData} />

            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your Feed</h2>
              {posts.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">No posts yet. Join communities to see posts!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onUpdate={fetchDashboardData}
                    initialOpenComments={post._id === openPostId}
                  />
                ))
              )}
            </div>
          </div>
        </main>

        <aside className="w-80 p-6 space-y-6 hidden lg:block">
          <div className="card">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">My Communities</h3>
            {communities.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">You haven't joined any communities yet.</p>
            ) : (
              <div className="space-y-3">
                {communities.slice(0, 3).map((community) => (
                  <CommunityCard key={community._id} community={community} />
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Upcoming Events</h3>
            {events.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">No upcoming events.</p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Dashboard





