import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { teacherApi } from '../services/teacherApi';
import { teacherDashboardMock } from '../services/teacherMock';
import TeacherAttendanceScreen from './TeacherAttendanceScreen';
import TeacherGatePassScreen from './TeacherGatePassScreen';
import TeacherHomeworkEvaluationScreen from './TeacherHomeworkEvaluationScreen';
import TeacherHomeworkScreen from './TeacherHomeworkScreen';
import TeacherLeaveManagementScreen from './TeacherLeaveManagementScreen';

const colors = {
  ink: '#17343B',
  muted: '#6A7F83',
  line: '#D9E7E4',
  canvas: '#F4F8F6',
  white: '#FFFFFF',
  navy: '#123B43',
  blue: '#0D8B82',
  paleBlue: '#E5F4F0',
  teal: '#168A7C',
  paleTeal: '#E2F4EE',
  orange: '#D9822B',
  paleOrange: '#FFF1DF',
  red: '#C65353',
  plum: '#5A4AB6',
  softLilac: '#F5F1FF',
  noticeBackground: '#EAF4FF',
  };

const primaryNavItems = [
  { label: 'Home', icon: 'home-outline' },
  { label: 'Attendance', icon: 'calendar-outline' },
  { label: 'Gate Pass', module: 'Gate Pass', icon: 'log-out-outline' },
  { label: 'Homework', icon: 'book-outline' },
  { label: 'Leave Management', module: 'Leave', icon: 'document-text-outline' },
  { label: 'Timetable', module: 'Timetable', icon: 'time-outline' },
  { label: 'More', icon: 'menu-outline' },
];

const moreNavItems = [
  'My Students',
  'Exams / Marks',
  'Timetable',
  'Leave',
  'Messaging',
  'Notifications',
  'Reports',
  'Gate Pass',
  'OMR System',
];

const moreModuleIcons = {
  'My Students': 'people-outline',
  'Exams / Marks': 'ribbon-outline',
  Timetable: 'time-outline',
  Leave: 'document-text-outline',
  Messaging: 'chatbubble-ellipses-outline',
  Notifications: 'notifications-outline',
  Reports: 'bar-chart-outline',
  'Gate Pass': 'log-out-outline',
  'OMR System': 'scan-outline',
};

const legacyQuickActions = [
  ['Mark Attendance', 'calendar-outline', 'Record daily presence and absences', '#E0F2FE'],
  ['Post Homework', 'book-outline', 'Assign daily coursework to students', '#DCFCE7'],
  ['Grade Exams', 'ribbon-outline', 'Review and grade student submissions', '#FEF3C7'],
  ['My Schedule', 'time-outline', 'View personalized weekly schedule', '#F3E8FF'],
];
const shortcutColors = [
  colors.paleBlue,
  colors.paleTeal,
  colors.paleOrange,
  colors.softLilac,
];

const operationColors = [
  colors.paleOrange,
  colors.softLilac,
  colors.paleTeal,
  colors.paleBlue,
];
const defaultDashboard = teacherDashboardMock;

function Icon({ name, size = 20, color = colors.ink }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function SectionTitle({ title, action, onAction }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <Pressable onPress={onAction}>
          <Text style={styles.seeAll}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

function TeacherStatCard({ icon, label, value, detail, tint, iconColor, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.summaryCard, { backgroundColor: tint }, pressed && styles.pressed]}>
      <View style={[styles.summaryIcon, { backgroundColor: tint }]}>
        <Icon name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryDetail}>{detail}</Text>
    </Pressable>
  );
}

function DashboardShortcut({ title, icon, onPress , backgroundColor}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.moduleCard, { backgroundColor }, pressed && styles.pressed]}>
      <View style={styles.moduleIcon}>
        <Icon name={icon} size={21} color={colors.blue} />
      </View>
      <Text style={styles.moduleTitle}>{title}</Text>
      <Icon name="arrow-forward" size={15} color={colors.blue} />
    </Pressable>
  );
}

function TeacherQuickAction({ title, description, icon, onPress, backgroundColor }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.moduleCard, { backgroundColor: backgroundColor }, pressed && styles.pressed]}>
      <View style={styles.moduleIcon}>
        <Icon name={icon} size={21} color={colors.blue} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.moduleTitle}>{title}</Text>
        <Text style={styles.moduleMeta}>{description}</Text>
      </View>
    </Pressable>
  );
}

function LegacyQuickAction({ label, icon, detail, backgroundColor, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionCard, { backgroundColor }, pressed && styles.pressed]}
    >
      <View style={styles.actionIcon}>
        <Icon name={icon} color={colors.blue} />
      </View>
      <Text style={styles.actionTitle}>{label}</Text>
      <Text style={styles.actionDetail}>{detail}</Text>
      <Icon name="arrow-forward" size={16} color={colors.blue} />
    </Pressable>
  );
}

function AttendanceVelocityChart({ data }) {
  const maxValue = useMemo(() => Math.max(...data.map((item) => item.value), 100), [data]);
  const average = Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length);

  return (
    <View style={styles.listCard}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Attendance Velocity Chart</Text>
        <Text style={styles.chip}>WEEKLY AVG: {average}%</Text>
      </View>

      <View style={styles.chartArea}>
        <View style={styles.yAxis}>
          {[100, 90, 80, 70, 60].map((level) => (
            <Text key={level} style={styles.axisLabel}>{level}</Text>
          ))}
        </View>

        <View style={styles.chartColumnsWrap}>
          {data.map((item) => (
            <View key={item.day} style={styles.chartColumn}>
              <View style={styles.chartBarWrap}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: Math.max((item.value / maxValue) * 120, 18),
                      backgroundColor: item.value >= 91 ? colors.blue : colors.orange,
                    },
                  ]}
                />
              </View>
              <Text style={styles.chartValue}>{item.value}%</Text>
              <Text style={styles.chartDay}>{item.day}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function FacultyNoticeBoard({ notices }) {
  return (
    <View style={styles.listCard}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Faculty Notice Board</Text>
        <View style={styles.noticeLiveWrap}>
          <View style={styles.noticeLiveDot} />
          <Text style={styles.noticeLiveText}>LIVE</Text>
        </View>
      </View>

      {notices.map((notice, index) => (
        <View key={`${notice.date}-${notice.title}-${index}`} style={styles.noticeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeType}>{notice.category || 'General'}</Text>
            <Text style={styles.noticeDate}>{notice.date}</Text>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            {notice.description ? <Text style={styles.noticeDescription}>{notice.description}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function ModulePlaceholder({ title, icon, description }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Icon name={icon} size={26} color={colors.blue} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{description}</Text>
      <Pressable style={styles.primaryButton} onPress={() => Alert.alert('Ready', `${title} is ready for API integration.`)}>
        <Text style={styles.primaryButtonText}>View details</Text>
      </Pressable>
    </View>
  );
}

function DashboardScreen({ data, onNavigate, onSearch, query }) {
  const dashboardData = data?.dashboardData || defaultDashboard.dashboardData;
  const teacher = data?.teacher || defaultDashboard.teacher;
  const shortcuts = data?.shortcuts || defaultDashboard.shortcuts;
  const notices = data?.notices || defaultDashboard.notices;
  const quickActions = data?.quickActions || defaultDashboard.quickActions;
  const weeklyAttendance = data?.attendanceWeekly || defaultDashboard.attendanceWeekly;

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{getGreeting()}, {teacher.name.split(' ')[0]}! 👋</Text>
          <Text style={styles.school}>{teacher.school || 'Demo School'}</Text>
        </View>
        <View style={styles.accountBadge}>
          <Text style={styles.accountName}>Instructor</Text>
          <Text style={styles.accountCount}>{teacher.initials || 'S'}</Text>
        </View>
      </View>

      <View style={styles.studentSelector}>
        <View style={styles.studentAvatar}>
          <Text style={styles.studentAvatarText}>{teacher.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.studentLabel}>INSTRUCTOR OS</Text>
          <Text style={styles.studentName}>{teacher.name}</Text>
          <Text style={styles.studentClass}>{teacher.role}</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={17} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={onSearch}
          placeholder="Search anything..."
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.summaryGrid}>
        <TeacherStatCard icon="school-outline" label="Assigned Classes" value={String(dashboardData.activeLoad)} detail="Active Load" tint={colors.paleBlue} iconColor={colors.blue} onPress={() => onNavigate('My Students')} />
        <TeacherStatCard icon="people-outline" label="Total Students" value={String(dashboardData.totalStudents)} detail="Mentored" tint={colors.paleTeal} iconColor={colors.teal} onPress={() => onNavigate('My Students')} />
        <TeacherStatCard icon="pie-chart-outline" label="Attendance %" value={`${dashboardData.attendancePercentage}%`} detail="Average Today" tint={colors.paleOrange} iconColor={colors.orange} onPress={() => onNavigate('Attendance')} />
        <TeacherStatCard icon="clipboard-outline" label="Pending Marks" value={String(dashboardData.pendingMarks)} detail="Grade Audit" tint={colors.softLilac} iconColor={colors.plum} onPress={() => onNavigate('Exams / Marks')} />
      </View>

      <SectionTitle title="Dashboard Shortcuts" />
      <View style={styles.moduleGrid}>
        {shortcuts.map((shortcut, index) => (
          <DashboardShortcut key={shortcut.title} title={shortcut.title} icon={shortcut.icon} backgroundColor={shortcutColors[index % shortcutColors.length]} onPress={() => onNavigate(shortcut.target)} />
        ))}
      </View>

      <AttendanceVelocityChart data={weeklyAttendance} />

      <SectionTitle title="Instructional Operations" />
      <View style={styles.moduleGrid}>
        {quickActions.map((action, index) =>(
          <TeacherQuickAction key={action.title} title={action.title} description={action.description} icon={action.icon} backgroundColor={operationColors[index % operationColors.length]} onPress={() => onNavigate(action.target)} />
        ))}
      </View>

      <SectionTitle title="Quick actions" />
      <View style={styles.actionGrid}>
        {legacyQuickActions.map(([label, icon, detail, backgroundColor]) => (
          <LegacyQuickAction
            key={label}
            label={label}
            icon={icon}
            detail={detail}
            backgroundColor={backgroundColor}
            onPress={() => onNavigate(label === 'My Schedule' ? 'Timetable' : label === 'Mark Attendance' ? 'Attendance' : label === 'Post Homework' ? 'Homework' : 'Exams / Marks')}
          />
        ))}
      </View>

      <FacultyNoticeBoard notices={notices} />
    </ScrollView>
  );
}

export default function TeacherPortalScreen({ session, onLogout }) {
  const [activeModule, setActiveModule] = useState('Home');
  const [dashboardData, setDashboardData] = useState(defaultDashboard);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [homeworkMenuOpen, setHomeworkMenuOpen] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await teacherApi.getDashboard(session);
      setDashboardData(data);
    } catch (err) {
      setError('Unable to load dashboard data. Showing local demo data.');
      setDashboardData(defaultDashboard);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [session]);

  const handleNavigate = (module) => {
    if (!module) return;
    setActiveModule(module);
    setMoreOpen(false);
  };

  const signOut = () => Alert.alert('Signed out', 'Demo sign out complete.', [{ text: 'OK', onPress: onLogout }]);

  const renderModuleView = () => {
    if (activeModule === 'Attendance') {
      return <TeacherAttendanceScreen session={session} onBack={() => setActiveModule('Home')} />;
    }

    if (activeModule === 'Home') {
      return (
        <>
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={colors.blue} />
              <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <DashboardScreen data={dashboardData} query={search} onSearch={setSearch} onNavigate={handleNavigate} />
        </>
      );
    }

    if (activeModule === 'My Students') {
      return <ModulePlaceholder title="My Students" icon="people-outline" description="Student groups, mentor list, and class allocation are ready for future API integration." />;
    }

    if (activeModule === 'Homework') {
      return <TeacherHomeworkScreen session={session} />;
    }

    if (activeModule === 'Homework Evaluation') {
      return <TeacherHomeworkEvaluationScreen session={session} />;
    }

    if (activeModule === 'Exams / Marks') {
      return <ModulePlaceholder title="Exams / Marks" icon="ribbon-outline" description="Mark evaluation, grade review, and score publishing will appear here." />;
    }

    if (activeModule === 'Timetable') {
      return <ModulePlaceholder title="Timetable" icon="time-outline" description="View the daily and weekly class timetable for faculty planning." />;
    }

    if (activeModule === 'Leave') {
      return <TeacherLeaveManagementScreen session={session} />;
    }

    if (activeModule === 'Messaging') {
      return <ModulePlaceholder title="Messaging" icon="chatbubble-ellipses-outline" description="Parent and staff communication channels can be connected to this screen." />;
    }

    if (activeModule === 'Notifications') {
      return <ModulePlaceholder title="Notifications" icon="notifications-outline" description="Live updates, alerts, and announcements for the teaching staff." />;
    }

    if (activeModule === 'Reports') {
      return <ModulePlaceholder title="Reports" icon="bar-chart-outline" description="Attendance, academic performance, and operational insights will be displayed here." />;
    }

    if (activeModule === 'Gate Pass') {
      return <TeacherGatePassScreen session={session} />;
    }

    if (activeModule === 'OMR System') {
      return <ModulePlaceholder title="OMR System" icon="scan-outline" description="OMR evaluation workflows can be connected to this module in a future release." />;
    }

    return <ModulePlaceholder title={activeModule} icon="grid-outline" description="This teacher module is ready for data integration." />;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>DEMO SCHOOL</Text>
          <Text style={styles.portal}>Teacher portal <Text style={styles.year}>2026–27</Text></Text>
        </View>
        <Pressable onPress={signOut} style={styles.logout}>
          <Icon name="log-out-outline" size={18} color="#C8DBF2" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {activeModule !== 'Home' && activeModule !== 'Attendance' && activeModule !== 'Homework Evaluation' ? <View style={styles.pageHeading}><Text style={styles.pageTitle}>{activeModule}</Text></View> : null}

      {renderModuleView()}

      <View style={styles.bottomNav}>
        {primaryNavItems.map((item) => {
          const module = item.module || item.label;
          const isActive = item.label === 'More'
            ? moreNavItems.includes(activeModule)
            : item.label === 'Homework'
              ? activeModule === 'Homework' || activeModule === 'Homework Evaluation' || homeworkMenuOpen
              : activeModule === module;

          return (
            <Pressable
              key={item.label}
              onPress={() => {
                if (item.label === 'More') {
                  setMoreOpen(true);
                  return;
                }
                if (item.label === 'Homework') {
                  setHomeworkMenuOpen((value) => !value);
                  return;
                }
                setActiveModule(module);
              }}
              style={({ pressed }) => [styles.navItem, isActive && styles.navItemActive, pressed && styles.pressed]}
            >
              <Icon name={item.icon} size={21} color={isActive ? colors.blue : colors.muted} />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Modal transparent visible={homeworkMenuOpen} animationType="slide" onRequestClose={() => setHomeworkMenuOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setHomeworkMenuOpen(false)}>
          <View style={styles.moreSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Homework</Text>
              <Pressable onPress={() => setHomeworkMenuOpen(false)}><Icon name="close" size={22} color={colors.ink} /></Pressable>
            </View>
            <Pressable
              style={({ pressed }) => [styles.moreItem, activeModule === 'Homework' && styles.moreItemActive, pressed && styles.pressed]}
              onPress={() => { setHomeworkMenuOpen(false); setActiveModule('Homework'); }}
            >
              <View style={styles.moreItemIconWrap}><Icon name="add-circle-outline" size={18} color={colors.blue} /></View>
              <View style={styles.moreItemCopy}>
                <Text style={styles.moreItemTitle}>Add Homework</Text>
                <Text style={styles.moreItemDescription}>Create and manage assignments</Text>
              </View>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.moreItem, activeModule === 'Homework Evaluation' && styles.moreItemActive, pressed && styles.pressed]}
              onPress={() => { setHomeworkMenuOpen(false); setActiveModule('Homework Evaluation'); }}
            >
              <View style={styles.moreItemIconWrap}><Icon name="checkmark-done-outline" size={18} color={colors.blue} /></View>
              <View style={styles.moreItemCopy}>
                <Text style={styles.moreItemTitle}>Homework Evaluation</Text>
                <Text style={styles.moreItemDescription}>Review student submissions</Text>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal transparent visible={moreOpen} animationType="slide" onRequestClose={() => setMoreOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMoreOpen(false)}>
          <View style={styles.moreSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Teacher Modules</Text>
              <Pressable onPress={() => setMoreOpen(false)}><Icon name="close" size={22} color={colors.ink} /></Pressable>
            </View>
            {moreNavItems.map((item) => (
              <Pressable
                key={item}
                onPress={() => handleNavigate(item)}
                style={({ pressed }) => [styles.moreItem, activeModule === item && styles.moreItemActive, pressed && styles.pressed]}
              >
                <View style={styles.moreItemIconWrap}><Icon name={moreModuleIcons[item]} size={18} color={activeModule === item ? colors.blue : colors.ink} /></View>
                <View style={styles.moreItemCopy}>
                  <Text style={[styles.moreItemTitle, activeModule === item && styles.moreItemTextActive]}>{item}</Text>
                  <Text style={styles.moreItemDescription}>{
                    item === 'My Students' ? 'View assigned students' :
                    item === 'Exams / Marks' ? 'Review examination marks' :
                    item === 'Timetable' ? 'View teaching schedule' :
                    item === 'Leave' ? 'Apply and manage leave' :
                    item === 'Messaging' ? 'Communicate with students and parents' :
                    item === 'Notifications' ? 'View notifications' :
                    item === 'Reports' ? 'View teaching reports' :
                    item === 'Gate Pass' ? 'Manage gate pass requests' :
                    'Manage OMR examinations'
                  }</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { color: '#A9C6E8', fontSize: 11, letterSpacing: 1.8, fontWeight: '800' },
  portal: { color: colors.white, fontSize: 22, fontWeight: '800', marginTop: 4 },
  year: { color: '#8EB7E8', fontSize: 13, fontWeight: '600' },
  logout: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoutText: { color: '#C8DBF2', fontSize: 13, fontWeight: '700' },
  pageHeading: { paddingHorizontal: 20, paddingBottom: 8 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: colors.ink },
  content: { padding: 20, paddingBottom: 110 },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  greeting: { color: colors.ink, fontSize: 24, fontWeight: '900', lineHeight: 31 },
  school: { color: colors.muted, fontSize: 12, marginTop: 6 },
  accountBadge: { alignItems: 'flex-end', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 10, minWidth: 92 },
  accountName: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  accountCount: { color: colors.blue, fontSize: 20, fontWeight: '900', marginTop: 4 },
  studentSelector: { backgroundColor: colors.navy, borderRadius: 13, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 18 },
  studentAvatar: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#2E5D91', alignItems: 'center', justifyContent: 'center' },
  studentAvatarText: { color: colors.white, fontSize: 18, fontWeight: '900' },
  studentLabel: { color: '#B8D0EC', fontSize: 10, fontWeight: '800' },
  studentName: { color: colors.white, fontSize: 16, fontWeight: '900', marginTop: 2 },
  studentClass: { color: '#B8D0EC', fontSize: 11, marginTop: 2 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 8, color: colors.ink, fontSize: 14 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  summaryCard: { width: '48%', minHeight: 145, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 13 },
  summaryIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  summaryLabel: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  summaryValue: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 6 },
  summaryDetail: { color: colors.muted, fontSize: 9, marginTop: 5 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  seeAll: { color: colors.blue, fontSize: 12, fontWeight: '800' },
  chip: { color: colors.blue, fontSize: 10, fontWeight: '900', letterSpacing: 0.7 },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  moduleCard: { width: '48%', minHeight: 74, borderWidth: 1, borderColor: colors.line, borderRadius: 11, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  moduleIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.paleBlue, alignItems: 'center', justifyContent: 'center' },
  moduleTitle: { color: colors.ink, fontSize: 11, fontWeight: '900', lineHeight: 15, flex: 1 },
  moduleMeta: { color: colors.muted, fontSize: 10, marginTop: 4 },
  listCard: { backgroundColor:  '#EAF4FF', borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 14, marginBottom: 18 },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 6 },
  yAxis: { width: 26, justifyContent: 'space-between', height: 150, paddingBottom: 26 },
  axisLabel: { color: colors.muted, fontSize: 10, textAlign: 'right' },
  chartColumnsWrap: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 170, paddingLeft: 10 },
  chartColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', marginHorizontal: 2 },
  chartBarWrap: { width: 26, height: 120, justifyContent: 'flex-end', alignItems: 'center', borderRadius: 10, backgroundColor: colors.canvas, overflow: 'hidden' },
  chartBar: { width: '100%', borderRadius: 10, minHeight: 18 },
  chartValue: { color: colors.muted, fontSize: 10, marginTop: 8, marginBottom: 6 },
  chartDay: { color: colors.ink, fontWeight: '700', fontSize: 11 },
  noticeLiveWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  noticeLiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red },
  noticeLiveText: { color: colors.red, fontWeight: '800', fontSize: 10 },
  noticeRow: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line },
  noticeType: { color: colors.orange, fontSize: 10, fontWeight: '900', marginBottom: 4 },
  noticeDate: { color: colors.muted, fontSize: 11, marginBottom: 6 },
  noticeTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  noticeDescription: { color: colors.muted, fontSize: 12, marginTop: 6 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  actionCard: { width: '48%', minHeight: 146, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 13 },
  actionIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  actionTitle: { color: colors.ink, fontSize: 13, fontWeight: '900', marginBottom: 5 },
  actionDetail: { color: colors.muted, fontSize: 11, lineHeight: 16, flex: 1, marginBottom: 8 },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 9,
    paddingBottom: 10,
    minHeight: 74,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 7 },
  navItemActive: { backgroundColor: colors.paleBlue },
  navLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  navLabelActive: { color: colors.blue, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 31, 0.35)', justifyContent: 'flex-end' },
  moreSheet: { backgroundColor: colors.white, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  moreItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, paddingVertical: 12, marginTop: 8 },
  moreItemActive: { backgroundColor: colors.paleBlue, borderColor: colors.blue },
  moreItemIconWrap: { width: 32, height: 32, borderRadius: 9, backgroundColor: colors.paleBlue, alignItems: 'center', justifyContent: 'center' },
  moreItemCopy: { flex: 1 },
  moreItemTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  moreItemTextActive: { color: colors.blue },
  moreItemDescription: { color: colors.muted, fontSize: 11, marginTop: 3 },
  loadingState: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  loadingText: { color: colors.muted, fontSize: 12 },
  errorText: { color: colors.red, backgroundColor: '#FDECEC', borderRadius: 10, padding: 14, marginHorizontal: 20, marginBottom: 16, textAlign: 'center' },
  emptyState: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 24, alignItems: 'center', marginHorizontal: 20, marginTop: 16, marginBottom: 100 },
  emptyIconWrap: { width: 52, height: 52, borderRadius: 15, backgroundColor: colors.paleBlue, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginBottom: 8 },
  emptySubtitle: { color: colors.muted, fontSize: 12, textAlign: 'center', marginBottom: 18 },
  primaryButton: { backgroundColor: colors.blue, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12 },
  primaryButtonText: { color: colors.white, fontWeight: '800', fontSize: 13 },
  pressed: { opacity: 0.7 },
});

export { moreNavItems, primaryNavItems };

