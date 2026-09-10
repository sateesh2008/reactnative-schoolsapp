import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
};

const navItems = [
  { label: 'Home', icon: 'home-outline' },
  { label: 'Attendance', icon: 'calendar-outline' },
  { label: 'Fees', icon: 'wallet-outline' },
  { label: 'Homework', icon: 'book-outline' },
  { label: 'Exams', icon: 'ribbon-outline' },
  { label: 'Timetable', icon: 'time-outline' },
];

const notices = [
  { type: 'Finance', date: '9 Sep 2026', title: 'Fees outstanding: ₹1,80,186', color: colors.red },
  { type: 'Compliance', date: '9 Sep 2026', title: 'Attendance alert: 65%', color: colors.orange },
  { type: 'General', date: '17 Jul 2026', title: 'Sankranthi', color: colors.blue },
  { type: 'Holiday', date: '19 May 2026', title: 'Ugadi', color: colors.teal },
  { type: 'General', date: '13 Apr 2026', title: 'Annual Exam', color: colors.blue },
  { type: 'General', date: '10 Apr 2026', title: 'Annual Day Celebrations', color: colors.blue },
];

const homeworkItems = [
  { subject: 'Mathematics', title: 'Practice multiplication tables 2 to 10', due: 'Due tomorrow', done: false },
  { subject: 'English', title: 'Read chapter 4 and write five new words', due: 'Due 12 Sep', done: false },
  { subject: 'Science', title: 'Complete the plants worksheet', due: 'Submitted', done: true },
];

const schedule = [
  ['08:30', 'Mathematics', 'Room 204'],
  ['09:20', 'English', 'Room 204'],
  ['10:10', 'Science', 'Lab 1'],
  ['11:30', 'Hindi', 'Room 204'],
  ['12:20', 'Art & Craft', 'Art Studio'],
];

function Icon({ name, size = 20, color = colors.ink }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function StatCard({ icon, label, value, detail, tint, iconColor, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.statCard, pressed && styles.pressed]}>
      <View style={[styles.statIcon, { backgroundColor: tint }]}><Icon name={icon} color={iconColor} /></View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statDetail}>{detail}</Text>
    </Pressable>
  );
}

function SectionTitle({ title, action, onAction }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && <Pressable onPress={onAction}><Text style={styles.seeAll}>{action}</Text></Pressable>}
    </View>
  );
}

function HomeContent({ goTo }) {
  return (
    <>
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.eyebrow}>TUESDAY, 9 SEPTEMBER 2026</Text>
          <Text style={styles.greeting}>Good morning, Joshi</Text>
          <Text style={styles.subtle}>Here is today&apos;s school update.</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>J</Text></View>
      </View>
      <View style={styles.studentBanner}>
        <View style={styles.studentInitial}><Text style={styles.studentInitialText}>J</Text></View>
        <View style={{ flex: 1 }}><Text style={styles.studentName}>joshii</Text><Text style={styles.studentMeta}>Class 1 · Section A · Roll No. 3424</Text></View>
        <Icon name="chevron-forward" color="#A7C5E9" />
      </View>
      <View style={styles.statsGrid}>
        <StatCard icon="pie-chart-outline" label="Attendance" value="65%" detail="20 present · 4 absent" tint={colors.paleBlue} iconColor={colors.blue} onPress={() => goTo('Attendance')} />
        <StatCard icon="wallet-outline" label="Fees & dues" value="₹1,80,186" detail="Outstanding balance" tint={colors.paleOrange} iconColor={colors.orange} onPress={() => goTo('Fees')} />
        <StatCard icon="book-outline" label="Homework" value="2 tasks" detail="1 submitted" tint={colors.paleTeal} iconColor={colors.teal} onPress={() => goTo('Homework')} />
        <StatCard icon="ribbon-outline" label="Exams" value="5 exams" detail="Next: 18 Sep" tint="#F0ECFF" iconColor="#7760C8" onPress={() => goTo('Exams')} />
      </View>
      <SectionTitle title="Notice feed" action="View all" onAction={() => goTo('Notices')} />
      <View style={styles.panel}>{notices.slice(0, 3).map((notice) => <NoticeRow key={notice.title} notice={notice} />)}</View>
      <SectionTitle title="Today&apos;s timetable" action="Full schedule" onAction={() => goTo('Timetable')} />
      <View style={styles.panel}>{schedule.slice(0, 3).map((item) => <ScheduleRow key={item[0]} item={item} />)}</View>
    </>
  );
}

function NoticeRow({ notice }) {
  return <View style={styles.noticeRow}><View style={[styles.noticeDot, { backgroundColor: notice.color }]} /><View style={{ flex: 1 }}><View style={styles.noticeMeta}><Text style={[styles.noticeType, { color: notice.color }]}>{notice.type.toUpperCase()}</Text><Text style={styles.noticeDate}>{notice.date}</Text></View><Text style={styles.noticeTitle}>{notice.title}</Text></View><Icon name="chevron-forward" size={16} color="#A3ADBB" /></View>;
}

function ScheduleRow({ item }) {
  return <View style={styles.scheduleRow}><Text style={styles.scheduleTime}>{item[0]}</Text><View style={styles.scheduleLine} /><View style={{ flex: 1 }}><Text style={styles.scheduleSubject}>{item[1]}</Text><Text style={styles.scheduleRoom}>{item[2]}</Text></View><Icon name="arrow-forward-outline" size={16} color={colors.blue} /></View>;
}

function DetailContent({ section, homework, setHomework, goTo }) {
  if (section === 'Attendance') return <AttendanceContent />;
  if (section === 'Fees') return <FeesContent />;
  if (section === 'Homework') return <HomeworkContent homework={homework} setHomework={setHomework} />;
  if (section === 'Exams') return <ExamsContent />;
  if (section === 'Timetable') return <TimetableContent />;
  return <NoticesContent />;
}

function AttendanceContent() {
  return <><DetailHero icon="pie-chart" title="Attendance overview" value="65%" caption="20 days present out of 24 school days" tint={colors.paleBlue} iconColor={colors.blue} /><View style={styles.panel}><Bar label="Present" value="20 days" width="83%" color={colors.teal} /><Bar label="Absent" value="4 days" width="17%" color={colors.red} /></View><SectionTitle title="Monthly attendance" /><View style={styles.calendar}><Text style={styles.month}>September 2026</Text><View style={styles.calendarGrid}>{['M','T','W','T','F','S','S', ...Array.from({ length: 30 }, (_, i) => String(i + 1))].map((day, index) => <View key={`${day}-${index}`} style={[styles.day, index > 6 && index < 27 && styles.dayPresent, index === 10 && styles.dayToday]}><Text style={styles.dayText}>{day}</Text></View>)}</View></View></>;
}

function DetailHero({ icon, title, value, caption, tint, iconColor }) {
  return <View style={styles.detailHero}><View style={[styles.largeIcon, { backgroundColor: tint }]}><Icon name={icon} size={30} color={iconColor} /></View><View style={{ flex: 1 }}><Text style={styles.heroTitle}>{title}</Text><Text style={styles.heroCaption}>{caption}</Text></View><Text style={styles.heroValue}>{value}</Text></View>;
}

function Bar({ label, value, width, color }) { return <View style={styles.barBlock}><View style={styles.barLabel}><Text style={styles.bodyText}>{label}</Text><Text style={styles.bodyText}>{value}</Text></View><View style={styles.barTrack}><View style={[styles.barFill, { width, backgroundColor: color }]} /></View></View>; }

function FeesContent() {
  return <><DetailHero icon="wallet" title="Fees & dues" value="₹1,80,186" caption="Your current outstanding balance" tint={colors.paleOrange} iconColor={colors.orange} /><View style={styles.panel}><FeeRow label="Tuition fee" amount="₹1,20,000" /><FeeRow label="Transport fee" amount="₹35,000" /><FeeRow label="Activity & materials" amount="₹25,186" total /></View><Pressable style={styles.primaryButton} onPress={() => Alert.alert('Demo payment', 'Payment flow is ready to connect to your school payment gateway.')}><Icon name="card-outline" color={colors.white} /><Text style={styles.primaryButtonText}>Pay outstanding fees</Text></Pressable><Text style={styles.helperText}>Last updated 9 Sep 2026 · No payment API connected</Text></>;
}

function FeeRow({ label, amount, total }) { return <View style={[styles.feeRow, total && styles.totalRow]}><Text style={[styles.bodyText, total && styles.totalText]}>{label}</Text><Text style={[styles.bodyText, total && styles.totalText]}>{amount}</Text></View>; }

function HomeworkContent({ homework, setHomework }) {
  return <><View style={styles.filterRow}><Text style={styles.subtle}>3 assignments this week</Text><View style={styles.filterChip}><Text style={styles.filterText}>All <Icon name="chevron-down" size={13} color={colors.blue} /></Text></View></View>{homework.map((item, index) => <Pressable key={item.title} onPress={() => setHomework(homework.map((task, taskIndex) => taskIndex === index ? { ...task, done: !task.done } : task))} style={styles.taskCard}><View style={[styles.checkbox, item.done && styles.checkboxDone]}>{item.done && <Icon name="checkmark" size={14} color={colors.white} />}</View><View style={{ flex: 1 }}><Text style={styles.taskSubject}>{item.subject}</Text><Text style={styles.taskTitle}>{item.title}</Text><Text style={[styles.taskDue, item.done && { color: colors.teal }]}>{item.done ? 'Completed' : item.due}</Text></View><Icon name="chevron-forward" size={17} color="#A3ADBB" /></Pressable>)}</>;
}

function ExamsContent() { return <><DetailHero icon="ribbon" title="Upcoming exams" value="5" caption="Next exam begins 18 September" tint="#F0ECFF" iconColor="#7760C8" /><View style={styles.panel}>{[['18 Sep', 'Mathematics', '09:00 AM'], ['20 Sep', 'English', '09:00 AM'], ['22 Sep', 'Science', '09:00 AM'], ['24 Sep', 'Hindi', '09:00 AM'], ['26 Sep', 'Environmental Studies', '09:00 AM']].map((exam) => <View style={styles.examRow} key={exam[1]}><View style={styles.examDate}><Text style={styles.examDay}>{exam[0].split(' ')[0]}</Text><Text style={styles.examMonth}>{exam[0].split(' ')[1]}</Text></View><View style={{ flex: 1 }}><Text style={styles.scheduleSubject}>{exam[1]}</Text><Text style={styles.scheduleRoom}>School examination · {exam[2]}</Text></View><Icon name="chevron-forward" size={17} color="#A3ADBB" /></View>)}</View></>; }

function TimetableContent() { return <><View style={styles.weekRow}>{['Mon','Tue','Wed','Thu','Fri'].map((day, index) => <View key={day} style={[styles.weekDay, index === 1 && styles.weekDayActive]}><Text style={[styles.weekDayName, index === 1 && styles.weekDayActiveText]}>{day}</Text><Text style={[styles.weekDayNumber, index === 1 && styles.weekDayActiveText]}>{7 + index}</Text></View>)}</View><View style={styles.panel}>{schedule.map((item) => <ScheduleRow key={item[0]} item={item} />)}</View></>; }

function NoticesContent() { return <><View style={styles.filterRow}><Text style={styles.subtle}>6 updates from Demo School</Text><View style={styles.filterChip}><Text style={styles.filterText}>All notices <Icon name="chevron-down" size={13} color={colors.blue} /></Text></View></View><View style={styles.panel}>{notices.map((notice) => <NoticeRow key={notice.title} notice={notice} />)}</View></>; }

function ProfileModal({ visible, onClose }) {
  const [name, setName] = useState('joshi');
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={styles.modal}><View style={styles.modalHeader}><Text style={styles.modalTitle}>Edit profile</Text><Pressable onPress={onClose}><Icon name="close" size={22} color={colors.ink} /></Pressable></View><Text style={styles.inputLabel}>Parent name</Text><TextInput value={name} onChangeText={setName} style={styles.input} /><Text style={styles.inputLabel}>Email address</Text><TextInput value="joshi.parent@demoschool.in" editable={false} style={[styles.input, styles.disabledInput]} /><Pressable style={styles.primaryButton} onPress={() => { onClose(); Alert.alert('Profile updated', `Welcome, ${name}.`); }}><Text style={styles.primaryButtonText}>Update profile</Text></Pressable></View></View></Modal>;
}

export default function ParentPortalScreen({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Home');
  const [homework, setHomework] = useState(homeworkItems);
  const [profileOpen, setProfileOpen] = useState(false);
  const isHome = activeTab === 'Home';
  const handleLogout = () => {
    Alert.alert('Signed out', 'Demo sign out complete.', [{ text: 'OK', onPress: onLogout }]);
  };

  return <SafeAreaView style={styles.safe}><StatusBar barStyle="light-content" backgroundColor={colors.navy} /><View style={styles.header}><View><Text style={styles.brand}>DEMO SCHOOL</Text><Text style={styles.portal}>Parent portal <Text style={styles.year}>2026–27</Text></Text></View><Pressable onPress={handleLogout} style={styles.logout}><Icon name="log-out-outline" size={18} color="#C8DBF2" /><Text style={styles.logoutText}>Logout</Text></Pressable></View><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{isHome ? <HomeContent goTo={setActiveTab} /> : <><View style={styles.pageHeading}><Pressable onPress={() => setActiveTab('Home')}><Icon name="arrow-back" color={colors.ink} size={23} /></Pressable><View><Text style={styles.pageTitle}>{activeTab}</Text><Text style={styles.subtle}>joshii · Class 1, Section A</Text></View></View><DetailContent section={activeTab} homework={homework} setHomework={setHomework} goTo={setActiveTab} /></>}</ScrollView><View style={styles.bottomNav}>{navItems.map((item) => <Pressable key={item.label} onPress={() => setActiveTab(item.label)} style={styles.navItem}><Icon name={item.icon} size={21} color={activeTab === item.label ? colors.blue : colors.muted} /><Text style={[styles.navLabel, activeTab === item.label && styles.navLabelActive]}>{item.label}</Text></Pressable>)}<Pressable onPress={() => setProfileOpen(true)} style={styles.navItem}><Icon name="person-outline" size={21} color={colors.muted} /><Text style={styles.navLabel}>Profile</Text></Pressable></View><ProfileModal visible={profileOpen} onClose={() => setProfileOpen(false)} /></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas }, header: { backgroundColor: colors.navy, paddingHorizontal: 22, paddingTop: 18, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, brand: { color: '#A9C6E8', fontSize: 11, letterSpacing: 1.8, fontWeight: '800' }, portal: { color: colors.white, fontSize: 22, fontWeight: '800', marginTop: 4 }, year: { color: '#8EB7E8', fontSize: 13, fontWeight: '600' }, logout: { flexDirection: 'row', alignItems: 'center', gap: 6 }, logoutText: { color: '#C8DBF2', fontSize: 13, fontWeight: '700' }, content: { padding: 20, paddingBottom: 30 }, greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }, eyebrow: { color: colors.blue, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 }, greeting: { color: colors.ink, fontSize: 25, fontWeight: '800', marginTop: 5 }, subtle: { color: colors.muted, fontSize: 13, marginTop: 4 }, avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DCEBFB', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.blue, fontSize: 19, fontWeight: '800' }, studentBanner: { backgroundColor: colors.navy, borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 18 }, studentInitial: { width: 39, height: 39, borderRadius: 12, backgroundColor: '#2E5D91', alignItems: 'center', justifyContent: 'center', marginRight: 12 }, studentInitialText: { color: colors.white, fontWeight: '800', fontSize: 17 }, studentName: { color: colors.white, fontSize: 16, fontWeight: '800' }, studentMeta: { color: '#B8D0EC', fontSize: 11, marginTop: 3 }, statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 }, statCard: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 13, width: '48%', minHeight: 145 }, pressed: { opacity: 0.7 }, statIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, statLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' }, statValue: { color: colors.ink, fontSize: 18, fontWeight: '800', marginTop: 5 }, statDetail: { color: colors.muted, fontSize: 10, marginTop: 4 }, sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 3 }, sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' }, seeAll: { color: colors.blue, fontSize: 12, fontWeight: '800' }, panel: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 15, marginBottom: 22 }, noticeRow: { paddingVertical: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.line, gap: 11 }, panel: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 15, marginBottom: 22 }, noticeDot: { width: 8, height: 8, borderRadius: 4 }, noticeMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 }, noticeType: { fontSize: 9, fontWeight: '900', letterSpacing: 0.6 }, noticeDate: { color: colors.muted, fontSize: 10 }, noticeTitle: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 4, textTransform: 'capitalize' }, scheduleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 12 }, scheduleTime: { color: colors.blue, fontSize: 12, fontWeight: '800', width: 42 }, scheduleLine: { height: 28, width: 2, backgroundColor: '#BFD8F5' }, scheduleSubject: { color: colors.ink, fontSize: 13, fontWeight: '800' }, scheduleRoom: { color: colors.muted, fontSize: 11, marginTop: 3 }, bottomNav: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 9, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-around' }, navItem: { alignItems: 'center', width: '14%' }, navLabel: { color: colors.muted, fontSize: 9, fontWeight: '600', marginTop: 4 }, navLabelActive: { color: colors.blue, fontWeight: '800' }, pageHeading: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 }, pageTitle: { color: colors.ink, fontSize: 25, fontWeight: '800' }, detailHero: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 17, flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 }, largeIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, heroTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' }, heroCaption: { color: colors.muted, fontSize: 11, marginTop: 5, maxWidth: 145, lineHeight: 16 }, heroValue: { color: colors.ink, fontSize: 21, fontWeight: '900' }, barBlock: { paddingVertical: 12 }, barLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }, bodyText: { color: colors.ink, fontSize: 13 }, barTrack: { height: 8, borderRadius: 4, backgroundColor: '#EDF1F5', overflow: 'hidden' }, barFill: { height: 8, borderRadius: 4 }, month: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 14 }, calendar: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 16, marginBottom: 22 }, calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 }, day: { width: '12.4%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 7 }, dayText: { color: colors.muted, fontSize: 11 }, dayPresent: { backgroundColor: colors.paleTeal }, dayPresent: { backgroundColor: colors.paleTeal }, dayToday: { backgroundColor: colors.blue }, filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, filterChip: { borderWidth: 1, borderColor: '#C9DDF5', backgroundColor: colors.paleBlue, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 7 }, filterText: { color: colors.blue, fontSize: 11, fontWeight: '800' }, taskCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }, checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#AAB7C7', alignItems: 'center', justifyContent: 'center' }, checkboxDone: { backgroundColor: colors.teal, borderColor: colors.teal }, taskSubject: { color: colors.blue, fontSize: 10, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' }, taskTitle: { color: colors.ink, fontSize: 13, fontWeight: '700', lineHeight: 18, marginTop: 4 }, taskDue: { color: colors.orange, fontSize: 11, marginTop: 6, fontWeight: '700' }, feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.line }, totalRow: { borderBottomWidth: 0 }, totalText: { fontWeight: '900', fontSize: 15 }, primaryButton: { backgroundColor: colors.blue, minHeight: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 10 }, primaryButtonText: { color: colors.white, fontWeight: '800', fontSize: 14 }, helperText: { color: colors.muted, textAlign: 'center', fontSize: 11, marginBottom: 20 }, examRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line }, examDate: { width: 43, height: 43, borderRadius: 10, backgroundColor: colors.paleBlue, alignItems: 'center', justifyContent: 'center' }, examDay: { color: colors.blue, fontSize: 16, fontWeight: '900' }, examMonth: { color: colors.blue, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }, weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }, weekDay: { width: '18%', alignItems: 'center', paddingVertical: 10, borderRadius: 10 }, weekDayActive: { backgroundColor: colors.blue }, weekDayName: { color: colors.muted, fontSize: 10, fontWeight: '700' }, weekDayNumber: { color: colors.ink, fontSize: 16, fontWeight: '800', marginTop: 4 }, weekDayActiveText: { color: colors.white }, modalBackdrop: { flex: 1, backgroundColor: 'rgba(9, 25, 44, 0.5)', justifyContent: 'flex-end' }, modal: { backgroundColor: colors.white, padding: 22, borderTopLeftRadius: 20, borderTopRightRadius: 20 }, modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }, modalTitle: { color: colors.ink, fontSize: 21, fontWeight: '800' }, inputLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', marginBottom: 6, marginTop: 10 }, input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 9, paddingHorizontal: 13, paddingVertical: 12, color: colors.ink, fontSize: 14 }, disabledInput: { backgroundColor: '#F1F4F7', color: colors.muted },
});