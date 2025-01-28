import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Register
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

export const login = async (formData) => {
  const response = await axios.post(`${API_URL}/login`, formData);
  return response.data;
};