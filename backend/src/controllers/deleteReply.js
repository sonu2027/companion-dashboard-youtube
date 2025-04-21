import { google } from "googleapis";
import { Log } from "../models/logs.model.js";

export const deleteReply = async (req, res) => {
  const replyId = req.query.replyId;
  const { videoId } = req.body;

  if (!replyId) {
    return res.status(400).json({
      success: false,
      message: "Reply ID is required",
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token missing",
    });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({ access_token: token });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    await youtube.comments.delete({
      id: replyId,
    });

    const deleteReply = await Log.insertOne({
      videoId,
      action: "REPLY_DELETED",
      details: {replyId},
    });

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
      deletedReplyId: replyId,
    });
  } catch (error) {
    console.error("YouTube API error:", error);

    let errorMessage = "Failed to delete reply";
    let statusCode = 500;

    if (error.code === 403) {
      statusCode = 403;
      errorMessage = "You don't have permission to delete this reply";
    } else if (error.code === 404) {
      statusCode = 404;
      errorMessage = "Reply not found or already deleted";
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
      details: error.response?.data?.error || null,
    });
  }
};
