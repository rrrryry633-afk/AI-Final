import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PortalLayout from '../../components/PortalLayout';
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  TrendingUp, 
  Award, 
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Send,
  MessageCircle,
  Gift,
  Wallet,
  UserPlus,
  ArrowRight,
  Info
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Design System Constants
const COLORS = {
  primary: '#1E3A8A',      // Deep Blue
  accent: '#10B981',       // Emerald
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
};

// Referral Progress Steps
const PROGRESS_STEPS = [
  { key: 'joined', label: 'Joined', icon: UserPlus },
  { key: 'deposited', label: 'Deposited', icon: Wallet },
  { key: 'eligible', label: 'Eligible', icon: CheckCircle2 },
  { key: 'credited', label: 'Credited', icon: Gift },
];

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
    credited: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Credited' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Rejected' },
    active: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Active' },
    inactive: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: 'Inactive' },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, value, label, color = 'primary' }) => {
  const colorClasses = {
    primary: 'text-blue-900',
    accent: 'text-emerald-600',
    warning: 'text-amber-600',
    muted: 'text-slate-600',
  };

  return (
    <div 
      className="bg-white rounded-[18px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-shadow duration-200"
      data-testid="stat-card"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === 'accent' ? 'bg-emerald-50' : color === 'warning' ? 'bg-amber-50' : 'bg-blue-50'}`}>
          <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
};

// Progress Timeline Component
const ReferralProgress = ({ referral }) => {
  const getStepStatus = (stepKey) => {
    const progress = referral?.progress || {};
    if (progress[stepKey]) return 'completed';
    
    // Determine current step
    const stepOrder = ['joined', 'deposited', 'eligible', 'credited'];
    const currentIndex = stepOrder.findIndex(s => !progress[s]);
    const stepIndex = stepOrder.indexOf(stepKey);
    
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="bg-white rounded-[18px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-900">
            {referral?.masked_username || 'us***01'}
          </span>
          <StatusBadge status={referral?.status} />
        </div>
        <span className="text-xs text-slate-500">
          {referral?.joined_date || 'Jan 15, 2025'}
        </span>
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center justify-between relative">
        {/* Connection Line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0" />
        
        {PROGRESS_STEPS.map((step, idx) => {
          const status = getStepStatus(step.key);
          const StepIcon = step.icon;
          
          return (
            <div key={step.key} className="flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                status === 'completed' 
                  ? 'bg-emerald-500 text-white' 
                  : status === 'current'
                    ? 'bg-blue-900 text-white ring-4 ring-blue-100'
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {status === 'completed' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>
              <span className={`text-[10px] mt-1.5 font-medium ${
                status === 'completed' ? 'text-emerald-600' : 
                status === 'current' ? 'text-blue-900' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Accordion Item Component
const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium text-slate-900">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-slate-600 leading-relaxed animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

// Main Component
const ReferralPage = () => {
  const { user, clientToken, portalToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const getAuthHeaders = useCallback(() => {
    if (clientToken) return { Authorization: `Bearer ${clientToken}` };
    if (portalToken) return { 'X-Portal-Token': portalToken };
    return {};
  }, [clientToken, portalToken]);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/portal/referrals/details`, {
        headers: getAuthHeaders()
      });
      setReferralData(response.data);
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
      // Set demo data for development
      setReferralData({
        referral_code: user?.referral_code || 'DEMO2024',
        referral_link: `${window.location.origin}/register?ref=${user?.referral_code || 'DEMO2024'}`,
        stats: {
          total_referrals: 12,
          active_referrals: 8,
          total_earned: 250.50,
          pending_rewards: 45.00
        },
        referrals: [
          { 
            masked_username: 'jo***23', 
            status: 'credited',
            joined_date: 'Jan 15, 2025',
            deposit_amount: 100,
            reward_percent: 10,
            reward_earned: 10.00,
            progress: { joined: true, deposited: true, eligible: true, credited: true }
          },
          { 
            masked_username: 'ma***45', 
            status: 'pending',
            joined_date: 'Jan 18, 2025',
            deposit_amount: 50,
            reward_percent: 10,
            reward_earned: 5.00,
            progress: { joined: true, deposited: true, eligible: true, credited: false }
          },
          { 
            masked_username: 'al***67', 
            status: 'active',
            joined_date: 'Jan 20, 2025',
            deposit_amount: 0,
            reward_percent: 10,
            reward_earned: 0,
            progress: { joined: true, deposited: false, eligible: false, credited: false }
          },
        ],
        earnings: [
          { friend: 'jo***23', deposit_amount: 100, reward_percent: 10, reward_earned: 10.00, status: 'credited' },
          { friend: 'ma***45', deposit_amount: 50, reward_percent: 10, reward_earned: 5.00, status: 'pending' },
          { friend: 'sa***89', deposit_amount: 200, reward_percent: 10, reward_earned: 20.00, status: 'credited' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = useCallback(() => {
    const link = referralData?.referral_link || 
      `${window.location.origin}/register?ref=${referralData?.referral_code || user?.referral_code || 'DEMO'}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        setCopied(true);
        setShowToast(true);
        setTimeout(() => {
          setCopied(false);
          setShowToast(false);
        }, 2500);
      }).catch(console.error);
    } else {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setShowToast(true);
        setTimeout(() => {
          setCopied(false);
          setShowToast(false);
        }, 2500);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
    }
  }, [referralData, user]);

  const handleShareTelegram = () => {
    const link = referralData?.referral_link || 
      `${window.location.origin}/register?ref=${referralData?.referral_code}`;
    const text = encodeURIComponent(`Join me and get a bonus! Use my referral link: ${link}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const link = referralData?.referral_link || 
      `${window.location.origin}/register?ref=${referralData?.referral_code}`;
    const text = encodeURIComponent(`Join me and get a bonus! Use my referral link: ${link}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <PortalLayout title="Referrals">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
        </div>
      </PortalLayout>
    );
  }

  const stats = referralData?.stats || { total_referrals: 0, active_referrals: 0, total_earned: 0, pending_rewards: 0 };
  const referralCode = referralData?.referral_code || user?.referral_code || 'N/A';
  const referralLink = referralData?.referral_link || `${window.location.origin}/register?ref=${referralCode}`;
  const referrals = referralData?.referrals || [];
  const earnings = referralData?.earnings || [];

  // Safely format numbers
  const formatCurrency = (value) => {
    const num = typeof value === 'number' ? value : 0;
    return `₱${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <PortalLayout title="Referrals">
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Referral link copied!</span>
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-6 pb-24">
          
          {/* ==================== HERO SECTION ==================== */}
          <section 
            className="rounded-[18px] overflow-hidden"
            data-testid="referral-hero"
          >
            <div className="bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#10B981] p-6 sm:p-8">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Turn Your Network Into Rewards
                </h1>
                <p className="text-white/80 text-sm sm:text-base mb-6 max-w-md mx-auto">
                  Earn bonuses every time your friends deposit and play.
                </p>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-[10px] hover:bg-white/95 hover:shadow-lg transition-all duration-200"
                  data-testid="hero-copy-btn"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Copied!' : 'Copy Referral Link'}
                </button>
              </div>
            </div>
          </section>

          {/* ==================== STATS SECTION ==================== */}
          <section data-testid="referral-stats">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard 
                icon={Users} 
                value={stats.total_referrals} 
                label="Total Referrals" 
                color="primary"
              />
              <StatCard 
                icon={UserPlus} 
                value={stats.active_referrals} 
                label="Active Referrals" 
                color="accent"
              />
              <StatCard 
                icon={TrendingUp} 
                value={formatCurrency(stats.total_earned)} 
                label="Total Earned" 
                color="accent"
              />
              <StatCard 
                icon={Clock} 
                value={formatCurrency(stats.pending_rewards)} 
                label="Pending Rewards" 
                color="warning"
              />
            </div>
          </section>

          {/* ==================== YOUR REFERRAL LINK CARD ==================== */}
          <section data-testid="referral-link-card">
            <div className="bg-white rounded-[18px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Your Referral Link</h2>
              
              {/* Link Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-[10px] text-sm text-slate-700 font-mono truncate"
                  data-testid="referral-link-input"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-3 bg-blue-900 text-white rounded-[10px] hover:bg-blue-800 transition-colors"
                  data-testid="copy-link-btn"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              {/* Share Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleShareTelegram}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#229ED9] text-white rounded-[10px] hover:bg-[#1E8BC3] transition-colors text-sm font-medium"
                  data-testid="share-telegram-btn"
                >
                  <Send className="w-4 h-4" />
                  Telegram
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-[10px] hover:bg-[#20BD5A] transition-colors text-sm font-medium"
                  data-testid="share-whatsapp-btn"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-[10px] hover:bg-slate-200 transition-colors text-sm font-medium"
                  data-testid="share-copy-btn"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-4 text-center">
                Share this link to earn rewards when your friends play.
              </p>
            </div>
          </section>

          {/* ==================== REFERRAL PROGRESS SECTION ==================== */}
          <section data-testid="referral-progress">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Referral Progress</h2>
              <span className="text-xs text-slate-500">{referrals.length} referrals</span>
            </div>

            {referrals.length > 0 ? (
              <div className="space-y-3">
                {referrals.map((referral, idx) => (
                  <ReferralProgress key={idx} referral={referral} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[18px] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 text-sm mb-2">You haven't referred anyone yet.</p>
                <p className="text-slate-400 text-xs">Share your link to get started.</p>
              </div>
            )}
          </section>

          {/* ==================== EARNINGS TABLE ==================== */}
          {earnings.length > 0 && (
            <section data-testid="earnings-table">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Earnings History</h2>
              
              <div className="bg-white rounded-[18px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <div>Friend</div>
                  <div className="text-right">Deposit</div>
                  <div className="text-right">Rate</div>
                  <div className="text-right">Reward</div>
                  <div className="text-center">Status</div>
                </div>
                
                {/* Table Body */}
                <div className="divide-y divide-slate-50">
                  {earnings.map((earning, idx) => (
                    <div 
                      key={idx} 
                      className="grid grid-cols-5 gap-2 px-4 py-3 items-center hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="text-sm font-medium text-slate-900">{earning.friend}</div>
                      <div className="text-sm text-slate-600 text-right">₱{earning.deposit_amount}</div>
                      <div className="text-sm text-slate-600 text-right">{earning.reward_percent}%</div>
                      <div className="text-sm font-medium text-emerald-600 text-right">
                        ₱{earning.reward_earned.toFixed(2)}
                      </div>
                      <div className="text-center">
                        <StatusBadge status={earning.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ==================== REFERRAL RULES ACCORDION ==================== */}
          <section data-testid="referral-rules">
            <div className="bg-white rounded-[18px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-900" />
                <h2 className="text-sm font-semibold text-slate-900">Referral Rules</h2>
              </div>

              <AccordionItem title="When are rewards credited?" defaultOpen>
                <p>
                  Rewards are credited to your wallet once your referred friend completes their first deposit 
                  and the deposit is approved by our team. This typically happens within 24 hours.
                </p>
              </AccordionItem>

              <AccordionItem title="Bonus limits">
                <ul className="list-disc list-inside space-y-1">
                  <li>Standard referral bonus: 10% of friend's first deposit</li>
                  <li>Maximum bonus per referral: ₱500</li>
                  <li>No limit on the number of referrals</li>
                  <li>Bonuses are subject to 1x playthrough requirement</li>
                </ul>
              </AccordionItem>

              <AccordionItem title="Abuse prevention">
                <p className="mb-2">
                  To ensure fairness, the following rules apply:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Self-referrals are not allowed</li>
                  <li>Multiple accounts per person are prohibited</li>
                  <li>Suspicious activity may result in bonus forfeiture</li>
                  <li>We reserve the right to modify or cancel bonuses</li>
                </ul>
              </AccordionItem>
            </div>
          </section>

        </div>

        {/* ==================== STICKY MOBILE CTA ==================== */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-200 sm:hidden safe-bottom z-40">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#1E3A8A] to-[#10B981] text-white font-semibold rounded-[10px] shadow-lg"
            data-testid="sticky-copy-btn"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copied!' : 'Copy Referral Link'}
          </button>
        </div>
      </div>
    </PortalLayout>
  );
};

export default ReferralPage;
