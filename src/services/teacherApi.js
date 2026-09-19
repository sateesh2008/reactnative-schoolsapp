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

const normalizePayrollStatus = (status) => {
  const normalized = String(status || 'Unmarked').trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (normalized === 'not marked' || normalized === 'unmarked') return 'Unmarked';
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const formatDateForPayrollApi = (dateValue) => {
  if (!dateValue) return null;

  if (dateValue instanceof Date) {
    if (Number.isNaN(dateValue.getTime())) throw new Error('Attendance date is invalid.');
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const value = String(dateValue).trim();
  let year;
  let month;
  let day;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    [, year, month, day] = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  } else {
    const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!match) throw new Error('Attendance date must use DD-MM-YYYY or YYYY-MM-DD format.');
    [, day, month, year] = match;
  }

  const calendarDate = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    calendarDate.getFullYear() !== Number(year)
    || calendarDate.getMonth() !== Number(month) - 1
    || calendarDate.getDate() !== Number(day)
  ) {
    throw new Error('Attendance date is invalid.');
  }

  return `${year}-${month}-${day}`;
};

const payrollDateKeys = ['date', 'attendance_date', 'from', 'to', 'fromDate', 'toDate', 'startDate', 'endDate', 'from_date', 'to_date', 'start_date', 'end_date'];

const normalizePayrollDateFields = (value) => {
  if (!value || typeof value !== 'object') return value;
  const normalized = { ...value };
  payrollDateKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(normalized, key) && normalized[key]) {
      normalized[key] = formatDateForPayrollApi(normalized[key]);
    }
  });
  return normalized;
};

const normalizePayrollDateParams = (params = {}) => normalizePayrollDateFields(params);

const normalizePayrollRecord = (record) => ({
  ...record,
  id: record.id || record.attendance_id || record.attendanceId || record.student_id || record.staff_id,
  name: record.name || record.student_name || record.studentName || record.staff_name || record.staffName,
  roll: record.roll || record.roll_number || record.rollNumber,
  admissionNumber: record.admissionNumber || record.admission_number,
  studentId: record.studentId || record.student_id,
  status: normalizePayrollStatus(record.status || record.attendance_status),
  punchIn: record.punchIn || record.punch_in || record.check_in || '',
  punchOut: record.punchOut || record.punch_out || record.check_out || '',
});

const normalizePayrollRecords = (payload) => {
  const records = payload?.data?.records || payload?.records || payload?.data?.attendance || payload?.attendance || payload?.data?.students || payload?.students || payload?.data || payload?.results || payload || [];
  return (Array.isArray(records) ? records : []).map(normalizePayrollRecord);
};

const normalizePayrollAttendance = (payload) => ({
  ...(payload?.data && !Array.isArray(payload.data) ? payload.data : payload && !Array.isArray(payload) ? payload : {}),
  records: normalizePayrollRecords(payload),
  classes: payload?.classes || payload?.data?.classes || [],
  sections: payload?.sections || payload?.data?.sections || [],
  subjects: payload?.subjects || payload?.data?.subjects || [],
});

const payloadItems = (payload, keys = []) => {
  const candidates = [payload, payload?.data, ...keys.map((key) => payload?.[key]), ...keys.map((key) => payload?.data?.[key])];
  return candidates.find((value) => Array.isArray(value)) || [];
};

const normalizeFilterOption = (item, index) => {
  if (typeof item === 'string' || typeof item === 'number') {
    return { id: String(item), label: String(item), name: String(item) };
  }
  const id = item?.id ?? item?.class_id ?? item?.division_id ?? item?.value ?? index;
  const label = item?.name || item?.label || item?.class_name || item?.division_name || item?.title || String(id);
  return { ...item, id: String(id), label: String(label), name: String(label) };
};

const normalizeAssignedFilters = (payload) => {
  const source = payload?.data && !Array.isArray(payload.data) ? payload.data : payload;
  const assignments = payloadItems(source, ['assigned_classes_divisions', 'assignments']);
  const classes = payloadItems(source, ['classes', 'assigned_classes', 'academic_classes']).map(normalizeFilterOption);
  const sections = payloadItems(source, ['divisions', 'sections', 'assigned_divisions', 'academic_divisions']).map(normalizeFilterOption);
  if (!classes.length && assignments.length) {
    classes.push(...assignments.map((item, index) => normalizeFilterOption({
      id: item?.class_id || item?.class?.id,
      name: item?.class_name || item?.class?.name,
    }, index)));
  }
  if (!sections.length && assignments.length) {
    sections.push(...assignments.map((item, index) => normalizeFilterOption({
      id: item?.division_id || item?.division?.id || item?.section_id,
      name: item?.division_name || item?.division?.name || item?.section_name,
    }, index)));
  }
  return { classes, sections };
};

const attendanceQuery = ({ date, classId, divisionId, className, section } = {}) => normalizePayrollDateParams({
  date,
  classId: classId || className,
  divisionId: divisionId || section,
});

const logApi = (method, path, details) => {
  if (__DEV__) console.debug(`[attendance] ${method} ${path}`, details || '');
};

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
    const payload = await apiRequest('/staff', { token: session?.token });
    const staff = payload?.data || payload?.staff || payload?.results || [];
    const currentStaff = Array.isArray(staff) ? staff[0] || {} : staff;
    return {
      teacher: { ...teacherProfile, ...(currentStaff?.name ? { name: currentStaff.name } : {}), ...(currentStaff?.school_name ? { school: currentStaff.school_name } : {}) },
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

  async getStaff(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/staff', { token: session?.token });
    return payload?.data || payload?.staff || payload?.results || [];
  },

  async getTeachers(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/teachers', { token: session?.token });
    return payload?.data || payload?.teachers || payload?.results || [];
  },

  async getStudents(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/students', { token: session?.token });
    const records = payload?.data?.data || payload?.data || payload?.students || payload?.results || payload || [];
    return Array.isArray(records) ? records : [];
  },

  async createStudent(input, session) {
    return apiRequest('/students', { method: 'POST', token: session?.token, body: input });
  },

  async updateStudent(id, input, session) {
    return apiRequest(`/students/${id}`, { method: 'PUT', token: session?.token, body: input });
  },

  async deleteStudent(id, session) {
    return apiRequest(`/students/${id}`, { method: 'DELETE', token: session?.token });
  },

  async getParentChildren(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/parents/children', { token: session?.token });
    const records = payload?.data?.data || payload?.data || payload?.children || payload || [];
    return Array.isArray(records) ? records : [];
  },

  async getAttendance(session) {
    if (!isApiConfigured) return teacherAttendanceMock;
    const payload = await apiRequest('/attendance', { token: session?.token });
    return payload?.data || payload || teacherAttendanceMock;
  },

  async getHomework(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/homework', { token: session?.token });
    const records = payload?.data?.data || payload?.data || payload?.assignments || payload?.homework || payload || [];
    return Array.isArray(records) ? records : [];
  },

  async createHomework(input, session) {
    if (isApiConfigured) {
      const payload = await apiRequest('/homework', { method: 'POST', token: session?.token, body: input });
      return payload?.data || payload;
    }
    const selectedClasses = input.assignedClasses?.length ? input.assignedClasses : [{ id: input.classId || 'class-1', label: `${input.className || 'Class_1'}-${input.section || 'A'}`, className: input.className || 'Class_1', section: input.section || 'A' }];
    const assignments = selectedClasses.map((selectedClass, index) => ({ ...input, id: `homework-${Date.now()}-${index}`, classId: selectedClass.id, className: selectedClass.className, section: selectedClass.section, teacher: input.teacher || teacherProfile.name }));
    localHomework = [...assignments, ...localHomework];
    return assignments.length === 1 ? { ...assignments[0] } : { assignments };
  },

  async getHomeworkSubmissions(homeworkId, session) {
    if (isApiConfigured) {
      const payload = await apiRequest(`/homework/${homeworkId}/submissions`, { token: session?.token });
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
      const payload = await apiRequest(`/homework/${homeworkId}/submissions/${submissionId}/evaluation`, { method: 'PUT', token: session?.token, body: input });
      return payload?.data || payload;
    }
    const submissions = localSubmissions[homeworkId] || [];
    const submission = submissions.find((item) => item.id === submissionId);
    if (!submission) throw new Error('The selected submission is no longer available.');
    Object.assign(submission, input, { evaluationStatus: 'Evaluated' });
    return { ...submission };
  },

  async getLeaves(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/leaves', { token: session?.token });
    return payload?.data || payload?.leaves || payload?.results || [];
  },

  async createLeaveRequest(input, session) {
    if (isApiConfigured) {
      const payload = await apiRequest('/leaves/apply', { method: 'POST', token: session?.token, body: input });
      return payload?.data || payload;
    }
    const request = { ...input, id: `leave-request-${Date.now()}` };
    localLeaveRequests = [request, ...localLeaveRequests];
    return { ...request };
  },

  async updateLeaveStatus(id, status, session) {
    if (!isApiConfigured) return { id, status };
    if (!id) throw new Error('The leave request ID is missing.');
    const apiStatus = String(status || '').toUpperCase();
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(apiStatus)) {
      throw new Error('Invalid leave status.');
    }

    let payload;
    try {
      payload = await apiRequest(`/leaves/${id}/status`, {
        method: 'PATCH',
        token: session?.token,
        body: { status: apiStatus },
      });
    } catch (error) {
      // Some deployments expose this update as PUT rather than PATCH.
      if (![404, 405].includes(error?.status)) throw error;
      payload = await apiRequest(`/leaves/${id}/status`, {
        method: 'PUT',
        token: session?.token,
        body: { status: apiStatus },
      });
    }
    return payload?.data || payload;
  },

  async deleteLeave(id, session) {
    if (!isApiConfigured) return { id, deleted: true };
    const payload = await apiRequest(`/leaves/${id}`, {
      method: 'DELETE',
      token: session?.token,
    });
    return payload?.data || payload;
  },

  async getExams(session) {
    if (!isApiConfigured) return localExams.map((exam) => ({ ...exam, subjects: [...(exam.subjects || [])] }));
    const payload = await apiRequest('/exams', { token: session?.token });
    const records = payload?.data?.data || payload?.data || payload?.exams || payload?.results || payload || [];
    return (Array.isArray(records) ? records : []).map((exam) => ({
      ...exam,
      name: exam.name || exam.exam_name || exam.title || 'Examination',
      targetClass: exam.targetClass || exam.class_name || exam.className || 'Global (All Classes)',
      section: exam.section || exam.division_name || exam.division || null,
      startDate: exam.startDate || exam.start_date || exam.exam_date || '',
      endDate: exam.endDate || exam.end_date || exam.exam_date || '',
      startTime: exam.startTime || exam.start_time || '',
      endTime: exam.endTime || exam.end_time || '',
      subjects: exam.subjects || exam.exam_subjects || [],
    }));
  },

  async getExamTerms(session) {
    const payload = await apiRequest('/exams/terms', { token: session?.token });
    return payload?.data?.data || payload?.data || payload?.terms || payload?.results || payload || [];
  },

  async getExamTypes(session) {
    const payload = await apiRequest('/exams/types', { token: session?.token });
    return payload?.data?.data || payload?.data || payload?.types || payload?.results || payload || [];
  },

  async fetchExams(session) {
    return this.getExams(session);
  },

  async fetchExamById(examId, session) {
    if (isApiConfigured) {
      const payload = await apiRequest(`/exams/${examId}`, { token: session?.token });
      return payload?.data || payload?.exam || payload;
    }

    return localExams.find((exam) => Number(exam.id) === Number(examId)) || null;
  },

  async createExam(input, session) {
    if (isApiConfigured) {
      const payload = await apiRequest('/exams', { method: 'POST', token: session?.token, body: input });
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

  async updateExam(examId, input, session) {
    if (isApiConfigured) {
      const payload = await apiRequest(`/exams/${examId}`, { method: 'PUT', token: session?.token, body: input });
      return payload?.data || payload;
    }

    const index = localExams.findIndex((exam) => Number(exam.id) === Number(examId));
    if (index < 0) throw new Error('The selected examination is no longer available.');
    localExams[index] = { ...localExams[index], ...input };
    return { ...localExams[index] };
  },

  async deleteExam(examId, session) {
    if (isApiConfigured) {
      const payload = await apiRequest(`/exams/${examId}`, { method: 'DELETE', token: session?.token });
      return payload?.data || payload;
    }

    localExams = localExams.filter((exam) => Number(exam.id) !== Number(examId));
    return { id: examId, deleted: true };
  },

  async getExamSubjects(examId, session) {
    if (isApiConfigured) {
      const payload = await apiRequest(`/exams/${examId}/subjects`, { token: session?.token });
      return payload?.data || payload?.subjects || [];
    }

    const exam = localExams.find((item) => Number(item.id) === Number(examId));
    return exam?.subjects || [];
  },

  async fetchExamSubjects(examId, session) {
    return this.getExamSubjects(examId, session);
  },

  async getExamAttendanceRoster(params = {}, session) {
    const { examId, subjectId, classId, divisionId } = params;
    if (!examId || !subjectId || !classId) return [];
    const payload = await apiRequest(`/exams/${examId}/subjects/${subjectId}/attendance`, {
      token: session?.token,
      query: { class_id: classId, division_id: divisionId },
    });
    const records = payload?.data?.records || payload?.records || payload?.data?.students || payload?.students || payload?.data || payload?.results || payload || [];
    return (Array.isArray(records) ? records : []).map((record, index) => ({
      ...record,
      id: record.id || record.student_id || record.studentId || `student-${index}`,
      studentId: record.studentId || record.student_id || record.id,
      name: record.name || record.student_name || record.studentName || 'Unnamed student',
      rollNumber: record.rollNumber || record.roll_number || record.rollNo || record.roll || '',
      admissionNumber: record.admissionNumber || record.admission_number || record.admissionNo || '',
      className: record.className || record.class_name || '',
      section: record.section || record.division || record.division_name || '',
      status: ['Present', 'Absent'].includes(record.status) ? record.status : 'Unmarked',
    }));
  },

  async getExamAttendanceHistory(params = {}, session) {
    const { examId, classId, divisionId } = params;
    if (!examId || !classId) return { subjects: [], students: [], audit: [] };
    const payload = await apiRequest(`/exams/${examId}/attendance-history`, {
      token: session?.token,
      query: { class_id: classId, division_id: divisionId },
    });
    const source = payload?.data && !Array.isArray(payload.data) ? payload.data : payload || {};
    const students = source.students || source.records || source.attendance || payload?.students || payload?.records || [];
    const subjects = source.subjects || source.papers || payload?.subjects || payload?.papers || [];
    return { subjects: Array.isArray(subjects) ? subjects : [], students: Array.isArray(students) ? students : [], audit: Array.isArray(source.audit) ? source.audit : [] };
  },

  async submitExamAttendance(data, session) {
    const { examId, subjectId, ...body } = data || {};
    if (!examId || !subjectId) throw new Error('Exam and subject paper are required.');
    return apiRequest(`/exams/${examId}/subjects/${subjectId}/attendance`, {
      method: 'POST',
      token: session?.token,
      body,
    });
  },

  async getExamMarksRoster(params = {}, session) {
    const { examId, subjectId, classId, divisionId } = params;
    if (!examId || !subjectId || !classId) return [];
    const payload = await apiRequest(`/exams/${examId}/subjects/${subjectId}/marks`, {
      token: session?.token,
      query: { class_id: classId, division_id: divisionId },
    });
    const records = payload?.data?.records || payload?.records || payload?.data?.students || payload?.students || payload?.data || payload?.results || payload || [];
    return (Array.isArray(records) ? records : []).map((record, index) => ({
      ...record,
      id: record.id || record.student_id || record.studentId || `student-${index}`,
      studentId: record.studentId || record.student_id || record.id,
      name: record.name || record.student_name || record.studentName || 'Unnamed student',
      rollNumber: record.rollNumber || record.roll_number || record.rollNo || record.roll || '',
      admissionNumber: record.admissionNumber || record.admission_number || record.admissionNo || '',
      className: record.className || record.class_name || '',
      section: record.section || record.division || record.division_name || '',
      maximumMarks: Number(record.maximumMarks ?? record.maximum_marks ?? record.maxMarks ?? record.max_marks ?? 100),
      obtainedMarks: record.obtainedMarks ?? record.obtained_marks ?? record.marks ?? '',
      passingMarks: record.passingMarks ?? record.passing_marks ?? record.passMarks ?? record.pass_marks ?? '',
      remarks: record.remarks || '',
    }));
  },

  async submitExamMarks(data, session) {
    const { examId, subjectId, ...body } = data || {};
    if (!examId || !subjectId) throw new Error('Exam and subject paper are required.');
    return apiRequest(`/exams/${examId}/subjects/${subjectId}/marks`, {
      method: 'POST',
      token: session?.token,
      body,
    });
  },

  async publishExamResults(examId, session) {
    if (!examId) throw new Error('The examination ID is missing.');
    const payload = await apiRequest(`/exams/${examId}/publish-results`, {
      method: 'POST',
      token: session?.token,
    });
    return payload?.data || payload;
  },

  async recallExamResults(examId, session) {
    if (!examId) throw new Error('The examination ID is missing.');
    const payload = await apiRequest(`/exams/${examId}/recall-results`, {
      method: 'POST',
      token: session?.token,
    });
    return payload?.data || payload;
  },

  async getExamReport(examId, session) {
    if (!examId) throw new Error('The examination ID is missing.');
    const payload = await apiRequest(`/exams/${examId}/report`, { token: session?.token });
    return payload?.data || payload?.report || payload;
  },

  async getClassResults(params = {}, session) {
    const { examId, classId, divisionId } = params;
    if (!examId || !classId) return [];
    const payload = await apiRequest(`/exams/${examId}/class-results`, {
      token: session?.token,
      query: { class_id: classId, division_id: divisionId },
    });
    const records = payload?.data?.records || payload?.records || payload?.data?.students || payload?.students || payload?.data || payload?.results || payload || [];
    return Array.isArray(records) ? records : [];
  },

  async createExamSubject(examId, input, session) {
    if (isApiConfigured) {
      const payload = await apiRequest(`/exams/${examId}/subjects`, { method: 'POST', token: session?.token, body: input });
      return payload?.data || payload;
    }

    const exam = localExams.find((item) => Number(item.id) === Number(examId));
    if (!exam) throw new Error('The selected examination is no longer available.');
    const subject = { ...input, id: input.id || `subject-${Date.now()}` };
    exam.subjects = [...(exam.subjects || []), subject];
    return { ...subject };
  },

  async updateExamSubject(examId, subjectId, input, session) {
    if (isApiConfigured) {
      const payload = await apiRequest(`/exams/${examId}/subjects/${subjectId}`, { method: 'PUT', token: session?.token, body: input });
      return payload?.data || payload;
    }

    const exam = localExams.find((item) => Number(item.id) === Number(examId));
    const index = exam?.subjects?.findIndex((subject) => String(subject.id) === String(subjectId));
    if (!exam || index === undefined || index < 0) throw new Error('The selected subject is no longer available.');
    exam.subjects[index] = { ...exam.subjects[index], ...input };
    return { ...exam.subjects[index] };
  },

  async deleteExamSubject(examId, subjectId, session) {
    if (isApiConfigured) {
      const payload = await apiRequest(`/exams/${examId}/subjects/${subjectId}`, { method: 'DELETE', token: session?.token });
      return payload?.data || payload;
    }

    const exam = localExams.find((item) => Number(item.id) === Number(examId));
    if (exam) exam.subjects = (exam.subjects || []).filter((subject) => String(subject.id) !== String(subjectId));
    return { id: subjectId, deleted: true };
  },

  async getTimetable(session, params = {}) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/timetable/teacher', {
      token: session?.token,
      query: {
        academic_year_id: params.academic_year_id,
        staff_id: params.staff_id,
      },
    });
    return payload?.data?.data || payload?.data || payload?.timetable || payload?.records || payload || [];
  },

  async getTimetableSessions(session, academicYearId) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/timetable/sessions', {
      token: session?.token,
      query: { academic_year_id: academicYearId },
    });
    return payload?.data?.data || payload?.data || payload?.sessions || payload?.records || payload || [];
  },

  async getNotices(session) {
    if (!isApiConfigured) return teacherNotices;
    const payload = await apiRequest('/notices', { token: session?.token });
    return payload?.data || payload?.notices || teacherNotices;
  },

  async getNotifications(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/notifications', { token: session?.token });
    return payload?.data || payload?.notifications || [];
  },

  async getReports(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/reports', { token: session?.token });
    const records = payload?.data?.data || payload?.data || payload?.reports || payload?.results || payload || [];
    return Array.isArray(records) ? records : [];
  },
};

const examAttendanceItems = (payload, keys = []) => payloadItems(payload, keys);

export const examAttendanceApi = {
  async getClasses(session) {
    const payload = await apiRequest('/academics/classes', { token: session?.token });
    return examAttendanceItems(payload, ['classes']);
  },

  async getDivisions(classId, session) {
    const payload = await apiRequest('/academics/divisions', {
      token: session?.token,
      query: { class_id: classId },
    });
    return examAttendanceItems(payload, ['divisions', 'sections']);
  },

  async getSubjects(examId, session) {
    const payload = await apiRequest(`/exams/${examId}/subjects`, { token: session?.token });
    return examAttendanceItems(payload, ['subjects', 'exam_subjects']);
  },

  async getSubjectMarks(examSubjectId, session) {
    const payload = await apiRequest(`/exams/subject/${examSubjectId}/marks`, { token: session?.token });
    return examAttendanceItems(payload, ['marks', 'records']);
  },

  async getStudents(classId, divisionId, session) {
    const payload = await apiRequest('/students', {
      token: session?.token,
      query: { class_id: classId, division_id: divisionId },
    });
    return examAttendanceItems(payload, ['students']);
  },

  async saveAttendance(data, session) {
    return apiRequest('/exams/attendance', {
      method: 'POST',
      token: session?.token,
      body: data,
    });
  },
};

export const examResultApi = {
  getClasses: examAttendanceApi.getClasses,
  getDivisions: examAttendanceApi.getDivisions,
  getSubjects: examAttendanceApi.getSubjects,
  getSubjectMarks: examAttendanceApi.getSubjectMarks,
  getStudents: examAttendanceApi.getStudents,

  async saveMarks(data, session) {
    return apiRequest('/exams/marks/bulk', {
      method: 'POST',
      token: session?.token,
      body: data,
    });
  },
};

export const teacherAttendanceApi = {
  async getAssignedClassesDivisions(session) {
    logApi('GET', '/attendance/assigned-classes-divisions');
    const payload = await apiRequest('/attendance/assigned-classes-divisions', { token: session?.token });
    return normalizeAssignedFilters(payload);
  },

  async getAcademicClasses(session) {
    logApi('GET', '/academics/classes');
    const payload = await apiRequest('/academics/classes', { token: session?.token });
    return payloadItems(payload, ['classes']).map(normalizeFilterOption);
  },

  async getAcademicDivisions(session, classId) {
    logApi('GET', '/academics/divisions');
    const payload = await apiRequest('/academics/divisions', {
      token: session?.token,
      query: { class_id: classId },
    });
    return payloadItems(payload, ['divisions', 'sections']).map(normalizeFilterOption);
  },

  async getAttendance(params = {}, session) {
    const query = attendanceQuery(params);
    logApi('GET', '/attendance', query);
    const payload = await apiRequest('/attendance', {
      token: session?.token,
      query,
    });
    return normalizePayrollAttendance(payload);
  },

  async submitAttendance(data, session) {
    const attendanceData = (data?.attendanceData || data?.records || []).map((record) => ({
      student_id: record.student_id || record.studentId,
      status: record.status,
    }));
    const academicYearId = session?.user?.tenant?.current_academic_year_id
      || session?.tenant?.current_academic_year_id;
    const body = {
      ...data,
      ...(academicYearId ? { academic_year_id: academicYearId } : {}),
      attendanceData,
    };
    delete body.records;
    logApi('POST', '/attendance', { ...body, attendanceData: `${attendanceData.length} record(s)` });
    return apiRequest('/attendance', {
      method: 'POST',
      token: session?.token,
      body: { ...body, date: formatDateForPayrollApi(data?.date) },
    });
  },

  async getAttendanceHistory(params = {}, session) {
    const query = normalizePayrollDateParams({
      classId: params.classId || params.class_id,
      divisionId: params.divisionId || params.division_id,
      startDate: params.startDate || params.from,
      endDate: params.endDate || params.to,
      page: params.page,
      limit: params.limit,
    });
    logApi('GET', '/attendance/history', query);
    const payload = await apiRequest('/attendance/history', {
      token: session?.token,
      query,
    });
    return { records: normalizePayrollRecords(payload), pagination: payload?.pagination || payload?.meta || {} };
  },

  async exportAttendance(params = {}, session) {
    const date = formatDateForPayrollApi(params.date || params.from || params.startDate);
    const query = {
      from: date,
      to: formatDateForPayrollApi(params.to || params.endDate || params.date),
      format: params.format || 'CSV',
      classId: params.classId || params.class_id,
      divisionId: params.divisionId || params.division_id,
    };
    logApi('GET', '/attendance/export', query);
    return apiRequest('/attendance/export', {
      token: session?.token,
      query,
    });
  },

  async triggerAutoCutoff(data, session) {
    logApi('POST', '/attendance/trigger-auto-cutoff', data);
    return apiRequest('/attendance/trigger-auto-cutoff', {
      method: 'POST',
      token: session?.token,
      body: { ...data, date: formatDateForPayrollApi(data?.date) },
    });
  },

  getPayrollAttendance(params, session) { return this.getAttendance(params, session); },
  recordPayrollAttendance(records, context, session) { return this.submitAttendance({ ...context, records }, session); },
  getPayrollAttendanceHistory(params, session) { return this.getAttendanceHistory(params, session).then((result) => result.records); },
  runAttendanceCutoff(date, session) { return this.triggerAutoCutoff({ date }, session); },

  async getBiometricStatus(session) {
    if (!isApiConfigured) return { available: false };
    return apiRequest('/attendance/analytics', { token: session?.token });
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
