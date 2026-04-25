import axios from 'axios';
import api from './api';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';
import type { RegisterRequest, AuthResponse, User } from '../models/User';

/**
 * Service d'authentification pour consommer l'API Spring Boot
 */
export const authService = {
  /**
   * 🔑 Connexion d'un utilisateur
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe
   * @returns Promise<AuthResponse>
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      // ✅ Sauvegarder le token et les infos utilisateur
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify({
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
        }));
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Login failed');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred during login');
    }
  },

  /**
   * 📝 Inscription d'un nouvel étudiant
   * @param registerData - Données d'inscription
   * @returns Promise<AuthResponse>
   */
  register: async (registerData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', registerData);
      
      // ✅ Sauvegarder le token et les infos utilisateur si l'inscription retourne un token
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify({
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
        }));
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Registration failed');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred during registration');
    }
  },

  /**
   * 🚪 Déconnexion de l'utilisateur
   */
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * 🎫 Récupérer le token JWT stocké
   * @returns string | null
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * 👤 Récupérer les informations de l'utilisateur connecté
   * @returns User | null
   */
  getCurrentUser: (): Partial<User> | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * ✅ Vérifier si l'utilisateur est connecté
   * @returns boolean
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * 📧 Vérifier l'email avec le code OTP
   */
  verifyEmail: async (email: string, code: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/verify', { email, code });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Verification failed');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred during verification');
    }
  },

  /**
   * 🔄 Renvoyer le code de vérification
   */
  resendCode: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/resend-code', { email });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to resend code');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while resending code');
    }
  },

  /**
   * 🔒 Demander la réinitialisation du mot de passe
   * @param email - Email de l'utilisateur
   * @returns Promise<{ message: string }>
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to send reset code');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while requesting password reset');
    }
  },

  /**
   * 🔑 Réinitialiser le mot de passe avec le code de vérification
   * @param email - Email de l'utilisateur
   * @param code - Code de vérification à 6 chiffres
   * @param newPassword - Nouveau mot de passe
   * @returns Promise<{ message: string }>
   */
  resetPassword: async (email: string, code: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/reset-password', { email, code, newPassword });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to reset password');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while resetting password');
    }
  },
};

export default authService;

