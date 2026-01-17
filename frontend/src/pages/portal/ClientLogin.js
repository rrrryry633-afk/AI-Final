import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SoftCard } from '../../components/SoftCard';
import { SoftButton } from '../../components/SoftButton';
import { SoftInput } from '../../components/SoftInput';
import { Lock, Eye, EyeOff, ArrowLeft, User, Gamepad2 } from 'lucide-react';

const ClientLogin = () => {
  const navigate = useNavigate();
  const { clientPasswordLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await clientPasswordLogin(form.username, form.password);
      if (result.success) {
        // Redirect to new mobile-first client home
        navigate('/client/home');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(var(--primary)_/_0.1)] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(var(--secondary)_/_0.08)] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <SoftCard className="p-8 animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-18 h-18 mx-auto rounded-[16px] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center shadow-[0_8px_24px_hsl(var(--primary)_/_0.4)] mb-4">
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Welcome Back</h1>
            <p className="text-sm text-[hsl(var(--text-secondary))]">Sign in to access your portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <SoftInput
              label="Username"
              icon={User}
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="username"
              required
            />

            <div className="relative">
              <SoftInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[42px] text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <div className="bg-[hsl(var(--error-bg))] border border-[hsl(var(--error)_/_0.3)] rounded-[12px] p-3 text-sm text-[hsl(var(--error))]">
                {error}
              </div>
            )}

            <SoftButton
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </SoftButton>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-[hsl(var(--text-muted))]">
            Don't have an account? Get a magic link from our messenger
          </div>
        </SoftCard>

        <Link
          to="/games"
          className="flex items-center justify-center gap-2 mt-6 text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-hover))] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </Link>
      </div>
    </div>
  );
};

export default ClientLogin;
