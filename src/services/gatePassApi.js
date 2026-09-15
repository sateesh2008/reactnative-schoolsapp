import { apiRequest, isApiConfigured } from './api';
import { dateKey, gatePassMockClasses, gatePassMockRecords, gatePassStudents, nextMockPassNumber } from './gatePassMock';

let mockRecords = gatePassMockRecords.map((record) => ({ ...record }));
const recordsFromPayload = (payload) => payload?.data || payload?.records || payload?.gatePasses || payload || [];

export const gatePassApi = {
  async list(session) {
    if (!isApiConfigured) return mockRecords.map((record) => ({ ...record }));
    return recordsFromPayload(await apiRequest('/api/gate-pass', { token: session?.token }));
  },
  async getStudents(session) {
    if (!isApiConfigured) return gatePassStudents;
    const payload = await apiRequest('/api/teacher/students', { token: session?.token });
    return payload?.data || payload?.students || [];
  },
  async getClasses(session) {
    if (!isApiConfigured) return gatePassMockClasses;
    const payload = await apiRequest('/api/classes', { token: session?.token });
    return payload?.data || payload?.classes || [];
  },
  async create(input, session) {
    if (isApiConfigured) {
      const payload = await apiRequest('/api/gate-pass', { method: 'POST', token: session?.token, body: input });
      return payload?.data || payload;
    }
    const student = gatePassStudents.find((item) => item.id === input.studentId);
    if (!student) throw new Error('The selected student is invalid.');
    const record = { ...input, ...student, id: `gate-pass-${Date.now()}`, passNumber: nextMockPassNumber(mockRecords, input.date), status: 'ISSUED', issueTime: new Date().toTimeString().slice(0, 5), exitTime: null, returnTime: null };
    mockRecords = [record, ...mockRecords];
    return { ...record };
  },
  async exit(id, session) {
    if (isApiConfigured) {
      const payload = await apiRequest(`/api/gate-pass/${id}/exit`, { method: 'POST', token: session?.token });
      return payload?.data || payload;
    }
    const record = mockRecords.find((item) => item.id === id);
    if (!record || record.status !== 'ISSUED') throw new Error('This gate pass cannot be exited.');
    record.status = 'OUT';
    record.exitTime = new Date().toTimeString().slice(0, 5);
    return { ...record };
  },
  async returnPass(id, session) {
    if (isApiConfigured) {
      const payload = await apiRequest(`/api/gate-pass/${id}/return`, { method: 'POST', token: session?.token });
      return payload?.data || payload;
    }
    const record = mockRecords.find((item) => item.id === id);
    if (!record || record.status !== 'OUT') throw new Error('This gate pass cannot be returned.');
    record.status = 'RETURNED';
    record.returnTime = new Date().toTimeString().slice(0, 5);
    return { ...record };
  },
};

export { dateKey };
