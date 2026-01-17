import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../utils/api';
import { getErrorMessage } from '../../utils/errorHandler';
import PortalLayout from '../../components/PortalLayout';
import { SoftCard, SoftCardHeader, SoftCardTitle } from '../../components/SoftCard';
import { SoftButton } from '../../components/SoftButton';
import { SoftInput } from '../../components/SoftInput';
import { StatusChip } from '../../components/StatusChip';
import { 
  Wallet, Gift, Info, Check, AlertCircle,
  Plus, Upload, X, Copy, Clock, RefreshCw, QrCode
} from 'lucide-react';

const PortalWallet = () => {
  const navigate = useNavigate();
  const { clientToken, portalToken } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState(null);
  
  // Add Balance Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);
  const [loadAmount, setLoadAmount] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  
  // Load History
  const [loadHistory, setLoadHistory] = useState([]);

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
      const [walletRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE}/api/v1/wallet/balance`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE}/api/v1/wallet/load-history`, { headers: getAuthHeaders() }).catch(() => ({ data: { requests: [] } }))
      ]);
      
      setWalletData({
        overview: {
          total_balance: (walletRes.data.wallet_balance || 0) + (walletRes.data.bonus_balance || 0) + (walletRes.data.play_credits || 0),
          cash_balance: walletRes.data.wallet_balance || 0,
          bonus_balance: walletRes.data.bonus_balance || 0,
          play_credits: walletRes.data.play_credits || 0,
          withdrawable_amount: walletRes.data.wallet_balance || 0,
          locked_amount: (walletRes.data.bonus_balance || 0) + (walletRes.data.play_credits || 0),
          pending_loads: walletRes.data.pending_loads || 0
        }
      });
      setLoadHistory(historyRes.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      setWalletData({
        overview: {
          total_balance: 0,
          cash_balance: 0,
          play_credits: 0,
          withdrawable_amount: 0,
          locked_amount: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentQR = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/v1/wallet/qr`, { headers: getAuthHeaders() });
      const qrByMethod = {};
      (response.data.qr_codes || []).forEach(qr => {
        if (!qrByMethod[qr.payment_method]) {
          qrByMethod[qr.payment_method] = [];
        }
        qrByMethod[qr.payment_method].push(qr);
      });
      return qrByMethod;
    } catch (error) {
      console.error('Failed to fetch payment QR:', error);
      return {};
    }
  };

  const handleOpenAddBalance = async () => {
    setShowAddModal(true);
    setAddStep(1);
    setSelectedMethod(null);
    setSelectedQR(null);
    setLoadAmount('');
    setProofImage(null);
    setProofPreview(null);
    setSubmitResult(null);
    const qrData = await fetchPaymentQR();
    setPaymentMethods(Object.keys(qrData).map(method => ({
      method,
      qr_codes: qrData[method]
    })));
  };

  const handleSelectMethod = (methodData) => {
    setSelectedMethod(methodData.method);
    const defaultQR = methodData.qr_codes.find(qr => qr.is_default) || methodData.qr_codes[0];
    setSelectedQR(defaultQR);
    setAddStep(2);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setProofImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitLoad = async () => {
    if (!loadAmount || parseFloat(loadAmount) < 10) {
      alert('Minimum load amount is $10');
      return;
    }
    if (!proofImage) {
      alert('Please upload payment proof');
      return;
    }

    setSubmitting(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        
        try {
          const response = await axios.post(
            `${API_BASE}/api/v1/wallet/load-request`,
            {
              amount: parseFloat(loadAmount),
              payment_method: selectedMethod,
              proof_image: base64
            },
            { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
          );
          
          setSubmitResult({
            success: true,
            message: response.data.message,
            request_id: response.data.request_id
          });
          setAddStep(4);
          fetchData();
        } catch (error) {
          setSubmitResult({
            success: false,
            message: getErrorMessage(error, 'Failed to submit request')
          });
        } finally {
          setSubmitting(false);
        }
      };
      reader.readAsDataURL(proofImage);
    } catch (error) {
      setSubmitting(false);
      setSubmitResult({
        success: false,
        message: 'Failed to process image'
      });
    }
  };

  const handleRedeemPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoMessage(null);
    try {
      const response = await axios.post(
        `${API_BASE}/api/v1/portal/promo/redeem`,
        { code: promoCode },
        { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
      );
      setPromoMessage({ type: 'success', text: response.data.message });
      setPromoCode('');
      fetchData();
    } catch (error) {
      setPromoMessage({ 
        type: 'error', 
        text: error.response?.data?.detail?.message || 'Failed to redeem promo code' 
      });
    } finally {
      setPromoLoading(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout title="Wallet">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
        </div>
      </PortalLayout>
    );
  }

  const overview = walletData?.overview || {};

  return (
    <PortalLayout title="Wallet">
      <div className="space-y-5">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-[hsl(var(--surface-elevated))] rounded-[14px] animate-fade-in-up" data-testid="wallet-tabs">
          <button 
            className={`flex-1 px-4 py-2.5 rounded-[12px] text-sm font-semibold transition-all duration-200 ${
              activeTab === 'overview' 
                ? 'bg-[hsl(var(--primary))] text-white shadow-[0_4px_12px_hsl(var(--primary)_/_0.3)]' 
                : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--foreground))]'
            }`}
            onClick={() => setActiveTab('overview')}
            data-testid="tab-overview"
          >
            Overview
          </button>
          <button 
            className={`flex-1 px-4 py-2.5 rounded-[12px] text-sm font-semibold transition-all duration-200 ${
              activeTab === 'history' 
                ? 'bg-[hsl(var(--primary))] text-white shadow-[0_4px_12px_hsl(var(--primary)_/_0.3)]' 
                : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--foreground))]'
            }`}
            onClick={() => setActiveTab('history')}
            data-testid="tab-history"
          >
            History
          </button>
          <button 
            className={`flex-1 px-4 py-2.5 rounded-[12px] text-sm font-semibold transition-all duration-200 ${
              activeTab === 'bonus' 
                ? 'bg-[hsl(var(--primary))] text-white shadow-[0_4px_12px_hsl(var(--primary)_/_0.3)]' 
                : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--foreground))]'
            }`}
            onClick={() => setActiveTab('bonus')}
            data-testid="tab-bonus"
          >
            Bonus
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <SoftCard className="animate-fade-in-up" data-testid="wallet-balance-card">
              <div className="text-center py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))] mb-2">
                  Wallet Balance
                </p>
                <p className="text-5xl font-bold bg-gradient-to-br from-[hsl(var(--foreground))] to-[hsl(var(--primary))] bg-clip-text text-transparent mb-4">
                  ${(overview.cash_balance || 0).toFixed(2)}
                </p>
              </div>
              
              <SoftButton
                variant="primary"
                fullWidth
                onClick={handleOpenAddBalance}
                data-testid="add-balance-btn"
                icon={Plus}
              >
                Add Balance
              </SoftButton>
              
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="text-center p-3 bg-[hsl(var(--success-bg))] rounded-[14px]">
                  <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))] mb-1">Available</p>
                  <p className="text-lg font-bold text-[hsl(var(--success))]">${(overview.cash_balance || 0).toFixed(2)}</p>
                </div>
                <div className="text-center p-3 bg-[hsl(var(--warning-bg))] rounded-[14px]">
                  <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))] mb-1">Pending</p>
                  <p className="text-lg font-bold text-[hsl(var(--warning))]">${(overview.pending_loads || 0).toFixed(2)}</p>
                </div>
              </div>
            </SoftCard>

            <div className="flex gap-3 p-4 bg-[hsl(var(--info-bg))] border border-[hsl(var(--info)_/_0.3)] rounded-[14px]">
              <Info className="w-5 h-5 text-[hsl(var(--info))] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                Games can ONLY be loaded from your wallet balance. Add funds via the Add Balance button above.
              </p>
            </div>

            <SoftCard data-testid="withdrawal-status-card">
              <SoftCardHeader>
                <SoftCardTitle>Balance Breakdown</SoftCardTitle>
              </SoftCardHeader>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[hsl(var(--text-secondary))]">Cash Balance</span>
                  <span className="text-base font-bold text-[hsl(var(--success))]">
                    ${(overview.cash_balance || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[hsl(var(--text-secondary))]">Bonus Balance</span>
                  <span className="text-base font-medium text-[hsl(var(--text-muted))]">
                    ${(overview.bonus_balance || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[hsl(var(--text-secondary))]">Play Credits</span>
                  <span className="text-base font-medium text-[hsl(var(--text-muted))]">
                    ${(overview.play_credits || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </SoftCard>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <SoftCard data-testid="load-history-section">
            <SoftCardHeader>
              <SoftCardTitle icon={Clock}>Load History</SoftCardTitle>
              <button onClick={fetchData} className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-[hsl(var(--surface-elevated))] hover:bg-[hsl(var(--surface-secondary))] transition-all duration-200">
                <RefreshCw className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
              </button>
            </SoftCardHeader>
            
            {loadHistory.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--text-dim))] opacity-50" />
                <p className="text-base font-medium text-[hsl(var(--text-secondary))] mb-1">No load history yet</p>
                <p className="text-sm text-[hsl(var(--text-muted))]">Your wallet load requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {loadHistory.map((item) => (
                  <div 
                    key={item.request_id}
                    className="p-4 bg-[hsl(var(--surface-elevated))] rounded-[14px] border border-[hsl(var(--border))]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-base font-bold text-[hsl(var(--foreground))]">
                          ${item.amount?.toFixed(2)}
                        </span>
                        <span className="ml-2 text-sm text-[hsl(var(--text-muted))]">
                          via {item.payment_method}
                        </span>
                      </div>
                      <StatusChip status={item.status} />
                    </div>
                    <div className="text-xs text-[hsl(var(--text-muted))]">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                    {item.rejection_reason && item.status === 'rejected' && (
                      <div className="mt-2 text-sm text-[hsl(var(--error))]">
                        Reason: {item.rejection_reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SoftCard>
        )}

        {/* Bonus Tab */}
        {activeTab === 'bonus' && (
          <SoftCard data-testid="promo-redeem-card">
            <SoftCardHeader>
              <SoftCardTitle icon={Gift}>Redeem Promo Code</SoftCardTitle>
            </SoftCardHeader>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 rounded-[14px] border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--text-dim))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-opacity-30 uppercase"
                data-testid="promo-input"
              />
              <SoftButton
                onClick={handleRedeemPromo}
                disabled={promoLoading || !promoCode.trim()}
                data-testid="promo-redeem-btn"
              >
                {promoLoading ? 'Redeeming...' : 'Redeem'}
              </SoftButton>
            </div>
            
            {promoMessage && (
              <div className={`mt-4 flex items-center gap-2 p-3 rounded-[14px] ${
                promoMessage.type === 'success' 
                  ? 'bg-[hsl(var(--success-bg))] text-[hsl(var(--success))]' 
                  : 'bg-[hsl(var(--error-bg))] text-[hsl(var(--error))]'
              }`}>
                {promoMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-sm">{promoMessage.text}</span>
              </div>
            )}
          </SoftCard>
        )}

        {/* Add Balance Modal */}
        {showAddModal && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <div 
              className="bg-[hsl(var(--surface-primary))] rounded-[16px] border border-[hsl(var(--border))] max-w-md w-full max-h-[90vh] overflow-auto shadow-[0_12px_40px_hsl(220_20%_5%_/_0.5)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Add Balance</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-[12px] hover:bg-[hsl(var(--surface-elevated))] transition-all duration-200"
                >
                  <X className="w-5 h-5 text-[hsl(var(--text-muted))]" />
                </button>
              </div>
              
              <div className="p-6">
                {addStep === 1 && (
                  <div>
                    <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                      Select a payment method:
                    </p>
                    <div className="space-y-2">
                      {paymentMethods.length === 0 ? (
                        <p className="text-center text-[hsl(var(--text-muted))] py-8">
                          No payment methods available. Please contact support.
                        </p>
                      ) : (
                        paymentMethods.map((pm) => (
                          <button
                            key={pm.method}
                            onClick={() => handleSelectMethod(pm)}
                            className="w-full flex items-center gap-3 p-4 bg-[hsl(var(--surface-elevated))] hover:bg-[hsl(var(--surface-secondary))] border border-[hsl(var(--border))] rounded-[14px] transition-all duration-200"
                          >
                            <QrCode className="w-6 h-6 text-[hsl(var(--primary))]" />
                            <span className="font-medium text-[hsl(var(--foreground))]">{pm.method}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
                
                {addStep === 2 && selectedQR && (
                  <div>
                    <div className="text-center mb-6">
                      <p className="font-medium text-[hsl(var(--foreground))] mb-3">{selectedMethod}</p>
                      {selectedQR.image_url && (
                        <img 
                          src={selectedQR.image_url} 
                          alt="Payment QR"
                          className="max-w-[200px] w-full mx-auto rounded-[14px] border border-[hsl(var(--border))]"
                        />
                      )}
                      {selectedQR.account_name && (
                        <p className="text-sm text-[hsl(var(--text-secondary))] mt-2">
                          {selectedQR.account_name}
                        </p>
                      )}
                      {selectedQR.account_number && (
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <code className="px-2 py-1 bg-[hsl(var(--surface-elevated))] rounded text-xs">
                            {selectedQR.account_number}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(selectedQR.account_number)}
                            className="p-1 hover:text-[hsl(var(--primary))] transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <SoftInput
                      type="number"
                      label="Amount to Load ($)"
                      placeholder="Enter amount (min. $10)"
                      value={loadAmount}
                      onChange={(e) => setLoadAmount(e.target.value)}
                      className="mb-4"
                    />
                    
                    <div className="flex gap-2">
                      <SoftButton
                        variant="secondary"
                        onClick={() => setAddStep(1)}
                        className="flex-1"
                      >
                        Back
                      </SoftButton>
                      <SoftButton
                        variant="primary"
                        onClick={() => loadAmount && parseFloat(loadAmount) >= 10 && setAddStep(3)}
                        disabled={!loadAmount || parseFloat(loadAmount) < 10}
                        className="flex-1"
                      >
                        Next: Upload Proof
                      </SoftButton>
                    </div>
                  </div>
                )}
                
                {addStep === 3 && (
                  <div>
                    <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                      Upload your payment screenshot as proof:
                    </p>
                    
                    <div className="p-3 bg-[hsl(var(--success-bg))] border border-[hsl(var(--success)_/_0.3)] rounded-[14px] mb-4">
                      <p className="text-sm text-[hsl(var(--success))]">
                        Loading: ${parseFloat(loadAmount).toFixed(2)} via {selectedMethod}
                      </p>
                    </div>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="proof-upload"
                    />
                    <label
                      htmlFor="proof-upload"
                      className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[hsl(var(--border))] rounded-[14px] cursor-pointer hover:border-[hsl(var(--primary)_/_0.5)] transition-all duration-200 text-center"
                    >
                      {proofPreview ? (
                        <img 
                          src={proofPreview} 
                          alt="Proof preview"
                          className="max-w-full max-h-48 rounded-[12px]"
                        />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-[hsl(var(--text-muted))] mb-3" />
                          <p className="text-sm text-[hsl(var(--text-muted))]">Click to upload payment proof</p>
                          <p className="text-xs text-[hsl(var(--text-dim))] mt-1">Max 5MB, JPG/PNG</p>
                        </>
                      )}
                    </label>
                    
                    {submitResult && !submitResult.success && (
                      <div className="mt-4 p-3 bg-[hsl(var(--error-bg))] border border-[hsl(var(--error)_/_0.3)] rounded-[14px] text-[hsl(var(--error))] text-sm">
                        {submitResult.message}
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <SoftButton
                        variant="secondary"
                        onClick={() => setAddStep(2)}
                        disabled={submitting}
                        className="flex-1"
                      >
                        Back
                      </SoftButton>
                      <SoftButton
                        variant="primary"
                        onClick={handleSubmitLoad}
                        disabled={submitting || !proofImage}
                        className="flex-1"
                      >
                        {submitting ? 'Submitting...' : 'Submit Request'}
                      </SoftButton>
                    </div>
                  </div>
                )}
                
                {addStep === 4 && submitResult?.success && (
                  <div className="text-center py-8">
                    <Check className="w-16 h-16 mx-auto mb-4 text-[hsl(var(--success))]" />
                    <h4 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">Request Submitted!</h4>
                    <p className="text-sm text-[hsl(var(--text-secondary))] mb-6 max-w-sm mx-auto">
                      Your wallet load request has been submitted for review. You will be notified once it is processed.
                    </p>
                    <SoftButton
                      variant="primary"
                      fullWidth
                      onClick={() => {
                        setShowAddModal(false);
                        setActiveTab('history');
                      }}
                    >
                      View Load History
                    </SoftButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default PortalWallet;
