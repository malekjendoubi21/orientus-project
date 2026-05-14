import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Endpoints publics qui ne nécessitent PAS de token
const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify',
  '/auth/resend-code',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/test',
];

// Intercepteur requête : ajouter le JWT sauf pour les endpoints publics
api.interceptors.request.use((config) => {
  const isPublic = PUBLIC_AUTH_PATHS.some((path) => config.url === path);
  if (!isPublic) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
