import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { FiImage, FiVideo, FiFile, FiX } from 'react-icons/fi'
import EmojiPickerButton, { insertEmojiAtCursor } from './EmojiPickerButton'

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [selectedCommunity, setSelectedCommunity] = useState('')
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [filePreviews, setFilePreviews] = useState([])
  const [fileCaptions, setFileCaptions] = useState({}) // Object to store captions by index
  const fileInputRef = useRef(null)
  const contentTextareaRef = useRef(null)
  const captionRefs = useRef({})

  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      const response = await api.get('/communities/my')
      setCommunities(response.data)
      if (response.data.length > 0) {
        setSelectedCommunity(response.data[0]._id)
      }
    } catch (error) {
      console.error('Error fetching communities:', error)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = [...selectedFiles, ...files].slice(0, 10) // Limit to 10 files
    setSelectedFiles(newFiles)

    // Create previews only for newly added files
    const existingCount = selectedFiles.length
    files.forEach((file, index) => {
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
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = filePreviews.filter((_, i) => i !== index)
    const newCaptions = { ...fileCaptions }
    delete newCaptions[index]
    // Reindex captions
    const reindexedCaptions = {}
    Object.keys(newCaptions).forEach((key) => {
      const oldIndex = parseInt(key)
      if (oldIndex > index) {
        reindexedCaptions[oldIndex - 1] = newCaptions[key]
      } else if (oldIndex < index) {
        reindexedCaptions[oldIndex] = newCaptions[key]
      }
    })
    setSelectedFiles(newFiles)
    setFilePreviews(newPreviews)
    setFileCaptions(reindexedCaptions)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const updateCaption = (index, caption) => {
    setFileCaptions((prev) => ({
      ...prev,
      [index]: caption,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if ((!content.trim() && selectedFiles.length === 0) || !selectedCommunity) return

    setLoading(true)
    try {
      const formData = new FormData()
      // Backend requires non-empty content: use main text, first file caption, or a placeholder when only files
      const contentToSend =
        content.trim() ||
        (filePreviews.length > 0 && fileCaptions[0]?.trim()) ||
        (selectedFiles.length > 0 ? '[Photo]' : '')
      formData.append('content', contentToSend)
      formData.append('community', selectedCommunity)

      // Append all files with their captions
      selectedFiles.forEach((file, index) => {
        formData.append('files', file)
        if (fileCaptions[index]) {
          formData.append(`captions[${index}]`, fileCaptions[index])
        }
      })

      await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setContent('')
      setSelectedFiles([])
      setFilePreviews([])
      setFileCaptions({})
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      if (onPostCreated) onPostCreated()
    } catch (error) {
      console.error('Error creating post:', error)
      alert(error.response?.data?.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card mb-6">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          {communities.length > 0 && (
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="input-field mb-3"
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
          <div className="flex space-x-2 mb-3">
            <textarea
              ref={contentTextareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="input-field flex-1"
              rows="3"
            />
            <EmojiPickerButton
              className="self-end"
              onInsert={(emoji) => insertEmojiAtCursor(contentTextareaRef, content, setContent, emoji)}
              title="Add emoji"
            />
          </div>

          {/* File Previews */}
          {filePreviews.length > 0 && (
            <div className="mb-3 space-y-3">
              {filePreviews.map((preview, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="relative group mb-2">
                    {preview.type === 'image' && (
                      <img
                        src={preview.preview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    {preview.type === 'video' && (
                      <video
                        src={preview.preview}
                        className="w-full h-32 object-cover rounded-lg"
                        controls={false}
                      />
                    )}
                    {preview.type === 'file' && (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FiFile className="text-4xl text-gray-400" />
                        <span className="ml-2 text-xs text-gray-600 truncate max-w-[80px]">
                          {preview.name}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX className="text-sm" />
                    </button>
                  </div>
                  {/* Caption Input */}
                  <div className="flex space-x-2 items-center">
                    <input
                      ref={(el) => { captionRefs.current[index] = el }}
                      type="text"
                      placeholder="Add a caption (optional)..."
                      value={fileCaptions[index] || ''}
                      onChange={(e) => updateCaption(index, e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      maxLength={200}
                    />
                    <EmojiPickerButton
                      onInsert={(emoji) => insertEmojiAtCursor(
                        { current: captionRefs.current[index] },
                        fileCaptions[index] || '',
                        (v) => updateCaption(index, v),
                        emoji
                      )}
                      title="Add emoji"
                    />
                  </div>
                  {fileCaptions[index] && (
                    <p className="text-xs text-gray-500 mt-1">
                      {fileCaptions[index].length}/200
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* File Upload Buttons */}
          <div className="flex items-center space-x-2 mb-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              <FiImage className="text-xl" />
              <span className="text-sm">Photo</span>
            </label>
            <label
              htmlFor="file-upload"
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              <FiVideo className="text-xl" />
              <span className="text-sm">Video</span>
            </label>
            <label
              htmlFor="file-upload"
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              <FiFile className="text-xl" />
              <span className="text-sm">File</span>
            </label>
            {selectedFiles.length > 0 && (
              <span className="text-sm text-gray-500">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {selectedFiles.length > 0 && `Max 10 files, ${selectedFiles.length}/10 selected`}
            </p>
            <button
              type="submit"
              disabled={loading || communities.length === 0 || (!content.trim() && selectedFiles.length === 0)}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost





