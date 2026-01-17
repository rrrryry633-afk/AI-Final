import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { 
  Gift,
  Plus, ArrowUpRight, ArrowDownLeft, ChevronRight,
  Copy, Check, Sparkles, Clock, Gamepad2, Users
} from 'lucide-react';

// New centralized API imports
import { walletApi, transactionsApi, rewardsApi, getErrorMessage } from '../../api';
import { ClientBottomNav } from '../../features/shared/ClientBottomNav';
import { PageLoader } from '../../features/shared/LoadingStates';

// Client Home Page
const ClientHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [hasWelcomeCredit, setHasWelcomeCredit] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Use new centralized API - auth headers are automatically injected
      const [walletRes, ordersRes, creditRes] = await Promise.all([
        walletApi.getBalance(),
        transactionsApi.getOrderHistory(5).catch(() => ({ data: { orders: [] } })),
        rewardsApi.getWelcomeCredit().catch(() => ({ data: { has_credit: false } }))
      ]);
      
      setWalletData(walletRes.data);
      setRecentOrders(ordersRes.data.orders || []);
      setHasWelcomeCredit(creditRes.data.has_credit || false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Set default data to prevent crashes
      setWalletData({
        wallet_balance: 0,
        play_credits: 0,
        bonus_balance: 0,
        cash_balance: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const claimWelcomeCredit = async () => {
    try {
      const res = await rewardsApi.claimWelcomeCredit();
      toast.success(res.data.message || 'Welcome credit claimed!');
      setHasWelcomeCredit(false);
      fetchData(); // Refresh wallet
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to claim credit'));
    }
  };

  const copyReferralCode = () => {
    const code = user?.referral_code || 'DEMO2024';
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return <PageLoader message="Loading your dashboard..." />;
  }

  const totalBalance = walletData?.wallet_balance || walletData?.real_balance || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-20" data-testid="client-home">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Welcome back,</p>
            <h1 className="text-lg font-bold text-white">{user?.display_name || user?.username || 'Player'}</h1>
          </div>
          <button 
            onClick={() => navigate('/client/profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold"
          >
            {(user?.display_name || user?.username || 'P')[0].toUpperCase()}
          </button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Welcome Credit Banner */}
        {hasWelcomeCredit && (
          <div 
            className="relative overflow-hidden p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl animate-pulse-slow"
            data-testid="welcome-credit-banner"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Welcome Bonus!</h3>
                  <p className="text-sm text-amber-300/80">Claim your free credits now</p>
                </div>
              </div>
              <button
                onClick={claimWelcomeCredit}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-all"
                data-testid="claim-credit-btn"
              >
                Claim
              </button>
            </div>
          </div>
        )}

        {/* Balance Card */}
        <div 
          className="relative overflow-hidden p-6 bg-gradient-to-br from-violet-900/40 via-fuchsia-900/30 to-violet-900/40 border border-violet-500/20 rounded-3xl"
          data-testid="balance-card"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-fuchsia-500 rounded-full blur-3xl" />
          </div>
          
          <div className="relative">
            <p className="text-sm text-gray-400 mb-1">Total Balance</p>
            <h2 className="text-4xl font-bold text-white mb-4">
              ${totalBalance.toFixed(2)}
            </h2>
            
            {/* Balance Breakdown */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Cash</p>
                <p className="text-sm font-semibold text-emerald-400">
                  ${(walletData?.cash_balance || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Play Credits</p>
                <p className="text-sm font-semibold text-violet-400">
                  ${(walletData?.play_credits || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Bonus</p>
                <p className="text-sm font-semibold text-amber-400">
                  ${(walletData?.bonus_balance || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/client/wallet/add')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                data-testid="add-funds-btn"
              >
                <Plus className="w-5 h-5" />
                Add Funds
              </button>
              <button
                onClick={() => navigate('/client/wallet/withdraw')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-all"
                data-testid="withdraw-btn"
              >
                <ArrowUpRight className="w-5 h-5" />
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/client/games')}
            className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-violet-500/30 transition-all text-left group"
            data-testid="games-action"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">My Games</h3>
            <p className="text-xs text-gray-500">Load & manage games</p>
          </button>

          <button
            onClick={() => navigate('/client/referrals')}
            className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-violet-500/30 transition-all text-left group"
            data-testid="referrals-action"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">Referrals</h3>
            <p className="text-xs text-gray-500">Earn bonus credits</p>
          </button>
        </div>

        {/* Referral Code Card */}
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Your Referral Code</p>
              <p className="text-lg font-mono font-bold text-violet-400">
                {user?.referral_code || 'DEMO2024'}
              </p>
            </div>
            <button
              onClick={copyReferralCode}
              className="p-3 bg-violet-500/10 hover:bg-violet-500/20 rounded-xl transition-all"
              data-testid="copy-referral-btn"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5 text-violet-400" />
              )}
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Activity</h3>
            <button
              onClick={() => navigate('/client/wallet')}
              className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
              <Clock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-xs text-gray-600 mt-1">Your transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.slice(0, 5).map(order => (
                <div
                  key={order.order_id}
                  className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      order.order_type?.includes('load') || order.order_type?.includes('deposit')
                        ? 'bg-emerald-500/10'
                        : 'bg-red-500/10'
                    }`}>
                      {order.order_type?.includes('load') || order.order_type?.includes('deposit') ? (
                        <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">
                        {order.order_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Transaction'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.game_name?.toUpperCase() || order.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      order.order_type?.includes('load') || order.order_type?.includes('deposit')
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}>
                      {order.order_type?.includes('load') || order.order_type?.includes('deposit') ? '+' : '-'}
                      ${order.amount?.toFixed(2) || '0.00'}
                    </p>
                    <p className={`text-xs ${
                      order.status === 'approved' || order.status === 'completed'
                        ? 'text-emerald-500'
                        : order.status === 'pending' || order.status === 'pending_approval'
                        ? 'text-amber-500'
                        : 'text-red-500'
                    }`}>
                      {order.status?.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Using shared component */}
      <ClientBottomNav active="home" />
    </div>
  );
};

export default ClientHome;
