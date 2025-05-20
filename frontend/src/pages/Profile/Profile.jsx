import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
        setFormData(prevData => ({
          ...prevData,
          name: userData.name || '',
          phone: userData.phone || ''
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setNameError('');
    setPhoneError('');

    let isValid = true;
    if (formData.name.trim().length < 3) {
      setNameError('Name must be at least 3 characters long');
      isValid = false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setPhoneError('Phone number must be exactly 10 digits');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setFormData(prev => ({
        ...prev,
        name: updatedUser.name,
        phone: updatedUser.phone
      }));
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setPasswordError('');
    setSuccessMessage('');

    // Check if new password is same as current password
    if (formData.currentPassword === formData.newPassword) {
      setPasswordError('New password cannot be the same as your current password');
      return;
    }

    // Strong password validation
    const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!strongPassword.test(formData.newPassword)) {
      setPasswordError('Password must contain letters and numbers, minimum 6 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setPasswordError(data.message || 'Failed to change password');
        return;
      }

      setSuccessMessage('Password changed successfully!');
      setFormData(prevData => ({
        ...prevData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setPasswordError('An error occurred while changing password');
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (error && !nameError && !phoneError) {
    return <div className="profile-error">Error: {error}</div>;
  }

  return (
    <div className="profile-container">
      <h1>Profile Settings</h1>
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {error && !nameError && !phoneError && (
        <div className="error-message">{error}</div>
      )}

      <div className="profile-section">
        <h2>Personal Information</h2>
        <form onSubmit={handleProfileUpdate}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            {nameError && (
              <div className="form-error">{nameError}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="disabled-input"
            />
            <small>Email cannot be changed</small>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            {phoneError && (
              <div className="form-error">{phoneError}</div>
            )}
          </div>

          <button type="submit" className="update-button">
            Update Profile
          </button>
        </form>
      </div>

      <div className="profile-section">
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              required
            />
            {passwordError && (
              <div className="form-error">{passwordError}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="update-button">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
