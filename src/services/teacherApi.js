import { apiRequest, isApiConfigured } from './api';
import {
  teacherAttendanceMock,
  teacherDashboardMock,
  teacherDashboardData,
  teacherNotices,
  teacherProfile,
  teacherShortcuts,
} from './teacherMock';

export const teacherApi = {
  async getDashboard(session) {
    if (!isApiConfigured) return teacherDashboardMock;
    const payload = await apiRequest('/api/teacher/dashboard', { token: session?.token });
    return {
      teacher: teacherProfile,
      dashboardData: teacherDashboardData,
      dashboardStats: teacherDashboardMock.dashboardStats,
      attendanceWeekly: teacherDashboardMock.attendanceWeekly,
      quickActions: teacherDashboardMock.quickActions,
      shortcuts: teacherShortcuts,
      notices: teacherNotices,
      modules: teacherDashboardMock.modules,
      ...(payload?.data || payload || {}),
    };
  },

  async getStudents(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/api/teacher/students', { token: session?.token });
    return payload?.data || payload?.students || [];
  },

  async getAttendance(session) {
    if (!isApiConfigured) return teacherAttendanceMock;
    const payload = await apiRequest('/api/teacher/attendance', { token: session?.token });
    return payload?.data || payload || teacherAttendanceMock;
  },

  async getHomework(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/api/teacher/homework', { token: session?.token });
    return payload?.data || payload?.homework || [];
  },

  async getExams(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/api/teacher/exams', { token: session?.token });
    return payload?.data || payload?.results || [];
  },

  async getTimetable(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/api/teacher/timetable', { token: session?.token });
    return payload?.data || payload?.timetable || [];
  },

  async getNotices(session) {
    if (!isApiConfigured) return teacherNotices;
    const payload = await apiRequest('/api/teacher/notices', { token: session?.token });
    return payload?.data || payload?.notices || teacherNotices;
  },

  async getNotifications(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/api/teacher/notifications', { token: session?.token });
    return payload?.data || payload?.notifications || [];
  },

  async getReports(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/api/teacher/reports', { token: session?.token });
    return payload?.data || payload?.reports || [];
  },
};

export const teacherAttendanceApi = {
  async getAttendance({ date, className, section, subject }, session) {
    if (!isApiConfigured) return teacherAttendanceMock;
    const payload = await apiRequest('/teacher/attendance', { token: session?.token, query: { date, class: className, section, subject } });
    return payload?.data || payload;
  },

  async runAttendanceCutoff(date, session) {
    if (!isApiConfigured) return { available: false };
    return apiRequest('/teacher/attendance/cutoff', { method: 'POST', token: session?.token, body: { date } });
  },

  async submitAttendance(records, context, session) {
    if (!isApiConfigured) return { available: false };
    return apiRequest('/teacher/attendance/submit', { method: 'POST', token: session?.token, body: { records, ...context } });
  },

  async getHistory(params, session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/teacher/attendance/history', { token: session?.token, query: params });
    return payload?.records || payload?.data || [];
  },

  async getBiometricStatus(session) {
    if (!isApiConfigured) return { available: false };
    return apiRequest('/teacher/attendance/biometric/status', { token: session?.token });
  },
};
