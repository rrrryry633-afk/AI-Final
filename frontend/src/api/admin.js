/**
 * Admin API Client - Centralized API for Admin Operations
 * 
 * All admin API calls MUST go through this module.
 * Uses the same http client as client-side for consistency.
 */

import http, { getErrorMessage } from './http';

// Re-export utilities
export { getErrorMessage };

// ============================================
// DASHBOARD & STATS
// ============================================
export const dashboardApi = {
  getStats: () => 
    http.get('/admin/stats'),
  
  getDashboard: () =>
    http.get('/admin/dashboard'),
};

// ============================================
// USER MANAGEMENT
// ============================================
export const usersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    const queryStr = query.toString();
    return http.get(`/admin/clients${queryStr ? '?' + queryStr : ''}`);
  },
  
  getById: (userId) => 
    http.get(`/admin/clients/${userId}`),
  
  update: (userId, data) =>
    http.put(`/admin/clients/${userId}`, data),
  
  updateStatus: (userId, status, reason = '') =>
    http.post(`/admin/clients/${userId}/status`, { status, reason }),
  
  updateBonus: (userId, bonusData) =>
    http.put(`/admin/clients/${userId}/bonus`, bonusData),
  
  suspend: (userId, reason) =>
    http.post(`/admin/clients/${userId}/status`, { status: 'suspended', reason }),
  
  ban: (userId, reason) =>
    http.post(`/admin/clients/${userId}/status`, { status: 'banned', reason }),
  
  activate: (userId) =>
    http.post(`/admin/clients/${userId}/status`, { status: 'active' }),
  
  // Overrides
  getOverrides: (userId) =>
    http.get(`/admin/clients/${userId}/overrides`),
  
  updateOverrides: (userId, overrides) =>
    http.put(`/admin/clients/${userId}/overrides`, overrides),
  
  // Activity
  getActivity: (userId) =>
    http.get(`/admin/clients/${userId}/activity`),
  
  // Credentials
  getCredentials: (userId) =>
    http.get(`/admin/clients/${userId}/credentials`),
  
  assignCredential: (userId, credential) =>
    http.post(`/admin/clients/${userId}/credentials`, credential),
};

// ============================================
// ANALYTICS
// ============================================
export const analyticsApi = {
  getClientAnalytics: (userId) =>
    http.get(`/admin/analytics/client/${userId}`),
  
  getGameAnalytics: (gameName) =>
    http.get(`/admin/analytics/game/${gameName}`),
  
  getRiskSnapshot: () =>
    http.get('/admin/analytics/risk-snapshot'),
  
  getRiskExposure: () =>
    http.get('/admin/analytics/risk-exposure'),
  
  getPlatformTrends: (days = 7) =>
    http.get(`/admin/analytics/platform-trends?days=${days}`),
  
  getAdvancedMetrics: () =>
    http.get('/admin/analytics/advanced-metrics'),
};

// ============================================
// ORDERS & TRANSACTIONS
// ============================================
export const ordersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.status) query.append('status', params.status);
    if (params.type) query.append('type', params.type);
    if (params.page) query.append('page', params.page);
    const queryStr = query.toString();
    return http.get(`/admin/orders${queryStr ? '?' + queryStr : ''}`);
  },
  
  getById: (orderId) =>
    http.get(`/admin/orders/${orderId}`),
  
  approve: (orderId, notes = '') =>
    http.post(`/admin/orders/${orderId}/approve`, { notes }),
  
  reject: (orderId, reason) =>
    http.post(`/admin/orders/${orderId}/reject`, { reason }),
};

// ============================================
// APPROVALS (Wallet Loads, Withdrawals)
// ============================================
export const approvalsApi = {
  // Get all pending items
  getPending: (orderType = null) => {
    const query = orderType ? `?order_type=${orderType}` : '';
    return http.get(`/admin/approvals/pending${query}`);
  },
  
  // Perform action on an order
  performAction: (orderId, action, reason = '') =>
    http.post(`/admin/approvals/${orderId}/action`, { action, reason: reason || undefined }),
  
  // Wallet Loads
  getPendingLoads: () =>
    http.get('/admin/approvals/wallet-loads'),
  
  approveLoad: (requestId, notes = '') =>
    http.post(`/admin/approvals/wallet-load/${requestId}/approve`, { notes }),
  
  rejectLoad: (requestId, reason) =>
    http.post(`/admin/approvals/wallet-load/${requestId}/reject`, { reason }),
  
  // Withdrawals
  getPendingWithdrawals: () =>
    http.get('/admin/approvals/withdrawals'),
  
  approveWithdrawal: (orderId, notes = '') =>
    http.post(`/admin/approvals/withdrawal/${orderId}/approve`, { notes }),
  
  rejectWithdrawal: (orderId, reason) =>
    http.post(`/admin/approvals/withdrawal/${orderId}/reject`, { reason }),
  
  // Game Loads
  getPendingGameLoads: () =>
    http.get('/admin/approvals/game-loads'),
  
  approveGameLoad: (orderId) =>
    http.post(`/admin/approvals/game-load/${orderId}/approve`),
  
  rejectGameLoad: (orderId, reason) =>
    http.post(`/admin/approvals/game-load/${orderId}/reject`, { reason }),
  
  // Redemptions
  getPendingRedemptions: () =>
    http.get('/admin/approvals/redemptions'),
  
  approveRedemption: (orderId) =>
    http.post(`/admin/approvals/redemption/${orderId}/approve`),
  
  rejectRedemption: (orderId, reason) =>
    http.post(`/admin/approvals/redemption/${orderId}/reject`, { reason }),
};

// ============================================
// SYSTEM MANAGEMENT
// ============================================
export const systemApi = {
  // Wallet Loads
  getWalletLoads: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.limit) query.append('limit', params.limit);
    const queryStr = query.toString();
    return http.get(`/admin/system/wallet-loads${queryStr ? '?' + queryStr : ''}`);
  },
  
  getWalletLoadById: (requestId) =>
    http.get(`/admin/system/wallet-loads/${requestId}`),
  
  // Payment Methods
  getPaymentMethods: () =>
    http.get('/admin/system/payment-methods'),
  
  createPaymentMethod: (data) =>
    http.post('/admin/system/payment-methods', data),
  
  updatePaymentMethod: (methodId, data) =>
    http.put(`/admin/system/payment-methods/${methodId}`, data),
  
  deletePaymentMethod: (methodId) =>
    http.delete(`/admin/system/payment-methods/${methodId}`),
  
  // Payment QR
  getPaymentQr: () =>
    http.get('/admin/system/payment-qr'),
  
  createPaymentQr: (data) =>
    http.post('/admin/system/payment-qr', data),
  
  updatePaymentQr: (qrId, data) =>
    http.patch(`/admin/system/payment-qr/${qrId}`, data),
  
  deletePaymentQr: (qrId) =>
    http.delete(`/admin/system/payment-qr/${qrId}`),
  
  // API Keys
  getApiKeys: () =>
    http.get('/admin/system/api-keys'),
  
  createApiKey: (data) =>
    http.post('/admin/system/api-keys', data),
  
  deleteApiKey: (keyId) =>
    http.delete(`/admin/system/api-keys/${keyId}`),
  
  // Webhooks
  getWebhooks: () =>
    http.get('/admin/system/webhooks'),
  
  createWebhook: (data) =>
    http.post('/admin/system/webhooks', data),
  
  updateWebhook: (webhookId, data) =>
    http.put(`/admin/system/webhooks/${webhookId}`, data),
  
  deleteWebhook: (webhookId) =>
    http.delete(`/admin/system/webhooks/${webhookId}`),
};

// ============================================
// SETTINGS
// ============================================
export const settingsApi = {
  get: () =>
    http.get('/admin/settings'),
  
  update: (settings) =>
    http.put('/admin/settings', settings),
  
  updateReferralTiers: (tiers) =>
    http.put('/admin/settings', { referral_tiers: tiers }),
  
  removeTier: (tierNumber) =>
    http.put('/admin/settings', { remove_tier: tierNumber }),
  
  updateBonusMilestones: (milestones) =>
    http.put('/admin/settings', { bonus_milestones: milestones }),
  
  updateAntiFraud: (updates) =>
    http.put('/admin/settings', { anti_fraud: updates }),
  
  resetDefaults: (section) =>
    http.post(`/admin/settings/reset-defaults?section=${section}`),
};

// ============================================
// GAMES & RULES
// ============================================
export const gamesApi = {
  getAll: () =>
    http.get('/admin/games'),
  
  update: (gameId, data) =>
    http.put(`/admin/games/${gameId}`, data),
  
  getRules: () =>
    http.get('/admin/rules'),
  
  createRule: (data) =>
    http.post('/admin/rules', data),
  
  deleteRule: (ruleId) =>
    http.delete(`/admin/rules/${ruleId}`),
};

// ============================================
// REFERRAL PERKS
// ============================================
export const perksApi = {
  getAll: () =>
    http.get('/admin/perks'),
  
  create: (data) =>
    http.post('/admin/perks', data),
  
  update: (perkId, data) =>
    http.put(`/admin/perks/${perkId}`, data),
  
  delete: (perkId) =>
    http.delete(`/admin/perks/${perkId}`),
};

// ============================================
// PROMO CODES
// ============================================
export const promoCodesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const queryStr = query.toString();
    return http.get(`/admin/promo-codes${queryStr ? '?' + queryStr : ''}`);
  },
  
  getById: (codeId) =>
    http.get(`/admin/promo-codes/${codeId}`),
  
  create: (data) =>
    http.post('/admin/promo-codes', data),
  
  disable: (codeId) =>
    http.post(`/admin/promo-codes/${codeId}/disable`),
  
  enable: (codeId) =>
    http.post(`/admin/promo-codes/${codeId}/enable`),
  
  delete: (codeId) =>
    http.delete(`/admin/promo-codes/${codeId}`),
  
  getRedemptions: (codeId) =>
    http.get(`/admin/promo-codes/${codeId}/redemptions`),
};

// ============================================
// REFERRALS
// ============================================
export const referralsApi = {
  getDashboard: () =>
    http.get('/admin/referrals/dashboard'),
  
  getLedger: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const queryStr = query.toString();
    return http.get(`/admin/referrals/ledger${queryStr ? '?' + queryStr : ''}`);
  },
};

// ============================================
// REPORTS
// ============================================
export const reportsApi = {
  getBalanceFlow: (days = 30) =>
    http.get(`/admin/reports/balance-flow?days=${days}`),
  
  getPerformance: (days = 7) =>
    http.get(`/admin/reports/performance?days=${days}`),
  
  getProfitByGame: () =>
    http.get('/admin/reports/profit-by-game'),
  
  getVoids: (days = 30) =>
    http.get(`/admin/reports/voids?days=${days}`),
  
  getReferralStats: () =>
    http.get('/admin/reports/referrals'),
  
  getBonusStats: () =>
    http.get('/admin/reports/bonus'),
};

// ============================================
// AUDIT LOGS
// ============================================
export const auditApi = {
  getLogs: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.action) query.append('action', params.action);
    if (params.admin_id) query.append('admin_id', params.admin_id);
    const queryStr = query.toString();
    return http.get(`/admin/audit-logs${queryStr ? '?' + queryStr : ''}`);
  },
};

// ============================================
// BALANCE CONTROL
// ============================================
export const balanceControlApi = {
  adjustBalance: (userId, data) =>
    http.post(`/admin/balance-control/${userId}/adjust`, data),
  
  addBonus: (userId, data) =>
    http.post(`/admin/balance-control/${userId}/bonus`, data),
  
  voidBonus: (userId, bonusId, reason) =>
    http.post(`/admin/balance-control/${userId}/void-bonus`, { bonus_id: bonusId, reason }),
};

// Default export for convenience
const adminApi = {
  dashboard: dashboardApi,
  users: usersApi,
  analytics: analyticsApi,
  orders: ordersApi,
  approvals: approvalsApi,
  system: systemApi,
  settings: settingsApi,
  games: gamesApi,
  perks: perksApi,
  promoCodes: promoCodesApi,
  referrals: referralsApi,
  reports: reportsApi,
  audit: auditApi,
  balanceControl: balanceControlApi,
};

export default adminApi;
