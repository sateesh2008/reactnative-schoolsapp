import { apiRequest, isApiConfigured } from './api';

const listFrom = (payload, keys = []) => {
  const values = [payload, payload?.data, ...keys.map((key) => payload?.[key]), ...keys.map((key) => payload?.data?.[key])];
  return values.find((value) => Array.isArray(value)) || [];
};

const unwrap = (payload) => payload?.data || payload;

export const omrApi = {
  async listSessions(session) {
    if (!isApiConfigured) return [];
    return listFrom(await apiRequest('/omr/sessions', { token: session?.token }));
  },
  async createSession(input, session) {
    return apiRequest('/omr/sessions', { method: 'POST', token: session?.token, body: input });
  },
  async deleteSession(id, session) {
    return apiRequest(`/omr/sessions/${id}`, { method: 'DELETE', token: session?.token });
  },
  async publishSession(id, isPublished, session) {
    return apiRequest(`/omr/sessions/${id}/publish`, { method: 'PATCH', token: session?.token, body: { is_published: isPublished } });
  },
  async getAnswerKey(id, bookletCode, session) {
    const payload = await apiRequest(`/omr/sessions/${id}/answer-key`, { token: session?.token });
    return unwrap(payload)?.[bookletCode] || [];
  },
  async saveAnswerKey(id, bookletCode, keys, session) {
    return apiRequest(`/omr/sessions/${id}/answer-key`, { method: 'POST', token: session?.token, body: { booklet_code: bookletCode, keys } });
  },
  async importResponses(id, items, scanSource, session) {
    return apiRequest(`/omr/sessions/${id}/import-csv`, { method: 'POST', token: session?.token, body: { items, scan_source: scanSource } });
  },
  async getPendingReviews(id, session) {
    return listFrom(await apiRequest(`/omr/sessions/${id}/pending-reviews`, { token: session?.token }));
  },
  async resolveReview(id, studentId, session) {
    return apiRequest(`/omr/pending-reviews/${id}/resolve`, { method: 'POST', token: session?.token, body: { student_id: studentId } });
  },
  async getResults(id, session) {
    const payload = await apiRequest(`/omr/sessions/${id}/results`, { token: session?.token });
    return unwrap(payload) || {};
  },
};
