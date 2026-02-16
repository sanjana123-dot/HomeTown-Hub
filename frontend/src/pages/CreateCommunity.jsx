import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import { INDIAN_STATES } from '../constants/indianStates'

const CreateCommunity = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    state: '',
    rules: '',
    requiresApproval: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/communities', formData)
      navigate(`/community/${response.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create community')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-dark dark:text-white">Create New Community</h1>
            <div className="card dark:bg-gray-900 dark:border-gray-800">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-gray-700 dark:text-white font-medium mb-2">Community Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Mumbai Community"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-white font-medium mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="4"
                    placeholder="Describe your community..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 dark:text-white font-medium mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-white font-medium mb-2">State *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-white font-medium mb-2">Community Rules (Optional)</label>
                  <textarea
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    className="input-field"
                    rows="4"
                    placeholder="Set community guidelines..."
                  />
                </div>
                <div className="flex items-start space-x-3">
                  <input
                    id="requiresApproval"
                    type="checkbox"
                    checked={formData.requiresApproval}
                    onChange={(e) =>
                      setFormData({ ...formData, requiresApproval: e.target.checked })
                    }
                    className="mt-1"
                  />
                  <label htmlFor="requiresApproval" className="text-sm text-gray-700 dark:text-white">
                    <span className="font-medium">Require admin approval for new members</span>
                    <br />
                    <span className="text-gray-500 dark:text-gray-300">
                      When enabled, people must send a join request and you (or your
                      moderators) must approve them before they become members.
                    </span>
                  </label>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Your community creation request will be reviewed by platform administrators before approval.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Community'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CreateCommunity






