/**
 * PortalCompatRoutes - Compatibility layer for legacy portal routes
 * 
 * Handles:
 * - /p/:token - Magic link landing (REQUIRED, preserved)
 * - /portal/* - Redirects to /client/* or /login
 * - /client-login - Redirects to /login
 */

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PortalLanding from '../../pages/portal/PortalLanding';

/**
 * PortalRedirect - Smart redirect for /portal routes
 */
const PortalRedirect = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Map old portal routes to new client routes
  const pathMap = {
    '/portal': '/client/home',
    '/portal/dashboard': '/client/home',
    '/portal/wallet': '/client/wallet',
    '/portal/wallets': '/client/wallet',
    '/portal/transactions': '/client/wallet',
    '/portal/referrals': '/client/referrals',
    '/portal/rewards': '/client/home',
    '/portal/load-game': '/client/games',
    '/portal/credentials': '/client/profile',
    '/portal/security': '/client/profile',
    '/portal/withdrawals': '/client/wallet/withdraw',
    '/portal/bonus-tasks': '/client/home',
  };
  
  if (isAuthenticated) {
    const newPath = pathMap[location.pathname] || '/client/home';
    return <Navigate to={newPath} replace />;
  }
  
  // Not authenticated - go to login
  return <Navigate to="/login" state={{ from: location }} replace />;
};

/**
 * ClientLoginRedirect - Always redirects to /login
 */
const ClientLoginRedirect = () => {
  return <Navigate to="/login" replace />;
};

export const PortalCompatRoutes = () => {
  return (
    <Routes>
      {/* Magic Link Landing - REQUIRED, must remain functional */}
      <Route path="/p/:token" element={<PortalLanding />} />
      
      {/* /client-login always redirects to /login */}
      <Route path="/client-login" element={<ClientLoginRedirect />} />
      
      {/* All /portal/* routes redirect appropriately */}
      <Route path="/portal" element={<PortalRedirect />} />
      <Route path="/portal/*" element={<PortalRedirect />} />
    </Routes>
  );
};

export default PortalCompatRoutes;
