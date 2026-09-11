import { apiRequest, isApiConfigured } from './api';
import { parentExamResults, parentHallTickets } from './examsMock';

export const examsApi = {
  async getHallTickets(session) {
    if (!isApiConfigured) return parentHallTickets;
    const payload = await apiRequest('/exams/hall-tickets', { token: session?.token });
    return payload?.hallTickets || payload?.data || [];
  },

  async getResults(session) {
    if (!isApiConfigured) return parentExamResults;
    const payload = await apiRequest('/exams/results', { token: session?.token });
    return payload?.results || payload?.data || [];
  },

  async downloadHallTicket() {
    return { available: false };
  },
};
