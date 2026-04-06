import axios from 'axios';
import api from './api';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

/**
 * Interface pour la mise à jour du profil
 */
export interface UpdateProfileRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  nationality?: string;
  password?: string;
}

/**
 * Interface pour la réponse du profil
 */
export interface ProfileResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  nationality?: string;
  role: string;
  createdAt?: string;
  message?: string;
}

/**
 * Service utilisateur pour gérer le profil
 */
export const userService = {
  /**
   * 👤 Récupérer le profil de l'utilisateur
   * @param email - Email de l'utilisateur
   * @returns Promise<ProfileResponse>
   */
  getProfile: async (email: string): Promise<ProfileResponse> => {
    try {
      // GET request without Content-Type header (no body)
      const response = await api.get<ProfileResponse>(`/users/profile?email=${encodeURIComponent(email)}`, {
        headers: {
          'Content-Type': undefined,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch profile');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching profile');
    }
  },

  /**
   * ✏️ Mettre à jour le profil de l'utilisateur
   * @param email - Email actuel de l'utilisateur
   * @param profileData - Nouvelles données du profil
   * @returns Promise<ProfileResponse>
   */
  updateProfile: async (email: string, profileData: UpdateProfileRequest): Promise<ProfileResponse> => {
    try {
      // Build request object without password first
      const requestBody: Partial<UpdateProfileRequest> = {
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        nationality: profileData.nationality,
      };

      // Only include password if it's not empty/whitespace
      if (profileData.password && profileData.password.trim()) {
        requestBody.password = profileData.password;
      }

      const response = await api.put<ProfileResponse>('/users/profile', requestBody, {
        params: { email },
      });

      // Mettre à jour le localStorage avec les nouvelles infos
      if (response.data) {
        const updatedUser = {
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to update profile');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while updating profile');
    }
  },

  /**
   * 🗑️ Supprimer le compte de l'utilisateur
   * @param email - Email de l'utilisateur
   * @returns Promise<{ message: string }>
   */
  deleteAccount: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>(`/users/profile?email=${encodeURIComponent(email)}`, {
        headers: {
          'Content-Type': undefined,
        },
      });

      // Nettoyer le localStorage après suppression
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to delete account');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while deleting account');
    }
  },
};

export default userService;
