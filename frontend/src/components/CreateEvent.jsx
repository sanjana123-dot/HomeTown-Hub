import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const CreateEvent = ({ onEventCreated, onCancel, defaultCommunity }) => {
  const { user } = useAuth()
  const [communities, setCommunities] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    community: defaultCommunity || '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCommunities()
  }, [])

  useEffect(() => {
    if (defaultCommunity && communities.length > 0) {
      const communityExists = communities.some(c => c._id === defaultCommunity)
      if (communityExists) {
        setFormData(prev => ({ ...prev, community: defaultCommunity }))
      }
    }
  }, [defaultCommunity, communities])

  const fetchCommunities = async () => {
    try {
      const response = await api.get('/communities/my')
      setCommunities(response.data)
    } catch (error) {
      console.error('Error fetching communities:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/events', formData)
      onEventCreated()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Event Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input-field"
          placeholder="e.g., Community Picnic 2024"
          required
        />
      </div>

      {!defaultCommunity && (
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Community *
          </label>
          {communities.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                You need to join a community first to create events. 
                <a href="/create-community" className="underline ml-1">Create or join a community</a>
              </p>
            </div>
          ) : (
            <select
              value={formData.community}
              onChange={(e) => setFormData({ ...formData, community: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select a community</option>
              {communities.map((comm) => (
                <option key={comm._id} value={comm._id}>
                  {comm.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input-field"
          rows="4"
          placeholder="Describe your event..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="input-field"
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Time *
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="input-field"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Location *
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="input-field"
          placeholder="e.g., Central Park, Main Street"
          required
        />
      </div>

      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          disabled={loading || communities.length === 0}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default CreateEvent

