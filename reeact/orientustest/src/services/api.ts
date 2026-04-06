import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur requête : ajouter le JWT (sauf sur les endpoints d'auth publics)
api.interceptors.request.use((config) => {
  if (config.url?.startsWith('/auth/')) {
    return config;
  }
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur réponse : gérer les 401 (token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('orientus_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
