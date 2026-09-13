import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

const colors = { navy: '#123B43', blue: '#0D8B82', ink: '#17343B', muted: '#6A7F83', line: '#D9E7E4', canvas: '#F4F8F6', white: '#FFFFFF', paleBlue: '#E5F4F0', paleTeal: '#E2F4EE', paleOrange: '#FFF1DF', teal: '#168A7C', orange: '#D9822B' };
const actions = [
  ['Mark Attendance', 'calendar-outline', 'Record daily presence and absences'],
  ['Post Homework', 'book-outline', 'Assign daily coursework to students'],
  ['Grade Exams', 'ribbon-outline', 'Review and grade student submissions'],
  ['My Schedule', 'time-outline', 'View personalized weekly schedule'],
];
const notices = [['General', '17 Jul 2026', 'Sankranthi'], ['Holiday', '19 May 2026', 'Ugadi'], ['Holiday', '7 May 2026', 'Sankranthi holidays']];
const schedule = [['08:30', 'Class 1 Mathematics', 'Room 204'], ['09:20', 'Class 1 English', 'Room 204'], ['10:10', 'Class 2 Science', 'Lab 1'], ['11:30', 'Faculty planning', 'Staff room']];

function Icon({ name, size = 20, color = colors.ink }) { return <Ionicons name={name} size={size} color={color} />; }
function Metric({ icon, label, value, detail, tint, iconColor }) { return <View style={styles.metric}><View style={[styles.metricIcon, { backgroundColor: tint }]}><Icon name={icon} color={iconColor} /></View><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricDetail}>{detail}</Text></View>; }
function ScheduleView({ title }) { return <><Text style={styles.pageTitle}>{title}</Text><Text style={styles.subtle}>Demo School · 2026–27</Text><View style={styles.panel}>{schedule.map(([time, subject, room]) => <View style={styles.schedule} key={time}><Text style={styles.scheduleTime}>{time}</Text><View style={styles.scheduleLine} /><View style={{ flex: 1 }}><Text style={styles.actionTitle}>{subject}</Text><Text style={styles.subtle}>{room}</Text></View></View>)}</View></>; }

export default function TeacherPortalScreen({ onLogout }) {
  const [activeView, setActiveView] = useState('Home');
  const handleAction = (label) => {
    if (label === 'Mark Attendance') { Alert.alert('Attendance', 'Today\'s attendance is marked for Class 1.'); return; }
    Alert.alert(label, 'This demo action is ready to connect to the school API.');
  };
  const signOut = () => Alert.alert('Signed out', 'Demo sign out complete.', [{ text: 'OK', onPress: onLogout }]);
  return <SafeAreaView style={styles.safe}><StatusBar barStyle="light-content" backgroundColor={colors.navy} />
  <View style={styles.header}><View><Text style={styles.brand}>DEMO SCHOOL</Text><Text style={styles.portal}>Instructor OS <Text style={styles.year}>2026–27</Text></Text></View><Pressable onPress={signOut} style={styles.logout}><Icon name="log-out-outline" size={18} color="#C8DBF2" /><Text style={styles.logoutText}>Logout</Text></Pressable></View><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{activeView === 'Home' ? <>
  <View style={styles.greeting}><View><Text style={styles.eyebrow}>TEACHER DASHBOARD</Text><Text style={styles.title}>Welcome, sudarsan!</Text><Text style={styles.subtle}>Tuesday, 9 September 2026 · Teacher</Text></View>
  <View style={styles.avatar}><Text style={styles.avatarText}>SK</Text></View></View>
  <View style={styles.teacherBanner}>
  <View style={styles.teacherAvatar}><Text style={styles.teacherAvatarText}>SK</Text></View>
  <View style={{ flex: 1 }}><Text style={styles.teacherName}>sudarsan kumar</Text><Text style={styles.teacherMeta}>Teacher · Demo School</Text></View><Icon name="shield-checkmark" color="#9FC7F2" size={23} /></View>
  <View style={styles.metrics}><Metric icon="people-outline" label="Assigned classes" value="2" detail="Active load" tint={colors.paleBlue} iconColor={colors.blue} /><Metric icon="school-outline" label="Total students" value="45" detail="Mentored" tint={colors.paleTeal} iconColor={colors.teal} /><Metric icon="pie-chart-outline" label="Attendance %" value="94%" detail="Average today" tint={colors.paleOrange} iconColor={colors.orange} /><Metric icon="clipboard-outline" label="Pending marks" value="8" detail="Grade audit" tint="#F0ECFF" iconColor="#7760C8" /></View><Text style={styles.sectionTitle}>Instructional operations</Text>
  <View style={styles.actionGrid}>{actions.map(([label, icon, detail]) => <Pressable key={label} style={styles.actionCard} onPress={() => handleAction(label)}>
  <View style={styles.actionIcon}><Icon name={icon} color={colors.blue} /></View><Text style={styles.actionTitle}>{label}</Text><Text style={styles.actionDetail}>{detail}</Text><Icon name="arrow-forward" size={16} color={colors.blue} /></Pressable>)}</View><Text style={styles.sectionTitle}>Attendance velocity</Text>
  <View style={styles.panel}>
  <View style={styles.chartHeader}><View><Text style={styles.chartCaption}>WEEKLY AVERAGE</Text><Text style={styles.chartValue}>91%</Text></View><Icon name="trending-up" size={26} color={colors.teal} /></View>
  <View style={styles.chart}>{[82, 88, 91, 86, 95, 93].map((height, index) => <View key={index} style={styles.chartColumn}>
  <View style={[styles.chartBar, { height: height / 2, backgroundColor: index === 4 ? colors.blue : '#B9D6F5' }]} /><Text style={styles.chartLabel}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}</Text></View>)}</View></View><Text style={styles.sectionTitle}>Faculty notice board</Text>
  <View style={styles.panel}>{notices.map(([type, date, title]) => <View style={styles.notice} key={title}>
  <View style={styles.noticeDot} /><View style={{ flex: 1 }}>
  <View style={styles.noticeMeta}><Text style={styles.noticeType}>{type.toUpperCase()}</Text><Text style={styles.noticeDate}>{date}</Text></View><Text style={styles.noticeTitle}>{title}</Text></View><Icon name="chevron-forward" size={16} color="#A3ADBB" /></View>)}</View></> : <ScheduleView title={activeView} />}</ScrollView>
  {/* <View style={styles.bottomNav}>{['Home', 'My Classes', 'Schedule', 'Notices'].map((item) => <Pressable key={item} onPress={() => setActiveView(item)} style={styles.navItem}><Icon name={item === 'Home' ? 'home-outline' : item === 'My Classes' ? 'people-outline' : item === 'Schedule' ? 'time-outline' : 'megaphone-outline'} size={21} color={activeView === item ? colors.blue : colors.muted} /><Text style={[styles.navLabel, activeView === item && styles.navActive]}>{item}</Text></Pressable>)}</View> */}
    <View style={styles.bottomNav}>
  {['Home', 'My Classes', 'Schedule', 'Notices'].map((item) => {
    const tabColors = {
      Home: '#E0F2FE',
      'My Classes': '#DCFCE7',
      Schedule: '#FEF3C7',
      Notices: '#F3E8FF',
    };

    const activeColors = {
      Home: '#0284C7',
      'My Classes': '#16A34A',
      Schedule: '#D97706',
      Notices: '#9333EA',
    };

    const iconName =
      item === 'Home'
        ? 'home-outline'
        : item === 'My Classes'
        ? 'people-outline'
        : item === 'Schedule'
        ? 'time-outline'
        : 'megaphone-outline';

    const isActive = activeView === item;

    return (
      <Pressable
        key={item}
        onPress={() => setActiveView(item)}
        style={[
          styles.navItem,
          {
            backgroundColor: isActive
              ? activeColors[item]
              : tabColors[item],
          },
        ]}
      >
        <Icon
          name={iconName}
          size={21}
          color={isActive ? colors.white : activeColors[item]}
        />

        <Text
          style={[
            styles.navLabel,
            {
              color: isActive ? colors.white : activeColors[item],
            },
          ]}
        >
          {item}
        </Text>
      </Pressable>
    );
  })}
</View>
  </SafeAreaView>; 
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas }, header: { backgroundColor: colors.navy, paddingHorizontal: 22, paddingTop: 18, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, brand: { color: '#A9C6E8', fontSize: 11, letterSpacing: 1.8, fontWeight: '800' }, portal: { color: colors.white, fontSize: 21, fontWeight: '800', marginTop: 4 }, year: { color: '#8EB7E8', fontSize: 13 }, logout: { flexDirection: 'row', alignItems: 'center', gap: 6 }, logoutText: { color: '#C8DBF2', fontSize: 13, fontWeight: '700' }, content: { padding: 20, paddingBottom: 90 }, greeting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }, eyebrow: { color: colors.blue, fontSize: 10, fontWeight: '900', letterSpacing: 0.7 }, title: { color: colors.ink, fontSize: 24, fontWeight: '900', marginTop: 6 }, subtle: { color: colors.muted, fontSize: 12, marginTop: 4 }, avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#DCEBFB', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.blue, fontWeight: '900' }, teacherBanner: { backgroundColor: colors.navy, borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 17 }, teacherAvatar: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#2E5D91', alignItems: 'center', justifyContent: 'center', marginRight: 12 }, teacherAvatarText: { color: colors.white, fontWeight: '900' }, teacherName: { color: colors.white, fontSize: 16, fontWeight: '900' }, teacherMeta: { color: '#B8D0EC', fontSize: 11, marginTop: 3 }, metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 }, metric: { width: '48%', minHeight: 139, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 13 }, metricIcon: { width: 31, height: 31, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 11 }, metricLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' }, metricValue: { color: colors.ink, fontSize: 20, fontWeight: '900', marginTop: 5 }, metricDetail: { color: colors.muted, fontSize: 10, marginTop: 3 }, sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginBottom: 10, marginTop: 3 }, actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 21 }, actionCard: { width: '48%', minHeight: 147, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 13 }, actionIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: colors.paleBlue, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }, actionTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' }, actionDetail: { color: colors.muted, fontSize: 10, lineHeight: 14, marginTop: 5, marginBottom: 8 }, panel: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 15, marginBottom: 22 }, chartHeader: { flexDirection: 'row', justifyContent: 'space-between' }, chartCaption: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.7 }, chartValue: { color: colors.ink, fontSize: 24, fontWeight: '900', marginTop: 3 }, chart: { height: 115, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', marginTop: 10 }, chartColumn: { alignItems: 'center', justifyContent: 'flex-end', height: 112 }, chartBar: { width: 18, borderRadius: 5, marginBottom: 7 }, chartLabel: { color: colors.muted, fontSize: 10 }, notice: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line }, noticeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue }, noticeMeta: { flexDirection: 'row', gap: 8 }, noticeType: { color: colors.blue, fontSize: 9, fontWeight: '900' }, noticeDate: { color: colors.muted, fontSize: 10 }, noticeTitle: { color: colors.ink, fontSize: 13, fontWeight: '800', marginTop: 4 },
  // bottomNav: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 9, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-around' }, 
  // navItem: { alignItems: 'center', width: '25%' }, 
  // navLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', marginTop: 4 }, 
  // navActive: { color: colors.blue, fontWeight: '900' },
  bottomNav: {
  backgroundColor: colors.white,
  borderTopWidth: 1,
  borderTopColor: colors.line,
  paddingTop: 8,
  paddingBottom: 8,
  paddingHorizontal: 8,
  flexDirection: 'row',
  justifyContent: 'space-between',
},

navItem: {
  alignItems: 'center',
  justifyContent: 'center',
  width: '23%',
  height: 58,
  borderRadius: 12,
},

navLabel: {
  fontSize: 10,
  fontWeight: '700',
  marginTop: 4,
},

navActive: {
  fontWeight: '900',
},
  pageTitle: { color: colors.ink, fontSize: 26, fontWeight: '900', marginBottom: 4 }, 
  schedule: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.line },
  scheduleTime: { color: colors.blue, fontSize: 12, fontWeight: '900', width: 44 }, scheduleLine: { height: 30, width: 2, backgroundColor: '#BFD8F5' },
});
