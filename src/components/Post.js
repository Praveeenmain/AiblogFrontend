import React, { useState, useEffect } from 'react';
import { API_URL } from '../App';
import '../styles/Post.css';
import { auth } from './firebase';

const Post = ({ post }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [file, setFile] = useState(null);
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [hasLiked, setHasLiked] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // AI Tools
  const [sentiment, setSentiment] = useState(null);
  const [summary, setSummary] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [showAiTools, setShowAiTools] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user && post.likes?.includes(user.uid)) {
        setHasLiked(true);
      }
    });
    return () => unsubscribe();
  }, [post.likes]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`${API_URL}/posts/${post._id}/comments`);
        const data = await response.json();
        if (response.ok) {
          setComments(data.comments);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };
    fetchComments();
  }, [post._id]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const handleDelete = async () => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_URL}/posts/${post._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      const data = await response.json();
      if (response.ok) {
        alert('Post deleted successfully');
        window.location.reload();
      } else {
        alert(data.error || 'Failed to delete post.');
      }
    } catch (err) {
      alert('Error deleting post.');
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (file) formData.append('file', file);

      const response = await fetch(`${API_URL}/posts/${post._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${idToken}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert('Post updated successfully');
        setIsEditing(false);
        window.location.reload();
      } else {
        alert(data.error || 'Failed to update post.');
      }
    } catch (err) {
      alert('Error updating post.');
    }
  };

  const handleLike = async () => {
    if (hasLiked) return alert('You have already liked this post.');
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_URL}/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setLikes(likes + 1);
        setHasLiked(true);
      } else {
        alert(data.error || 'Failed to like post.');
      }
    } catch (err) {
      alert('Error liking post.');
    }
  };

  const handleShare = async () => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_URL}/posts/${post._id}/share`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (response.ok) {
        const url = `${window.location.origin}/posts/${post._id}`;
        await navigator.clipboard.writeText(url);
        alert('Post shared and link copied to clipboard');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to share post.');
      }
    } catch (err) {
      alert('Error sharing post.');
    }
  };

  const toggleComments = () => setIsCommentsOpen(!isCommentsOpen);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_URL}/posts/${post._id}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: newComment }),
      });

      const data = await response.json();
      if (response.ok) {
        setComments([
          ...comments,
          {
            userId: user.uid,
            userName: user.displayName || user.email,
            comment: newComment,
            createdAt: new Date()
          }
        ]);
        setNewComment("");
        if (!isCommentsOpen) setIsCommentsOpen(true);
      } else {
        alert(data.error || 'Failed to post comment.');
      }
    } catch (err) {
      alert('Error posting comment.');
    }
  };

  const toggleAiTools = () => setShowAiTools(!showAiTools);

  const handleAnalyzeSentiment = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_URL}/api/analyze/post/${post._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error((await response.json()).error);
      const result = await response.json();
      console.log(result)
      setSentiment(result.sentiment);
      setSummary(result.summary);  // Fix: Ensure summary is properly received
    } catch (error) {
      console.error('Sentiment analysis failed:', error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="post">
      <h3>{post.title}</h3>
      <div className="post-meta">
        <span>By {post.author.name || post.author.email}</span>
        <span>{formatDate(post.createdAt)}</span>
      </div>
      <div className="post-content">{post.content}</div>

      {post.media?.contentType && (
        <div className="post-media">
          {post.media.contentType.startsWith('image/') ? (
            <img src={`${API_URL}/media/${post.media.fileId}`} alt={post.title} />
          ) : post.media.contentType.startsWith('video/') ? (
            <video controls>
              <source src={`${API_URL}/media/${post.media.fileId}`} type={post.media.contentType} />
            </video>
          ) : (
            <a href={`${API_URL}/media/${post.media.fileId}`} target="_blank" rel="noopener noreferrer">
              Download {post.media.fileName}
            </a>
          )}
        </div>
      )}

      <div className="post-actions">
        <button onClick={handleLike} disabled={!user || hasLiked}>
          {hasLiked ? 'Liked' : 'Like'} ({likes})
        </button>
        <button onClick={handleShare} disabled={!user}>Share</button>
        <button onClick={toggleAiTools}>AI Tools {showAiTools ? '▲' : '▼'}</button>
      </div>

      {showAiTools && (
        <div className="ai-tools">
          <div className="ai-buttons">
            <button onClick={handleAnalyzeSentiment} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Sentiment'}
            </button>
          </div>
          {sentiment && (
            <div className="ai-result sentiment-result">
              <h4>Sentiment:</h4>
              <p>
                This post seems 
                <strong className={sentiment === 'positive' ? 'positive' : 'negative'}>
              {sentiment.toLowerCase()}
            </strong>
              
              </p>
            </div>
          )}
          {summary && (
            <div className="ai-result summary-result">
              <h4>Summary:</h4>
              <p>{summary}</p>
            </div>
          )}
        </div>
      )}

      <button className="comments-toggle" onClick={toggleComments}>
        <span className={`comments-toggle-icon ${isCommentsOpen ? 'open' : ''}`}>▼</span>
        <span className="comments-count">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </span>
      </button>

      <div className={`post-comments ${isCommentsOpen ? 'open' : 'closed'}`}>
        <h4>Comments:</h4>
        <ul>
          {comments.map((comment, index) => (
            <li key={index}>
              <strong>{comment.userName || comment.author}:</strong> {comment.comment || comment.text}
              <div className="comment-date">
                {comment.createdAt && formatDate(comment.createdAt)}
              </div>
            </li>
          ))}
        </ul>
        {user ? (
          <form onSubmit={handleCommentSubmit}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              required
            />
            <button type="submit">Post Comment</button>
          </form>
        ) : (
          <p>Please log in to comment</p>
        )}
      </div>

      {user && post.author.uid === user.uid && (
        <div className="post-actions post-owner-actions">
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleUpdate} className="edit-post-form">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Edit title"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Edit content"
            required
          />
          <input type="file" onChange={handleFileChange} />
          <div className="edit-actions">
            <button type="submit">Update Post</button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Post;
