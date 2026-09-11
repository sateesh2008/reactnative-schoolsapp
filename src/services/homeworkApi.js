import { apiRequest, isApiConfigured } from './api';
import { parentHomeworkRecords } from './homeworkMock';

export const homeworkApi = {
  async getAssignments(session) {
    if (!isApiConfigured) return parentHomeworkRecords;
    const payload = await apiRequest('/homework', { token: session?.token });
    return payload?.assignments || payload?.data || [];
  },

  async submitAssignment(payload) {
    void payload;
    return { available: false };
  },
};
