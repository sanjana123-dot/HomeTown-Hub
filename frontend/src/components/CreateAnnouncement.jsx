import { useState } from 'react'
import { FiX, FiSend } from 'react-icons/fi'
import api from '../services/api'

const CreateAnnouncement = ({ communityId, onAnnouncementCreated, onCancel }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('Please provide both title and content')
      return
    }
    if (!communityId) {
      setError('Community not found. Please refresh the page.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await api.post(`/communities/${communityId}/announcements`, {
        title: title.trim(),
        content: content.trim(),
        communityId, // send in body too so backend always has it
      })
      setTitle('')
      setContent('')
      if (onAnnouncementCreated) onAnnouncementCreated()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create announcement')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card mb-6 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Announcement</h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg text-red-800 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Enter announcement title"
            required
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field min-h-[120px]"
            placeholder="Write your announcement..."
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend />
            {submitting ? 'Posting...' : 'Post Announcement'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default CreateAnnouncement
