import mongoose from "mongoose"

const logSchema = new mongoose.Schema({
  userId: {
    type: String, // Google user ID ya email
    required: true,
  },
  videoId: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: [
      'COMMENT_ADDED',
      'REPLY_ADDED',
      'COMMENT_DELETED',
      'REPLY_DELETED',
      'TITLE_UPDATED',
      'DESCRIPTION_UPDATED',
      'NOTE_ADDED',
      'NOTE_DELETED',
      'NOTE_UPDATED'
    ],
    required: true,
  },
  details: {
    type: Object, // Extra info (comment text, replyId, etc.)
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Log', logSchema);