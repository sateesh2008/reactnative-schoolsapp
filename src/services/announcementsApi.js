import { apiRequest, isApiConfigured } from './api';

const recordsFrom = (payload) => {
  const records =
    payload?.announcements ||
    payload?.data?.announcements ||
    payload?.data?.data ||
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

  async getAnnouncement(session, id) {
    return apiRequest(`/announcements/${id}`, { token: session?.token });
  },

  async getPublicAnnouncement(id) {
    return apiRequest(`/announcements/public/${id}`);
  },

  async createAnnouncement(session, announcement) {
    return apiRequest('/announcements', {
      method: 'POST',
      token: session?.token,
      body: announcement,
    });
  },

  async markAsRead(session, id) {
    return apiRequest(`/announcements/${id}/read`, {
      method: 'POST',
      token: session?.token,
    });
  },

  async markAllAsRead(session) {
    return apiRequest('/announcements/read-all', {
      method: 'POST',
      token: session?.token,
    });
  },

  async deleteAnnouncement(session, id) {
    return apiRequest(`/announcements/${id}`, {
      method: 'DELETE',
      token: session?.token,
    });
  },
};
