import React, { useState } from 'react';
import { register } from '../../api/auth';
import './signup.css';

const SignUp = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const validateForm = () => {
    const { name, phone, email, password, confirmPassword } = formData;
  
    // Name validation
    const nameRegex = /^[a-zA-Z\s]{3,50}$/;
    if (!name.trim()) {
      return "Name is required.";
    }
    if (!nameRegex.test(name)) {
      return "Name should contain only letters and spaces, and be between 3-50 characters long.";
    }
  
    if (!/^\d{10}$/.test(phone)) {
      return "Phone number must be exactly 10 digits.";
    }
  
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
  
    const passwordRegex = /^(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      return "Password must be at least 6 characters long and contain at least one number.";
    }
  
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
  
    return null;
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await register(formData);
      setSuccess(response.message);
      setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create an Account</h2>
        <p className="auth-subtitle">Join us today and get started</p>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="name" 
            placeholder="Username" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="text" 
            name="phone" 
            placeholder="Phone Number" 
            value={formData.phone} 
            onChange={handleChange} 
            required
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Email Address" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="password" 
            name="confirmPassword" 
            placeholder="Confirm Password" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            required 
          />

          <button type="submit" className="auth-submit-btn">Create Account</button>
        </form>

        <p className="auth-footer">
          Already have an account? <a href="/signin">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
