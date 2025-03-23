import React, { useState } from 'react';
import './Admin.css';

const Admin = () => {
  const [formData, setFormData] = useState({
    name: '',
    difficulty: 'Easy',
    time: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setImage(file);
      setError('');
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', image);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('time', formData.time);

      const response = await fetch('http://localhost:5000/api/recipes', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add recipe');
      }

      setMessage('Recipe added successfully!');
      setFormData({
        name: '',
        difficulty: 'Easy',
        time: '',
      });
      setImage(null);
      setPreview(null);
    } catch (err) {
      setError(err.message || 'An error occurred while adding the recipe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-container">
      <h1>Add New Recipe</h1>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="name">Recipe Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="difficulty">Difficulty:</label>
          <select
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            required
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="time">Preparation Time:</label>
          <input
            type="text"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            placeholder="e.g., 30 min"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Recipe Image:</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding Recipe...' : 'Add Recipe'}
        </button>
      </form>
    </div>
  );
};

export default Admin; 