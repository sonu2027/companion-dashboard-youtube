import mongoose, { Schema } from "mongoose";

const noteSchema = new Schema(
  {
    videoId: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Note = mongoose.model("Note", noteSchema);
