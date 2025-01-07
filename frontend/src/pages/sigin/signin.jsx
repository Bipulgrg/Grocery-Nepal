import React from 'react';
import './signin.css';

const SignIn = () => {
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

        <form className="auth-form">
          <input type="text" placeholder="Phone Number" />
          <input type="email" placeholder="Email Address" />
          <input type="password" placeholder="Password" />

          <button type="submit" className="auth-submit-btn">Signin</button>
        </form>

        <p className="auth-footer">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
