import { apiRequest, isApiConfigured } from './api';
import { parentAttendanceSample, parentAttendanceSampleSummary } from './attendanceMock';

const emptySummary = {
  totalEnrolled: 0,
  markedEntries: 0,
  presentToday: 0,
  absentCount: 0,
  lateArrivals: 0,
  canMarkAttendance: false,
};

const recordsFrom = (payload) => payload?.records || payload?.data || [];

export const attendanceApi = {
  async getSummary(date, session) {
    if (!isApiConfigured) return parentAttendanceSampleSummary;
    const payload = await apiRequest('/attendance/summary', {
      token: session?.token,
      query: { date },
    });
    return { ...emptySummary, ...(payload?.summary || payload || {}) };
  },

  async getByDate(date, search, session) {
    if (!isApiConfigured) return parentAttendanceSample;
    const payload = await apiRequest('/attendance/daily', {
      token: session?.token,
      query: { date, search },
    });
    return recordsFrom(payload);
  },

  async getMonthly(month, session) {
    if (!isApiConfigured) return parentAttendanceSample;
    const payload = await apiRequest('/attendance/monthly', {
      token: session?.token,
      query: { month },
    });
    return recordsFrom(payload);
  },

  async getHistory(params, session) {
    if (!isApiConfigured) return { records: [], summary: emptySummary };
    const payload = await apiRequest('/attendance/history', {
      token: session?.token,
      query: params,
    });
    return {
      records: recordsFrom(payload),
      summary: payload?.summary || emptySummary,
    };
  },

  async getBiometric(params, session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/attendance/biometric', {
      token: session?.token,
      query: params,
    });
    return recordsFrom(payload);
  },

  async runCutoff(date, session) {
    if (!isApiConfigured) return { processed: 0 };
    return apiRequest('/attendance/cutoff', {
      method: 'POST',
      token: session?.token,
      body: { date },
    });
  },

  async submit(records, session) {
    if (!isApiConfigured) return { submitted: 0 };
    return apiRequest('/attendance/submit', {
      method: 'POST',
      token: session?.token,
      body: { records },
    });
  },

  async export(params, session) {
    if (!isApiConfigured) return null;
    return apiRequest('/attendance/export', {
      token: session?.token,
      query: params,
    });
  },
};
