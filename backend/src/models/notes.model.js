import mongoose from "mongoose"

const noteSchema = new mongoose.Schema({
  userId: {
    type: String, // Google user ID ya email
    required: true,
  },
  videoId: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Note', noteSchema);
