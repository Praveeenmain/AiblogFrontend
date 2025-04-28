// src/components/TextGenerator.js
import React, { useState } from 'react';
import { API_URL } from '../App';
import '../styles/Textgeneration.css';

const TextGenerator = ({ token }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateText = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !token) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate text (${response.status})`);
      }
      
      const result = await response.json();
      setGeneratedText(result.generatedText || result.text);
    } catch (err) {
      console.error('Text generation error:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedText);
    // You could add a toast notification here
  };

  const handleClear = () => {
    setPrompt('');
    setGeneratedText('');
    setError(null);
  };

  return (
    <div className="text-generator-container">
      <div className="text-generator-header">
        <h2>AI Content Generator</h2>
        <p>Create blog content, ideas, or outlines using AI</p>
      </div>
      
      <form className="prompt-form" onSubmit={handleGenerateText}>
        <div className="form-group">
          <label htmlFor="prompt">What would you like to write about?</label>
          <textarea
            id="prompt"
            className="form-control text-area-control"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a topic or description for your content..."
            rows={3}
          />
        </div>
        
        <div className="btn-container">
          <button 
            type="submit" 
            className="btn-generate"
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Content'}
          </button>
          
          <button 
            type="button" 
            className="btn-clear"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </form>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {isGenerating && (
        <div className="loading-spinner"></div>
      )}
      
      {generatedText && !isGenerating && (
        <div className="result-container">
          <div className="result-header">
            <h3 className="result-title">Generated Content</h3>
            <div className="result-actions">
              <button className="btn-action btn-copy" onClick={handleCopyText}>
                Copy
              </button>
              <button className="btn-action btn-edit" onClick={() => setGeneratedText('')}>
                Clear
              </button>
            </div>
          </div>
          <div className="generated-text">
            {generatedText}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextGenerator;