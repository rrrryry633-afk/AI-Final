/**
 * API Module - Barrel Export
 * SINGLE SOURCE OF TRUTH for all API utilities
 */

// HTTP Client
export { 
  default as http, 
  safeApiCall, 
  getErrorMessage, 
  isServerUnavailable,
  API_URL, 
  API_V1 
} from './http';

// Endpoint Collections
export {
  authApi,
  walletApi,
  transactionsApi,
  gamesApi,
  referralsApi,
  rewardsApi,
  portalApi,
  adminApi,
  adminSystemApi,
} from './endpoints';

// Safe fetch helpers
export {
  fetchWalletBalance,
  fetchRecentTransactions,
  fetchPublicGames,
  fetchReferralDetails,
} from './endpoints';
