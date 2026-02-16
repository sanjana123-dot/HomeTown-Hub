import mongoose from 'mongoose'

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    image: {
      type: String,
    },
    video: {
      type: String,
    },
    files: [
      {
        filename: String,
        originalName: String,
        fileType: String, // 'image', 'video', 'document', 'other'
        url: String,
      },
    ],
    sharedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient querying
messageSchema.index({ sender: 1, receiver: 1, community: 1, createdAt: -1 })
messageSchema.index({ receiver: 1, isRead: 1 })

const Message = mongoose.model('Message', messageSchema)

export default Message
