import { apiRequest, isApiConfigured } from "./api";
import { parentFeesSummary, parentPendingFees, parentTransactionHistory } from './feesMock';

export const feesApi = {
  async getSummary(session, studentId) {
    if (!isApiConfigured) return parentFeesSummary;
    const payload = await apiRequest(`/parents/child/${studentId}/fees`, {
      token: session?.token,
    });
    if (payload?.data?.summary) {
      return {
        ...payload.data.summary,
        institutionalDues: Number(payload.data.summary.balance || 0),
        fees: payload.data.fees || [],
      };
    }
    const responseData = payload?.data;
    const allFees = Array.isArray(payload)
      ? payload
      : Array.isArray(responseData)
        ? responseData
        : responseData?.data || payload?.fees || payload?.studentFees || [];
    const fees = studentId
      ? allFees.filter((fee) => String(fee.student_id ?? fee.studentId) === String(studentId))
      : allFees;
    const cumulativeTotal = fees.reduce(
      (total, fee) => total + Number(fee.final_amount ?? fee.finalAmount ?? 0),
      0,
    );
    const settledAmount = fees.reduce(
      (total, fee) => total + Number(fee.paid_total ?? fee.paidTotal ?? 0),
      0,
    );
    return {
      cumulativeTotal,
      settledAmount,
      institutionalDues: fees.reduce(
        (total, fee) => {
          const totalAmount = Number(
            fee.final_amount ?? fee.finalAmount ?? fee.total_amount ?? fee.totalAmount ?? 0,
          );
          const paidAmount = Number(
            fee.paid_total ?? fee.paidTotal ?? fee.amount_paid ?? fee.amountPaid ?? 0,
          );
          return total + Math.max(totalAmount - paidAmount, 0);
        },
        0,
      ),
      fees,
    };
  },

  async getPendingFees(session) {
    if (!isApiConfigured) return parentPendingFees;
    const payload = await apiRequest('/fees/pending', {
      token: session?.token,
    });
    return payload?.fees || payload?.data || [];
  },

  async getTransactionHistory(session) {
    if (!isApiConfigured) return parentTransactionHistory;
    const payload = await apiRequest('/finance/transactions', {
      token: session?.token,
      query: { student_id: session?.studentId },
    });
    return payload?.transactions || payload?.data || [];
  },

  async getChildProfile(session) {
    if (!isApiConfigured) return null;
    const payload = await apiRequest('/parents/profile', { token: session?.token });
    return payload?.data || payload?.profile || null;
  },
};
