import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Colors } from "../constants/theme";
import { announcementsApi } from "../services/announcementsApi";
import { ApiError } from "../services/api";

const colors = {
  ink: Colors.light.text,
  muted: Colors.light.textSecondary,
  line: "#D9E7E4",
  white: "#FFFFFF",
  canvas: "#F4F8F6",
  blue: "#0D8B82",
  paleBlue: "#E5F4F0",
  red: "#C65353",
  paleRed: "#FDECEC",
  orange: "#A76E00",
  paleOrange: "#FFF7DF",
  blueTint: "#EAF0FB",
  blueAccent: "#5274B8",
  goldTint: "#FFF6D9",
  goldAccent: "#B8861B",
  purpleTint: "#F2ECFB",
  purpleAccent: "#7A5AA6",
};

const announcementCardColors = [
  [colors.paleBlue, colors.blue],
  [colors.blueTint, colors.blueAccent],
  [colors.paleOrange, colors.orange],
  [colors.paleRed, colors.red],
];

const priorityStyle = (priority) => {
  if (String(priority).toLowerCase() === "high") {
    return { backgroundColor: colors.paleRed, color: colors.red };
  }
  if (String(priority).toLowerCase() === "medium") {
    return { backgroundColor: colors.paleOrange, color: colors.orange };
  }
  return { backgroundColor: colors.paleBlue, color: colors.blue };
};

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

export default function ParentAnnouncementsScreen({
  session,
  selectedStudentId,
  onSessionExpired,
}) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnnouncements = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const records = await announcementsApi.getAnnouncements(
        session,
        selectedStudentId,
      );
      setAnnouncements(records);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to load announcements. Please try again.",
      );
      if (requestError.status === 401) onSessionExpired?.();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [session, selectedStudentId]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadAnnouncements(true)}
          tintColor={colors.blue}
        />
      }
    >
      <View style={styles.heading}>
        <View style={styles.headingRow}>
          <View style={styles.iconBox}>
            <Ionicons name="megaphone-outline" size={23} color={colors.blue} />
          </View>
          <View>
            <Text style={styles.title}>Announcements</Text>
            <Text style={styles.subtitle}>
              School messages and notifications
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.blue} />
          <Text style={styles.stateText}>Loading announcements...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => loadAnnouncements()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : announcements.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons
            name="notifications-off-outline"
            size={30}
            color={colors.muted}
          />
          <Text style={styles.emptyTitle}>No announcements</Text>
          <Text style={styles.emptyText}>
            New school notices will appear here.
          </Text>
        </View>
      ) : (
        announcements.map((announcement, index) => {
          const badge = priorityStyle(announcement.priority);
          const [cardBackground, cardAccent] =
            announcementCardColors[index % announcementCardColors.length];
          return (
            <View
              key={announcement.id || `${announcement.title}-${index}`}
              style={[
                styles.card,
                { backgroundColor: cardBackground, borderColor: cardAccent },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.typeRow}>
                  <Ionicons
                    name="notifications-outline"
                    size={15}
                    color={cardAccent}
                  />
                  <Text style={[styles.type, { color: cardAccent }]}>
                    {announcement.type}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.priority,
                    {
                      backgroundColor: badge.backgroundColor,
                      color: badge.color,
                    },
                  ]}
                >
                  {announcement.priority}
                </Text>
              </View>
              <Text style={styles.cardTitle}>{announcement.title}</Text>
              <Text style={styles.message}>{announcement.message}</Text>
              <View style={styles.meta}>
                <Text style={styles.metaText}>
                  {formatDate(announcement.date)}
                </Text>
                <Text style={styles.metaText}>{announcement.creator}</Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.canvas },
  content: { paddingBottom: 24 },
  heading: { marginBottom: 18 },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 18,
  },
  backText: { color: colors.blue, fontSize: 12, fontWeight: "900" },
  headingRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: colors.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: colors.ink, fontSize: 22, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 4 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  type: {
    color: colors.blue,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  priority: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
  },
  message: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: 12,
    paddingTop: 9,
  },
  metaText: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  state: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stateText: { color: colors.muted, fontSize: 12 },
  errorBox: {
    backgroundColor: colors.paleRed,
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
  emptyBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    padding: 28,
    alignItems: "center",
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 9,
  },
  emptyText: { color: colors.muted, fontSize: 11, marginTop: 5 },
});
