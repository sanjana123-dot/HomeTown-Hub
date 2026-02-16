import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiShare2, FiX } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import LoadingSpinner from './LoadingSpinner'

/**
 * Modal to share a post to a community member's chat. Shows list of members; on select, sends message with sharedPost and optionally navigates to that chat.
 */
const ShareToChatModal = ({ isOpen, onClose, post, communityId, communityName }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(null) // receiverId when sending

  const commId = communityId || post?.community?._id

  useEffect(() => {
    if (!isOpen || !commId) return
    setLoading(true)
    api
      .get(`/communities/${commId}`)
      .then((res) => {
        const list = res.data.members || []
        const other = list.filter((m) => m._id !== user?._id)
        setMembers(other)
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [isOpen, commId, user?._id])

  const handleShareTo = async (receiverId) => {
    if (!post?._id || !commId) return
    setSending(receiverId)
    try {
      await api.post('/messages', {
        receiverId,
        communityId: commId,
        postId: post._id,
        content: 'Shared a post',
      })
      onClose()
      navigate(`/inbox/${commId}/chat/${receiverId}`)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to share to chat')
    } finally {
      setSending(null)
    }
  }

  if (!isOpen) return null

  const name = communityName || post?.community?.name || 'Community'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiShare2 />
            Share to chat
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <p className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
          Send this post to a member in <span className="font-medium text-gray-900 dark:text-white">{name}</span>. It will appear in your inbox chat.
        </p>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : members.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6">No other members in this community.</p>
          ) : (
            <ul className="space-y-1">
              {members.map((member) => (
                <li key={member._id}>
                  <button
                    type="button"
                    onClick={() => handleShareTo(member._id)}
                    disabled={!!sending}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
                      {member.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                      {member.username && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{member.username}</p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {sending === member._id ? 'Sending...' : 'Send'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShareToChatModal
