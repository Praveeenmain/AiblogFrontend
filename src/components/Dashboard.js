import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { API_URL } from '../App';
import Post from './Post';
import TextGenerator from '../components/TextGenerator';
import "../styles/Dashboard.css";

// Import AI service functions
const analyzePost = async (postId, token) => {
  try {
    const response = await fetch(`${API_URL}/api/analyze/post/${postId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error analyzing post:', error);
    throw error;
  }
};

const Dashboard = ({ auth }) => {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Display state for content sections
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'generator'

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const idToken = await currentUser.getIdToken();
          localStorage.setItem('authToken', idToken);
          setToken(idToken);
          fetchUserPosts(idToken);
        } catch (err) {
          console.error("Failed to get ID token:", err);
          setLoading(false);
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  const fetchUserPosts = async (idToken) => {
    try {
      const response = await fetch(`${API_URL}/user/posts`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user posts: ${errorText}`);
      }

      const data = await response.json();
      setUserPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePost = async (postId) => {
    if (!token) return;

    try {
      const result = await analyzePost(postId, token);
      console.log('Analysis result:', result);
    } catch (error) {
      console.error('Failed to analyze post', error);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="loading">Loading dashboard...</div></div>;
  }

  if (!user) {
    return (
      <div className="not-logged-in">
        <h3>Not Logged In</h3>
        <p>Please log in to view your dashboard.</p>
        <Link to="/login" className="btn-primary">Log In</Link>
      </div>
    );
  }

  const renderPostWithAnalysis = (post) => (
    <div key={post._id} className="post-card">
      <Post post={post} />
      {/* Add button to trigger analysis if required */}
      <button onClick={() => handleAnalyzePost(post._id)}>Analyze</button>
    </div>
  );

  return (
    <div className="dashboard">
    
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          My Posts
        </button>
        <button 
          className={`tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
        >
          Content Generator
        </button>
      </div>

      <div className={`tab-content ${activeTab === 'posts' ? 'active' : ''}`}>
        {activeTab === 'posts' && (
          <div className="user-posts">
            <h3>Your Posts</h3>
            {userPosts.length === 0 ? (
              <div className="no-posts">
                <p>You haven't created any posts yet.</p>
                <Link to="/new-post" className="btn-secondary">Create Your First Post</Link>
              </div>
            ) : (
              <div className="posts-grid">
                {userPosts.map(post => renderPostWithAnalysis(post))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`tab-content ${activeTab === 'generator' ? 'active' : ''}`}>
        {activeTab === 'generator' && (
          <div className="content-generator-section">
            <TextGenerator token={token} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
