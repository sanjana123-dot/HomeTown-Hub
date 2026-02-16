import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiHome, FiUsers, FiCalendar, FiPlusCircle, FiSettings, FiCompass, FiShield } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()
  const [isCommunityAdmin, setIsCommunityAdmin] = useState(false)

  useEffect(() => {
    const checkCommunityAdmin = async () => {
      if (!user) return
      try {
        const response = await api.get('/communities/my/admin')
        setIsCommunityAdmin(response.data.length > 0)
      } catch (error) {
        setIsCommunityAdmin(false)
      }
    }
    checkCommunityAdmin()
  }, [user])

  const menuItems = [
    {
      icon: FiHome,
      label:
        user?.role === 'admin'
          ? 'Member Dashboard'
          : isCommunityAdmin
          ? 'User Dashboard'
          : 'Dashboard',
      path: '/dashboard',
    },
    { icon: FiUsers, label: 'My Communities', path: '/dashboard/communities' },
    { icon: FiCompass, label: 'Discover Communities', path: '/discover' },
    { icon: FiCalendar, label: 'Events', path: '/dashboard/events' },
    { icon: FiPlusCircle, label: 'Create Community', path: '/create-community' },
  ]

  // Show Community Admin Dashboard if user is admin/moderator of any community
  if (isCommunityAdmin) {
    menuItems.push({
      icon: FiShield,
      label: 'Community Admin',
      path: '/community-admin',
    })
  }

  // Show Platform Admin Dashboard if user is platform admin
  if (user?.role === 'admin') {
    menuItems.push({ icon: FiSettings, label: 'Platform Admin', path: '/admin' })
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 shadow-lg h-screen sticky top-16 border-r border-gray-200 dark:border-gray-800">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="text-xl" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar





