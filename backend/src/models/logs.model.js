import mongoose, { Schema } from "mongoose";

const logSchema = new Schema(
  {
    videoId: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: [
        "COMMENT_ADDED",
        "REPLY_ADDED",
        "COMMENT_DELETED",
        "REPLY_DELETED",
        "TITLE_AND_DESC_UPDATED",
        "NOTE_ADDED",
        "NOTE_DELETED",
        "NOTE_UPDATED",
      ],
      required: true,
    },
    details: {
      type: Object, 
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Log = mongoose.model("Log", logSchema);
