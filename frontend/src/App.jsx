import React, { useState, useEffect } from 'react';
import axios from "axios";
import AboutVideo from './component/AboutVideo.jsx';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      const expires = params.get('expires_in');

      localStorage.setItem('yt_access_token', token);
      localStorage.setItem(
        'yt_token_expires',
        Date.now() + parseInt(expires, 10) * 1000
      );

      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const extractVideoId = (url) => {
    const reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const m = url.match(reg);
    return (m && m[2].length === 11) ? m[2] : null;
  };

  const handleOnKeyDown = async (e) => {
    if (e.key === 'Enter' && inputValue.includes('https://')) {
      setError('');
      const videoId = extractVideoId(inputValue);
      if (!videoId) return setError("Invalid YouTube URL.");

      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/video?videoId=${videoId}`);
        setVideoData(data);

      } catch (err) {
        setError("Failed to fetch video data.");
      }
    }
  };

  const onUpdate = async (title, description) => {
    console.log(videoData.id,
      videoData.title,
      videoData.description, videoData);

    const token = localStorage.getItem("yt_access_token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/video/update/titledescription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          videoId: videoData.id,
          title,
          description
        })
      });

      const data = await response.json();
      if (!response.ok) throw data;
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const onComment = async (commentText) => {
    setError(null);

    const token = localStorage.getItem("yt_access_token");
    if (!token) {
      setError("Please login to comment");
      return;
    }

    if (!commentText.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    const tempComment = {
      id: `temp-${Date.now()}`,
      text: commentText,
      author: "You",
      publishedAt: new Date().toISOString(),
      isOptimistic: true,
    };

    setVideoData(prev => ({
      ...prev,
      comments: [tempComment, ...prev.comments],
      commentCount: (prev.commentCount || 0) + 1,
    }));

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/video/comment`,
        {
          videoId: videoData?.id,
          text: commentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data?.success) {
        throw new Error("Invalid response from server");
      }

      setVideoData(prev => ({
        ...prev,
        comments: [
          {
            ...response.data.comment,
            isOwner: true,
          },
          ...prev.comments.filter(c => c.id !== tempComment.id),
        ],
      }));
    } catch (err) {
      setVideoData(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c.id !== tempComment.id),
        commentCount: prev.commentCount - 1,
      }));

      let errorMessage = err.response?.data?.message || err.message;

      if (err.response?.status === 403) {
        errorMessage = "You don't have permission to comment on this video";
      } else if (err.response?.status === 400) {
        errorMessage = "Invalid comment request";
      }

      setError(errorMessage);
    }
  };


  const onReply = async (commentId, replyText) => {
    const token = localStorage.getItem("yt_access_token");
    if (!token) {
      setError("Please login to reply");
      return;
    }

    const tempReply = {
      id: `temp-reply-${Date.now()}`,
      text: replyText,
      author: "You",
      publishedAt: new Date().toISOString(),
      isOptimistic: true
    };


    try {
      setVideoData(prev => ({
        ...prev,
        comments: prev.comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), tempReply]
            };
          }
          return comment;
        })
      }));

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/video/reply`,
        {
          commentId,
          text: replyText,
          videoId: videoData?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("res: ", response);


      if (!response.data?.success) {
        throw new Error("Invalid response from server");
      }

      setVideoData(prev => ({
        ...prev,
        comments: prev.comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [
                ...(comment.replies || []).filter(r => r.id !== tempReply.id),
                response.data.reply
              ]
            };
          }
          return comment;
        })
      }));

    } catch (err) {
      setVideoData(prev => ({
        ...prev,
        comments: prev.comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: (comment.replies || []).filter(r => r.id !== tempReply.id)
            };
          }
          return comment;
        })
      }));

      setError(err.response?.data?.message || "Failed to post reply");
    }
  };

  const onDeleteComment = async (commentId) => {
    const token = localStorage.getItem("yt_access_token");
    if (!token) {
      setError("Please login to delete comments");
      return;
    }

    try {
      setVideoData(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c.id !== commentId),
        commentCount: prev.commentCount - 1
      }));

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/video/delete/comment?commentId=${commentId}`,
        {
          data: {
            videoId: videoData?.id, // yeh req.body me jayega
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      if (!response.data?.success) {
        throw new Error("Failed to delete comment");
      }
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/video?videoId=${videoData.id}`
      );
      setVideoData(data);

    } catch (err) {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/video?videoId=${videoData.id}`
      );
      setVideoData(data);

      setError(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const onDeleteReply = async (replyId, commentId) => {
    const token = localStorage.getItem("yt_access_token");
    if (!token) {
      setError("Please login to delete replies");
      return;
    }

    try {
      setVideoData(prev => ({
        ...prev,
        comments: prev.comments.map(comment => ({
          ...comment,
          replies: (comment.replies || []).filter(r => r.id !== replyId)
        }))
      }));

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/video/delete/reply?replyId=${replyId}`,
        {
          data: {
            videoId: videoData?.id, // This will go in req.body
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      if (!response.data?.success) {
        throw new Error("Failed to delete reply");
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/video?videoId=${videoData.id}`
      );
      setVideoData(data);

    } catch (err) {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/video?videoId=${videoData.id}`
      );
      setVideoData(data);

      setError(err.response?.data?.message || "Failed to delete reply");
    }
  };

  const loginWithGoogle = () => {
    const redirect_uri = import.meta.env.VITE_REDIRECT_URI
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_CLIENT_ID}&redirect_uri=${redirect_uri}/auth/callback&response_type=token&scope=https://www.googleapis.com/auth/youtube.force-ssl&prompt=consent`;

  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className='flex justify-center my-4'>
        <button
          className='bg-blue-500 px-3 py-1 text-white rounded hover:bg-blue-600'
          onClick={loginWithGoogle}
        >
          Login with Google
        </button>
      </div>

      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        YouTube Video Info Viewer
      </h1>

      <div className="flex justify-center mb-4">
        <input
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleOnKeyDown}
          value={inputValue}
          type="text"
          placeholder="Paste YouTube video URL and press Enter..."
          className="w-full max-w-xl px-4 py-2 border border-blue-500 rounded shadow-sm focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {error && <div className="text-center text-red-500 mb-4">{error}</div>}

      {videoData && (
        <div className="flex justify-center">
          <AboutVideo
            videoData={videoData}
            onUpdate={onUpdate}
            onReply={onReply}
            onComment={onComment}
            onDeleteComment={onDeleteComment}
            onDeleteReply={onDeleteReply}
          />
        </div>
      )}
    </div>
  );
}

export default App;