import React, { useState } from 'react';
import {
  Building2,
  Smartphone,
  Monitor,
  UserCheck,
  Bell,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Users,
  LogIn,
  LogOut,
  UserPlus,
  User as UserIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { AuthModal } from './auth/AuthModal';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    adminMode,
    setAdminMode,
    companySettings,
    activeCustomer,
    setActiveCustomer,
    customers,
    activeStaff,
    setActiveStaffRole,
    notifications,
    markNotificationRead,
    resetSystemData,
    currentUser,
    logout,
    openAuthModal,
    showAuthModal,
    setShowAuthModal,
    authModalTab,
    authModalType
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showCustDropdown, setShowCustDropdown] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {companySettings.logoUrl ? (
            <img
              src={companySettings.logoUrl}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/30 shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
              CF
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                {companySettings.companyName}
              </span>
              <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                Institutional v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">{companySettings.tagline}</p>
          </div>
        </div>

        {/* System View Switcher */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
          <button
            onClick={() => setViewMode('customer')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 ${
              viewMode === 'customer'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Customer Portal</span>
          </button>
          <button
            onClick={() => setViewMode('admin')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 ${
              viewMode === 'admin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Suite</span>
          </button>
        </div>

        {/* Contextual Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* If in Admin view, toggle Desktop vs Android Simulator */}
          {viewMode === 'admin' ? (
            <div className="hidden sm:flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setAdminMode('desktop')}
                title="Staff Web Dashboard"
                className={`p-1.5 rounded-md transition-colors ${
                  adminMode === 'desktop' ? 'bg-slate-700 text-blue-400 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAdminMode('android')}
                title="Android Admin App View"
                className={`p-1.5 rounded-md transition-colors ${
                  adminMode === 'android' ? 'bg-slate-700 text-blue-400 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          {/* Role / Customer Switcher Dropdowns */}
          {viewMode === 'admin' ? (
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="hidden md:inline text-slate-400 uppercase text-[10px] font-bold">Role:</span>
                <span className="text-blue-300 font-bold">{activeStaff.role}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-700 uppercase tracking-wider">
                    Switch Staff Role
                  </div>
                  {(['Super Admin', 'Manager', 'Loan Officer', 'Cashier', 'Auditor'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setActiveStaffRole(r);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/80 ${
                        activeStaff.role === r ? 'text-blue-300 font-bold bg-slate-700/60' : 'text-slate-300'
                      }`}
                    >
                      <span>{r}</span>
                      {activeStaff.role === r && <UserCheck className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowCustDropdown(!showCustDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all shadow-sm"
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline text-slate-400 uppercase text-[10px] font-bold">User:</span>
                <span className="font-bold text-blue-300 truncate max-w-[100px] sm:max-w-[130px]">
                  {activeCustomer ? activeCustomer.fullName : 'Guest'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showCustDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-700 uppercase tracking-wider">
                    Switch Test Customer
                  </div>
                  {customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveCustomer(c);
                        setShowCustDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700/80 ${
                        activeCustomer?.id === c.id ? 'text-blue-300 font-bold bg-slate-700/60' : 'text-slate-300'
                      }`}
                    >
                      <div className="font-semibold">{c.fullName}</div>
                      <div className="text-[10px] text-slate-400">{c.occupation}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notifications Drawer Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all relative shadow-sm"
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
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3.5 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Notifications & Alerts
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{notifications.length} Messages</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No notifications.</div>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3.5 text-xs cursor-pointer hover:bg-slate-700/50 transition-colors ${
                          !n.read ? 'bg-slate-700/40' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-blue-300">{n.title}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">{n.date}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[9px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600 font-bold uppercase">
                            {n.channel}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Auth Profile / Login Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 p-1 pl-2.5 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                {currentUser.avatarUrl && !currentUser.avatarUrl.includes('unsplash') ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-blue-500/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center ring-1 ring-slate-700">
                    <UserIcon className="w-4 h-4 text-white stroke-[2.5]" />
                  </div>
                )}
                <div className="hidden lg:block text-left pr-1">
                  <div className="text-[11px] font-extrabold text-slate-100 leading-tight truncate max-w-[110px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                    <span>@{currentUser.username}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300">{currentUser.role || currentUser.userType}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openAuthModal('login', currentUser.userType)}
                title="Switch Account or Login"
                className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Switch</span>
              </button>

              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('login', viewMode === 'admin' ? 'staff' : 'customer')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>

              <button
                onClick={() => openAuthModal('signup', viewMode === 'admin' ? 'staff' : 'customer')}
                className="hidden sm:flex px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Reset System Data */}
          <button
            onClick={() => {
              if (confirm('Reset CASH FIRST GROUP system data to defaults?')) resetSystemData();
            }}
            title="Reset System Data"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
        defaultType={authModalType}
      />
    </header>
  );
};
