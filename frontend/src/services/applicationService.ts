import axios from 'axios';
import api from './api';
import type { Application, ApplicationRequest, ApplicationsResponse, ApplicationStats } from '../models/Application';
import type { ApplicationSource, ApplicationStatus, ApplicationStep } from '../models/Application';

// Normalize paginated response from Spring Boot (content/totalElements) or custom (applications/totalItems)
function normalizeApplicationsResponse(data: Record<string, unknown>): ApplicationsResponse {
  return {
    applications: (data.applications ?? data.content ?? []) as Application[],
    currentPage: (data.currentPage ?? data.number ?? 0) as number,
    totalItems: (data.totalItems ?? data.totalElements ?? 0) as number,
    totalPages: (data.totalPages ?? 0) as number,
  };
}

export const applicationService = {
  /**
   * Submit a new application
   * studentId n'est plus passé — le backend l'extrait du JWT
   */
  createApplication: async (
    programId: number,
    data: ApplicationRequest
  ): Promise<{ message: string; application: Application }> => {
    try {
      const response = await api.post('/applications', data, {
        params: { programId },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to submit application');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while submitting application');
    }
  },

  /**
   * Get all applications with pagination, optional status and source filters
   */
  getApplications: async (
    page: number = 0,
    size: number = 10,
    status?: ApplicationStatus,
    source?: ApplicationSource
  ): Promise<ApplicationsResponse> => {
    try {
      const params: Record<string, string | number> = { page, size };
      if (status) params.status = status;
      if (source) params.source = source;

      const response = await api.get('/applications', { params });
      return normalizeApplicationsResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch applications');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching applications');
    }
  },

  /**
   * Get applications for a specific student
   */
  getStudentApplications: async (studentId: number): Promise<ApplicationsResponse> => {
    try {
      const response = await api.get(`/applications/student/${studentId}`);
      return normalizeApplicationsResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch your applications');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching your applications');
    }
  },

  /**
   * Get a single application by ID
   */
  getApplicationById: async (id: number): Promise<Application> => {
    try {
      const response = await api.get<Application>(`/applications/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 404) {
            throw new Error('Application not found');
          }
          throw new Error(error.response.data.message || 'Failed to fetch application');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching application');
    }
  },

  /**
   * Update application status
   */
  updateApplicationStatus: async (
    id: number,
    status: ApplicationStatus
  ): Promise<{ message: string; application: Application }> => {
    try {
      const response = await api.put(`/applications/${id}/status`, null, {
        params: { status },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to update application status');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while updating application status');
    }
  },

  /**
   * Delete an application
   */
  deleteApplication: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/applications/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 404) {
            throw new Error('Application not found');
          }
          throw new Error(error.response.data.message || 'Failed to delete application');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while deleting application');
    }
  },

  /**
   * Update application step (timeline) — Admin only
   */
  updateApplicationStep: async (
    id: number,
    step: ApplicationStep
  ): Promise<{ message: string; application: Application }> => {
    try {
      const response = await api.put(`/applications/${id}/step`, null, {
        params: { step },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to update application step');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while updating application step');
    }
  },

  /**
   * Submit an application via agency
   */
  submitAgencyApplication: async (
    studentId: number,
    programId: number,
    agencyName: string,
    data: ApplicationRequest
  ): Promise<{ message: string; application: Application }> => {
    try {
      const response = await api.post('/agency/applications', data, {
        params: { studentId, programId, agencyName },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to submit agency application');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while submitting agency application');
    }
  },

  /**
   * Get all applications for an agency
   */
  getAgencyApplications: async (
    agencyName: string,
    page: number = 0,
    size: number = 10
  ): Promise<ApplicationsResponse> => {
    try {
      const response = await api.get('/agency/applications', {
        params: { agencyName, page, size },
      });
      return normalizeApplicationsResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch agency applications');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching agency applications');
    }
  },

  /**
   * Get application statistics
   */
  getStats: async (): Promise<ApplicationStats> => {
    try {
      const response = await api.get<ApplicationStats>('/applications/stats');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch statistics');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching statistics');
    }
  },
};

export default applicationService;
