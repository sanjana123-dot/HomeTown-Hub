import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import { FiCalendar, FiMapPin, FiUsers, FiClock } from 'react-icons/fi'
import { format } from 'date-fns'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const EventDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAttending, setIsAttending] = useState(false)

  useEffect(() => {
    fetchEventData()
  }, [id])

  const fetchEventData = async () => {
    try {
      const response = await api.get(`/events/${id}`)
      setEvent(response.data)
      setIsAttending(response.data.attendees?.some(a => a._id === user?._id) || false)
    } catch (error) {
      console.error('Error fetching event data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinEvent = async () => {
    try {
      await api.post(`/events/${id}/attend`)
      setIsAttending(true)
      fetchEventData()
    } catch (error) {
      console.error('Error joining event:', error)
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

  if (!event) {
    return (
      <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-500 dark:text-gray-300">Event not found</p>
        </div>
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
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-dark mb-4">{event.title}</h1>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <FiCalendar className="mr-3 text-xl" />
                      <span className="text-lg">{format(new Date(event.date), 'MMMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiClock className="mr-3 text-xl" />
                      <span className="text-lg">{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiMapPin className="mr-3 text-xl" />
                      <span className="text-lg">{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiUsers className="mr-3 text-xl" />
                      <span className="text-lg">{event.attendees?.length || 0} People Going</span>
                    </div>
                  </div>
                </div>
                {!isAttending && (
                  <button onClick={handleJoinEvent} className="btn-secondary">
                    Join Event
                  </button>
                )}
                {isAttending && (
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
                    You're Going
                  </span>
                )}
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-3 text-dark">About This Event</h2>
                <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
              </div>

              {event.attendees && event.attendees.length > 0 && (
                <div className="border-t pt-6 mt-6">
                  <h2 className="text-xl font-semibold mb-4 text-dark">Attendees</h2>
                  <div className="flex flex-wrap gap-3">
                    {event.attendees.map((attendee) => (
                      <div
                        key={attendee._id}
                        className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2"
                      >
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {attendee.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-gray-700">{attendee.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default EventDetails






