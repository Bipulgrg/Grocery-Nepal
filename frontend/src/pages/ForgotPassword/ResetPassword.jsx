import { useState } from 'react';
import './ResetPassword.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post("http://localhost:5000/api/auth/reset-password", {
        email,
        code,
        password,
      });

      alert(response.data.message);
      localStorage.removeItem("resetEmail");

      navigate("/signin");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="reset-password-container"> 
      <h2>Reset Password</h2>
      {message && <p>{message}</p>}
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
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;