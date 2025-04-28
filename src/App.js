import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { auth } from './components/firebase';
// Components
import Header from './components/ Header';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import NewPost from './components/NewPost';
import PostList from './components/PostList';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile';
import './App.css';

// Firebase configuration


// API URL - update this to match your backend
export const API_URL = 'https://aiblogbackend-ia9h.onrender.com';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header auth={auth} />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login auth={auth} />} />
            <Route path="/register" element={<Register auth={auth} />} />
            <Route path="/dashboard" element={
              <ProtectedRoute  auth={auth} >
                <Dashboard auth={auth} />
              </ProtectedRoute>
            } />
              <Route path="/Profile" element={
              <ProtectedRoute  auth={auth} >
                <Profile auth={auth} />
              </ProtectedRoute>
            } />
            <Route path="/posts" element={<PostList />} />
            <Route path="/new-post" element={
              <ProtectedRoute auth={auth}>
                <NewPost auth={auth} />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;