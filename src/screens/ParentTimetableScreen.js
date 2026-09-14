import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "../constants/theme";
import { ApiError } from "../services/api";
import { timetableApi } from "../services/timetableApi";

const colors = {
  ink: Colors.light.text,
  muted: Colors.light.textSecondary,
  line: "#D9E7E4",
  white: "#FFFFFF",
  canvas: "#F4F8F6",
  blue: "#0D8B82",
  paleBlue: "#E5F4F0",
  paleOrange: "#FFF7DF",
  orange: "#A76E00",
  red: "#B94E4E",
  blueTint: "#E5F4F0",
  blueAccent: "#168A7C",
  indigoTint: "#EAF0FB",
  indigoAccent: "#5274B8",
  orangeTint: "#FFF1DF",
  orangeAccent: "#D9822B",
  redTint: "#FDECEC",
  redAccent: "#C65353",
  purpleTint: "#F2ECFB",
  purpleAccent: "#7A5AA6",
  skyTint: "#EAF5FB",
  skyAccent: "#3284A8",
  goldTint: "#FFF6D9",
  goldAccent: "#B8861B",
  violetTint: "#F0EDF8",
  violetAccent: "#6C63A8",
};
const timetableBoxColors = [
  [colors.blueTint, colors.blueAccent],
  [colors.orangeTint, colors.orangeAccent],
  [colors.indigoTint, colors.indigoAccent],
  [colors.redTint, colors.redAccent],
  [colors.skyTint, colors.skyAccent],
  [colors.goldTint, colors.goldAccent],
  [colors.purpleTint, colors.purpleAccent],
  [colors.violetTint, colors.violetAccent],
];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Icon({ name, size = 18, color = colors.ink }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function SessionCard({ session, index }) {
  const hasClass = Boolean(session.subject);
  const [backgroundColor, accentColor] =
    timetableBoxColors[index % timetableBoxColors.length];
  return (
    <View
      style={[
        styles.sessionCard,
        { backgroundColor, borderColor: accentColor },
      ]}
    >
      <Text style={[styles.time, { color: accentColor }]}>
        {session.startTime} TO {session.endTime}
      </Text>
      {hasClass ? (
        <>
          <View style={styles.sessionLine}>
            <Text style={[styles.room, { color: accentColor }]}>
              {session.room}
            </Text>
            <Text style={styles.subject}>{session.subject}</Text>
            <Text style={[styles.teacher, { color: accentColor }]}>
              {session.teacher}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.emptySession}>
          <Icon name="remove-circle-outline" size={18} color={accentColor} />
          <Text style={[styles.emptySessionText, { color: accentColor }]}>
            No class scheduled
          </Text>
        </View>
      )}
    </View>
  );
}

export default function ParentTimetableScreen({
  session,
  onSessionExpired,
  onBackHome,
}) {
  const [selectedDay, setSelectedDay] = useState("Mon");
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTimetable = async () => {
    setLoading(true);
    setError("");
    try {
      setTimetable(await timetableApi.getWeeklySchedule(session));
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to load timetable. Please try again.",
      );
      if (requestError.status === 401) onSessionExpired?.();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimetable();
  }, []);
  const sessions = timetable[selectedDay] || [];

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>Timetable</Text>
        <Text style={styles.subtitle}>Parent Mobile View</Text>
        <Pressable style={styles.backHome} onPress={onBackHome}>
          <Icon name="arrow-back" size={16} color={colors.blue} />
          <Text style={styles.backText}>Back Home</Text>
        </Pressable>
      </View>
      <View
        style={[
          styles.intro,
          {
            backgroundColor: colors.purpleTint,
            borderColor: colors.purpleAccent,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.purpleAccent }]}>
          Weekly Schedule
        </Text>
        <Text style={styles.description}>Institutional Class Timetable</Text>
      </View>
      <View style={styles.dayTabs}>
        {days.map((day, index) => {
          const [backgroundColor, accentColor] =
            timetableBoxColors[index % timetableBoxColors.length];
          return (
            <Pressable
              key={day}
              style={[
                styles.dayTab,
                { backgroundColor, borderColor: accentColor },
                selectedDay === day && styles.dayTabActive,
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: accentColor },
                  selectedDay === day && styles.dayTextActive,
                ]}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.blue} />
          <Text style={styles.loadingText}>Loading timetable...</Text>
        </View>
      ) : error ? (
        <View
          style={[
            styles.errorBox,
            { backgroundColor: colors.redTint, borderColor: colors.redAccent },
          ]}
        >
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadTimetable}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : sessions.length === 0 ? (
        <View
          style={[
            styles.empty,
            {
              backgroundColor: colors.goldTint,
              borderColor: colors.goldAccent,
            },
          ]}
        >
          <Text style={styles.emptyText}>No timetable available.</Text>
        </View>
      ) : (
        sessions.map((item, index) => (
          <SessionCard
            key={`${selectedDay}-${item.startTime}-${index}`}
            session={item}
            index={index}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.canvas, paddingBottom: 20 },
  heading: { marginBottom: 18 },
  title: { color: colors.ink, fontSize: 22, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  backHome: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  backText: { color: colors.blue, fontSize: 12, fontWeight: "900" },
  intro: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  description: { color: colors.muted, fontSize: 12, marginTop: 5 },
  dayTabs: { flexDirection: "row", gap: 6, marginBottom: 14 },
  dayTab: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  dayTabActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  dayText: { color: colors.muted, fontSize: 11, fontWeight: "900" },
  dayTextActive: { color: colors.white },
  sessionCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  time: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 10,
  },
  sessionLine: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 10,
  },
  room: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  subject: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 4,
    flexShrink: 1,
  },
  teacher: { color: colors.muted, fontSize: 12, marginTop: 5, flexShrink: 1 },
  emptySession: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  emptySessionText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  loading: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: { color: colors.muted, fontSize: 12 },
  errorBox: {
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  errorText: { color: colors.red, fontSize: 11, textAlign: "center" },
  retryText: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8,
  },
  empty: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 22,
    alignItems: "center",
  },
  emptyText: { color: colors.muted, fontSize: 12 },
});
