import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Clock, Wallet, User, Car, DollarSign, List, Shield, Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeRole, user } = useAuthStore();

  const userTabs = [
    { label: 'Home', icon: Home, path: '/app' },
    { label: 'Rides', icon: Compass, path: '/app/select-ride' },
    { label: 'History', icon: Clock, path: '/app/history' },
    { label: 'Wallet', icon: Wallet, path: '/app/wallet' },
    { label: 'Profile', icon: User, path: '/app/profile' }
  ];

  const driverTabs = [
    { label: 'Home', icon: Home, path: '/driver' },
    { label: 'Requests', icon: Bell, path: '/driver/requests' },
    { label: 'Earnings', icon: DollarSign, path: '/driver/earnings' },
    { label: 'Trips', icon: List, path: '/driver/trips' },
    { label: 'Profile', icon: User, path: '/driver/profile' }
  ];

  const isDriverRoute = location.pathname.startsWith('/driver') || activeRole === 'driver';
  const tabs = isDriverRoute ? driverTabs : userTabs;

  // Don't show bottom nav on public / auth / onboarding / admin pages
  const hiddenPaths = ['/', '/login', '/signup', '/otp', '/about', '/help', '/terms', '/privacy', '/onboarding/passenger', '/onboarding/driver'];
  if (hiddenPaths.includes(location.pathname) || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg px-2 py-2 safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Top App Header Bar
 */
export function AppHeader() {
  const navigate = useNavigate();
  const { activeRole, setRole, user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 shadow-sm font-black text-lg">
            S
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-base tracking-tight block leading-none">
              Smart<span className="text-emerald-600">Ride</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Move Together. Pay Less.</span>
          </div>
        </div>

        {/* Role Switcher & Actions */}
        <div className="flex items-center gap-2">
          {/* Role selector — only shown to authenticated users */}
          {isAuthenticated && user && (
            <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-semibold">
              {/* Passenger tab — only show if user is passenger or admin */}
              {(user.role === 'passenger' || user.role === 'admin') && (
                <button
                  onClick={() => {
                    setRole('passenger');
                    navigate('/app');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeRole === 'passenger' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  User
                </button>
              )}
              {/* Driver tab — only show if user is driver or admin */}
              {(user.role === 'driver' || user.role === 'admin') && (
                <button
                  onClick={() => {
                    setRole('driver');
                    navigate('/driver');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeRole === 'driver' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Driver
                </button>
              )}
              {/* Admin tab — only show for admins */}
              {user.role === 'admin' && (
                <button
                  onClick={() => {
                    setRole('admin');
                    navigate('/admin');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeRole === 'admin' ? 'bg-slate-900 text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Admin
                </button>
              )}
            </div>
          )}

          {/* User Profile Avatar */}
          {isAuthenticated && user && (
            <div className="flex items-center gap-2">
              <div
                onClick={() => navigate(activeRole === 'driver' ? '/driver/profile' : '/app/profile')}
                className="relative cursor-pointer"
              >
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=10b981&color=fff`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
              </div>
              {/* Logout */}
              <button
                onClick={handleLogout}
                title="Logout"
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Login button if not authenticated */}
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
