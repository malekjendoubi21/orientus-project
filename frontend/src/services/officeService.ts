import axios from 'axios';
import api from './api';

/**
 * Interface for an Office location
 */
export interface Office {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface for creating/updating an Office
 */
export interface OfficeRequest {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  latitude: number;
  longitude: number;
}

/**
 * Interface for Contact form submission
 */
export interface ContactMessageRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Interface for a Contact Message (admin view)
 */
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

/**
 * Service for office and contact operations
 */
export const officeService = {
  // ========================
  // PUBLIC ENDPOINTS
  // ========================

  /**
   * Get all offices (public)
   */
  getAllOffices: async (): Promise<Office[]> => {
    try {
      const response = await api.get<Office[]>('/contact/offices');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch offices');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching offices');
    }
  },

  /**
   * Submit contact form (public)
   */
  submitContactForm: async (data: ContactMessageRequest): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/contact/send', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to send message');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while sending message');
    }
  },

  // ========================
  // ADMIN ENDPOINTS
  // ========================

  /**
   * Create a new office (admin only)
   */
  createOffice: async (data: OfficeRequest): Promise<Office> => {
    try {
      const response = await api.post<Office>('/contact/admin/offices', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to create office');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while creating office');
    }
  },

  /**
   * Update an existing office (admin only)
   */
  updateOffice: async (id: number, data: OfficeRequest): Promise<Office> => {
    try {
      const response = await api.put<Office>(`/contact/admin/offices/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to update office');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while updating office');
    }
  },

  /**
   * Delete an office (admin only)
   */
  deleteOffice: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>(`/contact/admin/offices/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to delete office');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while deleting office');
    }
  },

  /**
   * Get all contact messages (admin only)
   */
  getAllMessages: async (): Promise<ContactMessage[]> => {
    try {
      const response = await api.get<ContactMessage[]>('/contact/admin/messages');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch messages');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching messages');
    }
  },

  /**
   * Mark a message as read (admin only)
   */
  markMessageAsRead: async (id: number): Promise<ContactMessage> => {
    try {
      const response = await api.put<ContactMessage>(`/contact/admin/messages/${id}/read`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to update message');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while updating message');
    }
  },

  /**
   * Delete a contact message (admin only)
   */
  deleteMessage: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>(`/contact/admin/messages/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to delete message');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while deleting message');
    }
  },

  /**
   * Get new message count (admin only)
   */
  getNewMessageCount: async (): Promise<number> => {
    try {
      const response = await api.get<{ count: number }>('/contact/admin/messages/count');
      return response.data.count;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch count');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching count');
    }
  },
};

export default officeService;
