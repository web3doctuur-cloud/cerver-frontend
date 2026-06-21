import axios from 'axios';
import { API_BASE_URL, endpoints } from '../config/api';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Show error toast for all errors except maybe 404s?
    const errorMsg = error.response?.data?.message || 
                     (Array.isArray(error.response?.data?.errors) 
                      ? error.response.data.errors.join(', ') 
                      : 'An error occurred');
    toast.error(errorMsg);
    return Promise.reject(error);
  }
);

export { api, endpoints };
