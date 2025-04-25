import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { API_URL } from '../App';
import Post from './Post';

const PostList = ({ limit }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => { // Wrap fetchPosts with useCallback
    try {
      const url = limit ? `${API_URL}/posts?limit=${limit}` : `${API_URL}/posts`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]); // Make sure fetchPosts is recomputed when 'limit' changes

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); // Now fetchPosts is correctly included in the dependency array

  if (loading) return <div className="loading">Loading posts...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (posts.length === 0) return <div className="no-posts">No posts available</div>;

  return (
    <div className="posts">
      {posts.map(post => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default PostList;
