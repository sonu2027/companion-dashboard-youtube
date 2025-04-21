import { Note } from "../models/notes.model.js";
import { Log } from "../models/logs.model.js";

const addNotes = async (req, res) => {
  const { videoId, notes } = req.body;
  console.log("Received notes:", req.body, videoId, notes);

  try {
    const response = await Note.insertOne({
      videoId: videoId,
      note: notes,
    });

    const deleteLog = await Log.insertOne({
      videoId,
      action: "NOTE_ADDED",
      details: {notes},
    });

    res.status(200).json({ message: "Notes added successfully" });
  } catch (error) {
    console.error("Error adding notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { addNotes };
