import { ApiError, apiRequest, isApiConfigured } from './api';

const emptySummary = {
  totalEnrolled: 0,
  markedEntries: 0,
  presentToday: 0,
  absentCount: 0,
  lateArrivals: 0,
  canMarkAttendance: false,
};

const recordsFrom = (payload) => {
  const records = payload?.data?.records || payload?.records || payload?.data || [];
  return (Array.isArray(records) ? records : []).map((record) => {
    const date = record.date || record.attendance_date || record.attendanceDate || '';
    const status = record.status || record.attendance_status || 'Unmarked';
    return {
      ...record,
      date,
      day: record.day || (date ? new Date(date).toLocaleDateString('en-US', { weekday: 'long' }) : ''),
      status: String(status).replace(/\b\w/g, (letter) => letter.toUpperCase()),
      biometricPunch: record.biometricPunch || record.biometric_punch || record.punch_time || '',
    };
  });
};

const summaryFrom = (summary = {}, records = []) => {
  const total = Number(summary.total ?? summary.total_days ?? records.length);
  const present = Number(summary.present ?? summary.days_present ?? records.filter((record) => record.status === 'Present').length);
  const absent = Number(summary.absent ?? summary.days_absent ?? records.filter((record) => record.status === 'Absent').length);
  const late = Number(summary.late ?? summary.late_entries ?? records.filter((record) => record.status === 'Late').length);
  const providedRate = summary.attendanceRate ?? summary.attendance_rate ?? summary.rate;
  return {
    ...emptySummary,
    ...summary,
    total,
    present,
    absent,
    late,
    daysPresent: present,
    daysAbsent: absent,
    lateEntries: late,
    attendanceRate:
      providedRate == null
        ? total
          ? Math.round((present / total) * 100)
          : 0
        : Number(providedRate),
  };
};

const getMonthlyData = async (month, session, studentId, year) => {
  if (!isApiConfigured || !studentId) {
    return { records: [], summary: emptySummary };
  }

  const monthValue = String(month ?? "");
  const monthMatch = monthValue.match(/^(\d{4})-(\d{1,2})$/);
  const requestMonth = monthMatch ? Number(monthMatch[2]) : Number(monthValue);
  const requestYear = monthMatch ? Number(monthMatch[1]) : Number(year);
  if (
    !Number.isInteger(requestMonth) ||
    requestMonth < 1 ||
    requestMonth > 12 ||
    !Number.isInteger(requestYear)
  ) {
    throw new ApiError("Select a valid attendance month and year.", 400);
  }

  const payload = await apiRequest(`/parents/child/${encodeURIComponent(String(studentId))}/attendance`, {
    token: session?.token,
    query: { month: requestMonth, year: requestYear },
  });
  if (payload?.success === false) {
    const message =
      typeof payload.message === "string"
        ? payload.message
        : "Unable to load attendance for the selected month.";
    throw new ApiError(message, 200, payload);
  }
  const records = recordsFrom(payload);
  return {
    records,
    summary: summaryFrom(payload?.data?.summary || payload?.summary, records),
  };
};

export const attendanceApi = {
  async getSummary(date, session, studentId) {
    const dateValue = String(date || '');
    return (await getMonthlyData(dateValue.slice(0, 7), session, studentId)).summary;
  },

  async getByDate(date, search, session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/attendance/daily', {
      token: session?.token,
      query: { date, search },
    });
    return recordsFrom(payload);
  },

  async getMonthly(month, session, studentId) {
    return (await getMonthlyData(month, session, studentId)).records;
  },

  async getMonthlyData(month, session, studentId) {
    return getMonthlyData(month, session, studentId);
  },

  async getHistory(params, session) {
    if (!isApiConfigured) return { records: [], summary: emptySummary };
    const payload = await apiRequest('/attendance/history', {
      token: session?.token,
      query: params,
    });
    return {
      records: recordsFrom(payload),
      summary: payload?.summary || emptySummary,
    };
  },

  async getBiometric(params, session) {
    if (!isApiConfigured) return [];
    const payload = await apiRequest('/attendance/biometric', {
      token: session?.token,
      query: params,
    });
    return recordsFrom(payload);
  },

  async runCutoff(date, session) {
    if (!isApiConfigured) return { processed: 0 };
    return apiRequest('/attendance/cutoff', {
      method: 'POST',
      token: session?.token,
      body: { date },
    });
  },

  async submit(records, session) {
    if (!isApiConfigured) return { submitted: 0 };
    return apiRequest('/attendance/submit', {
      method: 'POST',
      token: session?.token,
      body: { records },
    });
  },

  async export(params, session) {
    if (!isApiConfigured) return null;
    return apiRequest('/attendance/export', {
      token: session?.token,
      query: params,
    });
  },
};
