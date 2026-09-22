import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { announcementsApi } from "../services/announcementsApi";

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
  plum: "#5A4AB6",
  softLilac: "#F5F1FF",
};

const sampleAnnouncements = [
  {
    id: "sample-sankranthi",
    title: "Sankranthi",
    date: "17 Jul",
    message: "iuh",
    type: "Announcement",
    creator: "School Administration",
  },
  {
    id: "sample-ugadi",
    title: "UGADI",
    date: "19 May",
    message: "...",
    type: "Announcement",
    creator: "School Administration",
  },
  {
    id: "sample-sankranthi-holidays-1",
    title: "SANKRANTHI HOILDAYS",
    date: "07 May",
    message: "",
    type: "Announcement",
    creator: "School Administration",
  },
  {
    id: "sample-sankranthi-holidays-2",
    title: "SANKRANTHI HOILDAYS",
    date: "",
    message: "",
    type: "Announcement",
    creator: "School Administration",
  },
];

function Icon({ name, size = 18, color = colors.ink }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function formatAnnouncementDate(value) {
  if (!value) return "Date unavailable";
  if (/^\d{1,2} [A-Za-z]{3,9}$/.test(String(value))) return String(value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export default function TeacherMessagesScreen({ session, onBack }) {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await announcementsApi.getAnnouncements(session);
      const nextMessages =
        Array.isArray(result) && result.length ? result : sampleAnnouncements;
      setMessages(nextMessages);
    } catch (requestError) {
      setError(
        requestError?.message || "Unable to load messages. Please try again.",
      );
      setMessages(sampleAnnouncements);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadMessages();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadMessages]);

  const unreadCount = useMemo(
    () =>
      messages.filter((message) => {
        const readStatus =
          message?.read === true ||
          message?.isRead === true ||
          message?.read_status === true ||
          message?.status === "read";
        return !readStatus;
      }).length,
    [messages],
  );

  const openMessage = (message) => {
    setSelectedMessage(message);
  };

  return (
    <View style={styles.screenWrap}>
      <View style={styles.headerCard}>
        {onBack ? (
          <Pressable style={styles.backButton} onPress={onBack}>
            <Icon name="arrow-back" size={16} color={colors.blue} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : null}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Announcements</Text>
            <Text style={styles.pageSubtitle}>
              School messages and notifications
            </Text>
          </View>
          <View style={styles.unreadPill}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="small" color={colors.blue} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : null}

      {!loading && !messages.length ? (
        <View style={styles.emptyState}>
          <Icon name="mail-open-outline" size={28} color={colors.blue} />
          <Text style={styles.emptyTitle}>No announcements yet</Text>
          <Text style={styles.emptyText}>
            New school notices will appear here.
          </Text>
        </View>
      ) : null}

      {!loading && messages.length ? (
        <ScrollView contentContainerStyle={styles.listWrap}>
          {messages.map((message, index) => {
            const isUnread =
              message?.read !== true &&
              message?.isRead !== true &&
              message?.read_status !== true &&
              message?.status !== "read";
            const subject = message?.title || "No subject";
            const preview =
              message?.message ||
              message?.content ||
              message?.description ||
              "No message preview available.";
            const time = message?.date || message?.created_at || "";
            const creator = message?.creator || "School Administration";

            return (
              <Pressable
                key={message?.id || `${subject}-${index}`}
                style={({ pressed }) => [
                  styles.messageCard,
                  isUnread && styles.messageCardUnread,
                  pressed && styles.pressed,
                ]}
                onPress={() => {
                  openMessage(message);
                  if (!String(message?.id || "").startsWith("sample-")) {
                    void announcementsApi.markAsRead(session, message.id);
                  }
                }}
              >
                <View style={styles.messageBadgeWrap}>
                  <View style={styles.messageAvatar}>
                    <Text style={styles.messageAvatarText}>
                      {String(creator).charAt(0).toUpperCase() || "S"}
                    </Text>
                  </View>
                  {isUnread ? <View style={styles.unreadDot} /> : null}
                </View>
                <View style={styles.messageCopy}>
                  <View style={styles.messageHeaderRow}>
                    <Text style={styles.senderName}>
                      {message?.type || "Announcement"}
                    </Text>
                    <Text style={styles.messageTime}>
                      {formatAnnouncementDate(time)}
                    </Text>
                  </View>
                  <Text style={styles.messageSubject}>{subject}</Text>
                  <Text style={styles.messagePreview} numberOfLines={2}>
                    {preview}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          <Pressable
            style={({ pressed }) => [
              styles.viewAllButton,
              pressed && styles.pressed,
            ]}
            onPress={() => void loadMessages()}
          >
            <Icon name="megaphone-outline" size={17} color={colors.blue} />
            <Text style={styles.viewAllText}>View All Announcements</Text>
            <Icon name="arrow-forward" size={16} color={colors.blue} />
          </Pressable>
        </ScrollView>
      ) : null}

      <Modal
        transparent
        visible={Boolean(selectedMessage)}
        animationType="slide"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedMessage(null)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Message</Text>
              <Pressable onPress={() => setSelectedMessage(null)}>
                <Icon name="close" size={20} color={colors.ink} />
              </Pressable>
            </View>
            <Text style={styles.modalSender}>
              {selectedMessage?.creator || "School Administration"}
            </Text>
            <Text style={styles.modalSubject}>
              {selectedMessage?.subject ||
                selectedMessage?.title ||
                selectedMessage?.preview ||
                "No subject"}
            </Text>
            <Text style={styles.modalTime}>
              {formatAnnouncementDate(
                selectedMessage?.date || selectedMessage?.created_at,
              )}
            </Text>
            <Text style={styles.modalBody}>
              {selectedMessage?.message ||
                selectedMessage?.content ||
                selectedMessage?.description ||
                "No message content available."}
            </Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => setSelectedMessage(null)}
            >
              <Text style={styles.primaryButtonText}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  backText: { color: colors.blue, fontSize: 12, fontWeight: "800" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageTitle: { color: colors.ink, fontSize: 24, fontWeight: "900" },
  pageSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  unreadPill: {
    backgroundColor: colors.paleBlue,
    borderRadius: 999,
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  unreadText: { color: colors.blue, fontWeight: "900", fontSize: 12 },
  loaderWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  loadingText: { color: colors.muted, fontSize: 13 },
  errorText: {
    color: colors.red,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#F5D0D0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 12,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  listWrap: { paddingBottom: 20 },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 2,
  },
  viewAllText: { color: colors.blue, fontSize: 13, fontWeight: "900" },
  messageCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  messageCardUnread: {
    backgroundColor: colors.paleBlue,
    borderColor: colors.blue,
  },
  messageBadgeWrap: { position: "relative", justifyContent: "center" },
  messageAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.paleTeal,
    alignItems: "center",
    justifyContent: "center",
  },
  messageAvatarText: { color: colors.teal, fontWeight: "900" },
  unreadDot: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.red,
    borderWidth: 2,
    borderColor: colors.white,
  },
  messageCopy: { flex: 1 },
  messageHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  senderName: { color: colors.ink, fontWeight: "800", fontSize: 14 },
  messageTime: { color: colors.muted, fontSize: 10 },
  messageSubject: {
    color: colors.ink,
    fontWeight: "800",
    fontSize: 13,
    marginTop: 6,
  },
  messagePreview: { color: colors.muted, fontSize: 11, marginTop: 4 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(14, 31, 36, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  modalSender: { color: colors.ink, fontWeight: "800", fontSize: 15 },
  modalSubject: {
    color: colors.navy,
    fontWeight: "900",
    fontSize: 16,
    marginTop: 8,
  },
  modalTime: { color: colors.muted, fontSize: 11, marginTop: 6 },
  modalBody: { color: colors.ink, fontSize: 13, lineHeight: 20, marginTop: 12 },
  primaryButton: {
    backgroundColor: colors.blue,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  primaryButtonText: { color: colors.white, fontWeight: "800", fontSize: 13 },
  pressed: { opacity: 0.9 },
});
