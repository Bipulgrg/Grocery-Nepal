import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      alert(response.data.message);
      localStorage.setItem("resetEmail", email);
      navigate("/reset-password");
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="forgotpassword-container">
      <div className="forgotpassword-card">
        <h2 className="forgotpassword-title">Forgot Password</h2>
        <p className="forgotpassword-subtitle">Enter your email to reset password</p>

        {message && <p className="error-message">{message}</p>}

        <form className="forgotpassword-form" onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Enter your email" 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <button type="submit" className="forgotpassword-submit-btn">Send Code</button>
        </form>

        <p className="forgotpassword-footer">
          Remember your password? <a href="/signin">Sign in</a>
        </p>
      </div>
    </div>
  );
};
export default ForgotPassword;