import { google } from "googleapis";

export const deleteComment = async (req, res) => {
  const commentId = req.query.commentId;

  if (!commentId) {
    return res.status(400).json({
      success: false,
      message: "Comment ID is required",
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
      id: commentId,
    });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      deletedCommentId: commentId,
    });
  } catch (error) {
    console.error("YouTube API error:", error);

    let errorMessage = "Failed to delete comment";
    let statusCode = 500;

    if (error.code === 403) {
      statusCode = 403;
      errorMessage = "You don't have permission to delete this comment";
    } else if (error.code === 404) {
      statusCode = 404;
      errorMessage = "Comment not found or already deleted";
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
      details: error.response?.data?.error || null,
    });
  }
};
