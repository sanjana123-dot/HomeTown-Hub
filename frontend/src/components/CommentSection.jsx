import { useState, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import EmojiPickerButton, { insertEmojiAtCursor } from './EmojiPickerButton'

const CommentSection = ({ postId, comments: initialComments, onUpdate }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState(initialComments || [])
  const [newComment, setNewComment] = useState('')
  const commentInputRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        content: newComment,
      })
      setComments([...comments, response.data])
      setNewComment('')
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex space-x-2 items-center">
          <div className="flex-1 flex space-x-2 items-center">
            <input
              ref={commentInputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 input-field"
            />
            <EmojiPickerButton
              onInsert={(emoji) => insertEmojiAtCursor(commentInputRef, newComment, setNewComment, emoji)}
              title="Add emoji"
            />
          </div>
          <button type="submit" className="btn-primary">
            Post
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment._id} className="flex space-x-3">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
              {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg p-3">
                <h4 className="font-semibold text-sm">{comment.author?.name}</h4>
                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CommentSection






