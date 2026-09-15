import { apiRequest, isApiConfigured } from './api';
import {
  teacherAttendanceMock,
  teacherDashboardMock,
  teacherDashboardData,
  teacherNotices,
  teacherProfile,
  teacherShortcuts,
  teacherHomeworkMock,
} from './teacherMock';

let localHomework = teacherHomeworkMock.map((assignment) => ({ ...assignment }));
let localSubmissions = {};

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
    if (!isApiConfigured) return localHomework.map((assignment) => ({ ...assignment }));
    const payload = await apiRequest('/api/teacher/homework', { token: session?.token });
    return payload?.data || payload?.homework || [];
  },

  async createHomework(input, session) {
    if (isApiConfigured) {
      const payload = await apiRequest('/api/homework', { method: 'POST', token: session?.token, body: input });
      return payload?.data || payload;
    }
    const selectedClasses = input.assignedClasses?.length ? input.assignedClasses : [{ id: input.classId || 'class-1', label: `${input.className || 'Class_1'}-${input.section || 'A'}`, className: input.className || 'Class_1', section: input.section || 'A' }];
    const assignments = selectedClasses.map((selectedClass, index) => ({ ...input, id: `homework-${Date.now()}-${index}`, classId: selectedClass.id, className: selectedClass.className, section: selectedClass.section, teacher: input.teacher || teacherProfile.name }));
    localHomework = [...assignments, ...localHomework];
    return assignments.length === 1 ? { ...assignments[0] } : { assignments };
  },

  async getHomeworkSubmissions(homeworkId, session) {
    if (isApiConfigured) {
      const payload = await apiRequest(`/api/homework/${homeworkId}/submissions`, { token: session?.token });
      return payload?.data || payload?.submissions || [];
    }
    if (!localSubmissions[homeworkId]) {
      const assignment = localHomework.find((item) => item.id === homeworkId);
      localSubmissions[homeworkId] = assignment ? [
        { id: `${homeworkId}-student-1`, studentName: 'Aarav Sharma', className: assignment.className || assignment.class, section: assignment.section || 'A', rollNumber: '01', submissionStatus: 'Submitted', evaluationStatus: 'Pending Evaluation', submittedDate: assignment.dueDate, submissionDetails: 'Homework submission received.' },
        { id: `${homeworkId}-student-2`, studentName: 'Diya Nair', className: assignment.className || assignment.class, section: assignment.section || 'A', rollNumber: '02', submissionStatus: 'Not Submitted', evaluationStatus: 'Not Submitted' },
      ] : [];
    }
    return localSubmissions[homeworkId].map((submission) => ({ ...submission }));
  },

  async saveHomeworkEvaluation(homeworkId, submissionId, input, session) {
    if (isApiConfigured) {
      const payload = await apiRequest(`/api/homework/${homeworkId}/submissions/${submissionId}/evaluation`, { method: 'PUT', token: session?.token, body: input });
      return payload?.data || payload;
    }
    const submissions = localSubmissions[homeworkId] || [];
    const submission = submissions.find((item) => item.id === submissionId);
    if (!submission) throw new Error('The selected submission is no longer available.');
    Object.assign(submission, input, { evaluationStatus: 'Evaluated' });
    return { ...submission };
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

  async sendAbsentWhatsAppAlert(records, context) {
    return {
      available: false,
      simulated: true,
      count: records.length,
      context,
    };
  },
};
