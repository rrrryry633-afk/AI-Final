/**
 * ClientGames - Migrated to new API layer
 * Route: /client/games
 * 
 * Features:
 * - List games with accounts
 * - Create account
 * - Load from wallet
 * - Redeem to wallet
 * - Safe error handling
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { 
  Gamepad2, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw,
  Eye, EyeOff, Copy, Check, AlertCircle, Loader2
} from 'lucide-react';

// Centralized API
import http, { getErrorMessage, isServerUnavailable } from '../../api/http';
import { ClientBottomNav } from '../../features/shared/ClientBottomNav';
import { PageLoader } from '../../features/shared/LoadingStates';
import { EmptyState, ErrorState } from '../../features/shared/EmptyStates';

const ClientGames = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [games, setGames] = useState([]);
  const [myAccounts, setMyAccounts] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [activeGame, setActiveGame] = useState(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [loadAmount, setLoadAmount] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [gamesRes, accountsRes, walletRes] = await Promise.all([
        http.get('/public/games'),
        http.get('/game-accounts/my-accounts').catch(() => ({ data: { accounts: [] } })),
        http.get('/wallet/balance')
      ]);
      
      setGames(gamesRes.data.games || gamesRes.data || []);
      setMyAccounts(accountsRes.data.accounts || accountsRes.data || []);
      setWalletBalance(walletRes.data.wallet_balance || walletRes.data.real_balance || 0);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load games');
      setError(message);
      
      if (!isServerUnavailable(err)) {
        setGames([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createAccount = async (gameId) => {
    setProcessing(true);
    try {
      const response = await http.post('/game-accounts/create', {
        game_id: gameId,
        username_hint: user?.username
      });
      
      if (response.data.success) {
        toast.success('Game account created!');
        fetchData();
      } else {
        throw new Error(response.data.message || 'Failed to create account');
      }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to create account');
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const loadGame = async () => {
    if (!loadAmount || parseFloat(loadAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (parseFloat(loadAmount) > walletBalance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setProcessing(true);
    try {
      const response = await http.post('/game-accounts/load', {
        game_id: activeGame.game_id,
        amount: parseFloat(loadAmount)
      });
      
      if (response.data.success) {
        toast.success(`Loaded $${loadAmount} to ${activeGame.display_name}!`);
        setShowLoadModal(false);
        setLoadAmount('');
        fetchData();
      } else {
        throw new Error(response.data.message || 'Failed to load game');
      }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load game');
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const redeemGame = async () => {
    if (!redeemAmount || parseFloat(redeemAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      const response = await http.post('/game-accounts/redeem', {
        game_id: activeGame.game_id,
        amount: parseFloat(redeemAmount),
        withdrawal_method: 'WALLET',
        account_number: 'wallet',
        account_name: user?.username || 'User'
      });
      
      if (response.data.success) {
        toast.success(`Redeemed $${redeemAmount} from ${activeGame.display_name}!`);
        setShowRedeemModal(false);
        setRedeemAmount('');
        fetchData();
      } else {
        throw new Error(response.data.message || 'Failed to redeem');
      }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to redeem');
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const getAccountForGame = (gameId) => {
    return myAccounts.find(acc => acc.game_id === gameId);
  };

  if (loading) {
    return <PageLoader message="Loading games..." />;
  }

  if (error && games.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pb-20" data-testid="client-games">
        <header className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-white">My Games</h1>
          </div>
        </header>
        <main className="px-4 py-6">
          <ErrorState 
            title="Could not load games" 
            description={error}
            onRetry={fetchData} 
          />
        </main>
        <ClientBottomNav active="games" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-20" data-testid="client-games">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">My Games</h1>
          <div className="text-right">
            <p className="text-xs text-gray-500">Wallet</p>
            <p className="text-sm font-bold text-emerald-400">${walletBalance.toFixed(2)}</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {games.length === 0 ? (
          <EmptyState
            icon="games"
            title="No games available"
            description="Games will appear here once configured by the administrator."
          />
        ) : (
          games.map(game => {
            const account = getAccountForGame(game.game_id);
            return (
              <GameCard
                key={game.game_id}
                game={game}
                account={account}
                onCreateAccount={() => createAccount(game.game_id)}
                onLoad={() => { setActiveGame(game); setShowLoadModal(true); }}
                onRedeem={() => { setActiveGame(game); setShowRedeemModal(true); }}
                processing={processing}
              />
            );
          })
        )}
      </main>

      {/* Load Modal */}
      {showLoadModal && activeGame && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-[#12121a] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 animate-slideUp">
            <h3 className="text-xl font-bold text-white mb-2">Load {activeGame.display_name}</h3>
            <p className="text-gray-400 text-sm mb-6">Transfer from wallet to game</p>
            
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Available: ${walletBalance.toFixed(2)}</p>
              <input
                type="number"
                value={loadAmount}
                onChange={(e) => setLoadAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
                data-testid="load-amount-input"
              />
              {loadAmount && parseFloat(loadAmount) > walletBalance && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Exceeds wallet balance
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowLoadModal(false); setLoadAmount(''); }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={loadGame}
                disabled={processing || !loadAmount || parseFloat(loadAmount) <= 0 || parseFloat(loadAmount) > walletBalance}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                data-testid="confirm-load-btn"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load Game'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Modal */}
      {showRedeemModal && activeGame && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-[#12121a] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 animate-slideUp">
            <h3 className="text-xl font-bold text-white mb-2">Redeem from {activeGame.display_name}</h3>
            <p className="text-gray-400 text-sm mb-6">Transfer from game to wallet</p>
            
            <div className="mb-4">
              <input
                type="number"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
                data-testid="redeem-amount-input"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowRedeemModal(false); setRedeemAmount(''); }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={redeemGame}
                disabled={processing || !redeemAmount || parseFloat(redeemAmount) <= 0}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                data-testid="confirm-redeem-btn"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Redeem'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ClientBottomNav active="games" />
    </div>
  );
};

// Game Card Component
const GameCard = ({ game, account, onCreateAccount, onLoad, onRedeem, processing }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCredentials = () => {
    if (account) {
      const text = `Username: ${account.game_username}\nPassword: ${account.game_password}`;
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Fallback
        toast.error('Could not copy to clipboard');
      });
    }
  };

  return (
    <div 
      className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden"
      data-testid={`game-card-${game.game_name}`}
    >
      {/* Game Header */}
      <div className="p-4 flex items-center gap-4 border-b border-white/5">
        <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <Gamepad2 className="w-7 h-7 text-violet-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white">{game.display_name || game.game_name}</h3>
          <p className="text-xs text-gray-500">{game.game_name?.toUpperCase()}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          game.is_active 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {game.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Account Section */}
      <div className="p-4">
        {account ? (
          <>
            {/* Account Credentials */}
            <div className="p-3 bg-white/[0.02] rounded-xl mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Username</span>
                <span className="text-sm font-mono text-white">{account.game_username || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Password</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-white">
                    {showPassword ? (account.game_password || 'N/A') : '••••••••'}
                  </span>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={copyCredentials}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onLoad}
                disabled={!game.is_active}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-all"
                data-testid={`load-btn-${game.game_name}`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                Load
              </button>
              <button
                onClick={onRedeem}
                disabled={!game.is_active}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-all"
                data-testid={`redeem-btn-${game.game_name}`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Redeem
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onCreateAccount}
            disabled={processing || !game.is_active}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/15 disabled:bg-gray-800 disabled:text-gray-500 text-white font-medium rounded-xl transition-all"
            data-testid={`create-account-btn-${game.game_name}`}
          >
            {processing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ClientGames;
