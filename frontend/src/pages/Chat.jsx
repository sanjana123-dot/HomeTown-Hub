import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  FiArrowLeft,
  FiSend,
  FiImage,
  FiVideo,
  FiPaperclip,
  FiSmile,
  FiX,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import { getImageUrl } from '../utils/imageUrl'

const Chat = () => {
  const { communityId, receiverId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [receiver, setReceiver] = useState(null)
  const [community, setCommunity] = useState(null)
  const [content, setContent] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [filePreviews, setFilePreviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾']

  useEffect(() => {
    fetchChatData()
  }, [communityId, receiverId])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
      // Mark messages as read
      markMessagesAsRead()
    }
  }, [messages])

  useEffect(() => {
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      fetchMessages()
    }, 3000)
    return () => clearInterval(interval)
  }, [communityId, receiverId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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
          setFilePreviews((prev) => [
            ...prev,
            { file, preview: reader.result, type: 'image' },
          ])
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreviews((prev) => [
            ...prev,
            { file, preview: reader.result, type: 'video' },
          ])
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreviews((prev) => [
          ...prev,
          { file, preview: null, type: 'file', name: file.name },
        ])
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

      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      await api.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setContent('')
      setSelectedFiles([])
      setFilePreviews([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      await fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      alert(error.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
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

  return (
    <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Chat Header */}
            <div className="card dark:bg-gray-900 dark:border-gray-800 mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(`/inbox/${communityId}`)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <FiArrowLeft className="text-xl text-gray-900 dark:text-white" />
                </button>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {receiver?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {receiver?.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {community?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="card dark:bg-gray-900 dark:border-gray-800 mb-4 h-[600px] overflow-y-auto flex flex-col">
              <div className="flex-1 space-y-4 p-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-300 font-medium">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.sender._id === user?._id
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            isOwn ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          } rounded-lg p-3`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-semibold mb-1 opacity-75">
                              {message.sender.name}
                            </p>
                          )}
                          {message.content && (
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          )}
                          {message.image && (
                            <img
                              src={message.image.startsWith('http') ? message.image : message.image}
                              alt="Shared"
                              className="mt-2 rounded-lg max-w-full max-h-64 object-cover cursor-pointer"
                              onClick={() => window.open(message.image.startsWith('http') ? message.image : message.image, '_blank')}
                            />
                          )}
                          {message.video && (
                            <video
                              src={message.video.startsWith('http') ? message.video : message.video}
                              controls
                              className="mt-2 rounded-lg max-w-full max-h-64"
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                          {message.files && message.files.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.files.map((file, index) => {
                                const fileUrl = getImageUrl(file.url) || file.url
                                return (
                                  <div key={index}>
                                    {file.fileType === 'image' && (
                                      <img
                                        src={fileUrl}
                                        alt={file.originalName}
                                        className="rounded-lg max-w-full max-h-64 object-cover cursor-pointer"
                                        onClick={() => window.open(fileUrl, '_blank')}
                                      />
                                    )}
                                    {file.fileType === 'video' && (
                                      <video
                                        src={fileUrl}
                                        controls
                                        className="rounded-lg max-w-full max-h-64"
                                      >
                                        Your browser does not support the video tag.
                                      </video>
                                    )}
                                    {(file.fileType === 'document' || file.fileType === 'other') && (
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                                      >
                                        <FiPaperclip />
                                        <span className="text-sm">{file.originalName}</span>
                                      </a>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                          <p className="text-xs mt-2 opacity-75">
                            {formatDistanceToNow(new Date(message.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* File Previews */}
            {filePreviews.length > 0 && (
              <div className="card dark:bg-gray-900 dark:border-gray-800 mb-4 p-4">
                <div className="flex flex-wrap gap-2">
                  {filePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      {preview.type === 'image' && (
                        <img
                          src={preview.preview}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      {preview.type === 'video' && (
                        <video
                          src={preview.preview}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      {preview.type === 'file' && (
                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <FiPaperclip className="text-2xl" />
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <FiX className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <form onSubmit={handleSend} className="card dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend(e)
                      }
                    }}
                  />
                  <div className="absolute bottom-2 right-2 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg"
                    >
                      <FiSmile className="text-xl text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg"
                    >
                      <FiPaperclip className="text-xl text-gray-700 dark:text-gray-300" />
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
                  className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend className="text-xl" />
                </button>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="text-2xl hover:bg-gray-200 dark:hover:bg-slate-600 rounded p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Chat
