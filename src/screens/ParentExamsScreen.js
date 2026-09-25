import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Colors } from "../constants/theme";
import { ApiError } from "../services/api";
import { examsApi } from "../services/examsApi";

const colors = {
  ink: Colors.light.text,
  muted: Colors.light.textSecondary,
  line: "#D9DDF2",
  white: "#FFFFFF",
  canvas: "#F7F8FF",
  blue: "#1E32CC",
  paleBlue: "#EEF0FC",
  green: "#1E8E5E",
  paleGreen: "#E8F8F1",
  red: "#B94E4E",
  paleRed: "#FDECEC",
  blueTint: "#EEF0FC",
  blueAccent: "#334BD6",
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

const examBoxColors = [
  [colors.blueTint, colors.blueAccent],
  [colors.orangeTint, colors.orangeAccent],
  [colors.indigoTint, colors.indigoAccent],
  [colors.redTint, colors.redAccent],
  [colors.skyTint, colors.skyAccent],
  [colors.goldTint, colors.goldAccent],
  [colors.purpleTint, colors.purpleAccent],
  [colors.violetTint, colors.violetAccent],
];

function Icon({ name, size = 18, color = colors.ink }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function HallTicketCard({ ticket, index, downloadingId, onDownload }) {
  const downloading = downloadingId === ticket.id;
  const [backgroundColor, accentColor] =
    examBoxColors[index % examBoxColors.length];
  return (
    <View
      style={[styles.ticketCard, { backgroundColor, borderColor: accentColor }]}
    >
      <View style={styles.ticketCopy}>
        <Text style={[styles.ticketDate, { color: accentColor }]}>
          {ticket.date}
        </Text>
        <Text style={styles.ticketTitle}>{ticket.title}</Text>
      </View>
      <Pressable
        style={[
          styles.downloadButton,
          { backgroundColor: accentColor },
          downloading && styles.disabled,
        ]}
        disabled={Boolean(downloadingId)}
        onPress={() => onDownload(ticket)}
      >
        <Icon
          name={downloading ? "hourglass-outline" : "download-outline"}
          size={16}
          color={colors.white}
        />
        <Text style={styles.downloadText}>
          {downloading ? "Downloading..." : "Hall Ticket"}
        </Text>
      </Pressable>
    </View>
  );
}

function ResultCard({ result, index }) {
  const [backgroundColor, accentColor] =
    examBoxColors[index % examBoxColors.length];
  return (
    <View
      style={[styles.resultCard, { backgroundColor, borderColor: accentColor }]}
    >
      <View style={styles.resultHeader}>
        <View style={styles.resultCopy}>
          <Text style={styles.resultExam}>{result.examName}</Text>
          <Text style={[styles.resultDate, { color: accentColor }]}>
            {result.date}
          </Text>
        </View>
        <View style={styles.percentage}>
          <Text style={[styles.percentageValue, { color: accentColor }]}>
            {result.percentage}%
          </Text>
          <Text style={styles.percentageLabel}>OVERALL</Text>
        </View>
      </View>
      {result.subjects.map((subject, index) => (
        <View
          key={`${result.id}-${subject.name}-${index}`}
          style={styles.subjectRow}
        >
          <Text style={styles.subjectNumber}>{index + 1}</Text>
          <Text style={styles.subjectName}>{subject.name}</Text>
          <Text style={styles.marks}>
            {subject.obtained.toFixed(2)} / {subject.maximum.toFixed(2)}
          </Text>
          <Text
            style={[
              styles.resultStatus,
              subject.status === "PASS" ? styles.pass : styles.fail,
            ]}
          >
            {subject.status}
          </Text>
        </View>
      ))}
      <View style={styles.aggregate}>
        <Text style={styles.aggregateLabel}>Aggregate Results</Text>
        <Text style={styles.aggregateValue}>{result.aggregate}</Text>
      </View>
    </View>
  );
}

export default function ParentExamsScreen({
  session,
  selectedStudentId,
  onSessionExpired,
}) {
  const [hallTickets, setHallTickets] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const loadExams = async () => {
    setLoading(true);
    setError("");
    try {
      const [nextTickets, nextResults] = await Promise.all([
        examsApi.getHallTickets(session, selectedStudentId),
        examsApi.getResults(session, selectedStudentId),
      ]);
      setHallTickets(nextTickets || []);
      setResults(nextResults || []);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to load examinations. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, [session, selectedStudentId]);

  const downloadHallTicket = async (ticket) => {
    setDownloadingId(ticket.id);
    try {
      const response = await examsApi.downloadHallTicket(
        ticket.id,
        selectedStudentId,
        session,
      );
      if (!response?.available && !response?.url && !response?.download_url)
        Alert.alert(
          "Hall ticket unavailable",
          "Hall ticket download will be available when the examination API is connected.",
        );
    } catch {
      Alert.alert(
        "Download error",
        "Unable to download hall ticket. Please try again.",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heading}>
        <Text style={styles.title}>Exams</Text>
        <Text style={styles.subtitle}>Parent Mobile View</Text>
      </View>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.blue} />
          <Text style={styles.loadingText}>Loading examinations...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadExams}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Examination Hall Tickets</Text>
          <Text style={styles.description}>
            Download Admit Cards for upcoming scheduled examinations.
          </Text>
          {hallTickets.length === 0 ? (
            <Text style={styles.emptyText}>No hall tickets available.</Text>
          ) : (
            hallTickets.map((ticket, index) => (
              <HallTicketCard
                key={ticket.id}
                ticket={ticket}
                index={index}
                downloadingId={downloadingId}
                onDownload={downloadHallTicket}
              />
            ))
          )}
          <Text style={[styles.sectionTitle, styles.resultsTitle]}>
            Examination Results
          </Text>
          {results.length === 0 ? (
            <Text style={styles.emptyText}>
              No examination results available.
            </Text>
          ) : (
            results.map((result, index) => (
              <ResultCard
                key={result.id}
                result={result}
                index={index + hallTickets.length}
              />
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.canvas },
  content: { paddingBottom: 24 },
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
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  description: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 12,
  },
  ticketCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 13,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ticketCopy: { flex: 1, minWidth: 0 },
  ticketDate: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  ticketTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
  downloadButton: {
    backgroundColor: colors.blue,
    borderRadius: 9,
    minHeight: 38,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  downloadText: { color: colors.white, fontSize: 10, fontWeight: "900" },
  disabled: { opacity: 0.6 },
  resultsTitle: { marginTop: 20, marginBottom: 12 },
  resultCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 13,
    marginBottom: 10,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  resultCopy: { flex: 1 },
  resultExam: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  resultDate: { color: colors.muted, fontSize: 11, marginTop: 4 },
  percentage: { alignItems: "flex-end" },
  percentageValue: { color: colors.blue, fontSize: 20, fontWeight: "900" },
  percentageLabel: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingVertical: 10,
  },
  subjectNumber: {
    color: colors.muted,
    width: 16,
    fontSize: 11,
    fontWeight: "800",
  },
  subjectName: { color: colors.ink, flex: 1, fontSize: 12, fontWeight: "800" },
  marks: { color: colors.ink, fontSize: 10, fontWeight: "700" },
  resultStatus: {
    width: 39,
    textAlign: "right",
    fontSize: 9,
    fontWeight: "900",
  },
  pass: { color: colors.green },
  fail: { color: colors.red },
  aggregate: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 10,
    marginTop: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aggregateLabel: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  aggregateValue: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  loading: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: { color: colors.muted, fontSize: 12 },
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
  emptyText: { color: colors.muted, fontSize: 12, marginTop: 12 },
});
