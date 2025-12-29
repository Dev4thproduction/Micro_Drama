import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token & Guest ID
api.interceptors.request.use(
  (config) => {
    // Handle Auth Token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle Guest ID
    if (typeof window !== 'undefined') {
      let guestId = localStorage.getItem('guestId');
      if (!guestId) {
        guestId = crypto.randomUUID(); // Use native crypto UUID
        localStorage.setItem('guestId', guestId);
      }
      if (config.headers) {
        config.headers['X-Guest-ID'] = guestId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global Errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired or invalid, clear storage and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Optional: Redirect logic can go here or be handled by AuthContext
      }
    }
    return Promise.reject(error);
  }
);

export default api;