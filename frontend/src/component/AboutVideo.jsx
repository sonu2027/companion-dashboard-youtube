import React, { useState } from 'react';
import toast from 'react-hot-toast';

function AboutVideo({ videoData, onUpdate, onComment, onReply, onDeleteComment, onDeleteReply }) {
    const [editMode, setEditMode] = useState(false);
    const [title, setTitle] = useState(videoData.title);
    const [description, setDescription] = useState(videoData.description);
    const [newComment, setNewComment] = useState("");
    const [replyBox, setReplyBox] = useState({ id: null, text: "" });
    const [notes, setNotes]=useState('')

    const handleUpdate = () => {
        onUpdate(title, description);
        setEditMode(false);
    };

    const handlePostComment = () => {
        if (newComment.trim()) {
            onComment(newComment);
            setNewComment("");
        }
    };

    const handleReply = (commentId, replyText) => {
        console.log("commentId and text: ", commentId, replyText);

        if (replyText.trim()) {
            onReply(commentId, replyText);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mt-4 max-w-3xl mx-auto">

            <div className="my-6">
                <h2 className="text-lg font-semibold mb-2">📝 Write notes</h2>
                <textarea
                    className="w-full border p-2 rounded mb-2"
                    placeholder="Write your comment here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <button onClick={() => {
                    toast.success("Note added successfully");
                    setNotes("");
                }}
                    className="px-4 py-1 bg-blue-600 text-white rounded"
                >
                    Add notes
                </button>
            </div>

            <div className="flex flex-col sm:flex-row">
                <div className="sm:w-1/3 mb-4 sm:mb-0 sm:mr-4">
                    <img
                        src={videoData.thumbnail}
                        alt={videoData.title}
                        className="w-full h-auto rounded-lg object-cover"
                    />
                </div>

                <div className="flex-1">
                    {editMode ? (
                        <>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-xl sm:text-2xl font-semibold mb-2 w-full border p-1 rounded"
                            />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full text-sm text-gray-600 border p-1 rounded mb-2"
                            />
                            <button
                                onClick={() => handleUpdate(title, description)}
                                className="px-3 py-1 bg-green-500 text-white rounded mr-2"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditMode(false)}
                                className="px-3 py-1 bg-gray-300 text-black rounded"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <h1 className="text-xl sm:text-2xl font-semibold mb-1">{title}</h1>
                            <p className="text-gray-600 text-sm mb-2">{description}</p>
                            <button
                                onClick={() => setEditMode(true)}
                                className="text-sm text-blue-500 underline"
                            >
                                Edit Title/Description
                            </button>
                        </>
                    )}
                    <div className="flex flex-wrap text-sm text-gray-500 gap-x-4 mt-2">
                        <p>👁️ {videoData.views.toLocaleString()} views</p>
                        <p>👍 {videoData.likes.toLocaleString()} likes</p>
                        <p>📅 {new Date(videoData.publishedAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">📝 Post a Comment</h2>
                <textarea
                    className="w-full border p-2 rounded mb-2"
                    placeholder="Write your comment here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                    onClick={() => handlePostComment(newComment)}
                    className="px-4 py-1 bg-blue-600 text-white rounded"
                >
                    Post
                </button>
            </div>

            {videoData.comments?.length > 0 && (
                <div className="mt-6 border-t pt-4">
                    <h2 className="text-lg font-semibold mb-3">💬 Top Comments</h2>
                    <ul className="space-y-6">
                        {
                            videoData.comments.map((comment) => (
                                <li key={comment.id} className="flex space-x-3">
                                    <img
                                        src={comment.authorProfileImageUrl}
                                        alt={comment.authorDisplayName}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-gray-900">{comment.authorDisplayName}</p>
                                        <p
                                            className="text-sm text-gray-700"
                                            dangerouslySetInnerHTML={{ __html: comment.textDisplay }}
                                        />
                                        <div className="text-xs text-gray-500 mt-1">
                                            {new Date(comment.publishedAt).toLocaleString()} · 👍 {comment.likeCount}
                                        </div>
                                        <div className="mt-1 space-x-2">
                                            <button
                                                onClick={() => setReplyBox({ id: comment.commentId, text: "" })}
                                                className="text-blue-500 text-xs"
                                            >
                                                Reply
                                            </button>
                                            <button
                                                onClick={() => onDeleteComment(comment.commentId)}
                                                className="text-red-500 text-xs"
                                            >
                                                Delete
                                            </button>
                                        </div>

                                        {replyBox.id === comment.commentId && (
                                            <div className="mt-2">
                                                <textarea
                                                    className="w-full border p-2 rounded mb-1 text-sm"
                                                    placeholder="Write a reply..."
                                                    value={replyBox.text}
                                                    onChange={(e) => setReplyBox({ ...replyBox, text: e.target.value })}
                                                />
                                                <button
                                                    onClick={() => {
                                                        handleReply(comment.id, replyBox.text);
                                                        setReplyBox({ id: null, text: "" });
                                                    }}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                                                >
                                                    Submit Reply
                                                </button>
                                            </div>
                                        )}

                                        {comment.replies?.length > 0 && (
                                            <ul className="mt-3 pl-4 border-l border-gray-200 space-y-3">
                                                {comment.replies.map((reply) => (
                                                    <li key={reply.commentId} className="flex space-x-2">
                                                        <img
                                                            src={reply.authorProfileImageUrl}
                                                            alt={reply.authorDisplayName}
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-900">{reply.authorDisplayName}</p>
                                                            <p
                                                                className="text-sm text-gray-700"
                                                                dangerouslySetInnerHTML={{ __html: reply.textDisplay }}
                                                            />
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {new Date(reply.publishedAt).toLocaleString()} · 👍 {reply.likeCount}
                                                            </div>
                                                            <button
                                                                onClick={() => onDeleteReply(reply.commentId)}
                                                                className="text-red-500 text-xs mt-1"
                                                            >
                                                                Delete Reply
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default AboutVideo;
