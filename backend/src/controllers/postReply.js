import { google } from "googleapis";

export const postReply = async (req, res) => {
  const { commentId, text } = req.body;

  console.log("commentId, text:", commentId, text); 
  

  if (!commentId || !text) {
    return res.status(400).json({
      success: false,
      message: "Comment ID and text are required",
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

    const response = await youtube.comments.insert({
      part: "snippet",
      requestBody: {
        snippet: {
          parentId: commentId,
          textOriginal: text,
        },
      },
    });

    const replyData = {
      id: response.data.id,
      textDisplay: response.data.snippet.textDisplay,
      authorDisplayName: response.data.snippet.authorDisplayName,
      authorProfileImageUrl: response.data.snippet.authorProfileImageUrl,
      publishedAt: response.data.snippet.publishedAt,
      likeCount: response.data.snippet.likeCount,
      isOwner: true,
    };

    res.status(201).json({
      success: true,
      reply: replyData,
      message: "Reply posted successfully",
    });
  } catch (error) {
    console.error("YouTube API error:", error);

    let errorMessage = "Failed to post reply";
    let statusCode = 500;

    if (error.code === 403) {
      statusCode = 403;
      errorMessage = "You don't have permission to reply to this comment";
    } else if (error.code === 400) {
      statusCode = 400;
      errorMessage = "Invalid request to YouTube API";
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
      details: error.response?.data?.error || null,
    });
  }
};
