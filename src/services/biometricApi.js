import { apiRequest, isApiConfigured } from './api';

const state = {
  devices: [],
  enrollments: [],
  punches: [],
};

const recordsFrom = (payload, key) => payload?.[key] || payload?.data || payload || [];

const requestOrMock = async (path, options, key, fallback) => {
  if (!isApiConfigured) return fallback;
  const payload = await apiRequest(path, options);
  return recordsFrom(payload, key);
};

export const biometricApi = {
  async getSnapshot(session) {
    if (isApiConfigured) {
      const payload = await apiRequest('/api/biometric/snapshot', { token: session?.token });
      return {
        devices: payload?.devices || [],
        enrollments: payload?.enrollments || [],
        punches: payload?.punches || [],
      };
    }
    return { devices: [...state.devices], enrollments: [...state.enrollments], punches: [...state.punches] };
  },

  async registerDevice(device, session) {
    if (isApiConfigured) return apiRequest('/api/biometric/devices', { method: 'POST', token: session?.token, body: device });
    const saved = { ...device, id: `mock-device-${Date.now()}`, status: 'Unknown', lastSeen: null, hasCredentials: Boolean(device.username || device.password) };
    delete saved.password;
    state.devices = [...state.devices, saved];
    return saved;
  },

  async deleteDevice(id, session) {
    if (isApiConfigured) return apiRequest(`/api/biometric/devices/${id}`, { method: 'DELETE', token: session?.token });
    state.devices = state.devices.filter((device) => device.id !== id);
    return { ok: true };
  },

  async testConnection(device, session) {
    if (isApiConfigured) return apiRequest(`/api/biometric/devices/${device.id}/test`, { method: 'POST', token: session?.token });
    return { status: 'Unknown', simulated: true, message: 'Connection testing requires the biometric backend.' };
  },

  async getEnrollments(session) {
    return requestOrMock('/api/biometric/enrollments', { token: session?.token }, 'enrollments', [...state.enrollments]);
  },

  async saveEnrollment(enrollment, session) {
    if (isApiConfigured) return apiRequest('/api/biometric/enrollments', { method: 'POST', token: session?.token, body: enrollment });
    const saved = { ...enrollment, id: `mock-enrollment-${Date.now()}`, status: 'Mapped', lastSync: null };
    state.enrollments = [...state.enrollments, saved];
    return saved;
  },

  async updateEnrollment(id, enrollment, session) {
    if (isApiConfigured) return apiRequest(`/api/biometric/enrollments/${id}`, { method: 'PUT', token: session?.token, body: enrollment });
    const current = state.enrollments.find((item) => item.id === id);
    if (!current) throw new Error('Enrollment was not found.');
    const updated = { ...current, ...enrollment, status: 'Mapped' };
    state.enrollments = state.enrollments.map((item) => item.id === id ? updated : item);
    return updated;
  },

  async bulkImportEnrollments(enrollments, session) {
    if (isApiConfigured) return apiRequest('/api/biometric/enrollments/bulk-import', { method: 'POST', token: session?.token, body: { enrollments } });
    const existingUids = new Set(state.enrollments.map((item) => String(item.biometricUid)));
    const imported = enrollments.map((item, index) => ({ ...item, id: `mock-enrollment-${Date.now()}-${index}`, status: 'Mapped', lastSync: null }));
    state.enrollments = [...state.enrollments, ...imported.filter((item) => !existingUids.has(String(item.biometricUid)))];
    return { imported: state.enrollments.length - existingUids.size, skipped: imported.length - (state.enrollments.length - existingUids.size) };
  },

  async getAutoMapCandidates(category, session) {
    if (isApiConfigured) return apiRequest('/api/biometric/enrollments/auto-map/candidates', { token: session?.token, query: { category } });
    return [];
  },

  async autoMapEnrollments(category, candidates, session) {
    if (isApiConfigured) return apiRequest('/api/biometric/enrollments/auto-map', { method: 'POST', token: session?.token, body: { category, candidates } });
    const existingUids = new Set(state.enrollments.map((item) => String(item.biometricUid)));
    const result = { mapped: 0, skipped: 0, alreadyMapped: 0, failed: 0, failures: [] };
    candidates.forEach((candidate) => {
      const uid = String(candidate.admissionOrEmployeeCode || '').trim();
      if (!uid || existingUids.has(uid)) { result.skipped += 1; result.alreadyMapped += existingUids.has(uid) ? 1 : 0; return; }
      existingUids.add(uid);
      state.enrollments.push({ ...candidate, biometricUid: uid, id: `mock-auto-map-${Date.now()}-${result.mapped}`, status: 'Mapped', lastSync: null });
      result.mapped += 1;
    });
    return result;
  },

  async deleteEnrollment(id, session) {
    if (isApiConfigured) return apiRequest(`/api/biometric/enrollments/${id}`, { method: 'DELETE', token: session?.token });
    state.enrollments = state.enrollments.filter((enrollment) => enrollment.id !== id);
    return { ok: true };
  },

  async getPunches(session) {
    return requestOrMock('/api/biometric/punches', { token: session?.token }, 'punches', [...state.punches]);
  },

  async simulatePunch(punch, session) {
    if (isApiConfigured) return apiRequest('/api/biometric/webhook/test', { method: 'POST', token: session?.token, body: punch });
    const mapping = state.enrollments.find((enrollment) => String(enrollment.biometricUid) === String(punch.biometricUid));
    const event = {
      ...punch,
      id: `mock-punch-${Date.now()}`,
      student: mapping?.user || mapping?.student || 'Unmapped user',
      device: mapping?.device || punch.device || 'Test device',
      status: mapping ? 'Mapped' : 'Unmapped',
      simulated: true,
    };
    state.punches = [event, ...state.punches];
    return event;
  },
};
