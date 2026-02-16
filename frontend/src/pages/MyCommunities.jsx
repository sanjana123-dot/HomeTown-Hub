import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import CommunityCard from '../components/CommunityCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { FiUsers, FiPlusCircle, FiSearch } from 'react-icons/fi'
import api from '../services/api'

const MyCommunities = () => {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      const response = await api.get('/communities/my')
      setCommunities(response.data)
    } catch (error) {
      console.error('Error fetching communities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCommunities = communities.filter((community) =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.state.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">My Communities</h1>
                <p className="text-gray-600 dark:text-gray-300">Manage and explore your communities</p>
              </div>
              <Link
                to="/create-community"
                className="btn-primary flex items-center space-x-2"
              >
                <FiPlusCircle className="text-xl" />
                <span>Create Community</span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="card mb-6 dark:bg-gray-900 dark:border-gray-800">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search communities by name, city, or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Communities Grid */}
            {filteredCommunities.length === 0 ? (
              <div className="card text-center py-16 dark:bg-gray-900 dark:border-gray-800">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUsers className="text-4xl text-gray-400 dark:text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">
                    {searchTerm ? 'No communities found' : "You haven't joined any communities yet"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-300 mb-6">
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'Join communities to connect with your hometown or create your own!'}
                  </p>
                  {!searchTerm && (
                    <Link to="/create-community" className="btn-primary inline-block">
                      Create Your First Community
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-600 dark:text-gray-300">
                  Showing {filteredCommunities.length} of {communities.length} communities
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCommunities.map((community) => (
                    <CommunityCard key={community._id} community={community} />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default MyCommunities


