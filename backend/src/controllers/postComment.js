import { google } from "googleapis";

export const postComment = async (req, res) => {
  const { videoId, text } = req.body;

  if (!videoId || !text) {
    return res.status(400).json({
      success: false,
      message: "Video ID and text are required",
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

    const response = await youtube.commentThreads.insert({
      part: "snippet",
      requestBody: {
        snippet: {
          videoId: videoId,
          topLevelComment: {
            snippet: {
              textOriginal: text,
            },
          },
        },
      },
    });

    const newComment = response.data.snippet.topLevelComment.snippet;
    const commentData = {
      id: response.data.id,
      textDisplay: newComment.textDisplay,
      authorDisplayName: newComment.authorDisplayName,
      authorProfileImageUrl: newComment.authorProfileImageUrl,
      publishedAt: newComment.publishedAt,
      likeCount: newComment.likeCount,
      isOwner: true,
    };

    return res.status(201).json({
      success: true,
      comment: commentData,
      message: "Comment posted successfully",
    });
  } catch (error) {
    console.error("YouTube API error:", error);

    let errorMessage = "Failed to post comment";
    let statusCode = 500;

    if (error.code === 403) {
      statusCode = 403;
      errorMessage = "You don't have permission to comment on this video";
    } else if (error.code === 400) {
      statusCode = 400;
      errorMessage = "Invalid request to YouTube API";
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
      details: error.response?.data?.error || null,
    });
  }
};
