/**
 * AddFunds - Migrated to new API layer
 * Route: /client/wallet/add
 * 
 * Features:
 * - Amount input with quick amounts
 * - Payment method selection
 * - Proof upload
 * - Info box: "Requires Telegram approval"
 * - Success state with order ID
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Upload, DollarSign, CreditCard, 
  Smartphone, Building2, CheckCircle, Loader2,
  ArrowLeft, Info, AlertCircle
} from 'lucide-react';

// Centralized API
import http, { getErrorMessage, isServerUnavailable } from '../../api/http';

const paymentMethods = [
  { id: 'gcash', name: 'GCash', icon: Smartphone, color: 'blue' },
  { id: 'paymaya', name: 'PayMaya', icon: Smartphone, color: 'green' },
  { id: 'bank', name: 'Bank Transfer', icon: Building2, color: 'violet' },
];

const AddFunds = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);

  const quickAmounts = [20, 50, 100, 200, 500];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (!proofImage) {
      toast.error('Please upload payment proof');
      return;
    }

    setSubmitting(true);
    setError(null);
    
    try {
      const response = await http.post('/wallet-load/request', {
        amount: parseFloat(amount),
        payment_method: paymentMethod.toUpperCase(),
        proof_image: proofImage,
        notes: `Via ${paymentMethod}`
      });

      if (response.data.success) {
        setOrderId(response.data.order_id || response.data.request_id);
        setSuccess(true);
        toast.success('Deposit request submitted!');
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to submit request');
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
          <p className="text-gray-400 mb-4">
            Your deposit request for ${parseFloat(amount).toFixed(2)} has been submitted.
          </p>
          
          {/* Telegram approval info */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-amber-400" />
              <p className="text-amber-400 font-medium text-sm">Awaiting Telegram Approval</p>
            </div>
            <p className="text-xs text-amber-400/70">
              An admin will review and approve your deposit via Telegram. This usually takes a few minutes.
            </p>
            {orderId && (
              <p className="text-xs text-gray-500 mt-2 font-mono">
                Order ID: {orderId.slice(0, 8)}...
              </p>
            )}
          </div>
          
          <button
            onClick={() => navigate('/client/wallet')}
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all"
            data-testid="back-to-wallet-btn"
          >
            Back to Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]" data-testid="add-funds-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/client/wallet')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Add Funds</h1>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Telegram Approval Notice */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-5 h-5 text-blue-400" />
            <p className="text-blue-400 font-medium text-sm">Requires Telegram Approval</p>
          </div>
          <p className="text-xs text-blue-400/70">
            After submitting, an admin will review and approve your deposit via Telegram.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                s === step ? 'w-8 bg-violet-500' : s < step ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Amount */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Enter Amount</h2>
              <p className="text-gray-400">How much would you like to deposit?</p>
            </div>

            {/* Amount Input */}
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-4 text-2xl font-bold bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                data-testid="amount-input"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    amount === amt.toString()
                      ? 'bg-violet-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <button
              onClick={() => amount && parseFloat(amount) > 0 && setStep(2)}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all"
              data-testid="continue-btn"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Payment Method</h2>
              <p className="text-gray-400">Select how you'll pay</p>
            </div>

            <div className="space-y-3">
              {paymentMethods.map(method => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                      paymentMethod === method.id
                        ? 'bg-violet-500/10 border-violet-500/50'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                    }`}
                    data-testid={`method-${method.id}`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-${method.color}-500/10 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${method.color}-400`} />
                    </div>
                    <span className="font-medium text-white">{method.name}</span>
                    {paymentMethod === method.id && (
                      <CheckCircle className="w-5 h-5 text-violet-400 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
              >
                Back
              </button>
              <button
                onClick={() => paymentMethod && setStep(3)}
                disabled={!paymentMethod}
                className="flex-1 py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Upload Proof */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Upload Proof</h2>
              <p className="text-gray-400">Upload screenshot of your payment</p>
            </div>

            {/* Summary */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Amount</span>
                <span className="font-bold text-white">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Method</span>
                <span className="text-white capitalize">{paymentMethod}</span>
              </div>
            </div>

            {/* Upload Area */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                data-testid="proof-upload"
              />
              <div className={`p-8 border-2 border-dashed rounded-2xl text-center transition-all ${
                proofPreview ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/30'
              }`}>
                {proofPreview ? (
                  <div className="space-y-4">
                    <img 
                      src={proofPreview} 
                      alt="Payment proof" 
                      className="max-h-40 mx-auto rounded-xl"
                    />
                    <p className="text-emerald-400 text-sm">Image uploaded ✓</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-10 h-10 text-gray-500 mx-auto" />
                    <p className="text-gray-400">Tap to upload payment screenshot</p>
                    <p className="text-xs text-gray-600">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!proofImage || submitting}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                data-testid="submit-btn"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AddFunds;
