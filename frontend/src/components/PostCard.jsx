import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiMoreVertical,
  FiMapPin,
  FiTrash2,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import CommentSection from './CommentSection'
import ConfirmDialog from './ConfirmDialog'
import ShareToChatModal from './ShareToChatModal'
import api from '../services/api'

const PostCard = ({ post, onUpdate, initialOpenComments = false }) => {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(initialOpenComments)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [liked, setLiked] = useState(post.likes?.includes(user?._id) || false)
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const isAuthor = user && post.author?._id === user._id
  const isCommunityAdmin = post.community?.isCommunityAdminForViewer // optional, may be added later

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${post._id}/like`)
      setLiked(response.data.liked)
      setLikeCount(response.data.likeCount)
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleDeleteClick = () => setShowDeleteConfirm(true)

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true)
    try {
      await api.delete(`/posts/${post._id}`)
      setShowDeleteConfirm(false)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert(error.response?.data?.message || 'Failed to delete post')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleTogglePin = async () => {
    try {
      if (post.isPinned) {
        await api.post(`/posts/${post._id}/unpin`)
      } else {
        await api.post(`/posts/${post._id}/pin`)
      }
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error pinning/unpinning post:', error)
    }
  }

  return (
    <div className="card mb-4 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
          {post.author?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{post.author?.name}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              {post.isPinned && (
                <span className="inline-flex items-center text-xs text-primary mr-2">
                  <FiMapPin className="mr-1" />
                  Pinned
                </span>
              )}
              {(isAuthor || isCommunityAdmin) && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleTogglePin}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    title={post.isPinned ? 'Unpin post' : 'Pin post'}
                  >
                    <FiMapPin className="text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                    title="Delete post"
                  >
                    <FiTrash2 className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              )}
              {!isAuthor && !isCommunityAdmin && (
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
                  <FiMoreVertical className="text-gray-700 dark:text-gray-300" />
                </button>
              )}
            </div>
          </div>

          {post.community && (
            <span className="inline-block mt-1 text-sm text-primary font-medium">
              {post.community.name}
            </span>
          )}

          <p className="mt-3 text-gray-900 dark:text-white whitespace-pre-wrap font-medium">{post.content}</p>

          {/* Display Images - only when not already shown in files (backend sets both for compatibility) */}
          {post.image && !(post.files?.length > 0 && post.files[0].fileType === 'image') && (
            <div className="mt-3">
              <img
                src={post.image.startsWith('http') ? post.image : post.image}
                alt="Post"
                className="rounded-lg w-full max-h-96 object-cover cursor-pointer"
                onClick={() => {
                  const url = post.image.startsWith('http') ? post.image : post.image
                  window.open(url, '_blank')
                }}
              />
            </div>
          )}

          {/* Display Videos - only when not already shown in files (backend sets both for compatibility) */}
          {post.video && !(post.files?.length > 0 && post.files[0].fileType === 'video') && (
            <div className="mt-3">
              <video
                src={post.video.startsWith('http') ? post.video : post.video}
                controls
                className="rounded-lg w-full max-h-96"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Display Files Array */}
          {post.files && post.files.length > 0 && (
            <div className="mt-3 space-y-3">
              {post.files.map((file, index) => {
                const fileUrl = file.url.startsWith('http') ? file.url : file.url
                return (
                  <div key={index} className="space-y-2">
                    {file.fileType === 'image' && (
                      <>
                        <img
                          src={fileUrl}
                          alt={file.originalName}
                          className="rounded-lg w-full max-h-96 object-cover cursor-pointer"
                          onClick={() => window.open(fileUrl, '_blank')}
                        />
                        {file.caption && (
                          <p className="text-sm text-gray-800 dark:text-white italic px-2 font-medium">{file.caption}</p>
                        )}
                      </>
                    )}
                    {file.fileType === 'video' && (
                      <>
                        <video
                          src={fileUrl}
                          controls
                          className="rounded-lg w-full max-h-96"
                        >
                          Your browser does not support the video tag.
                        </video>
                        {file.caption && (
                          <p className="text-sm text-gray-800 dark:text-white italic px-2 font-medium">{file.caption}</p>
                        )}
                      </>
                    )}
                    {(file.fileType === 'document' || file.fileType === 'other') && (
                      <div>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <svg className="w-8 h-8 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{file.originalName}</p>
                            {file.caption ? (
                              <p className="text-xs text-gray-700 dark:text-gray-300 italic font-medium">{file.caption}</p>
                            ) : (
                              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">Click to download</p>
                            )}
                          </div>
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 font-semibold ${
                liked ? 'text-accent dark:text-pink-400' : 'text-gray-700 dark:text-gray-300'
              } hover:text-accent dark:hover:text-pink-400 transition-colors`}
            >
              <FiHeart className={liked ? 'fill-current' : ''} />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition-colors font-semibold"
            >
              <FiMessageCircle />
              <span>{post.comments?.length || 0}</span>
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition-colors font-semibold"
              title="Share to chat"
            >
              <FiShare2 />
              <span>Share</span>
            </button>
          </div>

          {showComments && <CommentSection postId={post._id} comments={post.comments || []} onUpdate={onUpdate} />}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete post"
        message="Are you sure you want to delete this post?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        loading={deleteLoading}
      />

      <ShareToChatModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post}
        communityId={post.community?._id}
        communityName={post.community?.name}
      />
    </div>
  )
}

export default PostCard





