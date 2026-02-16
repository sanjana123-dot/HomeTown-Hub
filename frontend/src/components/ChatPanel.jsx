import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
  FiSend,
  FiPaperclip,
  FiSmile,
  FiX,
  FiShare2,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import LoadingSpinner from './LoadingSpinner'
import { getImageUrl } from '../utils/imageUrl'

const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾']

export default function ChatPanel({ communityId, receiverId, receiver: receiverProp, community: communityProp, onBack, embedded = false, onConversationUpdate }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [receiver, setReceiver] = useState(receiverProp || null)
  const [community, setCommunity] = useState(communityProp || null)
  const [content, setContent] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [filePreviews, setFilePreviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!communityId || !receiverId) return
    fetchChatData()
  }, [communityId, receiverId])

  useEffect(() => {
    if (receiverProp) setReceiver(receiverProp)
    if (communityProp) setCommunity(communityProp)
  }, [receiverProp, communityProp])

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      markMessagesAsRead()
    }
  }, [messages])

  useEffect(() => {
    if (!communityId || !receiverId) return
    const interval = setInterval(() => fetchMessages(), 3000)
    return () => clearInterval(interval)
  }, [communityId, receiverId])

  const fetchChatData = async () => {
    try {
      const [receiverRes, communityRes] = await Promise.all([
        api.get(`/users/${receiverId}`),
        api.get(`/communities/${communityId}`),
      ])
      setReceiver(receiverRes.data)
      setCommunity(communityRes.data)
      await fetchMessages()
    } catch (error) {
      console.error('Error fetching chat data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await api.get(
        `/messages/community/${communityId}/conversation/${receiverId}`
      )
      setMessages(response.data)
      onConversationUpdate?.()
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const markMessagesAsRead = async () => {
    try {
      await api.post('/messages/mark-read', {
        senderId: receiverId,
        communityId,
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = [...selectedFiles, ...files].slice(0, 5)
    setSelectedFiles(newFiles)
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreviews((prev) => [...prev, { file, preview: reader.result, type: 'image' }])
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreviews((prev) => [...prev, { file, preview: reader.result, type: 'video' }])
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreviews((prev) => [...prev, { file, preview: null, type: 'file', name: file.name }])
      }
    })
  }

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
    setFilePreviews(filePreviews.filter((_, i) => i !== index))
  }

  const insertEmoji = (emoji) => {
    setContent(content + emoji)
    setShowEmojiPicker(false)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if ((!content.trim() && selectedFiles.length === 0) || sending) return
    setSending(true)
    try {
      const formData = new FormData()
      formData.append('receiverId', receiverId)
      formData.append('communityId', communityId)
      formData.append('content', content)
      selectedFiles.forEach((file) => formData.append('files', file))
      await api.post('/messages', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setContent('')
      setSelectedFiles([])
      setFilePreviews([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      alert(error.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const openFile = (url) => window.open(url.startsWith('http') ? url : url, '_blank')

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${embedded ? 'min-h-[400px]' : 'h-[600px]'}`}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-900 dark:border-gray-800 ${embedded ? 'rounded-lg border border-gray-200 dark:border-gray-700 h-full min-h-0' : 'card h-[700px]'}`}>
      {/* Chat header */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            aria-label="Back"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
          {receiver?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 dark:text-white truncate">{receiver?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{community?.name}</p>
        </div>
      </div>

      {/* Messages - WhatsApp/Instagram style: your messages right (green), theirs left (white/gray) */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-[#efeae2] dark:bg-gray-950">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
            <p className="text-gray-500 dark:text-gray-400 font-medium">No messages yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          <div className="p-3 space-y-1">
            {messages.map((message) => {
              const isOwn = message.sender._id === user?._id
              return (
                <div
                  key={message._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-1.5 items-end max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isOwn && (
                      <div className="w-6 h-6 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white text-xs font-medium shrink-0 mb-1">
                        {message.sender.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div
                      className={`inline-block rounded-2xl px-3 py-2 shadow-sm ${
                        isOwn
                          ? 'bg-[#dcf8c6] dark:bg-green-900/60 text-gray-900 dark:text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      {message.content && (
                        <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">{message.content}</p>
                      )}
                      {message.sharedPost && (
                        <Link
                          to={`/community/${message.sharedPost.community?._id || communityId}`}
                          className="mt-2 block border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="p-2.5">
                            <div className="flex items-center gap-2 text-xs text-primary dark:text-blue-400 font-medium mb-1">
                              <FiShare2 className="shrink-0" />
                              <span>{message.sharedPost.author?.name || 'Someone'} shared a post</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                              {message.sharedPost.content}
                            </p>
                            {message.sharedPost.image && (
                              <img
                                src={getImageUrl(message.sharedPost.image) || message.sharedPost.image}
                                alt="Post"
                                className="mt-2 w-full max-h-32 object-cover rounded-lg"
                              />
                            )}
                            {message.sharedPost.video && !message.sharedPost.image && (
                              <video
                                src={getImageUrl(message.sharedPost.video) || message.sharedPost.video}
                                className="mt-2 w-full max-h-32 object-cover rounded-lg"
                                muted
                                preload="metadata"
                              />
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              View in {message.sharedPost.community?.name || 'community'}
                            </p>
                          </div>
                        </Link>
                      )}
                      {message.image && (
                        <img
                          src={getImageUrl(message.image) || message.image}
                          alt="Shared"
                          className="mt-1 rounded-lg max-w-full max-h-64 object-cover cursor-pointer"
                          onClick={() => openFile(getImageUrl(message.image) || message.image)}
                        />
                      )}
                      {message.video && (
                        <video
                          src={getImageUrl(message.video) || message.video}
                          controls
                          className="mt-1 rounded-lg max-w-full max-h-64"
                        />
                      )}
                      {message.files?.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {message.files.map((file, idx) => {
                            const fileUrl = getImageUrl(file.url) || file.url
                            return (
                              <div key={idx}>
                                {file.fileType === 'image' && (
                                  <img
                                    src={fileUrl}
                                    alt={file.originalName}
                                    className="rounded-lg max-w-full max-h-64 object-cover cursor-pointer"
                                    onClick={() => openFile(fileUrl)}
                                  />
                                )}
                                {file.fileType === 'video' && (
                                  <video src={fileUrl} controls className="rounded-lg max-w-full max-h-64" />
                                )}
                                {(file.fileType === 'document' || file.fileType === 'other') && (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 bg-black/5 dark:bg-white/10 rounded-lg hover:bg-black/10"
                                  >
                                  <FiPaperclip className="shrink-0" />
                                  <span className="text-sm truncate">{file.originalName}</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className={`text-[10px] mt-1 ${isOwn ? 'text-gray-600 dark:text-gray-300 text-right' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* File previews */}
      {filePreviews.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border-t border-gray-200 dark:border-gray-700">
          {filePreviews.map((preview, index) => (
            <div key={index} className="relative">
              {preview.type === 'image' && <img src={preview.preview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />}
              {preview.type === 'video' && <video src={preview.preview} className="w-20 h-20 object-cover rounded-lg" />}
              {preview.type === 'file' && (
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <FiPaperclip className="text-xl text-gray-500" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
              >
                <FiX className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input - WhatsApp/Instagram style bar */}
      <form onSubmit={handleSend} className="p-2 border-t border-gray-200 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message"
              className="w-full pl-4 pr-12 py-2.5 border border-gray-200 dark:border-gray-600 rounded-3xl resize-none focus:outline-none focus:border-primary bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-[15px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((p) => !p)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
              >
                <FiSmile className="text-lg text-gray-600 dark:text-gray-400" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
              >
                <FiPaperclip className="text-lg text-gray-600 dark:text-gray-400" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={sending || (!content.trim() && selectedFiles.length === 0)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <FiSend className="text-lg" />
          </button>
        </div>
        {showEmojiPicker && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-10 gap-1 max-h-36 overflow-y-auto">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="text-xl hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
