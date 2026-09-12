export const teacherProfile = {
  name: 'sudarsan kumar',
  initials: 'SK',
  role: 'Teacher',
  school: 'Demo School',
  academicYear: '2026-2027',
};

export const teacherDashboardData = {
  activeLoad: 8,
  totalStudents: 45,
  attendancePercentage: 94,
  pendingMarks: 8,
  weeklyAttendance: [
    { day: 'Mon', value: 88 },
    { day: 'Tue', value: 92 },
    { day: 'Wed', value: 90 },
    { day: 'Thu', value: 94 },
    { day: 'Fri', value: 91 },
    { day: 'Sat', value: 91 },
  ],
  notices: [
    { category: 'General', date: '17/07/2026', title: 'Sankranthi', description: 'Holiday' },
    { category: 'General', date: '19/05/2026', title: 'UGADI', description: 'Holiday' },
    { category: 'General', date: '07/05/2026', title: 'SANKRANTHI HOILDAYS', description: '' },
  ],
  quickActions: [
    {
      title: 'Post New Homework',
      description: 'Assign daily coursework to students',
      icon: 'book-outline',
      target: 'Homework',
    },
    {
      title: 'Exam Grading & Evaluation',
      description: 'Review & grade student submissions',
      icon: 'ribbon-outline',
      target: 'Exams / Marks',
    },
    {
      title: 'Student Daily Attendance',
      description: 'Record daily presence & absences',
      icon: 'calendar-outline',
      target: 'Attendance',
    },
    {
      title: 'Faculty Class Timetable',
      description: 'View personalized weekly schedule',
      icon: 'time-outline',
      target: 'Timetable',
    },
  ],
  shortcuts: [
    { title: 'Attendance', description: 'Today’s class reports', icon: 'calendar-outline', target: 'Attendance' },
    { title: 'Post Homework', description: 'Assigned coursework', icon: 'book-outline', target: 'Homework' },
    { title: 'Grade Exams', description: 'Evaluate marks', icon: 'create-outline', target: 'Exams / Marks' },
    { title: 'My Schedule', description: 'Faculty timetable', icon: 'time-outline', target: 'Timetable' },
    { title: 'My Classes', description: 'Class groups', icon: 'people-outline', target: 'My Students' },
    { title: 'Faculty Notices', description: 'Live updates', icon: 'megaphone-outline', target: 'Notifications' },
  ],
};

export const teacherDashboardStats = {
  activeLoad: teacherDashboardData.activeLoad,
  totalStudents: teacherDashboardData.totalStudents,
  attendancePercentage: teacherDashboardData.attendancePercentage,
  pendingMarks: teacherDashboardData.pendingMarks,
};

export const teacherAttendanceWeekly = teacherDashboardData.weeklyAttendance;
export const teacherQuickActions = teacherDashboardData.quickActions;
export const teacherShortcuts = teacherDashboardData.shortcuts;
export const teacherNotices = teacherDashboardData.notices;

export const teacherNavigationModules = [
  'Dashboard',
  'My Students',
  'Attendance',
  'Homework',
  'Exams / Marks',
  'Timetable',
  'Leave',
  'Messaging',
  'Notifications',
  'Reports',
  'Gate Pass',
  'OMR System',
];

export const teacherDashboardMock = {
  teacher: teacherProfile,
  dashboardData: teacherDashboardData,
  dashboardStats: teacherDashboardStats,
  attendanceWeekly: teacherAttendanceWeekly,
  quickActions: teacherQuickActions,
  shortcuts: teacherShortcuts,
  notices: teacherNotices,
  modules: teacherNavigationModules,
};

export const teacherAttendanceMock = {
  summary: { totalEnrolled: 0, markedEntries: 0, presentToday: 0, absentCount: 0, lateArrivals: 0 },
  records: [],
  classes: ['Class 1', 'Class 2'],
  sections: ['A', 'B'],
  subjects: ['Mathematics', 'English', 'Science'],
};
