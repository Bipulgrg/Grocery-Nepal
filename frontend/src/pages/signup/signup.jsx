import React from 'react';
import './signup.css';

const SignUp = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create an Account</h2>
        <p className="auth-subtitle">Join us today and get started</p>

        <form className="auth-form">
          <input type="text" placeholder="Full Name" />
          <input type="text" placeholder="Phone Number" />
          <input type="email" placeholder="Email Address" />
          <input type="password" placeholder="Password" />
          <input type="password" placeholder="Confirm Password" />

          <button type="submit" className="auth-submit-btn">Create Account</button>
        </form>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <button className="google-btn">
            <div className="google-icon"> 
            <img src="/google.png" alt="Google Icon"/>
            </div>
             Continue with Google
        </button>

        <p className="auth-footer">
          Already have an account? <a href="/signin">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
