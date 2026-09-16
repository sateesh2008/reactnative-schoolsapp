import { apiRequest, isApiConfigured } from './api';

const recordsFrom = (payload) => {
  const records =
    payload?.announcements ||
    payload?.data?.announcements ||
    payload?.data ||
    payload ||
    [];
  return Array.isArray(records) ? records : [];
};

export const announcementsApi = {
  async getAnnouncements(session, studentId) {
    if (!isApiConfigured) return [];

    const payload = await apiRequest('/announcements', {
      token: session?.token,
      query: studentId ? { student_id: studentId } : undefined,
    });

    return recordsFrom(payload).map((announcement) => ({
      ...announcement,
      title: announcement.title || announcement.subject || 'Announcement',
      message: announcement.message || announcement.content || '',
      type: announcement.type || announcement.category || 'Notice',
      priority: announcement.priority || 'Normal',
      date: announcement.created_at || announcement.date || '',
      creator: announcement.creator_name || announcement.created_by_name || 'School Administration',
    }));
  },
};
