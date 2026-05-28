import axios from 'axios';

// Use relative path '/api' so requests go through the Vite dev proxy.
// This avoids CORS issues caused by calling http://localhost:5000 directly
// from the browser. The Vite proxy (vite.config.js) forwards /api → http://localhost:5000
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Log all responses for easier debugging
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status}:`, response.data);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
