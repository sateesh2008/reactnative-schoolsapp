import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "../constants/theme";
import { ApiError } from "../services/api";
import { attendanceApi } from "../services/attendanceApi";

const colors = {
  ink: Colors.light.text,
  muted: Colors.light.textSecondary,
  line: "#D9E7E4",
  white: "#FFFFFF",
  canvas: "#F5F3F8",
  blue: "#0D8B82",
  orange: "#A76E00",
  paleBlue: "#E5F4F0",
  green: "#1E8E5E",
  paleGreen: "#E8F8F1",
  red: "#B94E4E",
  paleRed: "#FDECEC",
  paleOrange: "#FFF7DF",
  attendanceRateTint: "#E5F4F0",
  attendanceRateAccent: "#168A7C",
  daysPresentTint: "#EAF0FB",
  daysPresentAccent: "#5274B8",
  daysAbsentTint: "#FFF1DF",
  daysAbsentAccent: "#D9822B",
  lateEntriesTint: "#FDECEC",
  lateEntriesAccent: "#C65353",
  logsTint: "#F2ECFB",
  logsAccent: "#7A5AA6",
  logRowBlueTint: "#EAF5FB",
  logRowBlueAccent: "#3284A8",
  logRowGoldTint: "#FFF6D9",
  logRowGoldAccent: "#B8861B",
  logRowPurpleTint: "#F0EDF8",
  logRowPurpleAccent: "#6C63A8",
};

const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, index) => ({ label, value: index + 1 }));

const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, index) => {
  const value = currentYear - 2 + index;
  return { label: String(value), value };
});

const getAttendanceDate = (value) => {
  const dateValue = String(value || "").split("T")[0];
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
};

const formatAttendanceDate = (value) => {
  const dateParts = getAttendanceDate(value);
  if (!dateParts) return "Date unavailable";
  const date = new Date(dateParts.year, dateParts.month - 1, dateParts.day);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAttendanceDay = (value) => {
  const dateParts = getAttendanceDate(value);
  if (!dateParts) return "";
  return new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
  ).toLocaleDateString("en-US", { weekday: "long" });
};

const filterAttendanceByMonth = (records, month, year) =>
  records.filter((record) => {
    const dateParts = getAttendanceDate(record.date);
    return dateParts?.month === month && dateParts?.year === year;
  });

const statusStyle = (status) => {
  if (status === "Present")
    return [styles.statusBadge, styles.presentBadge, styles.presentText];
  if (status === "Absent")
    return [styles.statusBadge, styles.absentBadge, styles.absentText];
  if (status === "Late")
    return [styles.statusBadge, styles.lateBadge, styles.lateText];
  if (status === "Half Day")
    return [styles.statusBadge, styles.halfDayBadge, styles.halfDayText];
  return [styles.statusBadge, styles.unmarkedBadge, styles.unmarkedText];
};

const messageForError = (error) =>
  error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again later.";

function Loading({ label = "Loading..." }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.blue} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

function EmptyState({ message = "No records found matching your criteria" }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No data available</Text>
      <Text style={styles.emptySubtitle}>{message}</Text>
    </View>
  );
}

function MetricCard({ title, value, label, backgroundColor, accentColor }) {
  return (
    <View style={[styles.metricCard, { backgroundColor }]}>
      <Text style={[styles.metricValue, { color: accentColor }]}>
        {value ?? 0}
      </Text>
      <Text style={[styles.metricTitle, { color: accentColor }]}>{title}</Text>
      <Text style={[styles.metricMeta, { color: accentColor }]}>{label}</Text>
    </View>
  );
}

function PeriodSelector({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <View style={styles.selectorWrap}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Select ${label}`}
        onPress={() => setOpen(true)}
        style={styles.selectorButton}
      >
        <Text style={styles.selectorValue}>{selectedOption?.label}</Text>
        <Ionicons name="chevron-down" size={17} color={colors.muted} />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.selectorBackdrop} onPress={() => setOpen(false)}>
          <View style={styles.selectorMenu}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={[
                  styles.selectorOption,
                  option.value === value && styles.selectorOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.selectorOptionText,
                    option.value === value && styles.selectorOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function AttendanceLog({ record, index, isFirst, isLast }) {
  const [badge, badgeBackground, badgeText] = statusStyle(record.status);
  const rowColors = [
    [colors.logsTint, colors.logsAccent],
    [colors.logRowBlueTint, colors.logRowBlueAccent],
    [colors.logRowGoldTint, colors.logRowGoldAccent],
    [colors.logRowPurpleTint, colors.logRowPurpleAccent],
  ];
  const [rowTint, rowAccent] = rowColors[index % rowColors.length];
  return (
    <View
      style={[
        styles.logRow,
        isFirst && styles.firstLogRow,
        isLast && styles.lastLogRow,
        { backgroundColor: rowTint },
      ]}
    >
      <View style={styles.logDate}>
        <Text style={[styles.logDateText, { color: rowAccent }]}>
            {formatAttendanceDate(record.date)}
        </Text>
          <Text style={[styles.logDay, { color: rowAccent }]}>
            {formatAttendanceDay(record.date)}
          </Text>
      </View>
      <View style={styles.logDivider} />
      <View style={styles.logDetails}>
        <View style={styles.logStatusRow}>
          <Text style={[styles.logStatusLabel, { color: rowAccent }]}>
            Attendance
          </Text>
          <View style={[badge, badgeBackground]}>
            <Text style={[styles.statusText, badgeText]}>{record.status}</Text>
          </View>
        </View>
        {record.biometricPunch ? (
          <Text style={[styles.biometricText, { color: rowAccent }]}>
            Biometric punch at {record.biometricPunch}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function ParentAttendanceScreen({
  session,
  selectedStudentId,
  onSessionExpired,
}) {
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const loadDaily = useCallback(async () => {
    setLoading(true);
    setError("");
    setMonthlyRecords([]);
    const month = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
    try {
      const { summary: nextSummary, records: nextMonthlyRecords } =
        await attendanceApi.getMonthlyData(month, session, selectedStudentId);
      const filteredRecords = filterAttendanceByMonth(
        nextMonthlyRecords,
        selectedMonth,
        selectedYear,
      );
      setSummary(nextSummary);
      setMonthlyRecords(filteredRecords);
    } catch (requestError) {
      setError(messageForError(requestError));
      if (requestError.status === 401) onSessionExpired?.();
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired, selectedMonth, selectedStudentId, selectedYear, session]);

  useEffect(() => {
    const timer = setTimeout(() => void loadDaily(), 0);
    return () => clearTimeout(timer);
  }, [loadDaily]);

  const selectedMonthLabel =
    monthOptions.find((option) => option.value === selectedMonth)?.label || "";

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Attendance</Text>
        <Text style={styles.scopeText}>Parent Mobile View</Text>
      </View>
      <View style={styles.selectorRow}>
        <PeriodSelector
          label="Month"
          value={selectedMonth}
          options={monthOptions}
          onChange={setSelectedMonth}
        />
        <PeriodSelector
          label="Academic Year"
          value={selectedYear}
          options={yearOptions}
          onChange={setSelectedYear}
        />
      </View>
      {error ? (
        <View style={styles.errorState}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => void loadDaily()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.summaryHeading}>
        <Text style={styles.sectionTitle}>Attendance Summary</Text>
        <Text style={styles.sectionSubtitle}>
          {selectedMonthLabel} {selectedYear} academic presence
        </Text>
      </View>
      <View style={styles.summaryGrid}>
        <MetricCard
          title="Attendance Rate"
          value={`${summary.attendanceRate ?? 0}%`}
          label="MONTHLY RATE"
          backgroundColor={colors.attendanceRateTint}
          accentColor={colors.attendanceRateAccent}
        />
        <MetricCard
          title="Days Present"
          value={summary.daysPresent ?? 0}
          label="PRESENT"
          backgroundColor={colors.daysPresentTint}
          accentColor={colors.daysPresentAccent}
        />
        <MetricCard
          title="Days Absent"
          value={summary.daysAbsent ?? 0}
          label="ABSENT"
          backgroundColor={colors.daysAbsentTint}
          accentColor={colors.daysAbsentAccent}
        />
        <MetricCard
          title="Late Entries"
          value={summary.lateEntries ?? 0}
          label="LATE"
          backgroundColor={colors.lateEntriesTint}
          accentColor={colors.lateEntriesAccent}
        />
      </View>
      <View style={styles.logsHeading}>
        <Text style={styles.sectionTitle}>Attendance Logs</Text>
        <Text style={styles.sectionSubtitle}>Monthly Academic Presence</Text>
        <Text style={styles.monthLabel}>
          {selectedMonthLabel} {selectedYear}
        </Text>
      </View>
      {loading ? (
        <Loading label="Loading attendance..." />
      ) : monthlyRecords.length === 0 ? (
        <EmptyState message="No attendance records found for this month." />
      ) : (
        <View style={[styles.logsCard, { borderColor: colors.logsAccent }]}>
          {monthlyRecords.map((record, index) => (
            <AttendanceLog
              key={record.id || index}
              record={record}
              index={index}
              isFirst={index === 0}
              isLast={index === monthlyRecords.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.canvas, paddingBottom: 18 },
  headingRow: { marginBottom: 14 },
  heading: { color: colors.ink, fontSize: 22, fontWeight: "900" },
  scopeText: { color: colors.muted, fontSize: 11, marginTop: 4 },
  selectorRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  selectorWrap: { flex: 1, minWidth: 0 },
  selectorLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 6,
  },
  selectorButton: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorValue: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  selectorBackdrop: {
    flex: 1,
    backgroundColor: "rgba(23, 52, 59, 0.28)",
    justifyContent: "center",
    padding: 24,
  },
  selectorMenu: {
    maxHeight: "80%",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 8,
    elevation: 5,
  },
  selectorOption: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectorOptionActive: { backgroundColor: colors.paleBlue },
  selectorOptionText: { color: colors.ink, fontSize: 14 },
  selectorOptionTextActive: { color: colors.blue, fontWeight: "800" },
  backHome: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  backHomeText: { color: colors.blue, fontSize: 12, fontWeight: "900" },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 14 },
  tab: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  activeTab: { backgroundColor: colors.paleBlue, borderColor: colors.blue },
  tabText: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  activeTabText: { color: colors.blue },
  summaryHeading: { marginBottom: 9 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  sectionSubtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  logsHeading: { marginBottom: 9 },
  monthLabel: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 10,
  },
  logsCard: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 8,
    marginBottom: 14,
    overflow: "hidden",
  },
  logRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 10,
  },
  firstLogRow: { borderTopLeftRadius: 13, borderTopRightRadius: 13 },
  lastLogRow: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
  },
  logDate: { width: 78 },
  logDateText: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  logDay: { color: colors.muted, fontSize: 10, marginTop: 4 },
  logDivider: {
    width: 2,
    height: 42,
    backgroundColor: colors.paleBlue,
    marginHorizontal: 10,
  },
  logDetails: { flex: 1 },
  logStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  logStatusLabel: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  biometricText: { color: colors.muted, fontSize: 10, marginTop: 6 },
  alertCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  alertHeading: { flexDirection: "row", alignItems: "center", gap: 7 },
  alertTitle: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  alertLabel: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 10,
  },
  alertBody: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  primaryButton: {
    backgroundColor: colors.blue,
    borderRadius: 10,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  primaryButtonText: { color: colors.white, fontSize: 12, fontWeight: "900" },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  metricCard: {
    width: "31.5%",
    minHeight: 92,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 9,
  },
  metricValue: {
    color: colors.ink,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "900",
  },
  metricTitle: {
    color: colors.ink,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
  },
  metricMeta: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 8,
    letterSpacing: 0.4,
    marginTop: 6,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  historyDates: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },
  dateLabel: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  dateValue: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  controlsRow: { gap: 8, marginBottom: 10 },
  selectButton: {
    minHeight: 43,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 9,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  searchBox: {
    minHeight: 43,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 9,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, color: colors.ink, fontSize: 12 },
  records: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  recordRow: {
    minHeight: 110,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  recordMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 9 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.blue, fontWeight: "900" },
  recordCopy: { flex: 1 },
  recordName: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  recordMeta: { color: colors.muted, fontSize: 10, marginTop: 3 },
  statusBadge: {
    minWidth: 72,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    alignItems: "center",
  },
  statusText: { fontSize: 10, fontWeight: "900" },
  presentBadge: { backgroundColor: colors.paleGreen, borderColor: "#B6E7D0" },
  presentText: { color: colors.green },
  absentBadge: { backgroundColor: colors.paleRed, borderColor: "#F4C4C4" },
  absentText: { color: colors.red },
  lateBadge: { backgroundColor: colors.paleOrange, borderColor: "#F5D98B" },
  lateText: { color: colors.orange },
  halfDayBadge: { backgroundColor: "#FFF0E0", borderColor: "#F2C38B" },
  halfDayText: { color: colors.orange },
  unmarkedBadge: { backgroundColor: "#F2F4F7", borderColor: "#DDE3EA" },
  unmarkedText: { color: colors.muted },
  submitButton: {
    backgroundColor: colors.blue,
    minHeight: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  loading: {
    minHeight: 130,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: { color: colors.muted, fontSize: 12 },
  emptyState: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 22,
    alignItems: "center",
  },
  emptyTitle: { color: colors.ink, fontSize: 14, fontWeight: "900" },
  emptySubtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 5,
    textAlign: "center",
  },
  errorState: {
    backgroundColor: colors.paleRed,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  errorText: {
    color: colors.red,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 5,
  },
  retryText: { color: colors.blue, fontSize: 12, fontWeight: "900" },
  historyCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 14,
    marginBottom: 9,
  },
  historyPercentage: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 7,
  },
  exportCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 14,
  },
  exportTitle: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  exportText: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 6,
    marginBottom: 14,
  },
  exportButton: {
    minHeight: 43,
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  exportButtonText: { color: colors.blue, fontSize: 12, fontWeight: "900" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(9, 25, 44, 0.45)",
    justifyContent: "center",
    padding: 24,
  },
  filterModal: { backgroundColor: colors.white, borderRadius: 14, padding: 16 },
  modalTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  modalOptionActive: { backgroundColor: colors.paleBlue },
  modalOptionText: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  modalOptionTextActive: { color: colors.blue },
  configHint: {
    color: colors.muted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 12,
  },
});
