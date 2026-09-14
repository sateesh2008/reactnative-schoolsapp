import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "../constants/theme";
import { ApiError } from "../services/api";
import { feesApi } from "../services/feesApi";

const colors = {
  ink: Colors.light.text,
  muted: Colors.light.textSecondary,
  line: "#D9E7E4",
  white: "#FFFFFF",
  canvas: "#F4F8F6",
  blue: "#0D8B82",
  paleBlue: "#E5F4F0",
  green: "#1E8E5E",
  paleGreen: "#E8F8F1",
  orange: "#A76E00",
  paleOrange: "#FFF7DF",
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

const feeBoxColors = [
  [colors.blueTint, colors.blueAccent],
  [colors.indigoTint, colors.indigoAccent],
  [colors.orangeTint, colors.orangeAccent],
  [colors.redTint, colors.redAccent],
  [colors.purpleTint, colors.purpleAccent],
  [colors.skyTint, colors.skyAccent],
  [colors.goldTint, colors.goldAccent],
  [colors.violetTint, colors.violetAccent],
];

const formatMoney = (value) =>
  `₹${Math.abs(Number(value) || 0).toLocaleString("en-IN")}`;
const formatBalance = (value) =>
  Number(value) < 0
    ? `-₹${Math.abs(Number(value)).toLocaleString("en-IN")}`
    : formatMoney(value);

function Icon({ name, size = 18, color = colors.ink }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function SummaryCard({ title, value, tone }) {
  return (
    <View style={[styles.summaryCard, tone]}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue}>{formatMoney(value)}</Text>
    </View>
  );
}

function StatusBadge({ status }) {
  const isPaid = status === "Fully Paid";
  return (
    <View
      style={[
        styles.statusBadge,
        isPaid ? styles.paidBadge : styles.pendingBadge,
      ]}
    >
      <Text
        style={[
          styles.statusText,
          isPaid ? styles.paidText : styles.pendingText,
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

function FeeTransaction({ transaction, index }) {
  const [backgroundColor, accentColor] =
    feeBoxColors[index % feeBoxColors.length];
  return (
    <View
      style={[
        styles.transactionCard,
        { backgroundColor, borderColor: accentColor },
      ]}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.categoryWrap}>
          <View style={styles.serial}>
            <Text style={styles.serialText}>
              {String(transaction.id).padStart(2, "0")}
            </Text>
          </View>
          <Text style={styles.category}>{transaction.category}</Text>
        </View>
        <StatusBadge status={transaction.status} />
      </View>
      <View style={styles.transactionDetails}>
        <View>
          <Text style={styles.detailLabel}>Total</Text>
          <Text style={styles.detailValue}>
            {formatMoney(transaction.total)}
          </Text>
        </View>
        <View>
          <Text style={styles.detailLabel}>Paid</Text>
          <Text style={styles.detailValue}>
            {formatMoney(transaction.paid)}
          </Text>
        </View>
        <View>
          <Text style={styles.detailLabel}>Balance</Text>
          <Text
            style={[
              styles.detailValue,
              transaction.balance > 0
                ? styles.balanceDue
                : styles.balanceCredit,
            ]}
          >
            {formatBalance(transaction.balance)}
          </Text>
        </View>
      </View>
      <View style={styles.dueRow}>
        <Text style={styles.detailLabel}>Due Date</Text>
        <Text style={styles.dueDate}>{transaction.dueDate}</Text>
      </View>
    </View>
  );
}

function ReceiptTransaction({ receipt, index }) {
  const handleReceipt = () =>
    Alert.alert(
      "Receipt unavailable",
      "Receipt viewing will be connected when the payment service provides a receipt file.",
    );
  const [backgroundColor, accentColor] =
    feeBoxColors[(index + 4) % feeBoxColors.length];

  return (
    <View
      style={[
        styles.receiptCard,
        { backgroundColor, borderColor: accentColor },
      ]}
    >
      <View style={styles.receiptHeader}>
        <Text style={styles.receiptDate}>{receipt.date}</Text>
        <Text style={styles.receiptAmount}>{formatMoney(receipt.amount)}</Text>
      </View>
      <View style={styles.receiptDetails}>
        <View>
          <Text style={styles.detailLabel}>Receipt No</Text>
          <Text style={styles.detailValue}>{receipt.receiptNo}</Text>
        </View>
        <View>
          <Text style={styles.detailLabel}>Mode</Text>
          <Text style={styles.detailValue}>{receipt.mode}</Text>
        </View>
        <Pressable style={styles.receiptButton} onPress={handleReceipt}>
          <Icon name="receipt-outline" size={15} color={colors.blue} />
          <Text style={styles.receiptButtonText}>Receipt</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ParentFeesScreen({ session, onSessionExpired }) {
  const [summary, setSummary] = useState({});
  const [pendingFees, setPendingFees] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFees = async () => {
    setLoading(true);
    setError("");
    try {
      const [nextSummary, nextPendingFees, nextTransactionHistory] =
        await Promise.all([
          feesApi.getSummary(session),
          feesApi.getPendingFees(session),
          feesApi.getTransactionHistory(session),
        ]);
      setSummary(nextSummary || {});
      setPendingFees(nextPendingFees || []);
      setTransactionHistory(nextTransactionHistory || []);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to load fees. Please try again later.",
      );
      if (requestError.status === 401) onSessionExpired?.();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  const payOutstanding = () =>
    Alert.alert(
      "Payment unavailable",
      "Payment processing will be connected when the school payment service is available.",
    );

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>Fees</Text>
        <Text style={styles.subtitle}>Parent Mobile View</Text>
      </View>
      <View style={styles.summaryGrid}>
        <SummaryCard
          title="Cumulative Total"
          value={summary.cumulativeTotal}
          tone={styles.blueCard}
        />
        <SummaryCard
          title="Settled Amount"
          value={summary.settledAmount}
          tone={styles.greenCard}
        />
        <SummaryCard
          title="Institutional Dues"
          value={summary.institutionalDues}
          tone={styles.orangeCard}
        />
      </View>
      <Text style={styles.sectionTitle}>Pending Fees</Text>
      <View
        style={[
          styles.pendingBanner,
          {
            backgroundColor: colors.purpleTint,
            borderColor: colors.purpleAccent,
          },
        ]}
      >
        <Icon name="alert-circle-outline" color={colors.purpleAccent} />
        <View style={styles.pendingCopy}>
          <Text style={[styles.pendingAmount, { color: colors.purpleAccent }]}>
            {formatMoney(summary.institutionalDues)}
          </Text>
          <Text style={styles.pendingCaption}>
            Outstanding institutional dues
          </Text>
        </View>
      </View>
      <View style={styles.pendingListHeading}>
        <Text style={styles.listColumnLabel}>S.No</Text>
        <Text style={styles.listColumnLabel}>Fee Category</Text>
        <Text style={styles.listColumnLabel}>Total / Paid / Balance</Text>
        <Text style={styles.listColumnLabel}>Due Date</Text>
        <Text style={styles.listColumnLabel}>Status</Text>
      </View>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.blue} />
          <Text style={styles.loadingText}>Loading fees...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadFees}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : pendingFees.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No pending fees available</Text>
        </View>
      ) : (
        pendingFees.map((transaction, index) => (
          <FeeTransaction
            key={transaction.id}
            transaction={transaction}
            index={index}
          />
        ))
      )}
      <View style={styles.historyHeading}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        <Text style={styles.historySubtitle}>Receipt payments</Text>
      </View>
      {!loading &&
        !error &&
        (transactionHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              No transaction history available
            </Text>
          </View>
        ) : (
          transactionHistory.map((receipt, index) => (
            <ReceiptTransaction
              key={receipt.id}
              receipt={receipt}
              index={index}
            />
          ))
        ))}
      <Pressable style={styles.payButton} onPress={payOutstanding}>
        <Icon name="card-outline" color={colors.white} />
        <Text style={styles.payButtonText}>
          Pay Outstanding {formatMoney(summary.institutionalDues || 180186)}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.canvas, paddingBottom: 20 },
  heading: { marginBottom: 16 },
  title: { color: colors.ink, fontSize: 22, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  summaryCard: {
    width: "31.5%",
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    justifyContent: "space-between",
  },
  blueCard: { backgroundColor: colors.paleBlue },
  greenCard: { backgroundColor: colors.indigoTint },
  orangeCard: { backgroundColor: colors.paleOrange },
  summaryTitle: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 14,
  },
  summaryValue: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  pendingBanner: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#F2D9A4",
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pendingCopy: { flex: 1 },
  pendingAmount: { color: colors.orange, fontSize: 17, fontWeight: "900" },
  pendingCaption: { color: colors.muted, fontSize: 11, marginTop: 3 },
  historyHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  historySubtitle: { color: colors.muted, fontSize: 11 },
  pendingListHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 8,
  },
  listColumnLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 12,
    flex: 1,
  },
  transactionCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 13,
    marginBottom: 9,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 13,
  },
  categoryWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 9 },
  serial: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  serialText: { color: colors.blue, fontSize: 11, fontWeight: "900" },
  category: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
    flexShrink: 1,
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusText: { fontSize: 9, fontWeight: "900" },
  paidBadge: { backgroundColor: colors.paleGreen, borderColor: "#B6E7D0" },
  paidText: { color: colors.green },
  pendingBadge: { backgroundColor: colors.paleOrange, borderColor: "#F5D98B" },
  pendingText: { color: colors.orange },
  transactionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 10,
  },
  detailLabel: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  detailValue: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
  },
  balanceDue: { color: colors.red },
  balanceCredit: { color: colors.green },
  dueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: 10,
    paddingTop: 9,
  },
  dueDate: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  receiptCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 13,
    marginBottom: 9,
  },
  receiptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptDate: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  receiptAmount: { color: colors.blue, fontSize: 15, fontWeight: "900" },
  receiptDetails: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: 11,
    paddingTop: 10,
  },
  receiptButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  receiptButtonText: { color: colors.blue, fontSize: 10, fontWeight: "900" },
  payButton: {
    backgroundColor: colors.blue,
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  payButtonText: { color: colors.white, fontSize: 13, fontWeight: "900" },
  loading: {
    minHeight: 140,
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
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 22,
    alignItems: "center",
  },
  emptyTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
});
