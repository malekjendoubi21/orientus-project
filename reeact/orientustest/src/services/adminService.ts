import axios from 'axios';
import api from './api';

/**
 * Interface pour un Admin
 */
export interface Admin {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  nationality?: string;
  role: string;
  createdAt?: string;
}

/**
 * Interface pour créer un Admin
 */
export interface CreateAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  nationality?: string;
}

/**
 * Interface pour la réponse du profil
 */
export interface AdminProfileResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  nationality?: string;
  role: string;
  createdAt?: string;
}

/**
 * Service pour les opérations Admin
 */
export const adminService = {
  /**
   * 📋 Récupérer la liste des admins (OWNER only)
   * @param ownerEmail - Email du OWNER
   * @returns Promise<Admin[]>
   */
  getAdminList: async (ownerEmail: string): Promise<Admin[]> => {
    try {
      const response = await api.get<Admin[]>('/admin/list', {
        params: { ownerEmail },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch admin list');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching admin list');
    }
  },

  /**
   * ➕ Créer un nouvel admin (OWNER only)
   * @param ownerEmail - Email du OWNER
   * @param adminData - Données du nouvel admin
   * @returns Promise<Admin>
   */
  createAdmin: async (ownerEmail: string, adminData: CreateAdminRequest): Promise<Admin> => {
    try {
      const response = await api.post<Admin>('/admin/create', adminData, {
        params: { ownerEmail },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to create admin');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while creating admin');
    }
  },

  /**
   * 🗑️ Supprimer un admin (OWNER only)
   * @param adminId - ID de l'admin à supprimer
   * @param ownerEmail - Email du OWNER
   * @returns Promise<{ message: string }>
   */
  deleteAdmin: async (adminId: number, ownerEmail: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>(`/admin/${adminId}`, {
        params: { ownerEmail },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to delete admin');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while deleting admin');
    }
  },

  /**
   * 👤 Récupérer le profil d'un admin
   * @param email - Email de l'admin
   * @returns Promise<AdminProfileResponse>
   */
  getAdminProfile: async (email: string): Promise<AdminProfileResponse> => {
    try {
      const response = await api.get<AdminProfileResponse>(`/users/profile?email=${encodeURIComponent(email)}`, {
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
};

export default adminService;
