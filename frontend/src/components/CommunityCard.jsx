import { Link } from 'react-router-dom'
import { FiUsers, FiMapPin } from 'react-icons/fi'

const CommunityCard = ({ community }) => {
  const getStatusBadge = () => {
    if (community.status === 'pending') {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          Pending Approval
        </span>
      )
    }
    if (community.status === 'approved') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          Approved
        </span>
      )
    }
    return null
  }

  return (
    <Link to={`/community/${community._id}`} className="card hover:shadow-lg transition-shadow block">
      <div className="h-32 bg-gradient-to-r from-primary to-secondary rounded-lg mb-4"></div>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{community.name}</h3>
        {getStatusBadge()}
      </div>
      <div className="flex items-center text-gray-800 dark:text-white mb-2 font-medium">
        <FiMapPin className="mr-2" />
        <span>{community.city}, {community.state}</span>
      </div>
      <div className="flex items-center text-gray-800 dark:text-white font-medium">
        <FiUsers className="mr-2" />
        <span>{community.memberCount || community.members?.length || 0} Members</span>
      </div>
      <p className="mt-3 text-gray-700 dark:text-gray-300 text-sm line-clamp-2 font-medium">{community.description}</p>
    </Link>
  )
}

export default CommunityCard





