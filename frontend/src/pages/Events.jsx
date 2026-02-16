import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import EventCard from '../components/EventCard'
import CreateEvent from '../components/CreateEvent'
import LoadingSpinner from '../components/LoadingSpinner'
import { FiCalendar, FiPlusCircle, FiFilter, FiSearch } from 'react-icons/fi'
import api from '../services/api'

const Events = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, upcoming, past

  useEffect(() => {
    const abortController = new AbortController()
    
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await api.get('/events/all', {
          signal: abortController.signal
        })
        setEvents(response.data)
      } catch (error) {
        // Don't log error if request was cancelled
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          console.error('Error fetching events:', error)
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvents()
    
    // Cleanup: cancel request if component unmounts or dependencies change
    return () => {
      abortController.abort()
    }
  }, [])

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (filter === 'all') return true

    const eventDate = new Date(event.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (filter === 'upcoming') {
      return eventDate >= today
    }
    if (filter === 'past') {
      return eventDate < today
    }

    return true
  })

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
            {/* Header with Hero Image */}
            <div className="relative mb-8 rounded-lg overflow-hidden">
              <div className="h-64 bg-gradient-to-r from-primary via-secondary to-primary flex items-center justify-center">
                <div className="text-center text-white z-10">
                  <FiCalendar className="text-6xl mx-auto mb-4 opacity-80" />
                  <h1 className="text-4xl font-bold mb-2">Community Events</h1>
                  <p className="text-xl opacity-90">Discover and join exciting events in your communities</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black opacity-20"></div>
            </div>

            {/* Action Bar */}
            <div className="card mb-6 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                  {/* Filter */}
                  <div className="relative">
                    <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="input-field pl-10 appearance-none"
                    >
                      <option value="all">All Events</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past Events</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap"
                >
                  <FiPlusCircle className="text-xl" />
                  <span>Create Event</span>
                </button>
              </div>
            </div>

            {/* Create Event Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-dark dark:text-white">Create New Event</h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-6">
                    <CreateEvent
                      onEventCreated={() => {
                        setShowCreateModal(false)
                        fetchEvents()
                      }}
                      onCancel={() => setShowCreateModal(false)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <div className="card text-center py-16 dark:bg-gray-900 dark:border-gray-800">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCalendar className="text-4xl text-gray-400 dark:text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">
                    {searchTerm || filter !== 'all'
                      ? 'No events found'
                      : 'No events yet'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-300 mb-6">
                    {searchTerm || filter !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Be the first to create an event in your community!'}
                  </p>
                  {(!searchTerm && filter === 'all') && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn-primary inline-flex items-center space-x-2"
                    >
                      <FiPlusCircle />
                      <span>Create Your First Event</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-600 dark:text-gray-300">
                  Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <EventCard key={event._id} event={event} />
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

export default Events

