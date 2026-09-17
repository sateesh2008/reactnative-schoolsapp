import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Colors } from "../constants/theme";
import { ApiError } from "../services/api";
import { leaveApi } from "../services/leaveApi";

const colors = {
  ink: Colors.light.text,
  muted: Colors.light.textSecondary,
  line: "#D9E7E4",
  white: "#FFFFFF",
  canvas: "#F4F8F6",
  blue: "#0D8B82",
  paleBlue: "#E5F4F0",
  blueTint: "#EAF0FB",
  blueAccent: "#5274B8",
  goldTint: "#FFF6D9",
  goldAccent: "#B8861B",
  red: "#C65353",
  paleRed: "#FDECEC",
};

const leaveCardColors = [
  [colors.paleBlue, colors.blue],
  [colors.blueTint, colors.blueAccent],
  [colors.goldTint, colors.goldAccent],
  [colors.paleRed, colors.red],
];

const displayDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN");
};

export default function ParentLeaveScreen({
  session,
  selectedStudentId,
  onSessionExpired,
}) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    leave_type: "Sick Leave",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const loadLeaves = async () => {
    setLoading(true);
    setError("");
    try {
      setLeaves(await leaveApi.getLeaves(session, selectedStudentId));
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to load leave requests.",
      );
      if (requestError.status === 401) onSessionExpired?.();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [session, selectedStudentId]);

  const submitLeave = async () => {
    if (
      !selectedStudentId ||
      !form.start_date ||
      !form.end_date ||
      !form.reason.trim()
    ) {
      Alert.alert(
        "Missing details",
        "Enter the dates and reason before applying.",
      );
      return;
    }
    setSubmitting(true);
    try {
      await leaveApi.applyLeave(session, {
        student_id: selectedStudentId,
        ...form,
        reason: form.reason.trim(),
      });
      setForm({
        leave_type: "Sick Leave",
        start_date: "",
        end_date: "",
        reason: "",
      });
      Alert.alert("Leave applied", "Your leave request has been submitted.");
      loadLeaves();
    } catch (requestError) {
      Alert.alert(
        "Unable to apply leave",
        requestError instanceof ApiError
          ? requestError.message
          : "Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <Ionicons name="create-outline" size={27} color={colors.blue} />
        <View>
          <Text style={styles.title}>Leave Requests</Text>
          <Text style={styles.subtitle}>Apply and track student leave</Text>
        </View>
      </View>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.paleBlue, borderColor: colors.blue },
        ]}
      >
        <Text style={styles.cardTitle}>Apply for leave</Text>
        <Text style={styles.label}>Leave type</Text>
        <View style={styles.typeRow}>
          {["Sick Leave", "Personal Leave", "Other"].map((type) => (
            <Pressable
              key={type}
              style={[
                styles.type,
                form.leave_type === type && styles.typeActive,
              ]}
              onPress={() => setForm({ ...form, leave_type: type })}
            >
              <Text
                style={[
                  styles.typeText,
                  form.leave_type === type && styles.typeTextActive,
                ]}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Start date (YYYY-MM-DD)</Text>
        <TextInput
          value={form.start_date}
          onChangeText={(value) => setForm({ ...form, start_date: value })}
          placeholder="2026-09-20"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Text style={styles.label}>End date (YYYY-MM-DD)</Text>
        <TextInput
          value={form.end_date}
          onChangeText={(value) => setForm({ ...form, end_date: value })}
          placeholder="2026-09-21"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Text style={styles.label}>Reason</Text>
        <TextInput
          value={form.reason}
          onChangeText={(value) => setForm({ ...form, reason: value })}
          placeholder="Explain the reason for leave"
          placeholderTextColor={colors.muted}
          multiline
          style={[styles.input, styles.reason]}
        />
        <Pressable
          style={[styles.button, submitting && styles.disabled]}
          disabled={submitting}
          onPress={submitLeave}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="send-outline" size={16} color={colors.white} />
              <Text style={styles.buttonText}>Submit application</Text>
            </>
          )}
        </Pressable>
      </View>
      <Text style={styles.sectionTitle}>Previous requests</Text>
      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.blue} />
          <Text style={styles.stateText}>Loading leave requests...</Text>
        </View>
      ) : error ? (
        <View style={styles.error}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadLeaves}>
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </View>
      ) : leaves.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No leave requests</Text>
          <Text style={styles.emptyText}>
            Submitted requests will appear here.
          </Text>
        </View>
      ) : (
        leaves.map((leave, index) => {
          const [rowBackground, rowAccent] =
            leaveCardColors[(index + 1) % leaveCardColors.length];
          return (
            <View
              key={leave.id || index}
              style={[
                styles.leaveRow,
                { backgroundColor: rowBackground, borderColor: rowAccent },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.leaveType}>
                  {leave.leave_type || leave.type || "Leave request"}
                </Text>
                <Text style={styles.leaveDate}>
                  {displayDate(leave.start_date || leave.from_date)} -{" "}
                  {displayDate(leave.end_date || leave.to_date)}
                </Text>
                <Text style={styles.leaveReason}>
                  {leave.reason || "No reason provided"}
                </Text>
              </View>
              <Text style={[styles.status, { color: rowAccent }]}>
                {leave.status || "Pending"}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.canvas },
  content: { paddingBottom: 25 },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 18,
  },
  backText: { color: colors.blue, fontSize: 12, fontWeight: "900" },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  title: { color: colors.ink, fontSize: 22, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    padding: 14,
    marginBottom: 18,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
  },
  label: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 9,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  typeRow: { flexDirection: "row", gap: 6 },
  type: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
  },
  typeActive: { backgroundColor: colors.paleBlue, borderColor: colors.blue },
  typeText: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  typeTextActive: { color: colors.blue },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    minHeight: 42,
    paddingHorizontal: 11,
    color: colors.ink,
    fontSize: 13,
  },
  reason: { minHeight: 82, paddingTop: 11, textAlignVertical: "top" },
  button: {
    minHeight: 44,
    borderRadius: 9,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 15,
  },
  buttonText: { color: colors.white, fontSize: 12, fontWeight: "900" },
  disabled: { opacity: 0.6 },
  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 9,
  },
  leaveRow: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 13,
    marginBottom: 9,
    flexDirection: "row",
    gap: 10,
  },
  leaveType: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  leaveDate: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },
  leaveReason: { color: colors.muted, fontSize: 11, marginTop: 5 },
  status: {
    color: colors.blue,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  state: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stateText: { color: colors.muted, fontSize: 11 },
  error: {
    backgroundColor: colors.paleRed,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  errorText: { color: colors.red, fontSize: 11, textAlign: "center" },
  retry: { color: colors.blue, fontSize: 12, fontWeight: "900", marginTop: 7 },
  empty: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  emptyTitle: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  emptyText: { color: colors.muted, fontSize: 11, marginTop: 5 },
});
