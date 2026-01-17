/**
 * API Endpoints Registry
 * Centralized definition of all API endpoints
 * Provides type-safe, documented API access
 */

import http, { safeApiCall } from './http';

// ============================================
// AUTH ENDPOINTS
// ============================================
export const authApi = {
  login: (username, password) => 
    http.post('/auth/login', { username, password }),
  
  signup: (data) => 
    http.post('/auth/signup', data),
  
  validateToken: () => 
    http.post('/auth/validate-token'),
  
  updateProfile: (data) => 
    http.put('/auth/profile', data),
  
  changePassword: (currentPassword, newPassword) => 
    http.put('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),
};

// ============================================
// WALLET ENDPOINTS
// ============================================
export const walletApi = {
  getBalance: () => 
    http.get('/wallet/balance'),
  
  getBreakdown: () => 
    http.get('/portal/wallet/breakdown'),
  
  getBonusProgress: () => 
    http.get('/portal/wallet/bonus-progress'),
  
  getCashoutPreview: () => 
    http.get('/portal/wallet/cashout-preview'),
  
  getLoadHistory: () => 
    http.get('/wallet/load-history'),
  
  getQrCodes: () => 
    http.get('/wallet/qr'),
  
  requestLoad: (data) => 
    http.post('/wallet-load/request', data),
  
  requestWithdrawal: (data) => 
    http.post('/withdrawal/wallet', data),
};

// ============================================
// TRANSACTIONS ENDPOINTS
// ============================================
export const transactionsApi = {
  getEnhanced: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return http.get(`/portal/transactions/enhanced${queryString ? `?${queryString}` : ''}`);
  },
  
  getOrderHistory: (limit = 10) => 
    http.get(`/portal/orders/history?limit=${limit}`),
  
  getOrderDetail: (orderId) => 
    http.get(`/portal/transactions/${orderId}`),
};

// ============================================
// GAMES ENDPOINTS
// ============================================
export const gamesApi = {
  getPublicGames: () => 
    http.get('/public/games'),
  
  getAvailableGames: () => 
    http.get('/games/available'),
  
  getMyAccounts: () => 
    http.get('/game-accounts/my-accounts'),
  
  createAccount: (gameId, usernameHint) => 
    http.post('/game-accounts/create', { game_id: gameId, username_hint: usernameHint }),
  
  loadGame: (gameId, amount) => 
    http.post('/game-accounts/load', { game_id: gameId, amount }),
  
  redeemGame: (data) => 
    http.post('/game-accounts/redeem', data),
};

// ============================================
// REFERRALS ENDPOINTS
// ============================================
export const referralsApi = {
  getDetails: () => 
    http.get('/portal/referrals/details'),
  
  // Admin endpoints
  getDashboard: () => 
    http.get('/admin/referrals/dashboard'),
  
  getLedger: () => 
    http.get('/admin/referrals/ledger'),
};

// ============================================
// REWARDS ENDPOINTS
// ============================================
export const rewardsApi = {
  getRewards: () => 
    http.get('/portal/rewards'),
  
  redeemPromo: (code) => 
    http.post('/portal/promo/redeem', { code }),
  
  getWelcomeCredit: () => 
    http.get('/portal/credits/welcome'),
  
  claimWelcomeCredit: () => 
    http.post('/portal/credits/welcome/claim'),
};

// ============================================
// PORTAL ENDPOINTS
// ============================================
export const portalApi = {
  getCredentials: () => 
    http.get('/portal/credentials'),
  
  setPassword: (password) => 
    http.post('/portal/security/set-password', { password }),
  
  getGameRules: () => 
    http.get('/portal/games/rules'),
};

// ============================================
// ADMIN ENDPOINTS
// ============================================
export const adminApi = {
  // Dashboard
  getDashboard: () => 
    http.get('/admin/dashboard'),
  
  getSystem: () => 
    http.get('/admin/system'),
  
  updateSystem: (data) => 
    http.put('/admin/system', data),
  
  // Approvals
  getPendingApprovals: () => 
    http.get('/admin/approvals/pending'),
  
  processApproval: (orderId, action, data = {}) => 
    http.post(`/admin/approvals/${orderId}/action`, { action, ...data }),
  
  // Orders
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return http.get(`/admin/orders${queryString ? `?${queryString}` : ''}`);
  },
  
  getOrderDetail: (orderId) => 
    http.get(`/admin/orders/${orderId}`),
  
  // Clients
  getClients: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return http.get(`/admin/clients${queryString ? `?${queryString}` : ''}`);
  },
  
  getClientDetail: (userId) => 
    http.get(`/admin/clients/${userId}`),
  
  createClient: (data) => 
    http.post('/admin/clients', data),
  
  updateClient: (userId, data) => 
    http.put(`/admin/clients/${userId}`, data),
  
  getClientOverrides: (userId) => 
    http.get(`/admin/clients/${userId}/overrides`),
  
  updateClientOverrides: (userId, overrides) => 
    http.put(`/admin/clients/${userId}/overrides`, overrides),
  
  getClientActivity: (userId) => 
    http.get(`/admin/clients/${userId}/activity`),
  
  addClientCredentials: (userId, data) => 
    http.post(`/admin/clients/${userId}/credentials`, data),
  
  getClientAnalytics: (userId) => 
    http.get(`/admin/analytics/client/${userId}`),
  
  // Games
  getGames: () => 
    http.get('/admin/games'),
  
  createGame: (data) => 
    http.post('/admin/games', data),
  
  updateGame: (gameId, data) => 
    http.put(`/admin/games/${gameId}`, data),
  
  // Rules
  getRules: () => 
    http.get('/admin/rules'),
  
  updateRules: (data) => 
    http.put('/admin/rules', data),
  
  // Promo Codes
  getPromoCodes: () => 
    http.get('/admin/promo-codes'),
  
  createPromoCode: (data) => 
    http.post('/admin/promo-codes', data),
  
  disablePromoCode: (codeId) => 
    http.put(`/admin/promo-codes/${codeId}/disable`),
  
  // Reports
  getBalanceFlowReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return http.get(`/admin/reports/balance-flow${queryString ? `?${queryString}` : ''}`);
  },
  
  getProfitByGameReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return http.get(`/admin/reports/profit-by-game${queryString ? `?${queryString}` : ''}`);
  },
  
  // Audit Logs
  getAuditLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return http.get(`/admin/audit-logs${queryString ? `?${queryString}` : ''}`);
  },
  
  // Perks
  getPerks: () => 
    http.get('/admin/perks'),
  
  createPerk: (data) => 
    http.post('/admin/perks', data),
  
  updatePerk: (perkId, data) => 
    http.put(`/admin/perks/${perkId}`, data),
  
  deletePerk: (perkId) => 
    http.delete(`/admin/perks/${perkId}`),
};

// ============================================
// ADMIN SYSTEM ENDPOINTS
// ============================================
export const adminSystemApi = {
  // Webhooks
  getWebhooks: () => 
    http.get('/admin/webhooks'),
  
  createWebhook: (data) => 
    http.post('/admin/webhooks', data),
  
  updateWebhook: (webhookId, data) => 
    http.put(`/admin/webhooks/${webhookId}`, data),
  
  deleteWebhook: (webhookId) => 
    http.delete(`/admin/webhooks/${webhookId}`),
  
  // API Keys
  getApiKeys: () => 
    http.get('/admin/api-keys'),
  
  createApiKey: (data) => 
    http.post('/admin/api-keys', data),
  
  deleteApiKey: (keyId) => 
    http.delete(`/admin/api-keys/${keyId}`),
  
  // Payment Methods
  getPaymentMethods: () => 
    http.get('/admin/payment-methods'),
  
  createPaymentMethod: (data) => 
    http.post('/admin/payment-methods', data),
  
  updatePaymentMethod: (methodId, data) => 
    http.put(`/admin/payment-methods/${methodId}`, data),
  
  deletePaymentMethod: (methodId) => 
    http.delete(`/admin/payment-methods/${methodId}`),
  
  // Payment QR
  getPaymentQr: () => 
    http.get('/admin/payment-qr'),
  
  createPaymentQr: (data) => 
    http.post('/admin/payment-qr', data),
  
  deletePaymentQr: (qrId) => 
    http.delete(`/admin/payment-qr/${qrId}`),
  
  // Wallet Loads
  getWalletLoads: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return http.get(`/admin/wallet-loads${queryString ? `?${queryString}` : ''}`);
  },
  
  getWalletLoadDetail: (requestId) => 
    http.get(`/admin/wallet-loads/${requestId}`),
  
  // Telegram Bots
  getTelegramBots: () => 
    http.get('/admin/telegram/bots'),
  
  createTelegramBot: (data) => 
    http.post('/admin/telegram/bots', data),
  
  updateTelegramBot: (botId, data) => 
    http.put(`/admin/telegram/bots/${botId}`, data),
  
  deleteTelegramBot: (botId) => 
    http.delete(`/admin/telegram/bots/${botId}`),
  
  testTelegramBot: (botId) => 
    http.post(`/admin/telegram/bots/${botId}/test`),
};

// ============================================
// SAFE WRAPPERS FOR COMMON PATTERNS
// ============================================

/**
 * Fetch wallet balance with fallback
 */
export async function fetchWalletBalance() {
  return safeApiCall(walletApi.getBalance(), {
    defaultValue: {
      wallet_balance: 0,
      cash_balance: 0,
      play_credits: 0,
      bonus_balance: 0,
    },
  });
}

/**
 * Fetch recent transactions with fallback
 */
export async function fetchRecentTransactions(limit = 10) {
  return safeApiCall(transactionsApi.getEnhanced({ limit }), {
    defaultValue: { transactions: [] },
  });
}

/**
 * Fetch games list with fallback
 */
export async function fetchPublicGames() {
  return safeApiCall(gamesApi.getPublicGames(), {
    defaultValue: { games: [] },
  });
}

/**
 * Fetch referral details with fallback
 */
export async function fetchReferralDetails() {
  return safeApiCall(referralsApi.getDetails(), {
    defaultValue: {
      referral_code: 'N/A',
      stats: { total_referrals: 0, active_referrals: 0, total_earned: 0, pending_rewards: 0 },
      referrals: [],
      earnings: [],
    },
  });
}
