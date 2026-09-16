import { apiRequest, isApiConfigured } from './api';
import { parentHomeworkRecords } from './homeworkMock';

export const homeworkApi = {
  async getAssignments(session, studentId) {
    if (!isApiConfigured) return parentHomeworkRecords;
    const payload = await apiRequest('/homework', {
      token: session?.token,
      query: { student_id: studentId },
    });
    const records = payload?.assignments || payload?.data || [];
    return (Array.isArray(records) ? records : []).map((record) => {
      const dueDate = record.submission_date || record.dueDate;
      const isOverdue = dueDate && new Date(dueDate) < new Date();
      return {
        ...record,
        subject: record.subject || record.subject_name || 'Subject',
        topic: record.topic || record.title || 'Homework',
        assignedDate: record.assignedDate || record.homework_date || '',
        dueDate: record.dueDate || dueDate || '',
        status: record.status || (isOverdue ? 'Overdue' : 'Active'),
        submissionStatus: record.submissionStatus || record.submission_status || '',
        material: record.material || record.attachment_url || null,
      };
    });
  },

  async submitAssignment(payload) {
    void payload;
    return { available: false };
  },
};
