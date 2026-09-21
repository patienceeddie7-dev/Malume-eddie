import React, { useState } from 'react';
import {
  ShieldCheck,
  Monitor,
  Smartphone,
  ChevronDown,
  UserCheck,
  Bell,
  LogOut,
  Sparkles,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const AdminHeader: React.FC = () => {
  const {
    adminMode,
    setAdminMode,
    companySettings,
    activeStaff,
    setActiveStaffRole,
    notifications,
    markNotificationRead,
    resetSystemData,
    currentUser,
    logout,
    navigatePath
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-lg shadow-lg">
              CF
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                {companySettings.companyName}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                ADMIN SUITE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
              Restricted Management Dashboard
            </p>
          </div>
        </div>

        {/* Staff Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop vs Android Simulator View Toggle */}
          <div className="hidden sm:flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setAdminMode('desktop')}
              title="Staff Web Dashboard"
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                adminMode === 'desktop' ? 'bg-slate-700 text-blue-400 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="text-[11px] font-semibold">Web</span>
            </button>
            <button
              onClick={() => setAdminMode('android')}
              title="Android Admin App View"
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                adminMode === 'android' ? 'bg-slate-700 text-blue-400 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-[11px] font-semibold">Android Simulator</span>
            </button>
          </div>

          {/* Role Switcher */}
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
                  Switch Staff Role Scope
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

          {/* Notifications Drawer */}
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

            {showNotifDrawer && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3.5 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Admin System Alerts
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{notifications.length} Alerts</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No alerts.</div>
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
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reset System Data */}
          <button
            onClick={() => {
              if (confirm('Reset system data to initial state?')) resetSystemData();
            }}
            title="Reset System Data"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Back to Customer Website Button */}
          <button
            onClick={() => navigatePath('/')}
            title="View Public Customer Portal"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Customer Site</span>
          </button>

          {/* Logout Staff */}
          <button
            onClick={() => {
              logout();
              navigatePath('/admin/login');
            }}
            title="Log Out Staff"
            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
