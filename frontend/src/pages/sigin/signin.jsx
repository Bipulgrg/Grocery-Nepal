import React, { useState } from 'react';
import { login } from '../../api/auth';
import './signin.css';

const SignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await login(formData);
      alert(response.message);
      localStorage.setItem('token', response.token);
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Credentials');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Sign In</h2>
        <p className="auth-subtitle">Enter your details</p>

        <button className="google-btn">
          <div className="google-icon">
            <img src="/google.png" alt="Google Icon"/>
          </div>
          Continue with Google
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        {error && <p className="error-message">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <button type="submit" className="auth-submit-btn">Sign In</button>
        </form>

        <p className="auth-footer">
          <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
        </p>

        <p className="auth-footer">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;