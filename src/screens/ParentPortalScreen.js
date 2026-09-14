import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { attendanceApi } from "../services/attendanceApi";
import { feesApi } from "../services/feesApi";
import { homeworkApi } from "../services/homeworkApi";
import { timetableApi } from "../services/timetableApi";
import ParentAdditionalModuleScreen from "./ParentAdditionalModuleScreen";
import ParentAttendanceScreen from "./ParentAttendanceScreen";
import ParentExamsScreen from "./ParentExamsScreen";
import ParentFeesScreen from "./ParentFeesScreen";
import ParentHomeworkScreen from "./ParentHomeworkScreen";
import ParentTimetableScreen from "./ParentTimetableScreen";

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

const notices = [
  {
    type: "Finance",
    date: "9 Sep 2026",
    title: "Fees outstanding: ₹1,80,186",
    color: colors.red,
  },
  {
    type: "Compliance",
    date: "9 Sep 2026",
    title: "Attendance alert: 65%",
    color: colors.orange,
  },
  {
    type: "General",
    date: "17 Jul 2026",
    title: "Sankranthi",
    color: colors.blue,
  },
  { type: "Holiday", date: "19 May 2026", title: "Ugadi", color: colors.teal },
  {
    type: "General",
    date: "13 Apr 2026",
    title: "Annual Exam",
    color: colors.blue,
  },
  {
    type: "General",
    date: "10 Apr 2026",
    title: "Annual Day Celebrations",
    color: colors.blue,
  },
];

const schedule = [
  ["08:30", "Mathematics", "Room 204"],
  ["09:20", "English", "Room 204"],
  ["10:10", "Science", "Lab 1"],
  ["11:30", "Hindi", "Room 204"],
  ["12:20", "Art & Craft", "Art Studio"],
];

const attendanceSeed = [
  { id: 1, roll: "01", name: "Aarav Sharma", status: "Present" },
  { id: 2, roll: "02", name: "Diya Nair", status: "Present" },
  { id: 3, roll: "03", name: "Kabir Singh", status: "Late" },
  { id: 4, roll: "04", name: "Meera Iyer", status: "Unmarked" },
  { id: 5, roll: "05", name: "Rohan Das", status: "Absent" },
  { id: 6, roll: "06", name: "Sana Khan", status: "Unmarked" },
  { id: 7, roll: "07", name: "Vihaan Patel", status: "Present" },
  { id: 8, roll: "08", name: "Zoya Ali", status: "Present" },
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

const parentStudents = [
  {
    id: "student-1",
    initial: "j",
    name: "joshii",
    className: "Class_1",
    section: "A",
  },
  { id: "student-2", initial: "A", name: "Aarav", className: "Class_1" },
];

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
  onSelectStudent,
  onRefresh,
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
        {parentStudents.map((student) => (
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
      ) : dashboard.error ? (
        <View style={dashboardStyles.error}>
          <Text style={dashboardStyles.errorText}>{dashboard.error}</Text>
          <Pressable onPress={onRefresh}>
            <Text style={dashboardStyles.retry}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={dashboardStyles.summaryGrid}>
            <DashboardCard
              icon="pie-chart-outline"
              label="Attendance"
              value={dashboard.attendance}
              detail="Current summary"
              tint={colors.paleBlue}
              iconColor={colors.blue}
              onPress={() => goTo("Attendance")}
            />
            <DashboardCard
              icon="wallet-outline"
              label="Fees & Dues"
              value={dashboard.fees}
              detail="Outstanding"
              tint={colors.paleOrange}
              iconColor={colors.orange}
              onPress={() => goTo("Fees")}
            />
            <DashboardCard
              icon="book-outline"
              label="Homework"
              value="Tasks"
              detail={dashboard.homeworkDetail}
              tint={colors.paleTeal}
              iconColor={colors.teal}
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
            <Text style={dashboardStyles.emptyText}>No new notifications</Text>
          </View>
        </>
      )}
    </View>
  );
}

function NoticeRow({ notice }) {
  return (
    <View style={styles.noticeRow}>
      <View style={[styles.noticeDot, { backgroundColor: notice.color }]} />
      <View style={{ flex: 1 }}>
        <View style={styles.noticeMeta}>
          <Text style={[styles.noticeType, { color: notice.color }]}>
            {notice.type.toUpperCase()}
          </Text>
          <Text style={styles.noticeDate}>{notice.date}</Text>
        </View>
        <Text style={styles.noticeTitle}>{notice.title}</Text>
      </View>
      <Icon name="chevron-forward" size={16} color="#A3ADBB" />
    </View>
  );
}

function ScheduleRow({ item }) {
  return (
    <View style={styles.scheduleRow}>
      <Text style={styles.scheduleTime}>{item[0]}</Text>
      <View style={styles.scheduleLine} />
      <View style={{ flex: 1 }}>
        <Text style={styles.scheduleSubject}>{item[1]}</Text>
        <Text style={styles.scheduleRoom}>{item[2]}</Text>
      </View>
      <Icon name="arrow-forward-outline" size={16} color={colors.blue} />
    </View>
  );
}

function DetailContent({
  section,
  goTo,
  session,
  onSessionExpired,
  selectedStudentId,
}) {
  if (section === "Attendance")
    return (
      <ParentAttendanceScreen
        session={session}
        selectedStudentId={selectedStudentId}
        onSessionExpired={onSessionExpired}
        onBackHome={() => goTo("Home")}
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
        onBackHome={() => goTo("Home")}
      />
    );
  if (section === "Timetable")
    return (
      <ParentTimetableScreen
        session={session}
        selectedStudentId={selectedStudentId}
        onSessionExpired={onSessionExpired}
        onBackHome={() => goTo("Home")}
      />
    );
  if (
    [
      "Student Profile",
      "Transport",
      "Messaging / Notifications",
      "Events",
      "Leave",
      "Documents",
    ].includes(section)
  )
    return (
      <ParentAdditionalModuleScreen
        title={section}
        selectedStudent={parentStudents.find(
          (student) => student.id === selectedStudentId,
        )}
        onBack={() => goTo("Home")}
      />
    );
  return <NoticesContent />;
}

function AttendanceContent() {
  const [students, setStudents] = useState(attendanceSeed);
  const [selectedAction, setSelectedAction] = useState("Daily Log / Marking");
  const [selectedBulk, setSelectedBulk] = useState("All Present");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const totalEnrolled = students.length;
  const markedEntries = students.filter(
    (student) => student.status !== "Unmarked",
  ).length;
  const presentToday = students.filter(
    (student) => student.status === "Present",
  ).length;
  const absentCount = students.filter(
    (student) => student.status === "Absent",
  ).length;
  const lateArrivals = students.filter(
    (student) => student.status === "Late",
  ).length;

  const filteredStudents = students.filter((student) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Present" && student.status === "Present") ||
      (filter === "Absent" && student.status === "Absent");

    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      student.name.toLowerCase().includes(query) ||
      student.roll.includes(query);

    return matchesFilter && matchesSearch;
  });

  const toggleStatus = (id) => {
    setStudents((current) =>
      current.map((student) => {
        if (student.id !== id) return student;
        const nextStatus = student.status === "Present" ? "Absent" : "Present";
        return { ...student, status: nextStatus };
      }),
    );
  };

  const applyBulkAction = (value) => {
    setStudents((current) =>
      current.map((student) => {
        if (value === "All Present") return { ...student, status: "Present" };
        if (value === "All Absent") return { ...student, status: "Absent" };
        return student;
      }),
    );
  };

  const runCutoff = () => {
    setStudents((current) =>
      current.map((student) =>
        student.status === "Unmarked"
          ? { ...student, status: "Absent" }
          : student,
      ),
    );
    Alert.alert(
      "Cutoff applied",
      "Unmarked entries have been marked Absent and parents were notified via WhatsApp.",
    );
  };

  const submitAttendance = () => {
    Alert.alert(
      "Attendance submitted",
      "Daily attendance has been synced successfully.",
    );
  };

  return (
    <>
      <View style={styles.attendanceControlCard}>
        <View style={styles.attendanceHeaderRow}>
          <Text style={styles.attendanceTitle}>Attendance Control</Text>
          <Pressable style={styles.primaryBadge}>
            <Text style={styles.primaryBadgeText}>Daily Log / Marking</Text>
          </Pressable>
        </View>

        <View style={styles.actionPillRow}>
          {[
            "Daily Log / Marking",
            "History Log",
            "Biometric",
            "Export",
            "Submit Attendance",
          ].map((action) => {
            const isSelected = selectedAction === action;
            const isSubmit = action === "Submit Attendance";

            return (
              <Pressable
                key={action}
                style={[
                  styles.actionPill,
                  isSelected && styles.actionPillSelected,
                  isSubmit && styles.actionPillPrimary,
                ]}
                onPress={() => {
                  setSelectedAction(action);
                  if (isSubmit) submitAttendance();
                }}
              >
                <Text
                  style={[
                    styles.actionPillText,
                    isSelected && styles.actionPillTextSelected,
                    isSubmit && styles.actionPillTextPrimary,
                  ]}
                >
                  {action}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.cutoffCard}>
          <View style={styles.cutoffLabelWrap}>
            <Icon name="time-outline" size={16} color={colors.blue} />
            <Text style={styles.cutoffText}>
              10:30 AM Daily Attendance Cutoff Active
            </Text>
          </View>
          <Text style={styles.cutoffSubText}>
            Any students left unmarked by 10:30 AM on working days are
            automatically recorded as Absent and WhatsApp alerts are dispatched
            to parents.
          </Text>
          <Pressable style={styles.cutoffButton} onPress={runCutoff}>
            <Text style={styles.cutoffButtonText}>Run Cutoff Now</Text>
          </Pressable>
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{totalEnrolled}</Text>
            <Text style={styles.metricLabel}>Total Enrolled</Text>
            <Text style={styles.metricMeta}>MATRIX VOLUME</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{markedEntries}</Text>
            <Text style={styles.metricLabel}>Marked Entries</Text>
            <Text style={styles.metricMeta}>SYNCED</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{presentToday}</Text>
            <Text style={styles.metricLabel}>Present Today</Text>
            <Text style={styles.metricMeta}>ACTIVE STATUS</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{absentCount}</Text>
            <Text style={styles.metricLabel}>Absent Count</Text>
            <Text style={styles.metricMeta}>MISSING</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{lateArrivals}</Text>
            <Text style={styles.metricLabel}>Late Arrivals</Text>
            <Text style={styles.metricMeta}>AUDIT LAG</Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Text style={styles.dateTitle}>Date:</Text>
          <Text style={styles.dateValue}>11-09-2026</Text>
        </View>

        <View style={styles.filterGroup}>
          {["All Present", "All Absent"].map((option) => {
            const isSelected = selectedBulk === option;
            return (
              <Pressable
                key={option}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => {
                  setSelectedBulk(option);
                  applyBulkAction(option);
                }}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    isSelected && styles.optionButtonTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.searchBox}>
          <Icon name="search-outline" size={17} color={colors.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search name/roll..."
            placeholderTextColor="#9AA7B7"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Student</Text>
          <Text style={styles.tableHeaderText}>Status</Text>
        </View>

        {filteredStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No data available</Text>
            <Text style={styles.emptySubtitle}>
              No records found matching your criteria
            </Text>
          </View>
        ) : (
          filteredStudents.map((student) => (
            <Pressable
              key={student.id}
              style={styles.studentRow}
              onPress={() => toggleStatus(student.id)}
            >
              <View style={styles.studentMetaWrap}>
                <View style={styles.avatarChip}>
                  <Text style={styles.avatarText}>
                    {student.name.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentRoll}>Roll {student.roll}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  student.status === "Present" && styles.statusPresent,
                  student.status === "Absent" && styles.statusAbsent,
                  student.status === "Late" && styles.statusLate,
                  student.status === "Unmarked" && styles.statusUnmarked,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    student.status === "Present" && styles.statusTextPresent,
                    student.status === "Absent" && styles.statusTextAbsent,
                    student.status === "Late" && styles.statusTextLate,
                    student.status === "Unmarked" && styles.statusTextUnmarked,
                  ]}
                >
                  {student.status}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </View>
    </>
  );
}

function NoticesContent() {
  return (
    <>
      <View style={styles.filterRow}>
        <Text style={styles.subtle}>6 updates from Demo School</Text>
        <View style={styles.filterChip}>
          <Text style={styles.filterText}>
            All notices{" "}
            <Icon name="chevron-down" size={13} color={colors.blue} />
          </Text>
        </View>
      </View>
      <View style={styles.panel}>
        {notices.map((notice) => (
          <NoticeRow key={notice.title} notice={notice} />
        ))}
      </View>
    </>
  );
}

function ProfileModal({ visible, onClose }) {
  const [name, setName] = useState("joshi");
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
            value="joshi.parent@demoschool.in"
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
  const [activeTab, setActiveTab] = useState("Home");
  const [selectedStudentId, setSelectedStudentId] = useState(
    parentStudents[0]?.id || "",
  );
  const [dashboard, setDashboard] = useState({
    loading: true,
    error: "",
    attendance: "0%",
    fees: "₹0",
    homeworkDetail: "No data available",
    classes: [],
    schoolName: "School information unavailable",
    studentCount: parentStudents.length,
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const isHome = activeTab === "Home";
  const handleLogout = () => {
    Alert.alert("Signed out", "Demo sign out complete.", [
      { text: "OK", onPress: onLogout },
    ]);
  };

  const loadDashboard = async () => {
    setDashboard((current) => ({ ...current, loading: true, error: "" }));
    try {
      const [attendance, fees, homework, timetable] = await Promise.all([
        attendanceApi.getSummary("2026-09-11", session),
        feesApi.getSummary(session),
        homeworkApi.getAssignments(session),
        timetableApi.getWeeklySchedule(session),
      ]);
      const dayKey = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
        new Date().getDay()
      ];
      const daySessions = timetable?.[dayKey] || [];
      const classes = daySessions
        .filter((item) => item.subject)
        .map((item) => [
          `${item.startTime || ""}${item.endTime ? ` - ${item.endTime}` : ""}`,
          item.subject,
          [item.teacher, item.room].filter(Boolean).join(" · "),
        ]);
      setDashboard({
        loading: false,
        error: "",
        attendance: `${attendance?.attendanceRate ?? 0}%`,
        fees: `₹${Number(fees?.institutionalDues || 0).toLocaleString("en-IN")}`,
        homeworkDetail: homework?.length
          ? `${homework.length} available`
          : "No data available",
        classes,
        schoolName: "School information unavailable",
        studentCount: parentStudents.length,
      });
    } catch {
      setDashboard((current) => ({
        ...current,
        loading: false,
        error: "Unable to load dashboard data. Please try again.",
      }));
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [session, selectedStudentId]);

  const selectedStudent = parentStudents.find(
    (student) => student.id === selectedStudentId,
  ) ||
    parentStudents[0] || {
      id: "",
      initial: "?",
      name: "Student",
      className: "",
    };
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>DEMO SCHOOL</Text>
          <Text style={styles.portal}>
            Parent portal <Text style={styles.year}>2026–27</Text>
          </Text>
        </View>
        <Pressable onPress={handleLogout} style={styles.logout}>
          <Icon name="log-out-outline" size={18} color="#C8DBF2" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
      <ScrollView
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
            onSelectStudent={setSelectedStudentId}
            onRefresh={loadDashboard}
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
              onSessionExpired={onLogout}
            />
          </>
        )}
      </ScrollView>
      <View style={styles.bottomNav}>
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
      />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  },
  year: { color: "#8EB7E8", fontSize: 13, fontWeight: "600" },
  logout: { flexDirection: "row", alignItems: "center", gap: 6 },
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
  panel: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 15,
    marginBottom: 22,
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
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 31,
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
