import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const isPublicAuthRequest = ['/auth/login', '/auth/register'].includes(config.url);
  const isPublicDoctorRead = config.method?.toLowerCase() === 'get'
    && /^\/doctors(?:\/|$)/.test(config.url || '');
  const token = isPublicAuthRequest || isPublicDoctorRead ? null : localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
