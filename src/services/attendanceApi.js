import { apiRequest, isApiConfigured } from "./api";
import {
    attendanceMonthQuery,
    emptyAttendanceSummary,
    normalizeAttendancePayload,
} from "./attendanceNormalization";

const getMonthlyData = async (month, session, studentId) => {
  if (!isApiConfigured || !studentId) {
    return { records: [], summary: emptyAttendanceSummary };
  }

  const payload = await apiRequest(`/parents/child/${studentId}/attendance`, {
    token: session?.token,
    query: attendanceMonthQuery(month),
  });
  return normalizeAttendancePayload(payload);
};

export const attendanceApi = {
  async getSummary(date, session, studentId) {
    const dateValue = String(date || "");
    return (await getMonthlyData(dateValue.slice(0, 7), session, studentId))
      .summary;
  },

  async getByDate(date, search, session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest("/attendance/daily", {
      token: session?.token,
      query: { date, search },
    });
    return normalizeAttendancePayload(payload).records;
  },

  async getMonthly(month, session, studentId) {
    return (await getMonthlyData(month, session, studentId)).records;
  },

  async getMonthlyData(month, session, studentId) {
    return getMonthlyData(month, session, studentId);
  },

  async getHistory(params, session) {
    if (!isApiConfigured)
      return { records: [], summary: emptyAttendanceSummary };
    const payload = await apiRequest("/attendance/history", {
      token: session?.token,
      query: params,
    });
    return {
      records: normalizeAttendancePayload(payload).records,
      summary: normalizeAttendancePayload(payload).summary,
    };
  },

  async getBiometric(params, session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest("/attendance/biometric", {
      token: session?.token,
      query: params,
    });
    return normalizeAttendancePayload(payload).records;
  },

  async runCutoff(date, session) {
    if (!isApiConfigured) return { processed: 0 };
    return apiRequest("/attendance/cutoff", {
      method: "POST",
      token: session?.token,
      body: { date },
    });
  },

  async submit(records, session) {
    if (!isApiConfigured) return { submitted: 0 };
    return apiRequest("/attendance/submit", {
      method: "POST",
      token: session?.token,
      body: { records },
    });
  },

  async export(params, session) {
    if (!isApiConfigured) return null;
    return apiRequest("/attendance/export", {
      token: session?.token,
      query: params,
    });
  },
};
