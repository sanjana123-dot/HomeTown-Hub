import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import CommunityCard from '../components/CommunityCard'
import { FiMapPin, FiUsers, FiArrowRight, FiX, FiEye } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const SuggestedCommunities = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(null)

  useEffect(() => {
    if (user?.city) {
      fetchMatchingCommunities()
    } else {
      // If no city, skip to dashboard
      navigate('/dashboard')
    }
  }, [user])

  const fetchMatchingCommunities = async () => {
    try {
      const response = await api.get(`/communities?city=${encodeURIComponent(user.city)}`)
      const allCommunities = response.data || []
      
      // Check which communities user is already a member of
      const myCommunitiesResponse = await api.get('/communities/my')
      const myCommunityIds = (myCommunitiesResponse.data || []).map(c => c._id)
      
      // Mark communities user is already a member of
      const communitiesWithMembership = allCommunities.map(community => ({
        ...community,
        isMember: myCommunityIds.includes(community._id)
      }))
      
      setCommunities(communitiesWithMembership)
    } catch (error) {
      console.error('Error fetching matching communities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (communityId) => {
    setJoining(communityId)
    try {
      await api.post(`/communities/${communityId}/join`)
      // Refresh communities list
      await fetchMatchingCommunities()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to join community')
    } finally {
      setJoining(null)
    }
  }

  const handleSkip = () => {
    navigate('/dashboard')
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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
        <div className="max-w-4xl w-full">
          <div className="card dark:bg-gray-900 dark:border-gray-800">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
                <FiMapPin className="text-3xl text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">
                Communities Near You
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                We found {communities.length} {communities.length === 1 ? 'community' : 'communities'} in{' '}
                <span className="font-semibold text-primary">{user?.city}</span>
              </p>
            </div>

            {/* Communities List */}
            {communities.length > 0 ? (
              <div className="space-y-4 mb-8">
                {communities.map((community) => (
                  <div
                    key={community._id}
                    className="border dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-dark dark:text-white mb-2">
                          {community.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {community.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-300">
                          <div className="flex items-center">
                            <FiMapPin className="mr-1" />
                            {community.city}, {community.state}
                          </div>
                          <div className="flex items-center">
                            <FiUsers className="mr-1" />
                            {community.memberCount || 0} Members
                          </div>
                        </div>
                      </div>
                      {community.isMember ? (
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium whitespace-nowrap">
                            Already a Member
                          </span>
                          <Link
                            to={`/community/${community._id}`}
                            className="text-sm text-primary hover:underline flex items-center space-x-1"
                          >
                            <FiEye />
                            <span>View</span>
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleJoin(community._id)}
                          disabled={joining === community._id}
                          className="btn-primary ml-4 whitespace-nowrap disabled:opacity-50"
                        >
                          {joining === community._id ? 'Joining...' : 'Join'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 mb-8">
                <FiUsers className="text-5xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  No communities found in {user?.city} yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Be the first to create a community in your city!
                </p>
              </div>
            )}

            {/* Skip Button */}
            <div className="flex justify-center pt-6 border-t dark:border-gray-800">
              <button
                onClick={handleSkip}
                className="btn-secondary flex items-center space-x-2"
              >
                <span>Skip and Go to Dashboard</span>
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuggestedCommunities
