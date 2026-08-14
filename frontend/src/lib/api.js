import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Response interceptor — unwrap the { success, data, message } envelope
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default api;
