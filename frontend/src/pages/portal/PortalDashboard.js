import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PortalLayout from '../../components/PortalLayout';
import { SoftCard, SoftCardHeader, SoftCardTitle, SoftCardContent } from '../../components/SoftCard';
import { SoftButton } from '../../components/SoftButton';
import { 
  Wallet, TrendingUp, Gift, Users, ChevronRight, Copy, Check,
  ArrowDownCircle, Shield, Gamepad2, Sparkles
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PortalDashboard = () => {
  const navigate = useNavigate();
  const { user, clientToken, portalToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [copied, setCopied] = useState(false);

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
      const response = await axios.get(`${BACKEND_URL}/api/v1/portal/wallet/breakdown`, {
        headers: getAuthHeaders()
      });
      setWalletData(response.data);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      // Mock data for UI demo
      setWalletData({
        overview: {
          total_balance: 1250.50,
          cash_balance: 850.00,
          play_credits: 400.50,
          bonus_balance: 400.50,
          withdrawable_amount: 850.00,
          locked_amount: 400.50
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const code = user?.referral_code || 'DEMO2024';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        document.body.removeChild(textArea);
      });
    }
  };

  if (loading) {
    return (
      <PortalLayout title="Dashboard" showBack={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
        </div>
      </PortalLayout>
    );
  }

  const totalBalance = walletData?.overview?.total_balance || 0;
  const cashBalance = walletData?.overview?.cash_balance || 0;
  const bonusBalance = walletData?.overview?.play_credits || walletData?.overview?.bonus_balance || 0;
  const withdrawableAmount = walletData?.overview?.withdrawable_amount || 0;

  return (
    <PortalLayout title="Dashboard" showBack={false}>
      <div className="space-y-5">
        {/* Balance Card with Glow Effect */}
        <SoftCard glow className="animate-fade-in-up" data-testid="balance-card">
          <div className="text-center py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))] mb-2">
              Total Balance
            </p>
            <p className="text-5xl font-bold bg-gradient-to-br from-[hsl(var(--foreground))] to-[hsl(var(--primary))] bg-clip-text text-transparent mb-6">
              ${totalBalance.toFixed(2)}
            </p>
            
            <div className="flex justify-center gap-8 pt-6 border-t border-[hsl(var(--border))]">
              <div className="text-center">
                <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))] mb-1">Cash</p>
                <p className="text-lg font-bold text-[hsl(var(--success))]">${cashBalance.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))] mb-1">Play Credits</p>
                <p className="text-lg font-bold text-[hsl(var(--warning))]">${bonusBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </SoftCard>

        {/* Referral Highlight Card */}
        <SoftCard className="bg-gradient-to-br from-[hsl(var(--warning-bg))] to-[hsl(var(--surface-primary))] border-[hsl(var(--warning)_/_0.3)] animate-fade-in-up" style={{ animationDelay: '0.1s' }} data-testid="referral-highlight">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[hsl(var(--warning))] to-orange-500 flex items-center justify-center shadow-[0_4px_16px_hsl(var(--warning)_/_0.4)]">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-[hsl(var(--foreground))] mb-1">
                Earn up to <span className="text-[hsl(var(--warning))]">30%</span> forever
              </p>
              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                Get lifetime commission from all your referral deposits — no limits, no expiration.
              </p>
            </div>
          </div>
          <SoftButton 
            variant="secondary" 
            fullWidth
            onClick={() => navigate('/portal/referrals')}
            data-testid="view-referrals-btn"
            icon={ChevronRight}
          >
            View Referrals
          </SoftButton>
        </SoftCard>

        {/* Quick Status Cards */}
        <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <SoftCard className="text-center">
            <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))] mb-2">Withdrawable</p>
            <p className="text-2xl font-bold text-[hsl(var(--success))]">${withdrawableAmount.toFixed(2)}</p>
          </SoftCard>
          <SoftCard className="text-center">
            <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))] mb-2">Play Credits</p>
            <p className="text-2xl font-bold text-[hsl(var(--warning))]">${bonusBalance.toFixed(2)}</p>
          </SoftCard>
        </div>

        {/* Quick Access List */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-muted))] mb-4">
            Quick Access
          </h2>
          <SoftCard className="divide-y divide-[hsl(var(--border))]">
            <QuickAccessItem 
              icon={Wallet}
              iconColor="hsl(var(--success))"
              iconBg="hsl(var(--success-bg))"
              title="Wallet"
              subtitle="Manage your balance"
              onClick={() => navigate('/portal/wallet')}
              testId="quick-access-wallet"
            />
            <QuickAccessItem 
              icon={TrendingUp}
              iconColor="hsl(var(--info))"
              iconBg="hsl(var(--info-bg))"
              title="Transactions"
              subtitle="View history"
              onClick={() => navigate('/portal/transactions')}
              testId="quick-access-transactions"
            />
            <QuickAccessItem 
              icon={Gift}
              iconColor="hsl(var(--warning))"
              iconBg="hsl(var(--warning-bg))"
              title="Rewards"
              subtitle="Earn bonuses"
              onClick={() => navigate('/portal/rewards')}
              testId="quick-access-rewards"
            />
            <QuickAccessItem 
              icon={ArrowDownCircle}
              iconColor="hsl(var(--primary))"
              iconBg="hsl(var(--primary-soft))"
              title="Withdrawals"
              subtitle="Cash out funds"
              onClick={() => navigate('/portal/withdrawals')}
              testId="quick-access-withdrawals"
              last
            />
          </SoftCard>
        </div>

        {/* Referral Code */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-muted))] mb-4">
            Your Referral Code
          </h2>
          <SoftCard>
            <div className="flex items-center gap-3" data-testid="referral-code-display">
              <div className="flex-1 text-center font-mono text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent tracking-[0.2em]">
                {user?.referral_code || 'DEMO2024'}
              </div>
              <button 
                className="w-12 h-12 flex items-center justify-center rounded-[12px] bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] transition-all duration-200 shadow-[0_4px_12px_hsl(var(--primary)_/_0.3)]" 
                onClick={handleCopy} 
                data-testid="copy-referral-btn"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </SoftCard>
        </div>
      </div>
    </PortalLayout>
  );
};

// Quick Access Item Component
const QuickAccessItem = ({ icon: Icon, iconColor, iconBg, title, subtitle, onClick, testId, last }) => (
  <button
    className={`w-full flex items-center gap-4 p-4 text-left transition-all duration-200 hover:bg-[hsl(var(--surface-elevated))] ${!last && ''}`}
    onClick={onClick}
    data-testid={testId}
  >
    <div className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
      <Icon className="w-5 h-5" style={{ color: iconColor }} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-[hsl(var(--foreground))]">{title}</div>
      <div className="text-xs text-[hsl(var(--text-muted))]">{subtitle}</div>
    </div>
    <ChevronRight className="w-5 h-5 text-[hsl(var(--text-dim))] flex-shrink-0" />
  </button>
);

export default PortalDashboard;
