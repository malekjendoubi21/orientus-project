import api from './api';
import type { StudentProfile, RecommendationResponse } from '../models/Recommendation';
import type { Program } from '../models/Program';

export const recommendationService = {
  getRecommendations: async (profile: StudentProfile): Promise<RecommendationResponse> => {
    const response = await api.post<RecommendationResponse>('/recommendations', profile);
    return response.data;
  },

  checkHealth: async (): Promise<{ mlAvailable: boolean }> => {
    try {
      const response = await api.get('/recommendations/health');
      return response.data;
    } catch {
      return { mlAvailable: false };
    }
  },

  getProgramDetails: async (programId: number): Promise<Program> => {
    const response = await api.get<Program>(`/programs/${programId}`);
    return response.data;
  },
};
