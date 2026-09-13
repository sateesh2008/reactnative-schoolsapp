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
