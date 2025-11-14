import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add mock user ID
api.interceptors.request.use(
  (config) => {
    // Get mock user ID from localStorage
    const mockUserId = localStorage.getItem('mockUserId');
    if (mockUserId) {
      config.headers['x-mock-user-id'] = mockUserId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid user ID
      localStorage.removeItem('mockUserId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
