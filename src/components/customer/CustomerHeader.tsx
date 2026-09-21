import React, { useState } from 'react';
import {
  Building2,
  Bell,
  LogIn,
  LogOut,
  UserPlus,
  User as UserIcon,
  FileText,
  Calculator,
  Home,
  ShieldCheck,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CustomerHeader: React.FC = () => {
  const {
    companySettings,
    currentUser,
    logout,
    navigatePath,
    currentPath,
    notifications,
    markNotificationRead
  } = useApp();

  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 text-slate-900 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => navigatePath('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {companySettings.logoUrl ? (
            <img
              src={companySettings.logoUrl}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/20 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-lg shadow-md shadow-blue-500/20">
              CF
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-slate-900 text-base sm:text-lg group-hover:text-blue-600 transition-colors">
                {companySettings.companyName}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wide hidden sm:block">
              {companySettings.tagline}
            </p>
          </div>
        </div>

        {/* Customer Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-600">
          <button
            onClick={() => navigatePath('/')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              currentPath === '/' || currentPath === '/customer'
                ? 'bg-blue-50 text-blue-600 font-extrabold'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" /> Home
          </button>

          <button
            onClick={() => navigatePath('/apply')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              currentPath === '/apply'
                ? 'bg-blue-50 text-blue-600 font-extrabold'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4 text-blue-600" /> Apply For Loan
          </button>

          <button
            onClick={() => navigatePath('/loans')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              currentPath === '/loans'
                ? 'bg-blue-50 text-blue-600 font-extrabold'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" /> My Loans
          </button>

          {currentUser && (
            <button
              onClick={() => navigatePath('/profile')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                currentPath === '/profile'
                  ? 'bg-blue-50 text-blue-600 font-extrabold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserIcon className="w-4 h-4" /> Profile
            </button>
          )}
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl transition-all relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer */}
            {showNotifDrawer && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center">
                  <span className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Company Messages
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{notifications.length} Alerts</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No notifications.</div>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3.5 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                          !n.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">{n.date}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Auth Info / Login Buttons */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 pl-2.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all"
              >
                {currentUser.avatarUrl && !currentUser.avatarUrl.includes('unsplash') ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-lg object-cover ring-2 ring-blue-500/20"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-black text-white font-black text-xs flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white stroke-[2.5]" />
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-extrabold text-slate-900 leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-blue-600 font-bold">Borrower Account</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">{currentUser.fullName}</div>
                    <div className="text-[10px] text-slate-500">{currentUser.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigatePath('/profile');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-blue-600" /> Profile & KYC
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigatePath('/loans');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" /> Loan History
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigatePath('/');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigatePath('/login')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>

              <button
                onClick={() => navigatePath('/register')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
