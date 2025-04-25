import React, { useState, useEffect } from 'react';
import { API_URL } from '../App';
import '../styles/Post.css';
import { auth } from './firebase'; // Firebase auth import

const Post = ({ post }) => {
  const [user, setUser] = useState(null); // State to store current user
  const [isEditing, setIsEditing] = useState(false); // To toggle edit mode
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [file, setFile] = useState(null); // State to store the selected file
  const [likes, setLikes] = useState(post.likes?.length || 0); // State for the like count
  const [comments, setComments] = useState(post.comments || []); // State for storing comments
  const [newComment, setNewComment] = useState(""); // State for new comment input
  const [hasLiked, setHasLiked] = useState(false); // Track if current user has liked the post
  const [isCommentsOpen, setIsCommentsOpen] = useState(false); // Track if comments are visible

  // Fetch the current user from Firebase
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); // Set the current user in state
      
      // Check if this user has already liked the post
      if (user && post.likes && post.likes.includes(user.uid)) {
        setHasLiked(true);
      }
    });

    // Clean up the subscription when component unmounts
    return () => unsubscribe();
  }, [post.likes]);

  // Fetch comments when the component mounts
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = async () => {
    try {
      const idToken = await user.getIdToken();

      const response = await fetch(`${API_URL}/posts/${post._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert('Post deleted successfully');
        // You might want to refresh the page or update the post list
        window.location.reload();
      } else {
        alert(data.error || 'Failed to delete post.');
      }
    } catch (err) {
      alert('Error deleting post.');
    }
  };

  const handleEdit = () => {
    // Toggle edit mode
    setIsEditing(true);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Update file state when a file is selected
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const idToken = await user.getIdToken();
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch(`${API_URL}/posts/${post._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert('Post updated successfully');
        setIsEditing(false); // Exit edit mode
        // Refresh the page to show the updated post
        window.location.reload();
      } else {
        alert(data.error || 'Failed to update post.');
      }
    } catch (err) {
      alert('Error updating post.');
    }
  };

  // Handle Like functionality
  const handleLike = async () => {
    if (hasLiked) {
      alert('You have already liked this post.');
      return;
    }

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

  // Handle Share functionality
  const handleShare = async () => {
    try {
      const idToken = await user.getIdToken();
      
      // Call the backend share endpoint
      const response = await fetch(`${API_URL}/posts/${post._id}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        // Copy link to clipboard 
        const url = `${window.location.origin}/posts/${post._id}`;
        navigator.clipboard.writeText(url).then(() => {
          alert('Post shared successfully and link copied to clipboard');
        });
      } else {
        alert(data.error || 'Failed to share post.');
      }
    } catch (err) {
      alert('Error sharing post.');
    }
  };

  // Toggle comments visibility
  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen);
  };

  // Handle Comment functionality
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
        // Add the new comment to the UI
        const newCommentObj = {
          userId: user.uid,
          userName: user.displayName || user.email,
          comment: newComment,
          createdAt: new Date()
        };
        
        setComments([...comments, newCommentObj]);
        setNewComment(""); // Reset comment input
        if (!isCommentsOpen) {
          setIsCommentsOpen(true); // Open comments when submitting a new comment
        }
      } else {
        alert(data.error || 'Failed to post comment.');
      }
    } catch (err) {
      alert('Error posting comment.');
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
      
      {/* Check if media exists and render accordingly */}
      {post.media && post.media.contentType && (
        <div className="post-media">
          {post.media.contentType.startsWith('image/') ? (
            <img 
              src={`${API_URL}/media/${post.media.fileId}`} 
              alt={post.title} 
            />
          ) : post.media.contentType.startsWith('video/') ? (
            <video controls>
              <source 
                src={`${API_URL}/media/${post.media.fileId}`} 
                type={post.media.contentType} 
              />
              Your browser does not support the video tag.
            </video>
          ) : (
            <a 
              href={`${API_URL}/media/${post.media.fileId}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Download {post.media.fileName}
            </a>
          )}
        </div>
      )}

      {/* Like, Share, and Comment */}
      <div className="post-actions">
        <button onClick={handleLike} disabled={!user || hasLiked}>
          {hasLiked ? 'Liked' : 'Like'} ({likes})
        </button>
        <button onClick={handleShare} disabled={!user}>Share</button>
      </div>

      {/* Comments Toggle Button */}
      <button className="comments-toggle" onClick={toggleComments}>
        <span className={`comments-toggle-icon ${isCommentsOpen ? 'open' : ''}`}>▼</span>
        <span className="comments-count">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </span>
      </button>

      {/* Comment Section */}
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

      {/* Only show edit and delete if the logged-in user is the author */}
      {user && post.author.uid === user.uid && (
        <div className="post-actions post-owner-actions">
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}

      {/* Show edit form when isEditing is true */}
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
          <input
            type="file"
            onChange={handleFileChange}
          />
          <div className="edit-actions">
            <button type="submit">Update Post</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Post;