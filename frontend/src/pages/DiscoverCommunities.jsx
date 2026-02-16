import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import CommunityCard from '../components/CommunityCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { FiSearch, FiMapPin } from 'react-icons/fi'
import api from '../services/api'

const DiscoverCommunities = () => {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')

  useEffect(() => {
    fetchCommunities()
  }, [searchTerm, cityFilter, stateFilter])

  const fetchCommunities = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (cityFilter) params.append('city', cityFilter)
      if (stateFilter) params.append('state', stateFilter)
      const response = await api.get(`/communities?${params.toString()}`)
      setCommunities(response.data)
    } catch (error) {
      console.error('Error fetching communities:', error)
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
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">Discover Communities</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Find and join city or village communities near you</p>

            <div className="card mb-6 dark:bg-gray-900 dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Filter by city"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Filter by state"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {communities.length === 0 ? (
              <div className="card text-center py-16">
                <FiMapPin className="text-5xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No communities found</h3>
                <p className="text-gray-500">Try adjusting your search or filters, or create a new community.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">{communities.length} communit{communities.length === 1 ? 'y' : 'ies'} found</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communities.map((community) => (
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

export default DiscoverCommunities
