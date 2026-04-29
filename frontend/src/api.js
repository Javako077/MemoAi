import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

const api = axios.create({
  baseURL: API_URL,
});

export const registerUser = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const sendMessage = async (userId, message) => {
  const response = await axios.post(`${API_URL}/chat`, { userId, message });
  return response.data;
};

export const getChatHistory = async (userId) => {
  const response = await axios.get(`${API_URL}/chat/${userId}`);
  return response.data;
};

export const getUserStats = async (userId) => {
  const response = await axios.get(`${API_URL}/stats/${userId}`);
  return response.data;
};

export const generateQuiz = async (userId) => {
  const response = await axios.post(`${API_URL}/generate-quiz`, { userId });
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await axios.post(`${API_URL}/auth/reset-password`, { email, otp, newPassword });
  return response.data;
};
