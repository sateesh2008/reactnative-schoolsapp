import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
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
  line: "#D9DDF2",
  white: "#FFFFFF",
  canvas: "#F7F8FF",
  blue: "#1E32CC",
  paleBlue: "#EEF0FC",
  green: "#1E8E5E",
  paleGreen: "#E8F8F1",
  orange: "#A76E00",
  paleOrange: "#FFF7DF",
  red: "#B94E4E",
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

const firstValue = (value, ...fallbacks) =>
  [value, ...fallbacks].find(
    (candidate) =>
      candidate !== undefined && candidate !== null && candidate !== "",
  );

const escapeHtml = (value) =>
  String(value ?? "Not provided")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatReceiptDate = (value) => {
  if (!value) return "Not provided";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const transactionDetails = (transaction) => ({
  receiptNo: firstValue(
    transaction?.receiptNo,
    transaction?.receipt_no,
    transaction?.receipt_number,
    transaction?.receiptNumber,
  ),
  paymentDate: firstValue(
    transaction?.date,
    transaction?.payment_date,
    transaction?.paymentDate,
    transaction?.created_at,
  ),
  status: firstValue(
    transaction?.status,
    transaction?.payment_status,
    transaction?.paymentStatus,
    "PAID",
  ),
  method: firstValue(
    transaction?.mode,
    transaction?.payment_method,
    transaction?.paymentMethod,
    "Not provided",
  ),
  transactionId: firstValue(
    transaction?.transaction_id,
    transaction?.transactionId,
    transaction?.txn_id,
    transaction?.txnId,
  ),
  receiptUrl: firstValue(
    transaction?.receipt_url,
    transaction?.receiptUrl,
    transaction?.download_url,
    transaction?.downloadUrl,
    transaction?.file_url,
    transaction?.fileUrl,
    transaction?.url,
  ),
  mimeType: firstValue(
    transaction?.mime_type,
    transaction?.mimeType,
    transaction?.content_type,
    transaction?.contentType,
  ),
  amount: firstValue(
    transaction?.amount,
    transaction?.paid_amount,
    transaction?.payment_amount,
    transaction?.transaction_amount,
    transaction?.amountPaid,
    0,
  ),
});

const isRemoteUri = (uri) => /^https?:\/\//i.test(String(uri || ""));
const isLocalUri = (uri) => /^(file|content):\/\//i.test(String(uri || ""));

const mimeTypeFrom = (uri, providedMimeType) => {
  if (providedMimeType) return providedMimeType;
  const path = String(uri || "")
    .split("?")[0]
    .toLowerCase();
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".png")) return "image/png";
  return "application/pdf";
};

const extensionFrom = (uri, mimeType) => {
  const path = String(uri || "")
    .split("?")[0]
    .toLowerCase();
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return ".jpg";
  if (path.endsWith(".png")) return ".png";
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  return ".pdf";
};

const receiptFileName = (receipt, uri, mimeType) => {
  const identifier = String(
    firstValue(
      receipt?.id,
      receipt?.receiptNo,
      receipt?.receipt_no,
      receipt?.transaction_id,
      Date.now(),
    ),
  ).replace(/[^a-z0-9_-]/gi, "_");
  return `fee_receipt_${identifier}${extensionFrom(uri, mimeType)}`;
};

const buildReceiptHtml = ({
  logoUri,
  session,
  selectedStudent,
  summary,
  transaction,
}) => {
  const details = transactionDetails(transaction);
  const feeRows = (Array.isArray(summary?.fees) ? summary.fees : [])
    .map((fee) => {
      const description = firstValue(
        fee?.category_name,
        fee?.category,
        fee?.fee_type,
        fee?.name,
        "Fee",
      );
      const amount = firstValue(
        fee?.final_amount,
        fee?.finalAmount,
        fee?.total_amount,
        fee?.totalAmount,
        0,
      );
      return `<tr><td>${escapeHtml(description)}</td><td>${escapeHtml(
        formatMoney(amount),
      )}</td></tr>`;
    })
    .join("");
  const schoolName = firstValue(
    session?.schoolName,
    session?.tenant?.school_name,
    session?.tenant?.name,
    "School",
  );
  const studentName = firstValue(selectedStudent?.name, "Student");
  const total = firstValue(summary?.cumulativeTotal, summary?.total, 0);
  const paid = firstValue(
    summary?.settledAmount,
    summary?.paid,
    details.amount,
    0,
  );
  const balance = firstValue(summary?.institutionalDues, summary?.balance, 0);
  const academicYear = firstValue(
    session?.academicYear,
    session?.academic_year,
    session?.academicYearName,
    "Not provided",
  );

  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /><style>
    body{font-family:Arial,sans-serif;color:#17175F;padding:28px;background:#fff}
    .header{text-align:center;border-bottom:2px solid #1E32CC;padding-bottom:18px}
    .logo{width:76px;height:76px;object-fit:contain}
    h1{font-size:22px;margin:8px 0;color:#13137F} h2{font-size:18px;letter-spacing:1px;margin:18px 0 8px;text-align:center}
    .muted{color:#596080;font-size:11px;margin:4px 0}.meta{display:flex;justify-content:space-between;gap:16px;margin:8px 0;font-size:12px}
    .meta div{flex:1}.label{color:#596080;font-weight:bold}.value{font-weight:bold;margin-top:3px}
    table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}th,td{padding:9px 6px;border-bottom:1px solid #D9DDF2;text-align:left}th:last-child,td:last-child{text-align:right}
    .total td{font-weight:bold;border-bottom:0}.summary{border-top:2px solid #1E32CC;margin-top:8px;padding-top:8px}.status{color:#1E8056;font-weight:bold}
    .footer{text-align:center;color:#596080;font-size:11px;margin-top:28px}
  </style></head><body>
    <div class="header">${logoUri ? `<img class="logo" src="${escapeHtml(logoUri)}" />` : ""}<h1>${escapeHtml(
      schoolName,
    )}</h1><p class="muted">${escapeHtml(
      firstValue(session?.schoolAddress, session?.tenant?.address, ""),
    )}</p><p class="muted">${escapeHtml(
      firstValue(session?.schoolContact, session?.tenant?.contact, ""),
    )}</p><h2>FEE RECEIPT</h2></div>
    <div class="meta"><div><span class="label">Receipt No</span><div class="value">${escapeHtml(
      details.receiptNo,
    )}</div></div><div><span class="label">Payment Date</span><div class="value">${escapeHtml(
      formatReceiptDate(details.paymentDate),
    )}</div></div></div>
    <div class="meta"><div><span class="label">Student/Ward</span><div class="value">${escapeHtml(
      studentName,
    )}</div></div><div><span class="label">Student ID</span><div class="value">${escapeHtml(
      firstValue(selectedStudent?.admission_no, selectedStudent?.id),
    )}</div></div></div>
    <div class="meta"><div><span class="label">Class</span><div class="value">${escapeHtml(
      firstValue(selectedStudent?.className, selectedStudent?.class_name),
    )}</div></div><div><span class="label">Section</span><div class="value">${escapeHtml(
      firstValue(selectedStudent?.section, selectedStudent?.division_name),
    )}</div></div><div><span class="label">Roll Number</span><div class="value">${escapeHtml(
      selectedStudent?.roll_no,
    )}</div></div></div>
    <div class="meta"><div><span class="label">Academic Year</span><div class="value">${escapeHtml(
      academicYear,
    )}</div></div><div><span class="label">Payment Status</span><div class="value status">${escapeHtml(
      details.status,
    )}</div></div></div>
    <table><thead><tr><th>Fee Description</th><th>Amount</th></tr></thead><tbody>${
      feeRows ||
      "<tr><td>Payment received</td><td>" +
        escapeHtml(formatMoney(details.amount)) +
        "</td></tr>"
    }<tr class="summary"><td>Total Fee</td><td>${escapeHtml(formatMoney(total))}</td></tr><tr><td>Amount Paid</td><td>${escapeHtml(
      formatMoney(paid),
    )}</td></tr><tr><td>Balance / Due</td><td>${escapeHtml(formatBalance(balance))}</td></tr></tbody></table>
    <div class="meta summary"><div><span class="label">Payment Method</span><div class="value">${escapeHtml(
      details.method,
    )}</div></div><div><span class="label">Transaction ID</span><div class="value">${escapeHtml(
      details.transactionId,
    )}</div></div></div><p class="footer">Thank you</p>
  </body></html>`;
};

const getLocalReceiptFile = async ({ receipt, session, generatePdf }) => {
  const details = transactionDetails(receipt);
  const receiptUrl = String(details.receiptUrl || "").trim();
  const mimeType = mimeTypeFrom(receiptUrl, details.mimeType);
  let localUri = receiptUrl;

  if (!receiptUrl) {
    const generated = await Print.printToFileAsync({ html: generatePdf() });
    localUri = generated?.uri;
  } else if (isRemoteUri(receiptUrl)) {
    if (!FileSystem.cacheDirectory) {
      throw new Error("A local receipt directory is unavailable.");
    }
    const destination = `${FileSystem.cacheDirectory}${receiptFileName(
      receipt,
      receiptUrl,
      mimeType,
    )}`;
    const downloadResult = await FileSystem.downloadAsync(
      receiptUrl,
      destination,
      session?.token
        ? { headers: { Authorization: `Bearer ${session.token}` } }
        : undefined,
    );
    localUri = downloadResult?.uri;
  }

  if (!localUri || isRemoteUri(localUri) || !isLocalUri(localUri)) {
    throw new Error("The receipt was not downloaded to a local file.");
  }

  const fileInfo = await FileSystem.getInfoAsync(localUri);
  if (!fileInfo?.exists) {
    throw new Error("The receipt file could not be found.");
  }

  return { localUri, mimeType };
};

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

function ReceiptTransaction({ receipt, index, downloading, onDownload }) {
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
        <Pressable
          style={[styles.receiptButton, downloading && styles.disabledButton]}
          onPress={() => onDownload(receipt)}
          disabled={downloading}
        >
          <Icon
            name={downloading ? "hourglass-outline" : "download-outline"}
            size={15}
            color={colors.blue}
          />
          <Text style={styles.receiptButtonText}>
            {downloading ? "Generating..." : "Download Fee Receipt"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ParentFeesScreen({
  session,
  selectedStudentId,
  selectedStudent,
  onSessionExpired,
}) {
  const [summary, setSummary] = useState({});
  const [pendingFees, setPendingFees] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

  const loadFees = async () => {
    setLoading(true);
    setError("");
    try {
      const nextSummary = await feesApi.getSummary(session, selectedStudentId);
      const nextPendingFees = nextSummary?.fees || [];
      setSummary(nextSummary || {});
      setPendingFees(nextPendingFees || []);
      try {
        const nextTransactionHistory = await feesApi.getTransactionHistory({
          ...session,
          studentId: selectedStudentId,
        });
        setTransactionHistory(nextTransactionHistory || []);
      } catch (transactionError) {
        if (transactionError.status === 401) onSessionExpired?.();
        setTransactionHistory([]);
      }
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
  }, [session, selectedStudentId]);

  const downloadReceipt = async (receipt) => {
    if (downloadingReceiptId || !receipt) return;
    setDownloadingReceiptId(receipt.id);
    try {
      const logoUri = Image.resolveAssetSource(
        require("../../assets/logo.png"),
      )?.uri;
      const { localUri, mimeType } = await getLocalReceiptFile({
        receipt,
        session,
        generatePdf: () =>
          buildReceiptHtml({
            logoUri,
            session,
            selectedStudent,
            summary,
            transaction: receipt,
          }),
      });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "Receipt generated",
          "The receipt was generated, but sharing is not available on this device.",
        );
        return;
      }
      await Sharing.shareAsync(localUri, {
        mimeType,
        dialogTitle: "Download Fee Receipt",
        ...(mimeType === "application/pdf" ? { UTI: "com.adobe.pdf" } : {}),
      });
      Alert.alert("Fee receipt downloaded successfully.");
    } catch (requestError) {
      Alert.alert(
        "Unable to generate the fee receipt",
        requestError?.message || "Please try again.",
      );
    } finally {
      setDownloadingReceiptId(null);
    }
  };

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
              downloading={downloadingReceiptId === receipt.id}
              onDownload={downloadReceipt}
            />
          ))
        ))}
      <Pressable style={styles.payButton} onPress={payOutstanding}>
        <Icon name="card-outline" color={colors.white} />
        <Text style={styles.payButtonText}>
          Pay Outstanding {formatMoney(summary.institutionalDues || 0)}
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
