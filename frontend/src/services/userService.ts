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
  profilePicture?: string;
  createdAt?: string;
  message?: string;
}

/**
 * Service utilisateur pour gérer le profil
 */
export const userService = {
  /**
   * 👤 Récupérer le profil de l'utilisateur connecté
   * L'email n'est plus passé en paramètre — le backend l'extrait du JWT
   */
  getProfile: async (): Promise<ProfileResponse> => {
    try {
      const response = await api.get<ProfileResponse>('/users/profile');
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
   * ✏️ Mettre à jour le profil de l'utilisateur connecté
   * L'email courant n'est plus passé en paramètre URL — le backend l'extrait du JWT
   * @param profileData - Nouvelles données du profil (peut contenir un nouvel email dans le body)
   */
  updateProfile: async (profileData: UpdateProfileRequest): Promise<ProfileResponse> => {
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

      const response = await api.put<ProfileResponse>('/users/profile', requestBody);

      // Mettre à jour le localStorage avec les nouvelles infos
      if (response.data) {
        const updatedUser = {
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          profilePicture: response.data.profilePicture,
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
   * 🗑️ Supprimer le compte de l'utilisateur connecté
   * L'email n'est plus passé en paramètre — le backend l'extrait du JWT
   */
  deleteAccount: async (): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>('/users/profile');

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

  /**
   * 🖼️ Uploader un avatar
   * L'email n'est plus passé en paramètre — le backend l'extrait du JWT
   */
  uploadAvatar: async (file: File): Promise<{ message: string; profilePicture: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<{ message: string; profilePicture: string }>('/users/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update local storage
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        const user = JSON.parse(userStr);
        user.profilePicture = response.data.profilePicture;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw new Error('Failed to upload avatar');
    }
  },
};

export default userService;
