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
let localLeaveRequests = [];

const examSeed = [
  { id: 20, name: 'Periodic Text', targetClass: 'Class_4', section: null, startDate: '07/09/2026', endDate: '07/09/2026', startTime: '12:00', endTime: '13:00', status: 'Scheduled', subjects: ['Mathematics', 'Science'] },
  { id: 15, name: 'UNIT TEST', targetClass: 'Global (All Classes)', section: null, startDate: '31/07/2026', endDate: '31/07/2026', startTime: '09:00', endTime: '00:00', status: 'Scheduled', subjects: ['English', 'Social Science'] },
  { id: 14, name: 'UNIT TEST', targetClass: 'Global (All Classes)', section: null, startDate: '31/07/2026', endDate: '31/07/2026', startTime: '09:00', endTime: '12:00', status: 'Scheduled', subjects: ['Mathematics'] },
  { id: 13, name: 'UNIT TEST', targetClass: 'Class_4 • A', section: 'A', startDate: '31/07/2026', endDate: '31/07/2026', startTime: '09:00', endTime: '12:00', status: 'Scheduled', subjects: ['Physics', 'Biology'] },
  { id: 19, name: 'Slip_test', targetClass: 'Class_6', section: null, startDate: '17/07/2026', endDate: '17/07/2026', startTime: '10:30', endTime: '11:00', status: 'Scheduled', subjects: ['Mathematics'] },
  { id: 18, name: 'Unit test', targetClass: 'Class_2 • A', section: 'A', startDate: '07/07/2026', endDate: '07/07/2026', startTime: '09:00', endTime: '10:00', status: 'Scheduled', subjects: ['Hindi', 'English'] },
  { id: 17, name: 'Quterly exam', targetClass: 'Class_1 • A', section: 'A', startDate: '06/07/2026', endDate: '06/07/2026', startTime: '10:04', endTime: '11:00', status: 'Scheduled', subjects: ['English', 'Mathematics'] },
  { id: 16, name: 'QUATERLY', targetClass: 'Class_1 • A', section: 'A', startDate: '06/07/2026', endDate: '06/07/2026', startTime: '15:00', endTime: '17:31', status: 'Scheduled', subjects: ['Science'] },
  { id: 11, name: 'Testttttttttttttttttttttttt', targetClass: 'CLASS (1) • A', section: 'A', startDate: '04/07/2026', endDate: '04/07/2026', startTime: '10:00', endTime: '11:00', status: 'Scheduled', subjects: ['Science', 'Computer'] },
  { id: 10, name: 'Unit Test_1', targetClass: 'Class 10 • A', section: 'A', startDate: '02/07/2026', endDate: '02/07/2026', startTime: '12:00', endTime: '13:00', status: 'Scheduled', subjects: ['Physics', 'Chemistry'] },
  { id: 9, name: 'Unit Test', targetClass: 'CLASS (1) • A', section: 'A', startDate: '02/07/2026', endDate: '02/07/2026', startTime: '10:00', endTime: '11:00', status: 'Scheduled', subjects: ['English', 'Mathematics'] },
  { id: 12, name: 'Unit Test', targetClass: 'Class_1 • A', section: 'A', startDate: '01/07/2026', endDate: '01/07/2026', startTime: '10:01', endTime: '11:02', status: 'Scheduled', subjects: ['History', 'Geography'] },
  { id: 8, name: 'Mid Exam', targetClass: 'Class_5 • A', section: 'A', startDate: '30/06/2026', endDate: '30/06/2026', startTime: '22:42', endTime: '00:43', status: 'Scheduled', subjects: ['Mathematics', 'Science'] },
  { id: 7, name: 'tweay', targetClass: 'Class_1 • A', section: 'A', startDate: '26/06/2026', endDate: '26/06/2026', startTime: '10:00', endTime: '11:00', status: 'Scheduled', subjects: ['English'] },
  { id: 6, name: 'Maths', targetClass: 'Class_4 • A', section: 'A', startDate: '07/06/2026', endDate: '07/06/2026', startTime: '09:00', endTime: '10:00', status: 'Scheduled', subjects: ['Mathematics'] },
  { id: 5, name: 'Mid Term', targetClass: 'class1 • C', section: 'C', startDate: '27/05/2026', endDate: '27/05/2026', startTime: '13:09', endTime: '15:15', status: 'Scheduled', subjects: ['Social Science', 'Mathematics'] },
  { id: 4, name: 'Weekly test', targetClass: 'Global (All Classes)', section: null, startDate: '13/04/2026', endDate: '13/04/2026', startTime: '16:24', endTime: '17:24', status: 'Scheduled', subjects: ['Physics', 'Chemistry'] },
  { id: 3, name: 'Daily test', targetClass: 'Global (All Classes)', section: null, startDate: '13/04/2026', endDate: '13/04/2026', startTime: '17:14', endTime: '18:14', status: 'Scheduled', subjects: ['Mathematics'] },
  { id: 1, name: 'subjects', targetClass: 'Global (All Classes)', section: null, startDate: '18/03/2026', endDate: '18/03/2026', startTime: '17:23', endTime: '17:24', status: 'Scheduled', subjects: ['Science'] },
];

let localExams = examSeed.map((exam) => ({ ...exam, subjects: [...(exam.subjects || [])] }));

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

  async createLeaveRequest(input, session) {
    if (isApiConfigured) {
      const payload = await apiRequest('/api/teacher/leave', { method: 'POST', token: session?.token, body: input });
      return payload?.data || payload;
    }
    const request = { ...input, id: `leave-request-${Date.now()}` };
    localLeaveRequests = [request, ...localLeaveRequests];
    return { ...request };
  },

  async getExams(session) {
    if (!isApiConfigured) return localExams.map((exam) => ({ ...exam, subjects: [...(exam.subjects || [])] }));
    const payload = await apiRequest('/api/teacher/exams', { token: session?.token });
    return payload?.data || payload?.results || localExams;
  },

  async createExam(input, session) {
    if (isApiConfigured) {
      const payload = await apiRequest('/api/teacher/exams', { method: 'POST', token: session?.token, body: input });
      return payload?.data || payload;
    }

    const nextId = localExams.reduce((maxId, exam) => Math.max(maxId, Number(exam.id) || 0), 0) + 1;
    const exam = {
      ...input,
      id: nextId,
      status: input.status || 'Scheduled',
      subjects: Array.isArray(input.subjects) ? input.subjects : [],
      section: input.section || null,
      targetClass: input.targetClass || 'Global (All Classes)',
    };

    localExams = [{ ...exam }, ...localExams];
    return { ...exam };
  },

  async getExamSubjects(examId, session) {
    if (isApiConfigured) {
      const payload = await apiRequest(`/api/teacher/exams/${examId}/subjects`, { token: session?.token });
      return payload?.data || payload?.subjects || [];
    }

    const exam = localExams.find((item) => Number(item.id) === Number(examId));
    return exam?.subjects || [];
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
