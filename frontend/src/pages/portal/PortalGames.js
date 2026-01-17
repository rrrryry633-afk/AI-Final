import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorHandler';
import PortalLayout from '../../components/PortalLayout';
import { SoftCard, SoftCardHeader, SoftCardContent, SoftCardTitle } from '../../components/SoftCard';
import { SoftButton } from '../../components/SoftButton';
import '../../styles/portal-design-system.css';
import { 
  Gamepad2, Wallet, Plus, DollarSign, ArrowDownToLine, Loader2, 
  CheckCircle, XCircle, Eye, EyeOff, Copy, Check
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PortalGames = () => {
  const { clientToken, portalToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [myAccounts, setMyAccounts] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showModal, setShowModal] = useState(null);
  const [modalData, setModalData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState({});
  const [copied, setCopied] = useState({});

  const getAuthHeaders = () => {
    if (clientToken) return { Authorization: `Bearer ${clientToken}` };
    if (portalToken) return { 'X-Portal-Token': portalToken };
    return {};
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gamesRes, accountsRes, walletRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/v1/games/available`, { headers: getAuthHeaders() }),
        axios.get(`${BACKEND_URL}/api/v1/game-accounts/my-accounts`, { headers: getAuthHeaders() }),
        axios.get(`${BACKEND_URL}/api/v1/wallet/balance`, { headers: getAuthHeaders() })
      ]);
      
      setGames(gamesRes.data.games || []);
      setMyAccounts(accountsRes.data.accounts || []);
      setWalletBalance(walletRes.data.wallet_balance || 0);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGameAccount = (gameId) => {
    return myAccounts.find(acc => acc.game_id === gameId);
  };

  const handleCreateAccount = (game) => {
    setShowModal('create');
    setModalData({ game, username_hint: '' });
    setError('');
    setSuccess('');
  };

  const handleLoad = (game) => {
    setShowModal('load');
    setModalData({ game, amount: '' });
    setError('');
    setSuccess('');
  };

  const handleRedeem = (game) => {
    setShowModal('redeem');
    setModalData({ 
      game, 
      amount: '', 
      withdrawal_method: 'BANK',
      account_number: '',
      account_name: ''
    });
    setError('');
    setSuccess('');
  };

  const submitCreateAccount = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/game-accounts/create`,
        {
          game_id: modalData.game.game_id,
          username_hint: modalData.username_hint || undefined
        },
        { headers: getAuthHeaders() }
      );
      
      setSuccess(`Account created! Username: ${response.data.game_username}, Password: ${response.data.game_password}`);
      await fetchData();
      setTimeout(() => setShowModal(null), 3000);
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to create account'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitLoad = async () => {
    if (!modalData.amount || parseFloat(modalData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(modalData.amount) > walletBalance) {
      setError(`Insufficient balance. Available: $${walletBalance.toFixed(2)}`);
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/game-accounts/load`,
        {
          game_id: modalData.game.game_id,
          amount: parseFloat(modalData.amount)
        },
        { headers: getAuthHeaders() }
      );
      
      setSuccess(`Game loaded! New wallet balance: $${response.data.new_wallet_balance.toFixed(2)}`);
      setWalletBalance(response.data.new_wallet_balance);
      await fetchData();
      setTimeout(() => setShowModal(null), 2000);
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to load game'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitRedeem = async () => {
    if (!modalData.amount || parseFloat(modalData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!modalData.account_number || !modalData.account_name) {
      setError('Please enter account details');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/game-accounts/redeem`,
        {
          game_id: modalData.game.game_id,
          amount: parseFloat(modalData.amount),
          withdrawal_method: modalData.withdrawal_method,
          account_number: modalData.account_number,
          account_name: modalData.account_name
        },
        { headers: getAuthHeaders() }
      );
      
      setSuccess(`Redeem successful! Pending admin approval. Order: ${response.data.order_id.substring(0, 8)}`);
      await fetchData();
      setTimeout(() => setShowModal(null), 3000);
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to redeem'));
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [key]: true });
    setTimeout(() => setCopied({ ...copied, [key]: false }), 2000);
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Games</h1>
            <p className="text-gray-400">Manage your game accounts</p>
          </div>
          <div className="soft-card p-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-xs text-gray-400">Wallet Balance</p>
                <p className="text-xl font-bold text-white">${walletBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(game => {
            const account = getGameAccount(game.game_id);
            
            return (
              <SoftCard key={game.game_id} className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{game.display_name}</h3>
                    <p className="text-sm text-gray-400">{game.description || 'Gaming platform'}</p>
                  </div>
                </div>

                {account ? (
                  <div className="space-y-4">
                    {/* Account Details */}
                    <div className="soft-card p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Status</span>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Username</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white font-mono">{account.game_username}</span>
                          <button 
                            onClick={() => copyToClipboard(account.game_username, `user-${game.game_id}`)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            {copied[`user-${game.game_id}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Password</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white font-mono">
                            {showPassword[game.game_id] ? account.game_password : '••••••••'}
                          </span>
                          <button 
                            onClick={() => setShowPassword({ ...showPassword, [game.game_id]: !showPassword[game.game_id] })}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            {showPassword[game.game_id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button 
                            onClick={() => copyToClipboard(account.game_password, `pass-${game.game_id}`)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            {copied[`pass-${game.game_id}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <SoftButton
                        onClick={() => handleLoad(game)}
                        className="flex-1 flex items-center justify-center gap-2"
                        data-testid={`load-btn-${game.game_id}`}
                      >
                        <DollarSign className="w-4 h-4" />
                        Load
                      </SoftButton>
                      <SoftButton
                        onClick={() => handleRedeem(game)}
                        className="flex-1 flex items-center justify-center gap-2"
                        variant="secondary"
                        data-testid={`redeem-btn-${game.game_id}`}
                      >
                        <ArrowDownToLine className="w-4 h-4" />
                        Redeem
                      </SoftButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="soft-card p-3 text-center">
                      <p className="text-sm text-gray-400">No account created</p>
                    </div>
                    <SoftButton
                      onClick={() => handleCreateAccount(game)}
                      className="w-full flex items-center justify-center gap-2"
                      data-testid={`create-account-btn-${game.game_id}`}
                    >
                      <Plus className="w-4 h-4" />
                      Create Account
                    </SoftButton>
                  </div>
                )}
              </SoftCard>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <SoftCard className="max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {showModal === 'create' && `Create ${modalData.game?.display_name} Account`}
              {showModal === 'load' && `Load ${modalData.game?.display_name}`}
              {showModal === 'redeem' && `Redeem from ${modalData.game?.display_name}`}
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-400">{success}</p>
              </div>
            )}

            {showModal === 'create' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Username Hint (optional)</label>
                  <input
                    type="text"
                    value={modalData.username_hint}
                    onChange={(e) => setModalData({ ...modalData, username_hint: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    placeholder="Leave empty for auto-generate"
                  />
                </div>
              </div>
            )}

            {showModal === 'load' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <input
                    type="number"
                    value={modalData.amount}
                    onChange={(e) => setModalData({ ...modalData, amount: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    placeholder="0.00"
                    min="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Available: ${walletBalance.toFixed(2)}</p>
                </div>
              </div>
            )}

            {showModal === 'redeem' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <input
                    type="number"
                    value={modalData.amount}
                    onChange={(e) => setModalData({ ...modalData, amount: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    placeholder="0.00"
                    min="20"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Withdrawal Method</label>
                  <select
                    value={modalData.withdrawal_method}
                    onChange={(e) => setModalData({ ...modalData, withdrawal_method: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  >
                    <option value="BANK">Bank Transfer</option>
                    <option value="GCASH">GCash</option>
                    <option value="PAYMAYA">PayMaya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Account Number</label>
                  <input
                    type="text"
                    value={modalData.account_number}
                    onChange={(e) => setModalData({ ...modalData, account_number: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Account Name</label>
                  <input
                    type="text"
                    value={modalData.account_name}
                    onChange={(e) => setModalData({ ...modalData, account_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <SoftButton
                onClick={() => setShowModal(null)}
                variant="secondary"
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </SoftButton>
              <SoftButton
                onClick={() => {
                  if (showModal === 'create') submitCreateAccount();
                  if (showModal === 'load') submitLoad();
                  if (showModal === 'redeem') submitRedeem();
                }}
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  showModal === 'create' ? 'Create' : showModal === 'load' ? 'Load' : 'Redeem'
                )}
              </SoftButton>
            </div>
          </SoftCard>
        </div>
      )}
    </PortalLayout>
  );
};

export default PortalGames;
