import { apiRequest, isApiConfigured } from './api';

export const parentApi = {
  async getChildren(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/parents/children', { token: session?.token });
    const children = payload?.data || payload?.children || [];
    return Array.isArray(children) ? children : children?.data || [];
  },
};