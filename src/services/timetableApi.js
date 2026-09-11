import { apiRequest, isApiConfigured } from './api';
import { parentTimetable } from './timetableMock';

export const timetableApi = {
  async getWeeklySchedule(session) {
    if (!isApiConfigured) return parentTimetable;
    const payload = await apiRequest('/timetable', { token: session?.token });
    return payload?.timetable || payload?.data || {};
  },
};
