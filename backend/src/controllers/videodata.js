// import { google } from "googleapis";

// const videoData = async (req, res) => {
//   try {
//     const videoId = req.query.videoId;
//     if (!videoId) {
//       return res.status(400).json({ error: "Video ID is required" });
//     }

//     const youtube = google.youtube({
//       version: "v3",
//       auth: process.env.YOUTUBE_API_KEY,
//     });

//     const videoResponse = await youtube.videos.list({
//       part: "snippet,statistics",
//       id: videoId,
//     });

//     if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
//       return res.status(404).json({ error: "Video not found" });
//     }

//     const video = videoResponse.data.items[0];
//     const channelId = video.snippet.channelId;

//     const commentsResponse = await youtube.commentThreads.list({
//       part: "snippet,replies",
//       videoId: videoId,
//       maxResults: 10,
//       order: "relevance",
//     });

//     const comments = commentsResponse.data.items.map((item) => {
//       const topComment = item.snippet.topLevelComment;
//       const topCommentSnippet = topComment.snippet;

//       const replies =
//         item.replies?.comments.map((reply) => ({
//           commentId: reply.id,
//           authorDisplayName: reply.snippet.authorDisplayName,
//           authorProfileImageUrl: reply.snippet.authorProfileImageUrl,
//           authorChannelId: reply.snippet.authorChannelId?.value,
//           textDisplay: reply.snippet.textDisplay,
//           publishedAt: reply.snippet.publishedAt,
//           likeCount: reply.snippet.likeCount,
//           isOwner: reply.snippet.authorChannelId?.value === channelId,
//           owner,
//         })) || [];

//       return {
//         commentId: topComment.id,
//         authorDisplayName: topCommentSnippet.authorDisplayName,
//         authorProfileImageUrl: topCommentSnippet.authorProfileImageUrl,
//         authorChannelId: topCommentSnippet.authorChannelId?.value,
//         textDisplay: topCommentSnippet.textDisplay,
//         publishedAt: topCommentSnippet.publishedAt,
//         likeCount: topCommentSnippet.likeCount,
//         isOwner: topCommentSnippet.authorChannelId?.value === channelId,
//         replies: replies,
//       };
//     });

//     const videoData = {
//       id: video.id,
//       title: video.snippet.title,
//       description: video.snippet.description,
//       thumbnail: video.snippet.thumbnails.high.url,
//       views: video.statistics.viewCount,
//       likes: video.statistics.likeCount,
//       publishedAt: video.snippet.publishedAt,
//       channelId: channelId,
//       comments: comments,
//     };

//     res.json(videoData);
//   } catch (error) {
//     console.error("Error fetching video:", error);
//     res.status(500).json({ error: "Failed to fetch video details" });
//   }
// };

// export { videoData };

import { google } from "googleapis";

const videoData = async (req, res) => {
  try {
    const videoId = req.query.videoId;
    if (!videoId) {
      return res.status(400).json({ error: "Video ID is required" });
    }

    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });

    const videoResponse = await youtube.videos.list({
      part: "snippet,statistics",
      id: videoId,
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    const video = videoResponse.data.items[0];

    const commentsResponse = await youtube.commentThreads.list({
      part: "snippet,replies",
      videoId: videoId,
      maxResults: 10,
      order: "relevance",
    });

    const comments = commentsResponse.data.items.map((item) => {
      const topComment = item.snippet.topLevelComment.snippet;

      const replies =
        item.replies?.comments.map((reply) => ({
          commentId: reply.id,
          authorDisplayName: reply.snippet.authorDisplayName,
          authorProfileImageUrl: reply.snippet.authorProfileImageUrl,
          textDisplay: reply.snippet.textDisplay,
          publishedAt: reply.snippet.publishedAt,
          likeCount: reply.snippet.likeCount,
        })) || [];

      return {
        commentId: item.id,
        authorDisplayName: topComment.authorDisplayName,
        authorProfileImageUrl: topComment.authorProfileImageUrl,
        textDisplay: topComment.textDisplay,
        publishedAt: topComment.publishedAt,
        likeCount: topComment.likeCount,
        replies: replies,
      };
    });

    const videoData = {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high.url,
      views: video.statistics.viewCount,
      likes: video.statistics.likeCount,
      publishedAt: video.snippet.publishedAt,
      comments: comments,
    };

    res.json(videoData);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ error: "Failed to fetch video details" });
  }
};

export { videoData };
