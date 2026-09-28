import { apiRequest, isApiConfigured } from "./api";
import { normalizeParentChildren } from "./parentNormalization";

export const parentApi = {
  async getChildren(session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest("/parents/children", {
      token: session?.token,
    });
    const children = normalizeParentChildren(payload);
    if (__DEV__) {
      console.info(
        "[Parent] child ID mapping",
        children.map((child) => ({
          selectedId: child.id,
          parentChildId: child.parentChildId,
          student_id: child.student_id,
          studentId: child.studentId,
          child_id: child.child_id,
          childId: child.childId,
          nestedStudentId:
            child.student?.student_id ??
            child.student?.studentId ??
            child.student?.id,
          nestedChildId:
            child.child?.student_id ??
            child.child?.studentId ??
            child.child?.id,
        })),
      );
    }
    return children;
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
