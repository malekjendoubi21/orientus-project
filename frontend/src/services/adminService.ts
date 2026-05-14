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
 * Interface pour un Student
 */
export interface Student {
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
   * ownerEmail n'est plus passé en paramètre — le backend l'extrait du JWT
   */
  getAdminList: async (): Promise<Admin[]> => {
    try {
      const response = await api.get<Admin[]>('/admin/list');
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
   * ownerEmail n'est plus passé en paramètre — le backend l'extrait du JWT
   */
  createAdmin: async (adminData: CreateAdminRequest): Promise<Admin> => {
    try {
      const response = await api.post<Admin>('/admin/create', adminData);
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
   * ownerEmail n'est plus passé en paramètre — le backend l'extrait du JWT
   */
  deleteAdmin: async (adminId: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>(`/admin/${adminId}`);
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
   * 👤 Récupérer le profil de l'utilisateur connecté
   * L'email n'est plus passé en paramètre — le backend l'extrait du JWT
   */
  getAdminProfile: async (): Promise<AdminProfileResponse> => {
    try {
      const response = await api.get<AdminProfileResponse>('/users/profile');
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
   * 🏢 Créer un compte agence partenaire (OWNER only)
   */
  createAgencyPartner: async (agencyData: CreateAdminRequest): Promise<Admin> => {
    try {
      const response = await api.post<Admin>('/auth/agency/create', agencyData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to create agency partner');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while creating agency partner');
    }
  },

  /**
   * 🏢 Récupérer la liste des agences partenaires (OWNER only)
   * ownerEmail n'est plus passé en paramètre — le backend l'extrait du JWT
   */
  getAgencyList: async (): Promise<Admin[]> => {
    try {
      const response = await api.get<Admin[]>('/admin/agencies');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch agency list');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching agency list');
    }
  },

  /**
   * 🗑️ Supprimer une agence partenaire (OWNER only)
   * ownerEmail n'est plus passé en paramètre — le backend l'extrait du JWT
   */
  deleteAgency: async (agencyId: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>(`/admin/agencies/${agencyId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to delete agency partner');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while deleting agency partner');
    }
  },

  /**
   * 🎓 Récupérer la liste des étudiants (ADMIN/OWNER)
   * @returns Promise<Student[]>
   */
  getStudentList: async (): Promise<Student[]> => {
    try {
      const response = await api.get<Student[]>('/admin/students');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch student list');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching student list');
    }
  },

  /**
   * 🔢 Récupérer le nombre total d'étudiants (ADMIN/OWNER)
   * @returns Promise<number>
   */
  getStudentCount: async (): Promise<number> => {
    try {
      const response = await api.get<{ count: number }>('/admin/students/count');
      return response.data.count;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch student count');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching student count');
    }
  },
};

export default adminService;

