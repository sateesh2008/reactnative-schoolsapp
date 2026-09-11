import { apiRequest, isApiConfigured } from "./api";
import { parentFeesSummary, parentPendingFees, parentTransactionHistory } from './feesMock';

export const feesApi = {
  async getSummary(session) {
    if (!isApiConfigured) return parentFeesSummary;
    const payload = await apiRequest("/fees/summary", {
      token: session?.token,
    });
    return payload?.summary || payload;
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
    const payload = await apiRequest('/fees/transactions', {
      token: session?.token,
    });
    return payload?.transactions || payload?.data || [];
  },
};
