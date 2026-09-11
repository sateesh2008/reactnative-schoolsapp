export const parentAttendanceSample = [
  { id: '2026-09-10', date: '10 Sept 2026', day: 'Thursday', status: 'Present' },
  { id: '2026-09-09', date: '9 Sept 2026', day: 'Wednesday', status: 'Present', biometricPunch: '09:19:02' },
  { id: '2026-09-08', date: '8 Sept 2026', day: 'Tuesday', status: 'Present' },
  { id: '2026-09-07', date: '7 Sept 2026', day: 'Monday', status: 'Present', biometricPunch: '09:11:47' },
  { id: '2026-09-04', date: '4 Sept 2026', day: 'Friday', status: 'Half Day', biometricPunch: '10:38:24' },
  { id: '2026-09-03', date: '3 Sept 2026', day: 'Thursday', status: 'Present', biometricPunch: '09:12:57' },
  { id: '2026-09-02', date: '2 Sept 2026', day: 'Wednesday', status: 'Present', biometricPunch: '09:10:44' },
  { id: '2026-09-01', date: '1 Sept 2026', day: 'Tuesday', status: 'Half Day', biometricPunch: '15:55:54' },
];

export const parentAttendanceSampleSummary = {
  totalEnrolled: 8,
  markedEntries: 8,
  presentToday: 6,
  absentCount: 0,
  lateArrivals: 0,
  attendanceRate: 75,
  daysPresent: 6,
  daysAbsent: 0,
  lateEntries: 0,
  canMarkAttendance: false,
};