import { useState } from 'react';
import './ResetPassword.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setPasswordError('');

    // Strong password validation
    const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!strongPassword.test(password)) {
      setPasswordError('Password must contain letters and numbers, minimum 6 characters');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      // First check if the new password is the same as the previous password
      const checkResponse = await axios.post("http://localhost:5000/api/auth/check-previous-password", {
        email,
        password
      });

      if (checkResponse.data.isPreviousPassword) {
        setPasswordError('New password cannot be the same as your previous password');
        return;
      }

      // If not the same as previous password, proceed with reset
      const response = await axios.post("http://localhost:5000/api/auth/reset-password", {
        email,
        code,
        password,
      });

      alert(response.data.message);
      localStorage.removeItem("resetEmail");

      navigate("/signin");
    } catch (error) {
      if (error.response?.status === 400) {
        setPasswordError(error.response.data.message);
      } else {
        setMessage(error.response?.data?.message || "Error resetting password");
      }
    }
  };

  return (
    <div className="reset-password-container"> 
      <h2>Reset Password</h2>
      {message && <p className="error-message">{message}</p>}
      {passwordError && <p className="error-message">{passwordError}</p>}
      <form onSubmit={handleReset}>
        <input
          type="text"
          placeholder="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;