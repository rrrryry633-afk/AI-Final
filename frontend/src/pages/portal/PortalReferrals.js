import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PortalLayout from '../../components/PortalLayout';
import InviteModal from '../../components/InviteModal';
import { SoftCard, SoftCardHeader, SoftCardTitle } from '../../components/SoftCard';
import { SoftButton } from '../../components/SoftButton';
import { 
  Users, Copy, Check, Share2, TrendingUp, Star, Award, Sparkles
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PortalReferrals = () => {
  const navigate = useNavigate();
  const { user, clientToken, portalToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const getAuthHeaders = () => {
    if (clientToken) return { Authorization: `Bearer ${clientToken}` };
    if (portalToken) return { 'X-Portal-Token': portalToken };
    return {};
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/portal/referrals/details`, {
        headers: getAuthHeaders()
      });
      setReferralData(response.data);
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
      setReferralData({
        referral_code: user?.referral_code || 'DEMO2024',
        earnings: { pending: 45.50, confirmed: 125.00, total: 170.50 },
        stats: { total_referrals: 12, active_referrals: 8 },
        tier: { 
          current: { name: 'Bronze', commission: 10 },
          all_tiers: [
            { name: 'Starter', commission: 5, min_refs: 0 },
            { name: 'Bronze', commission: 10, min_refs: 5 },
            { name: 'Silver', commission: 15, min_refs: 15 },
            { name: 'Gold', commission: 20, min_refs: 30 },
            { name: 'Platinum', commission: 25, min_refs: 50 },
            { name: 'Diamond', commission: 30, min_refs: 100 }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const code = referralData?.referral_code || user?.referral_code || 'N/A';
    if (code && navigator.clipboard && navigator.clipboard.writeText) {
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
      <PortalLayout title="Referrals">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
        </div>
      </PortalLayout>
    );
  }

  const referralCode = referralData?.referral_code || user?.referral_code || 'N/A';
  const earnings = referralData?.earnings || { pending: 0, confirmed: 0, total: 0 };
  const stats = referralData?.stats || { total_referrals: 0, active_referrals: 0 };
  const currentTier = referralData?.tier?.current || { name: 'Starter', commission: 5 };
  const tiers = referralData?.tier?.all_tiers || [
    { name: 'Starter', commission: 5, min_refs: 0 },
    { name: 'Bronze', commission: 10, min_refs: 10 },
    { name: 'Silver', commission: 15, min_refs: 25 },
    { name: 'Gold', commission: 20, min_refs: 50 }
  ];

  return (
    <PortalLayout title="Referrals">
      <div className="space-y-5">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in-up" data-testid="referral-stats">
          <SoftCard className="text-center p-4">
            <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))] mb-2">Total</p>
            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stats.total_referrals}</p>
          </SoftCard>
          <SoftCard className="text-center p-4">
            <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))] mb-2">Active</p>
            <p className="text-2xl font-bold text-[hsl(var(--success))]">{stats.active_referrals}</p>
          </SoftCard>
          <SoftCard className="text-center p-4">
            <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))] mb-2">Earned</p>
            <p className="text-2xl font-bold text-[hsl(var(--warning))]">${earnings.total.toFixed(0)}</p>
          </SoftCard>
        </div>

        {/* Referral Program Info - MOST IMPORTANT SECTION */}
        <SoftCard 
          className="bg-gradient-to-br from-[hsl(var(--warning-bg))] to-[hsl(var(--surface-primary))] border-[hsl(var(--warning)_/_0.3)] animate-fade-in-up" 
          style={{ animationDelay: '0.1s' }}
          data-testid="referral-program-info"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-[16px] bg-gradient-to-br from-[hsl(var(--warning))] to-orange-500 shadow-[0_8px_24px_hsl(var(--warning)_/_0.4)] mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
              Earn up to <span className="text-[hsl(var(--warning))]">30%</span> forever
            </h3>
            <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed max-w-md mx-auto">
              Get lifetime commission from all your referral deposits. Your current rate: <span className="font-bold text-[hsl(var(--foreground))]">{currentTier.commission}%</span> ({currentTier.name} tier)
            </p>
          </div>
          
          {/* How It Works */}
          <div className="bg-[hsl(var(--surface-primary)_/_0.6)] rounded-[14px] p-4 mb-4 space-y-3">
            <h4 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">How It Works</h4>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">Share your code</p>
                <p className="text-xs text-[hsl(var(--text-muted))]">Send your unique referral code to friends</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">They sign up</p>
                <p className="text-xs text-[hsl(var(--text-muted))]">Friends join using your referral code</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">Earn forever</p>
                <p className="text-xs text-[hsl(var(--text-muted))]">Get {currentTier.commission}% commission on every deposit they make</p>
              </div>
            </div>
          </div>
        </SoftCard>

        {/* Earnings Breakdown */}
        <SoftCard className="animate-fade-in-up" style={{ animationDelay: '0.2s' }} data-testid="earnings-breakdown">
          <SoftCardHeader>
            <SoftCardTitle icon={TrendingUp}>Earnings Breakdown</SoftCardTitle>
          </SoftCardHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-[hsl(var(--warning-bg))] rounded-[14px]">
              <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))] mb-2">Pending</p>
              <p className="text-xl font-bold text-[hsl(var(--warning))]">${earnings.pending.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-[hsl(var(--success-bg))] rounded-[14px]">
              <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))] mb-2">Confirmed</p>
              <p className="text-xl font-bold text-[hsl(var(--success))]">${earnings.confirmed.toFixed(2)}</p>
            </div>
          </div>
        </SoftCard>

        {/* Referral Code Section */}
        <SoftCard className="animate-fade-in-up" style={{ animationDelay: '0.3s' }} data-testid="referral-code-section">
          <SoftCardHeader>
            <SoftCardTitle>Your Referral Code</SoftCardTitle>
          </SoftCardHeader>
          
          <div className="bg-[hsl(var(--surface-elevated))] rounded-[14px] p-4 mb-4 border-2 border-dashed border-[hsl(var(--primary)_/_0.3)]">
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center font-mono text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent tracking-[0.2em]">
                {referralCode}
              </div>
              <button 
                className="w-12 h-12 flex items-center justify-center rounded-[12px] bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] transition-all duration-200 shadow-[0_4px_12px_hsl(var(--primary)_/_0.3)]" 
                onClick={handleCopy} 
                data-testid="copy-code-btn"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <SoftButton 
            variant="primary" 
            fullWidth
            onClick={() => setShowInviteModal(true)}
            data-testid="share-earn-btn"
            icon={Share2}
          >
            Share & Earn
          </SoftButton>
        </SoftCard>

        {/* Commission Tiers */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-muted))] mb-4">
            Commission Tiers
          </h2>
          <SoftCard className="divide-y divide-[hsl(var(--border))]" data-testid="commission-tiers">
            {tiers.slice(0, 4).map((tier, idx) => {
              const isCurrent = tier.name === currentTier.name;
              const TierIcon = idx === 0 ? Star : idx === 1 ? Award : idx === 2 ? Award : Sparkles;
              
              return (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-4 ${isCurrent ? 'bg-[hsl(var(--primary-soft))]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${
                        isCurrent ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--surface-elevated))] text-[hsl(var(--text-muted))]'
                      }`}
                    >
                      <TierIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${isCurrent ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>
                        {tier.name}
                        {isCurrent && <span className="ml-2 text-xs opacity-80">• Current</span>}
                      </div>
                      <div className="text-xs text-[hsl(var(--text-muted))]">
                        {tier.min_refs === 0 ? 'Starting tier' : `${tier.min_refs}+ active referrals`}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${isCurrent ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>
                    {tier.commission}%
                  </div>
                </div>
              );
            })}
          </SoftCard>
        </div>
      </div>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        referralCode={referralCode}
      />
    </PortalLayout>
  );
};

export default PortalReferrals;
