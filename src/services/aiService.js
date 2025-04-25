// src/services/aiService.js
export const analyzePostSentiment = async (text) => {
    try {
      const response = await fetch('/api/analyze/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      return await response.json();
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  };
  
  export const summarizeText = async (text) => {
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      return await response.json();
    } catch (error) {
      console.error('Error summarizing text:', error);
      throw error;
    }
  };
  
  export const generateText = async (prompt) => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      return await response.json();
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  };
  
  export const analyzePost = async (postId) => {
    try {
      const response = await fetch(`/api/analyze/post/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      console.error('Error analyzing post:', error);
      throw error;
    }
  };
  
  export const suggestTags = async (text) => {
    try {
      const response = await fetch('/api/suggest-tags', {
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