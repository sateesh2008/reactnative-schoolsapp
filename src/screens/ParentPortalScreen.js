import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { announcementsApi } from "../services/announcementsApi";
import { attendanceApi } from "../services/attendanceApi";
import { examsApi } from "../services/examsApi";
import { feesApi } from "../services/feesApi";
import { homeworkApi } from "../services/homeworkApi";
import { parentApi } from "../services/parentApi";
import ParentAdditionalModuleScreen from "./ParentAdditionalModuleScreen";
import ParentAnnouncementsScreen from "./ParentAnnouncementsScreen";
import ParentAttendanceScreen from "./ParentAttendanceScreen";
import ParentExamsScreen from "./ParentExamsScreen";
import ParentFeesScreen from "./ParentFeesScreen";
import ParentHomeworkScreen from "./ParentHomeworkScreen";
import ParentLeaveScreen from "./ParentLeaveScreen";
import ParentTimetableScreen from "./ParentTimetableScreen";
import ParentTransportScreen from "./ParentTransportScreen";

const colors = {
  ink: "#17343B",
  muted: "#6A7F83",
  line: "#D9E7E4",
  canvas: "#F4F8F6",
  white: "#FFFFFF",
  navy: "#123B43",
  blue: "#0D8B82",
  paleBlue: "#E5F4F0",
  teal: "#168A7C",
  paleTeal: "#E2F4EE",
  orange: "#D9822B",
  paleOrange: "#FFF1DF",
  red: "#C65353",
};

const navItems = [
  { label: "Home", icon: "home-outline" },
  { label: "Attendance", icon: "calendar-outline" },
  { label: "Fees", icon: "wallet-outline" },
  { label: "Homework", icon: "book-outline" },
  { label: "Exams", icon: "ribbon-outline" },
  { label: "Timetable", icon: "time-outline" },
];

function Icon({ name, size = 20, color = colors.ink }) {
  return <Ionicons name={name} size={size} color={color} />;
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

const additionalModules = [
  {
    title: "Timetable",
    icon: "time-outline",
    tab: "Timetable",
    tint: "#E5F4F0",
    accent: "#168A7C",
  },
  {
    title: "Student Profile",
    icon: "person-circle-outline",
    tab: "Student Profile",
    tint: "#EAF0FB",
    accent: "#5274B8",
  },
  {
    title: "Exams & Results",
    icon: "ribbon-outline",
    tab: "Exams",
    tint: "#FFF1DF",
    accent: "#D9822B",
  },
  {
    title: "Transport",
    icon: "bus-outline",
    tab: "Transport",
    tint: "#FDECEC",
    accent: "#C65353",
  },
  {
    title: "Messaging / Notifications",
    icon: "megaphone-outline",
    tab: "Messaging / Notifications",
    tint: "#F2ECFB",
    accent: "#7A5AA6",
  },
  {
    title: "Events",
    icon: "school-outline",
    tab: "Events",
    tint: "#EAF5FB",
    accent: "#3284A8",
  },
  {
    title: "Leave",
    icon: "create-outline",
    tab: "Leave",
    tint: "#FFF6D9",
    accent: "#B8861B",
  },
  {
    title: "Documents",
    icon: "document-text-outline",
    tab: "Documents",
    tint: "#F0EDF8",
    accent: "#6C63A8",
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning, Parent";
  if (hour < 17) return "Good Afternoon, Parent";
  return "Good Evening, Parent";
}

function DashboardCard({
  icon,
  label,
  value,
  detail,
  tint,
  iconColor,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        dashboardStyles.summaryCard,
        { backgroundColor: tint, borderColor: iconColor },
        pressed && styles.pressed,
      ]}
    >
      <View style={[dashboardStyles.summaryIcon, { backgroundColor: tint }]}>
        <Icon name={icon} color={iconColor} />
      </View>
      <Text style={dashboardStyles.summaryLabel}>{label}</Text>
      <Text style={dashboardStyles.summaryValue}>{value}</Text>
      <Text style={dashboardStyles.summaryDetail}>{detail}</Text>
    </Pressable>
  );
}

function ModuleCard({ module, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        dashboardStyles.moduleCard,
        {
          backgroundColor: module.tint,
          borderColor: module.accent,
          borderLeftColor: module.accent,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={dashboardStyles.moduleIcon}>
        <Icon name={module.icon} size={21} color={module.accent} />
      </View>
      <Text style={dashboardStyles.moduleTitle}>{module.title}</Text>
      <Icon name="arrow-forward" size={15} color={module.accent} />
    </Pressable>
  );
}

function StudentCard({ student, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        dashboardStyles.studentCard,
        selected && dashboardStyles.studentCardSelected,
      ]}
    >
      <View style={dashboardStyles.studentAvatar}>
        <Text style={dashboardStyles.studentAvatarText}>{student.initial}</Text>
      </View>
      <View style={dashboardStyles.studentCardCopy}>
        <Text style={dashboardStyles.studentCardName}>{student.name}</Text>
        <Text style={dashboardStyles.studentCardClass}>
          {student.className}
          {student.section ? ` - Section ${student.section}` : ""}
        </Text>
      </View>
      {selected ? (
        <Icon name="checkmark-circle" size={22} color={colors.blue} />
      ) : null}
    </Pressable>
  );
}

function HomeContent({
  goTo,
  dashboard,
  selectedStudent,
  students,
  onSelectStudent,
  onRefresh,
  onAnnouncementRead,
}) {
  const classes = dashboard.classes.length ? dashboard.classes : [];
  return (
    <View>
      <View style={dashboardStyles.headingRow}>
        <View style={{ flex: 1 }}>
          <Text style={dashboardStyles.greeting}>{getGreeting()} 👋</Text>
          <Text style={dashboardStyles.school}>{dashboard.schoolName}</Text>
        </View>
        <View style={dashboardStyles.accountBadge}>
          <Text style={dashboardStyles.accountName}>Parent Account</Text>
          <Text style={dashboardStyles.accountCount}>
            {dashboard.studentCount}
          </Text>
        </View>
      </View>
      <Text style={dashboardStyles.studentsLabel}>STUDENT:</Text>
      <View style={dashboardStyles.studentList}>
        {students.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            selected={student.id === selectedStudent.id}
            onPress={() => onSelectStudent(student.id)}
          />
        ))}
      </View>
      {dashboard.loading ? (
        <View style={dashboardStyles.state}>
          <Text style={dashboardStyles.stateText}>Loading dashboard...</Text>
        </View>
      ) : (
        <>
          {dashboard.error ? (
            <View style={dashboardStyles.error}>
              <Text style={dashboardStyles.errorText}>{dashboard.error}</Text>
              <Pressable onPress={onRefresh}>
                <Text style={dashboardStyles.retry}>Retry</Text>
              </Pressable>
            </View>
          ) : null}
          <View style={dashboardStyles.summaryGrid}>
            <DashboardCard
              icon="pie-chart-outline"
              label="Attendance"
              value={dashboard.attendance}
              detail="Current summary"
              tint="#F2ECFB"
              iconColor="#7A5AA6"
              onPress={() => goTo("Attendance")}
            />
            <DashboardCard
              icon="wallet-outline"
              label="Fees & Dues"
              value={dashboard.fees}
              detail="Outstanding"
              tint="#EAF5FB"
              iconColor="#3284A8"
              onPress={() => goTo("Fees")}
            />
            <DashboardCard
              icon="book-outline"
              label="Homework"
              value="Tasks"
              detail={dashboard.homeworkDetail}
              tint="#FFF1DF"
              iconColor="#D9822B"
              onPress={() => goTo("Homework")}
            />
          </View>
          <SectionTitle title="Parent Modules" />
          <View style={dashboardStyles.moduleGrid}>
            {additionalModules.map((module) => (
              <ModuleCard
                key={module.title}
                module={module}
                onPress={() => goTo(module.tab)}
              />
            ))}
          </View>
          <SectionTitle title="Today's Classes" />
          <View style={dashboardStyles.listCard}>
            {classes.length ? (
              classes.map((item, index) => (
                <View
                  key={`${item[0]}-${index}`}
                  style={dashboardStyles.classRow}
                >
                  <Text style={dashboardStyles.classTime}>{item[0]}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={dashboardStyles.classSubject}>{item[1]}</Text>
                    <Text style={dashboardStyles.classMeta}>{item[2]}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={dashboardStyles.emptyText}>
                No classes scheduled for today
              </Text>
            )}
          </View>
          <SectionTitle title="Latest Notifications" />
          <View style={dashboardStyles.listCard}>
            {dashboard.announcements.length ? (
              dashboard.announcements.map((announcement) => (
                <Pressable
                  key={announcement.id || announcement.title}
                  style={dashboardStyles.notificationRow}
                  onPress={() => {
                    onAnnouncementRead?.(announcement.id, true);
                    goTo("Messaging / Notifications");
                  }}
                >
                  <View style={dashboardStyles.notificationCopy}>
                    <Text style={dashboardStyles.notificationTitle}>
                      {announcement.title}
                    </Text>
                    <Text
                      style={dashboardStyles.notificationMessage}
                      numberOfLines={1}
                    >
                      {announcement.message}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={16} color={colors.muted} />
                </Pressable>
              ))
            ) : (
              <Text style={dashboardStyles.emptyText}>
                No new notifications
              </Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}

function DetailContent({
  section,
  goTo,
  session,
  onSessionExpired,
  selectedStudentId,
  selectedStudent,
  onAnnouncementsLoaded,
  onAnnouncementRead,
}) {
  if (section === "Attendance")
    return (
      <ParentAttendanceScreen
        session={session}
        selectedStudentId={selectedStudentId}
        onSessionExpired={onSessionExpired}
      />
    );
  if (section === "Fees")
    return (
      <ParentFeesScreen
        session={session}
        selectedStudentId={selectedStudentId}
        onSessionExpired={onSessionExpired}
      />
    );
  if (section === "Homework")
    return (
      <ParentHomeworkScreen
        session={session}
        selectedStudentId={selectedStudentId}
        onSessionExpired={onSessionExpired}
      />
    );
  if (section === "Exams")
    return (
      <ParentExamsScreen
        session={session}
        selectedStudentId={selectedStudentId}
        onSessionExpired={onSessionExpired}
      />
    );
  if (section === "Timetable")
    return (
      <ParentTimetableScreen
        session={session}
        selectedStudentId={selectedStudentId}
        onSessionExpired={onSessionExpired}
      />
    );
  if (section === "Messaging / Notifications")
    return (
      <ParentAnnouncementsScreen
        session={session}
        selectedStudentId={selectedStudentId}
        onSessionExpired={onSessionExpired}
        onAnnouncementsLoaded={onAnnouncementsLoaded}
        onAnnouncementRead={onAnnouncementRead}
      />
    );
  if (section === "Events")
    return (
      <ParentAnnouncementsScreen
        session={session}
        selectedStudentId={selectedStudentId}
        onSessionExpired={onSessionExpired}
        title="Events"
        eventOnly
      />
    );
  if (section === "Leave")
    return (
      <ParentLeaveScreen
        session={session}
        selectedStudentId={selectedStudentId}
        onSessionExpired={onSessionExpired}
      />
    );
  if (section === "Transport")
    return (
      <ParentTransportScreen
        session={session}
        selectedStudentId={selectedStudentId}
        onSessionExpired={onSessionExpired}
      />
    );
  if (["Student Profile", "Documents"].includes(section))
    return (
      <ParentAdditionalModuleScreen
        title={section}
        selectedStudent={selectedStudent}
      />
    );
  return <NoticesContent />;
}

function NoticesContent() {
  return (
    <>
      <View style={styles.filterRow}>
        <Text style={styles.subtle}>No notifications available</Text>
        <View style={styles.filterChip}>
          <Text style={styles.filterText}>
            All notices{" "}
            <Icon name="chevron-down" size={13} color={colors.blue} />
          </Text>
        </View>
      </View>
      <View style={styles.panel}>
        <Text style={styles.subtle}>
          Open Messaging / Notifications to view announcements.
        </Text>
      </View>
    </>
  );
}

function ProfileModal({ visible, onClose, session }) {
  const [name, setName] = useState(
    session?.name || session?.email?.split("@")[0] || "",
  );
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit profile</Text>
            <Pressable onPress={onClose}>
              <Icon name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>
          <Text style={styles.inputLabel}>Parent name</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} />
          <Text style={styles.inputLabel}>Email address</Text>
          <TextInput
            value={session?.email || ""}
            editable={false}
            style={[styles.input, styles.disabledInput]}
          />
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              onClose();
              Alert.alert("Profile updated", `Welcome, ${name}.`);
            }}
          >
            <Text style={styles.primaryButtonText}>Update profile</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function ParentPortalScreen({ onLogout, session }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("Home");
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [dashboard, setDashboard] = useState({
    loading: true,
    error: "",
    attendance: "0%",
    fees: "₹0",
    homeworkDetail: "No data available",
    classes: [],
    announcements: [],
    unreadAnnouncementCount: 0,
    schoolName: session?.schoolName || "",
    studentCount: students.length,
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const isHome = activeTab === "Home";
  const syncAnnouncements = useCallback((announcements) => {
    setDashboard((current) => ({
      ...current,
      announcements,
      unreadAnnouncementCount: announcementsApi.getUnreadCount(announcements),
    }));
  }, []);
  const updateAnnouncementReadState = useCallback((announcementId, isRead) => {
    if (!announcementId) return;
    setDashboard((current) => ({
      ...current,
      announcements: current.announcements.map((announcement) =>
        String(announcement.id) === String(announcementId)
          ? { ...announcement, is_read: isRead }
          : announcement,
      ),
      unreadAnnouncementCount: announcementsApi.getUnreadCount(
        current.announcements.map((announcement) =>
          String(announcement.id) === String(announcementId)
            ? { ...announcement, is_read: isRead }
            : announcement,
        ),
      ),
    }));
  }, []);
  const handleLogout = () => {
    if (Platform.OS === "web") {
      onLogout();
      return;
    }

    Alert.alert("Signed out", "Your session has ended.", [
      { text: "OK", onPress: onLogout },
    ]);
  };

  const loadDashboard = useCallback(async () => {
    setDashboard((current) => ({ ...current, loading: true, error: "" }));
    try {
      const children = await parentApi.getChildren(session);
      const nextStudents = children.map((student) => ({
        ...student,
        initial: (student.first_name || student.name || "?")
          .charAt(0)
          .toUpperCase(),
        name:
          [student.first_name, student.last_name].filter(Boolean).join(" ") ||
          student.name ||
          "Student",
        className: student.class_name || student.className || "",
        section: student.division_name || student.section || "",
      }));
      setStudents(nextStudents);
      const activeStudentId =
        selectedStudentId || String(nextStudents[0]?.id || "");
      if (!activeStudentId) {
        setDashboard((current) => ({
          ...current,
          loading: false,
          studentCount: 0,
        }));
        return;
      }
      if (String(activeStudentId) !== String(selectedStudentId)) {
        setSelectedStudentId(activeStudentId);
      }

      const results = await Promise.allSettled([
        feesApi.getSummary(session, activeStudentId),
        attendanceApi.getSummary(
          new Date().toISOString().slice(0, 10),
          session,
          activeStudentId,
        ),
        homeworkApi.getAssignments(session, activeStudentId),
        examsApi.getResults(session, activeStudentId),
        announcementsApi.getAnnouncements(session, activeStudentId),
      ]);
      const [
        feesResult,
        attendanceResult,
        homeworkResult,
        examsResult,
        announcementsResult,
      ] = results;
      const failedServices = results
        .map((result, index) =>
          result.status === "rejected"
            ? `${["fees", "attendance", "homework", "exams", "announcements"][index]}: ${result.reason?.message || "request failed"}`
            : null,
        )
        .filter(Boolean);
      const fees = feesResult.status === "fulfilled" ? feesResult.value : null;
      const attendance =
        attendanceResult.status === "fulfilled" ? attendanceResult.value : null;
      const homework =
        homeworkResult.status === "fulfilled" ? homeworkResult.value : [];
      const exams = examsResult.status === "fulfilled" ? examsResult.value : [];
      const announcements =
        announcementsResult.status === "fulfilled"
          ? announcementsResult.value
          : [];
      setDashboard({
        loading: false,
        attendance: `${attendance?.attendanceRate ?? 0}%`,
        fees: `₹${Number(fees?.institutionalDues || 0).toLocaleString("en-IN")}`,
        homeworkDetail: homework?.length
          ? `${homework.length} available`
          : "No data available",
        classes: [],
        announcements,
        unreadAnnouncementCount: announcementsApi.getUnreadCount(announcements),
        schoolName: session?.schoolName || "",
        studentCount: nextStudents.length,
        examCount: exams.length,
        error: failedServices.length
          ? `Some services are unavailable: ${failedServices.join(", ")}.`
          : "",
      });
    } catch (error) {
      setDashboard((current) => ({
        ...current,
        loading: false,
        error:
          error?.message || "Unable to load dashboard data. Please try again.",
      }));
    }
  }, [session, selectedStudentId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const selectedStudent = students.find(
    (student) => String(student.id) === String(selectedStudentId),
  ) ||
    students[0] || {
      id: "",
      initial: "?",
      name: "Student",
      className: "",
    };
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.brand}>{session?.schoolName || ""}</Text>
          <Text style={styles.portal} numberOfLines={1} ellipsizeMode="tail">
            Parent portal{" "}
            <Text style={styles.year}>{session?.academicYear || ""}</Text>
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Messages"
            onPress={() => setActiveTab("Messaging / Notifications")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.headerAction}
          >
            <View style={styles.headerIconContainer}>
              <Icon
                name="chatbubble-ellipses-outline"
                size={19}
                color="#C8DBF2"
              />
              {dashboard.announcements.length ? (
                <Text pointerEvents="none" style={styles.unreadBadge}>
                  {dashboard.unreadAnnouncementCount}
                </Text>
              ) : null}
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => setActiveTab("Messaging / Notifications")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.headerAction}
          >
            <View style={styles.headerIconContainer}>
              <Icon name="notifications-outline" size={19} color="#C8DBF2" />
              {dashboard.announcements.length ? (
                <Text pointerEvents="none" style={styles.unreadBadge}>
                  {dashboard.unreadAnnouncementCount}
                </Text>
              ) : null}
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Logout"
            onPress={handleLogout}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.logout}
          >
            <Icon name="log-out-outline" size={18} color="#C8DBF2" />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isHome && dashboard.loading}
            onRefresh={loadDashboard}
            tintColor={colors.blue}
          />
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isHome ? (
          <HomeContent
            goTo={setActiveTab}
            dashboard={dashboard}
            selectedStudent={selectedStudent}
            students={students}
            onSelectStudent={setSelectedStudentId}
            onRefresh={loadDashboard}
            onAnnouncementRead={updateAnnouncementReadState}
          />
        ) : (
          <>
            <View style={styles.pageHeading}>
              <Pressable onPress={() => setActiveTab("Home")}>
                <Icon name="arrow-back" color={colors.ink} size={23} />
              </Pressable>
              <View>
                <Text style={styles.pageTitle}>{activeTab}</Text>
                <Text style={styles.subtle}>Parent section</Text>
              </View>
            </View>
            <DetailContent
              section={activeTab}
              goTo={setActiveTab}
              session={session}
              selectedStudentId={selectedStudentId}
              selectedStudent={selectedStudent}
              onSessionExpired={onLogout}
              onAnnouncementsLoaded={syncAnnouncements}
              onAnnouncementRead={updateAnnouncementReadState}
            />
          </>
        )}
      </ScrollView>
      <View
        style={[
          styles.bottomNav,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}
      >
        {navItems.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => setActiveTab(item.label)}
            style={styles.navItem}
          >
            <Icon
              name={item.icon}
              size={21}
              color={activeTab === item.label ? colors.blue : colors.muted}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === item.label && styles.navLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
        <Pressable onPress={() => setProfileOpen(true)} style={styles.navItem}>
          <Icon name="person-outline" size={21} color={colors.muted} />
          <Text style={styles.navLabel}>Profile</Text>
        </Pressable>
      </View>
      <ProfileModal
        visible={profileOpen}
        onClose={() => setProfileOpen(false)}
        session={session}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flex: 1 },
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  brand: {
    color: "#A9C6E8",
    fontSize: 11,
    letterSpacing: 1.8,
    fontWeight: "800",
  },
  portal: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
    maxWidth: "100%",
  },
  year: { color: "#8EB7E8", fontSize: 13, fontWeight: "600" },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexShrink: 0,
  },
  headerAction: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  headerIconContainer: {
    position: "relative",
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadge: {
    position: "absolute",
    top: -8,
    right: -12,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.red,
    color: colors.white,
    fontSize: 9,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 15,
    overflow: "hidden",
    pointerEvents: "none",
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: 4,
    gap: 6,
  },
  logoutText: { color: "#C8DBF2", fontSize: 13, fontWeight: "700" },
  content: { padding: 20, paddingBottom: 30 },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  eyebrow: {
    color: colors.blue,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  greeting: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: "800",
    marginTop: 5,
  },
  subtle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DCEBFB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.blue, fontSize: 19, fontWeight: "800" },
  studentBanner: {
    backgroundColor: colors.navy,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  studentInitial: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#2E5D91",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  studentInitialText: { color: colors.white, fontWeight: "800", fontSize: 17 },
  studentName: { color: colors.white, fontSize: 16, fontWeight: "800" },
  studentMeta: { color: "#B8D0EC", fontSize: 11, marginTop: 3 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
    width: "48%",
    minHeight: 145,
  },
  pressed: { opacity: 0.7 },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  statValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 5,
  },
  statDetail: { color: colors.muted, fontSize: 10, marginTop: 4 },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 3,
  },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  seeAll: { color: colors.blue, fontSize: 12, fontWeight: "800" },
  panel: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 15,
    marginBottom: 22,
  },
  noticeRow: {
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: 11,
  },
  noticeDot: { width: 8, height: 8, borderRadius: 4 },
  noticeMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  noticeType: { fontSize: 9, fontWeight: "900", letterSpacing: 0.6 },
  noticeDate: { color: colors.muted, fontSize: 10 },
  noticeTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
    textTransform: "capitalize",
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: 12,
  },
  scheduleTime: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "800",
    width: 42,
  },
  scheduleLine: { height: 28, width: 2, backgroundColor: "#BFD8F5" },
  scheduleSubject: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  scheduleRoom: { color: colors.muted, fontSize: 11, marginTop: 3 },
  bottomNav: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 9,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  navItem: { alignItems: "center", width: "14%" },
  navLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "600",
    marginTop: 4,
  },
  navLabelActive: { color: colors.blue, fontWeight: "800" },
  pageHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },
  pageTitle: { color: colors.ink, fontSize: 25, fontWeight: "800" },
  detailHero: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  largeIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  heroCaption: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 5,
    maxWidth: 145,
    lineHeight: 16,
  },
  heroValue: { color: colors.ink, fontSize: 21, fontWeight: "900" },
  barBlock: { paddingVertical: 12 },
  barLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bodyText: { color: colors.ink, fontSize: 13 },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EDF1F5",
    overflow: "hidden",
  },
  barFill: { height: 8, borderRadius: 4 },
  month: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 14,
  },
  calendar: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 16,
    marginBottom: 22,
  },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  day: {
    width: "12.4%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
  },
  dayText: { color: colors.muted, fontSize: 11 },
  dayPresent: { backgroundColor: colors.paleTeal },
  dayToday: { backgroundColor: colors.blue },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "#C9DDF5",
    backgroundColor: colors.paleBlue,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  filterText: { color: colors.blue, fontSize: 11, fontWeight: "800" },
  taskCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#AAB7C7",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: colors.teal, borderColor: colors.teal },
  taskSubject: {
    color: colors.blue,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  taskTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 4,
  },
  taskDue: {
    color: colors.orange,
    fontSize: 11,
    marginTop: 6,
    fontWeight: "700",
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  totalRow: { borderBottomWidth: 0 },
  totalText: { fontWeight: "900", fontSize: 15 },
  primaryButton: {
    backgroundColor: colors.blue,
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  primaryButtonText: { color: colors.white, fontWeight: "800", fontSize: 14 },
  helperText: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 11,
    marginBottom: 20,
  },
  examRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  examDate: {
    width: 43,
    height: 43,
    borderRadius: 10,
    backgroundColor: colors.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  examDay: { color: colors.blue, fontSize: 16, fontWeight: "900" },
  examMonth: {
    color: colors.blue,
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  weekDay: {
    width: "18%",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  weekDayActive: { backgroundColor: colors.blue },
  weekDayName: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  weekDayNumber: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  weekDayActiveText: { color: colors.white },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(9, 25, 44, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: colors.white,
    padding: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { color: colors.ink, fontSize: 21, fontWeight: "800" },
  inputLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 14,
  },
  disabledInput: { backgroundColor: "#F1F4F7", color: colors.muted },
});

const dashboardStyles = StyleSheet.create({
  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  greeting: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  school: { color: colors.muted, fontSize: 12, marginTop: 6 },
  dashboardOs: {
    color: colors.blue,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 7,
  },
  accountBadge: {
    alignItems: "flex-end",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 10,
    minWidth: 92,
  },
  accountName: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  accountCount: {
    color: colors.blue,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4,
  },
  studentSelector: {
    backgroundColor: colors.navy,
    borderRadius: 13,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 18,
  },
  studentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#2E5D91",
    alignItems: "center",
    justifyContent: "center",
  },
  studentAvatarText: { color: colors.white, fontSize: 18, fontWeight: "900" },
  studentLabel: { color: "#B8D0EC", fontSize: 10, fontWeight: "800" },
  studentName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  studentClass: { color: "#B8D0EC", fontSize: 11, marginTop: 2 },
  studentsLabel: {
    color: colors.blue,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  studentList: { gap: 8, marginBottom: 18 },
  studentCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    minHeight: 68,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  studentCardSelected: {
    borderColor: colors.blue,
    backgroundColor: colors.paleBlue,
  },
  studentCardCopy: { flex: 1 },
  studentCardName: { color: colors.ink, fontSize: 14, fontWeight: "900" },
  studentCardClass: { color: colors.muted, fontSize: 11, marginTop: 3 },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  summaryCard: {
    width: "31.5%",
    minHeight: 125,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
  },
  summaryIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  summaryLabel: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  summaryValue: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 6,
  },
  summaryDetail: { color: colors.muted, fontSize: 9, marginTop: 5 },
  moduleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  moduleCard: {
    width: "48%",
    minHeight: 74,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 4,
    borderRadius: 11,
    padding: 10,
  },
  moduleIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },
  moduleTitle: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 15,
    paddingRight: 2,
  },
  listCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 13,
    marginBottom: 18,
  },
  classRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  classTime: { color: colors.blue, fontSize: 11, fontWeight: "900", width: 72 },
  classSubject: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  classMeta: { color: colors.muted, fontSize: 10, marginTop: 3 },
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  notificationDot: { width: 8, height: 8, borderRadius: 4 },
  notificationText: {
    color: colors.ink,
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  state: { minHeight: 150, justifyContent: "center", alignItems: "center" },
  stateText: { color: colors.muted, fontSize: 12 },
  error: {
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: { color: colors.red, fontSize: 11, textAlign: "center" },
  retry: { color: colors.blue, fontSize: 12, fontWeight: "900", marginTop: 8 },
  emptyText: { color: colors.muted, fontSize: 12, paddingVertical: 16 },
});
