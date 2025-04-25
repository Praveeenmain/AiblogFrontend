import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { API_URL } from '../App';
import Post from './Post';
import "../styles/Dashboard.css";

const Dashboard = ({ auth }) => {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    console.log("Dashboard mounted");

    // Check if `auth` is available
    if (!auth) {
      setAuthError("Authentication object is missing");
      setLoading(false);
      return;
    }

    // Firebase Auth state change listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser);

      if (currentUser) {
        setUser(currentUser);
        try {
          const idToken = await currentUser.getIdToken();
          localStorage.setItem('authToken', idToken);
          setToken(idToken);
          fetchUserPosts(idToken);  // Fetch posts if user is authenticated
        } catch (err) {
          console.error("Failed to get ID token:", err);
          setError("Authentication error: " + err.message);
          setLoading(false);
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        setLoading(false);
      }
    }, (err) => {
      console.error("Auth state change error:", err);
      setError("Authentication observer error: " + err.message);
      setLoading(false);
    });

    // Cleanup the listener on component unmount
    return () => {
      unsubscribe();
    };
  }, [auth,token]);

  // Fetch posts for the authenticated user
  const fetchUserPosts = async (idToken) => {
    try {
      console.log("Fetching user posts...");
      const response = await fetch(`${API_URL}/user/posts`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user posts (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log("Fetched user posts:", data);
      setUserPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Display loading screen if fetching data
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  // Display authentication error if no auth object
  if (authError) {
    return (
      <div className="error-container">
        <div className="error">
          <h3>Authentication Error</h3>
          <p>{authError}</p>
          <Link to="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  // Display other errors (e.g., network issues, API errors)
  if (error) {
    return (
      <div className="error-container">
        <div className="error">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If user is not logged in
  if (!user) {
    return (
      <div className="not-logged-in">
        <h3>Not Logged In</h3>
        <p>Please log in to view your dashboard.</p>
        <Link to="/login" className="btn-primary">Log In</Link>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <Link to="/new-post" className="btn-primary">Create New Post</Link>
      </div>

      <div className="user-profile">
        <h3>Your Profile</h3>
        <div className="profile-details">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>User ID:</strong> {user?.uid}</p>
        </div>
      </div>

      <div className="user-posts">
        <h3>Your Posts</h3>
        {userPosts.length === 0 ? (
          <div className="no-posts">
            <p>You haven't created any posts yet.</p>
            <Link to="/new-post" className="btn-secondary">Create Your First Post</Link>
          </div>
        ) : (
          <div className="posts-grid">
            {userPosts.map(post => (
              <Post key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
