import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { FiMapPin, FiTrash2, FiEdit2, FiX, FiCheck } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import ConfirmDialog from './ConfirmDialog'
import api from '../services/api'

const AnnouncementCard = ({ announcement, onUpdate, isCommunityAdmin }) => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(announcement.title)
  const [editContent, setEditContent] = useState(announcement.content)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = user && announcement.author?._id === user._id

  const handlePin = async () => {
    try {
      if (announcement.isPinned) {
        await api.post(`/announcements/${announcement._id}/unpin`)
      } else {
        await api.post(`/announcements/${announcement._id}/pin`)
      }
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error pinning/unpinning announcement:', error)
      alert(error.response?.data?.message || 'Failed to pin/unpin announcement')
    }
  }

  const handleDeleteClick = () => setShowDeleteConfirm(true)

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/announcements/${announcement._id}`)
      setShowDeleteConfirm(false)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error deleting announcement:', error)
      alert(error.response?.data?.message || 'Failed to delete announcement')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await api.put(`/announcements/${announcement._id}`, {
        title: editTitle,
        content: editContent,
      })
      setIsEditing(false)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error updating announcement:', error)
      alert(error.response?.data?.message || 'Failed to update announcement')
    }
  }

  const handleCancelEdit = () => {
    setEditTitle(announcement.title)
    setEditContent(announcement.content)
    setIsEditing(false)
  }

  return (
    <div
      className={`card mb-4 dark:bg-gray-900 dark:border-gray-800 ${
        announcement.isPinned ? 'border-l-4 border-l-primary' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold shrink-0">
            {announcement.author?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {announcement.author?.name}
              </h3>
              {announcement.isPinned && (
                <span className="inline-flex items-center text-xs text-primary font-semibold">
                  <FiMapPin className="mr-1" />
                  Pinned
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        {(isAuthor || isCommunityAdmin) && (
          <div className="flex items-center gap-1 shrink-0">
            {isCommunityAdmin && (
              <button
                onClick={handlePin}
                className={`p-2 rounded-lg transition-colors ${
                  announcement.isPinned
                    ? 'text-primary hover:bg-primary/10'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={announcement.isPinned ? 'Unpin announcement' : 'Pin announcement'}
              >
                <FiMapPin className={announcement.isPinned ? 'fill-current' : ''} />
              </button>
            )}
            {isAuthor && (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Edit announcement"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete announcement"
                >
                  <FiTrash2 />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="input-field font-bold"
            placeholder="Announcement title"
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="input-field min-h-[100px]"
            placeholder="Announcement content"
          />
          <div className="flex gap-2">
            <button onClick={handleUpdate} className="btn-primary text-sm flex items-center gap-1">
              <FiCheck />
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              <FiX />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {announcement.title}
          </h4>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {announcement.content}
          </p>
        </>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete announcement"
        message="Are you sure you want to delete this announcement?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        loading={isDeleting}
      />
    </div>
  )
}

export default AnnouncementCard
