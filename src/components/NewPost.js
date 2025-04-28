import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../App';
import '../styles/NewPost.css';

// Import the AI service function
const suggestTags = async (text) => {
  try {
    const response = await fetch(`${API_URL}/api/suggest-tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return await response.json();
  } catch (error) {
    console.error('Error suggesting tags:', error);
    throw error;
  }
};

const NewPost = ({ auth }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  // Add new states for AI features
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getToken = async () => {
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        setToken(idToken);
      }
    };
    
    getToken();
  }, [auth]);

  // New function to handle tag suggestions
  const handleGetTagSuggestions = async () => {
    if (content.length < 50) {
      setError('Please enter at least 50 characters to get tag suggestions');
      return;
    }
    
    setIsLoadingTags(true);
    setError(null);
    try {
      const result = await suggestTags(content);
      setSuggestedTags(result.suggestedTags || []);
    } catch (error) {
      setError('Failed to get tag suggestions');
      console.error('Failed to get tag suggestions', error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  // Function to handle tag selection
  const handleTagSelection = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }
    
    if (!token) {
      setError('Authentication required');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (file) formData.append('file', file);
      
      // Add selected tags to form data
      if (selectedTags.length > 0) {
        formData.append('tags', JSON.stringify(selectedTags));
      }
      
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to create post');
      
      // Redirect to posts page after successful creation
      navigate('/posts');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="new-post">
      <h2>Create a New Post</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          
          {/* AI Tag Suggestion Feature */}
          {content.length >= 50 && (
            <button 
              type="button"
              className="btn-secondary"
              onClick={handleGetTagSuggestions}
              disabled={isLoadingTags}
            >
              {isLoadingTags ? 'Getting suggestions...' : 'Suggest Tags'}
            </button>
          )}
        </div>
        
        {/* Display Suggested Tags */}
        {suggestedTags.length > 0 && (
          <div className="suggested-tags">
            <h4>Suggested Tags:</h4>
            <div className="tags-container">
              {suggestedTags.map((tag, index) => (
                <span 
                  key={index} 
                  className={`tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => handleTagSelection(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="tag-help">Click on tags to select/deselect them</p>
          </div>
        )}
        
        {/* Display Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="form-group">
            <label>Selected Tags:</label>
            <div className="selected-tags">
              {selectedTags.map((tag, index) => (
                <span key={index} className="selected-tag">
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleTagSelection(tag)}
                    className="remove-tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="file">Media (Optional)</label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={submitting}
        >
          {submitting ? 'Posting...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default NewPost;