import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { FiHome, FiBell, FiUser, FiLogOut, FiSearch, FiMoon, FiSun, FiMessageCircle } from 'react-icons/fi'
import api from '../services/api'
import { formatDistanceToNow } from 'date-fns'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    if (!user) return
    const fetchNotifs = async () => {
      try {
        const [notifsRes, messagesRes] = await Promise.all([
          api.get('/notifications'),
          api.get('/messages/unread-count'),
        ])
        setNotifications(notifsRes.data.notifications || [])
        setUnreadCount(notifsRes.data.unreadCount || 0)
        setUnreadMessages(messagesRes.data.unreadCount || 0)
      } catch (_) {}
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [user])

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch (_) {}
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (_) {}
  }

  const handleNotificationClick = (n) => {
    markAsRead(n._id)
    setShowNotifications(false)
    if (!n.relatedId && !n.relatedCommunityId) return
    switch (n.type) {
      case 'comment':
        navigate('/dashboard', { state: { openPostId: n.relatedId } })
        break
      case 'post':
        if (n.relatedCommunityId) {
          navigate(`/community/${n.relatedCommunityId}`)
        } else {
          navigate('/dashboard')
        }
        break
      case 'announcement':
        if (n.relatedCommunityId) {
          navigate(`/community/${n.relatedCommunityId}`, {
            state: { tab: 'announcements', highlightAnnouncementId: n.relatedId },
          })
        } else {
          navigate('/dashboard')
        }
        break
      case 'event':
        if (n.relatedId) {
          navigate(`/event/${n.relatedId}`)
        } else {
          navigate('/dashboard/events')
        }
        break
      case 'community':
      case 'system':
      default:
        if (n.relatedCommunityId) {
          navigate(`/community/${n.relatedCommunityId}`)
        } else {
          navigate('/dashboard')
        }
        break
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary dark:text-blue-400">🏠 HomeTown Hub</span>
          </Link>

          {user && (
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300" />
                <input
                  type="text"
                  placeholder="Search communities..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <FiHome className="text-xl text-gray-900 dark:text-white" />
                </Link>
                <Link
                  to="/inbox"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
                >
                  <FiMessageCircle className="text-xl text-gray-900 dark:text-white" />
                  {unreadMessages > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadMessages > 99 ? '99+' : unreadMessages}
                    </span>
                  )}
                </Link>
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors"
                  >
                    <FiBell className="text-xl text-gray-900 dark:text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg shadow-xl py-2 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                        <span className="font-bold text-gray-900 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary dark:text-blue-400 hover:underline font-semibold">
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-gray-600 dark:text-gray-300 text-sm">No notifications yet.</p>
                      ) : (
                        notifications.slice(0, 20).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${!n.isRead ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                          >
                            <p className="text-sm text-gray-900 dark:text-white font-medium">{n.message}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <Link to={`/profile/${user._id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <FiUser className="text-xl text-gray-900 dark:text-white" />
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <FiSun className="text-xl text-gray-900 dark:text-white" />
                  ) : (
                    <FiMoon className="text-xl text-gray-900 dark:text-white" />
                  )}
                </button>
                <button onClick={handleLogout} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <FiLogOut className="text-xl text-gray-900 dark:text-white" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <FiSun className="text-xl text-gray-900 dark:text-white" />
                  ) : (
                    <FiMoon className="text-xl text-gray-900 dark:text-white" />
                  )}
                </button>
                <Link to="/login" className="text-gray-900 dark:text-white font-semibold hover:text-primary dark:hover:text-blue-400 transition-colors">Login</Link>
                <Link to="/register" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar






