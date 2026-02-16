import mongoose from 'mongoose'

const announcementSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
announcementSchema.index({ community: 1, isPinned: -1, createdAt: -1 })

const Announcement = mongoose.model('Announcement', announcementSchema)

export default Announcement
