/**
 * ClientRoutes - Protected routes for authenticated clients
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ClientGuard } from '../guards';
import { ROUTES } from './constants';

// Lazy load client pages
const ClientHome = React.lazy(() => import('../../pages/client/ClientHome'));
const ClientWallet = React.lazy(() => import('../../pages/client/ClientWallet'));
const ClientGames = React.lazy(() => import('../../pages/client/ClientGames'));
const ClientProfile = React.lazy(() => import('../../pages/client/ClientProfile'));
const AddFunds = React.lazy(() => import('../../pages/client/AddFunds'));
const Withdraw = React.lazy(() => import('../../pages/client/Withdraw'));
const TransactionDetail = React.lazy(() => import('../../pages/client/TransactionDetail'));
const ReferralPage = React.lazy(() => import('../../pages/portal/ReferralPage'));

// Portal pages (legacy support)
const PortalDashboard = React.lazy(() => import('../../pages/portal/PortalDashboard'));
const PortalWallet = React.lazy(() => import('../../pages/portal/PortalWallet'));
const PortalTransactions = React.lazy(() => import('../../pages/portal/PortalTransactions'));
const PortalCredentials = React.lazy(() => import('../../pages/portal/PortalCredentials'));
const PortalWithdrawals = React.lazy(() => import('../../pages/portal/PortalWithdrawals'));
const PortalRewards = React.lazy(() => import('../../pages/portal/PortalRewards'));
const PortalGames = React.lazy(() => import('../../pages/portal/PortalGames'));
const PortalSecuritySettings = React.lazy(() => import('../../pages/portal/PortalSecuritySettings'));
const PortalLanding = React.lazy(() => import('../../pages/portal/PortalLanding'));
const ClientLogin = React.lazy(() => import('../../pages/portal/ClientLogin'));

// Loading fallback
const PageFallback = () => (
  <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

/**
 * Wrapper component that applies ClientGuard to all client routes
 */
const ProtectedRoute = ({ children }) => (
  <ClientGuard>{children}</ClientGuard>
);

export const ClientRoutes = () => {
  return (
    <React.Suspense fallback={<PageFallback />}>
      <Routes>
        {/* ==================== NEW CLIENT ROUTES ==================== */}
        <Route path="/client/home" element={<ProtectedRoute><ClientHome /></ProtectedRoute>} />
        <Route path="/client/wallet" element={<ProtectedRoute><ClientWallet /></ProtectedRoute>} />
        <Route path="/client/wallet/add" element={<ProtectedRoute><AddFunds /></ProtectedRoute>} />
        <Route path="/client/wallet/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
        <Route path="/client/wallet/transaction/:orderId" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
        <Route path="/client/games" element={<ProtectedRoute><ClientGames /></ProtectedRoute>} />
        <Route path="/client/referrals" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
        <Route path="/client/profile" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />

        {/* ==================== PORTAL ROUTES (Legacy Support) ==================== */}
        <Route path="/portal" element={<ProtectedRoute><PortalDashboard /></ProtectedRoute>} />
        <Route path="/portal/transactions" element={<ProtectedRoute><PortalTransactions /></ProtectedRoute>} />
        <Route path="/portal/credentials" element={<ProtectedRoute><PortalCredentials /></ProtectedRoute>} />
        <Route path="/portal/referrals" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
        <Route path="/portal/withdrawals" element={<ProtectedRoute><PortalWithdrawals /></ProtectedRoute>} />
        <Route path="/portal/wallet" element={<ProtectedRoute><PortalWallet /></ProtectedRoute>} />
        <Route path="/portal/rewards" element={<ProtectedRoute><PortalRewards /></ProtectedRoute>} />
        <Route path="/portal/load-game" element={<ProtectedRoute><PortalGames /></ProtectedRoute>} />
        <Route path="/portal/security" element={<ProtectedRoute><PortalSecuritySettings /></ProtectedRoute>} />

        {/* Portal Redirects */}
        <Route path="/portal/wallets" element={<Navigate to="/portal/wallet" replace />} />
        <Route path="/portal/bonus-tasks" element={<Navigate to="/portal/rewards" replace />} />

        {/* ==================== SPECIAL ROUTES ==================== */}
        {/* Magic Link Landing */}
        <Route path="/p/:token" element={<PortalLanding />} />
        
        {/* Client Password Login (optional auth method) */}
        <Route path="/client-login" element={<ClientLogin />} />
      </Routes>
    </React.Suspense>
  );
};

export default ClientRoutes;
