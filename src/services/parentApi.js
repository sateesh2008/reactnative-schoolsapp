import { apiRequest, isApiConfigured } from "./api";

export const parentApi = {
  async getChildren(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest("/parents/children", {
      token: session?.token,
    });
    const children = payload?.data || payload?.children || [];
    return Array.isArray(children) ? children : children?.data || [];
  },

  async getChildProfile(studentId, session) {
    if (!isApiConfigured || !studentId) return null;
    const payload = await apiRequest(`/parents/child/${studentId}/profile`, {
      token: session?.token,
    });
    return payload?.data || payload?.profile || payload;
  },

  async updateChildProfile(studentId, profile, session) {
    if (!isApiConfigured || !studentId) {
      throw new Error("A ward must be selected before updating the profile.");
    }
    const payload = await apiRequest(`/parents/child/${studentId}/profile`, {
      method: "PUT",
      token: session?.token,
      body: profile,
    });
    return payload?.data || payload?.profile || payload;
  },
};
