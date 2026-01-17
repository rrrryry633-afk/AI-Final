import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FloatingBottomNav } from './FloatingBottomNav';
import { 
  Home, Wallet, Receipt, Users, Gift, Shield, Gamepad2, 
  ArrowDownCircle, LogOut, ChevronLeft, Sparkles
} from 'lucide-react';

// Desktop Sidebar Navigation - Soft Design
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: Home, path: '/portal' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/portal/wallet' },
    { id: 'transactions', label: 'Transactions', icon: Receipt, path: '/portal/transactions' },
    { id: 'referrals', label: 'Referrals', icon: Users, path: '/portal/referrals' },
    { id: 'rewards', label: 'Rewards', icon: Gift, path: '/portal/rewards' },
    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowDownCircle, path: '/portal/withdrawals' },
    { id: 'credentials', label: 'Game Credentials', icon: Gamepad2, path: '/portal/credentials' },
    { id: 'security', label: 'Security', icon: Shield, path: '/portal/security' },
  ];

  const isActive = (path) => {
    if (path === '/portal') return location.pathname === '/portal';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/client-login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[hsl(var(--surface-primary))] border-r border-[hsl(var(--border))] flex flex-col z-40">
      {/* Brand */}
      <div className="p-6 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center shadow-[0_4px_12px_hsl(var(--primary)_/_0.3)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[hsl(var(--foreground))]">Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[hsl(var(--primary))] text-white shadow-[0_4px_12px_hsl(var(--primary)_/_0.3)]'
                    : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-elevated))] hover:text-[hsl(var(--foreground))]'
                }`}
                onClick={() => navigate(item.path)}
                data-testid={`sidebar-${item.id}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))]">
        <div className="flex items-center gap-3 p-2 mb-2">
          <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center font-bold text-white shadow-[0_2px_8px_hsl(var(--primary)_/_0.3)]">
            {user?.display_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">
              {user?.display_name || user?.username || 'Client'}
            </div>
            <div className="text-xs text-[hsl(var(--text-muted))]">
              {user?.referral_code || 'N/A'}
            </div>
          </div>
        </div>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[hsl(var(--error))] hover:bg-[hsl(var(--error-bg))] transition-all duration-200"
          onClick={handleLogout}
          data-testid="sidebar-logout"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

// Mobile Header - Soft Design
const MobileHeader = ({ title, showBack = true, onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/portal');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[hsl(var(--surface-primary)_/_0.95)] backdrop-blur-xl border-b border-[hsl(var(--border))] z-40 flex items-center px-4 lg:hidden">
      {showBack ? (
        <button 
          className="w-11 h-11 flex items-center justify-center rounded-[12px] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-elevated))] hover:text-[hsl(var(--foreground))] transition-all duration-200" 
          onClick={handleBack}
          data-testid="mobile-back-btn"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      ) : (
        <div className="w-11" />
      )}
      <h1 className="flex-1 text-center text-base font-semibold text-[hsl(var(--foreground))]">{title}</h1>
      <div className="w-11" />
    </header>
  );
};

// Mobile Bottom Navigation - Using FloatingBottomNav component
const BottomNav = FloatingBottomNav;

// Main Layout Wrapper - Soft Design
const PortalLayout = ({ children, title, showBack = true, onBack }) => {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Mobile Header */}
        <MobileHeader title={title} showBack={showBack} onBack={onBack} />
        
        {/* Content Area */}
        <div className="pt-20 pb-32 lg:pt-0 lg:pb-8 px-6 lg:px-8 max-w-4xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Floating Bottom Nav (Mobile) */}
      <BottomNav />
    </div>
  );
};

export { PortalLayout, MobileHeader, BottomNav, Sidebar };
export default PortalLayout;
