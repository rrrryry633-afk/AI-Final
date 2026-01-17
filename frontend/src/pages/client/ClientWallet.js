/**
 * ClientWallet - Migrated to new API layer
 * Route: /client/wallet
 * 
 * Features:
 * - Balance card with Add Funds + Withdraw buttons
 * - Transaction list with status badges
 * - Expandable transaction details (timeline, rejection, void)
 * - Loading, empty, error states
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Plus, ArrowUpRight, ArrowDownLeft, Clock, 
  ChevronRight, ChevronDown, RefreshCw, Check, X, AlertCircle,
  Info, Ban, Calendar, Loader2
} from 'lucide-react';

// Centralized API
import http, { getErrorMessage, isServerUnavailable } from '../../api/http';
import { ClientBottomNav } from '../../features/shared/ClientBottomNav';
import { PageLoader } from '../../features/shared/LoadingStates';
import { EmptyState, ErrorState } from '../../features/shared/EmptyStates';

const ClientWallet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedTx, setExpandedTx] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        http.get('/wallet/balance'),
        http.get('/portal/transactions/enhanced?limit=50').catch(() => ({ data: { transactions: [] } }))
      ]);
      
      setWalletData(walletRes.data);
      setTransactions(transactionsRes.data.transactions || []);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load wallet');
      setError(message);
      
      if (!isServerUnavailable(err)) {
        // Set defaults for non-network errors
        setWalletData({
          wallet_balance: 0,
          play_credits: 0,
          bonus_balance: 0,
          cash_balance: 0
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'deposits') return tx.type === 'IN' || tx.order_type?.includes('load') || tx.order_type?.includes('deposit');
    if (filter === 'withdrawals') return tx.type === 'OUT' || tx.order_type?.includes('withdrawal');
    if (filter === 'pending') return ['pending', 'pending_approval', 'pending_review', 'initiated', 'awaiting_payment_proof'].includes(tx.status);
    return true;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <Check className="w-4 h-4 text-emerald-400" />;
      case 'pending':
      case 'pending_approval':
      case 'pending_review':
      case 'initiated':
      case 'awaiting_payment_proof':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'pending':
      case 'pending_approval':
      case 'pending_review':
      case 'initiated':
      case 'awaiting_payment_proof':
        return 'text-amber-400 bg-amber-500/10';
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (txId) => {
    setExpandedTx(expandedTx === txId ? null : txId);
  };

  if (loading) {
    return <PageLoader message="Loading wallet..." />;
  }

  if (error && !walletData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pb-20" data-testid="client-wallet">
        <header className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-white">Wallet</h1>
          </div>
        </header>
        <main className="px-4 py-6">
          <ErrorState 
            title="Could not load wallet" 
            description={error}
            onRetry={fetchData} 
          />
        </main>
        <ClientBottomNav active="wallet" />
      </div>
    );
  }

  const totalBalance = walletData?.wallet_balance || walletData?.real_balance || 0;
  const pendingAmount = transactions
    .filter(t => ['pending', 'pending_approval', 'pending_review', 'initiated', 'awaiting_payment_proof'].includes(t.status))
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-20" data-testid="client-wallet">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-white">Wallet</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Balance Card */}
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-violet-900/40 via-fuchsia-900/30 to-violet-900/40 border border-violet-500/20 rounded-3xl">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500 rounded-full blur-3xl" />
          </div>
          
          <div className="relative">
            <p className="text-sm text-gray-400 mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold text-white mb-6">
              ${totalBalance.toFixed(2)}
            </h2>

            {/* Balance Breakdown */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Cash</p>
                <p className="text-sm font-semibold text-emerald-400">
                  ${(walletData?.cash_balance || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Play Credits</p>
                <p className="text-sm font-semibold text-violet-400">
                  ${(walletData?.play_credits || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Bonus</p>
                <p className="text-sm font-semibold text-amber-400">
                  ${(walletData?.bonus_balance || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
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

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <p className="text-xs text-emerald-400 mb-1">Withdrawable</p>
            <p className="text-lg font-bold text-white">
              ${(walletData?.cash_balance || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Cash only</p>
          </div>
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <p className="text-xs text-amber-400 mb-1">Pending</p>
            <p className="text-lg font-bold text-white">${pendingAmount.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Under review</p>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Transaction History</h3>
            <button
              onClick={fetchData}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
              data-testid="refresh-btn"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'deposits', label: 'Deposits' },
              { id: 'withdrawals', label: 'Withdrawals' },
              { id: 'pending', label: 'Pending' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f.id
                    ? 'bg-violet-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Transaction List */}
          {filteredTransactions.length === 0 ? (
            <EmptyState
              icon="clock"
              title="No transactions found"
              description="Your transaction history will appear here."
              action={() => navigate('/client/wallet/add')}
              actionLabel="Add Funds"
            />
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map(tx => {
                const isDeposit = tx.type === 'IN' || tx.order_type?.includes('load') || tx.order_type?.includes('deposit');
                const isExpanded = expandedTx === tx.transaction_id;
                
                return (
                  <div
                    key={tx.transaction_id}
                    className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden"
                    data-testid={`transaction-${tx.transaction_id}`}
                  >
                    {/* Main Row */}
                    <div
                      className="flex items-center justify-between p-4 hover:bg-white/[0.04] transition-colors cursor-pointer"
                      onClick={() => toggleExpand(tx.transaction_id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isDeposit ? 'bg-emerald-500/10' : 'bg-red-500/10'
                        }`}>
                          {isDeposit ? (
                            <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {tx.order_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Transaction'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(tx.status)}`}>
                              {getStatusIcon(tx.status)}
                              {tx.status_label || tx.status?.replace(/_/g, ' ')}
                            </span>
                            {tx.game && (
                              <span className="text-xs text-gray-500">• {tx.game}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`font-semibold ${isDeposit ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isDeposit ? '+' : '-'}${tx.amount?.toFixed(2) || '0.00'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(tx.created_at)}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-3 animate-fadeIn">
                        {/* Timeline */}
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Timeline</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Created</span>
                              <span className="text-white">{formatDate(tx.created_at)}</span>
                            </div>
                            {tx.approved_at && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Approved</span>
                                <span className="text-white">{formatDate(tx.approved_at)}</span>
                              </div>
                            )}
                            {tx.processed_at && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Processed</span>
                                <span className="text-white">{formatDate(tx.processed_at)}</span>
                              </div>
                            )}
                            {tx.completed_at && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Completed</span>
                                <span className="text-white">{formatDate(tx.completed_at)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bonus */}
                        {tx.bonus_amount > 0 && (
                          <div className="flex items-center gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                            <Info className="w-4 h-4 text-violet-400" />
                            <span className="text-sm text-violet-400">
                              Includes ${tx.bonus_amount.toFixed(2)} bonus
                            </span>
                          </div>
                        )}

                        {/* Rejection Reason */}
                        {tx.rejection_reason && (
                          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <Ban className="w-4 h-4 text-red-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-400">Rejection Reason</p>
                              <p className="text-sm text-red-400/80">{String(tx.rejection_reason)}</p>
                            </div>
                          </div>
                        )}

                        {/* Void Record */}
                        {tx.void_amount > 0 && (
                          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-amber-400">
                                Voided: ${tx.void_amount.toFixed(2)}
                              </p>
                              {tx.void_reason && (
                                <p className="text-sm text-amber-400/80">{String(tx.void_reason)}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* View Full Details */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/client/wallet/transaction/${tx.transaction_id}`);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg transition-colors"
                        >
                          View Full Details
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <ClientBottomNav active="wallet" />
    </div>
  );
};

export default ClientWallet;
