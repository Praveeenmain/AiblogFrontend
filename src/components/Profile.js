import React, { useEffect, useState } from 'react';
import { signOut, onAuthStateChanged, getIdToken } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../App';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = ({ auth }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setFirebaseUser(currentUser);
        await fetchUserProfile(currentUser);
      } else {
        setFirebaseUser(null);
        setFormData({ name: '', location: '' });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchUserProfile = async (currentUser) => {
    try {
      const token = await getIdToken(currentUser);

      // Try to GET existing profile
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormData({ name: response.data.name, location: response.data.location });
    } catch (error) {
      // If profile not found, create a new one
      if (error.response && error.response.status === 404) {
        try {
          const token = await getIdToken(currentUser);

          await axios.post(`${API_URL}/user/profile`, {
            name: currentUser.displayName || 'New User',
            location: 'Unknown'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Fetch the newly created profile
          const response = await axios.get(`${API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setFormData({ name: response.data.name, location: response.data.location });
        } catch (postError) {
          console.error('Error creating profile:', postError);
        }
      } else {
        console.error('Error fetching user profile:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!firebaseUser) return;

    try {
      const token = await getIdToken(firebaseUser);

      await axios.post(`${API_URL}/user/profile`, {
        name: formData.name,
        location: formData.location
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMessage('Profile updated successfully! ✅');

      setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 sec
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return <p className="profile-loading">Loading...</p>;
  }

  if (!firebaseUser) {
    return <p className="profile-not-loggedin">User not logged in.</p>;
  }

  return (
    <div className="profile-container">
      <p className="profile-email"><strong>Email:</strong> {firebaseUser.email}</p>

      <form className="profile-form" onSubmit={handleUpdate}>
        <div className="profile-form-group">
          <label className="profile-label">Name:</label>
          <input
            className="profile-input"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-label">Location:</label>
          <input
            className="profile-input"
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="profile-update-btn">Update Profile</button>

        {successMessage && (
          <p className="profile-success-message">{successMessage}</p>
        )}
      </form>

      <button
        className="profile-logout-btn"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
