import { google } from "googleapis";

export const updateTitleDescription = async (req, res) => {
  const { videoId, title, description } = req.body;

  if (!videoId || !title) {
    return res.status(400).json({
      message: "videoId and title are required",
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const accessToken = authHeader.split(" ")[1];
  if (!accessToken) {
    return res.status(401).json({ message: "Access token missing" });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    const { data: videoData } = await youtube.videos.list({
      part: "snippet",
      id: videoId,
    });

    if (!videoData.items?.length) {
      return res.status(404).json({ message: "Video not found" });
    }

    const currentSnippet = videoData.items[0].snippet;

    const response = await youtube.videos.update({
      part: "snippet",
      requestBody: {
        id: videoId,
        snippet: {
          ...currentSnippet,
          title: title,
          description: description || currentSnippet.description,
        },
      },
    });
    console.log(`Video ${videoId} updated successfully`);

    return res.status(200).json({
      success: true,
      videoId: videoId,
      title: response.data.snippet.title,
      description: response.data.snippet.description,
      thumbnail: response.data.snippet.thumbnails?.high?.url,
    });
  } catch (err) {
    console.error("YouTube API Error:", err);

    if (err.code === 403) {
      return res.status(403).json({
        message:
          "Permission denied. Make sure you have proper YouTube permissions.",
        details: err.errors,
      });
    }

    if (err.response?.data) {
      return res.status(err.response.status).json({
        message: "YouTube API error",
        details: err.response.data,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
