import React from 'react';
import { Link } from 'react-router-dom';
import PostList from './PostList';
import '../styles/Home.css'
const Home = () => {
  return (
    <div className="home">
      <div className="hero">
        <h2>Welcome to the Blog Website</h2>
        <p>Share your thoughts and experiences with the world.</p>
        <div className="hero-buttons">
          <Link to="/posts" className="btn-secondary">Browse Posts</Link>
          <Link to="/new-post" className="btn-secondary">Create a Post</Link>
        </div>
      </div>
      
      <div className="featured-posts">
        <h3>Recent Posts</h3>
        <PostList limit={3} />
      </div>
    </div>
  );
};

export default Home;