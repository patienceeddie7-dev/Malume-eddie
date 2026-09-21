import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CustomerHeader } from './components/customer/CustomerHeader';
import { CustomerLanding } from './components/customer/CustomerLanding';
import { CustomerLogin } from './components/customer/CustomerLogin';
import { CustomerRegister } from './components/customer/CustomerRegister';
import { CustomerForgotPassword } from './components/customer/CustomerForgotPassword';
import { CustomerProfile } from './components/customer/CustomerProfile';
import { CustomerPortal } from './components/customer/CustomerPortal';

import { AdminHeader } from './components/admin/AdminHeader';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CustomerManagement } from './components/admin/CustomerManagement';
import { LoanManagement } from './components/admin/LoanManagement';
import { RepaymentCashier } from './components/admin/RepaymentCashier';
import { ReportsAnalytics } from './components/admin/ReportsAnalytics';
import { MessagingNotifications } from './components/admin/MessagingNotifications';
import { AdminSettings } from './components/admin/AdminSettings';
import { AndroidSimulator } from './components/admin/AndroidSimulator';

import {
  LayoutDashboard,
  Users,
  FileCheck,
  DollarSign,
  BarChart2,
  MessageSquare,
  Settings,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentPath, navigatePath, adminMode, activeStaff, companySettings, currentUser } = useApp();
  const [adminTab, setAdminTab] = useState<'dashboard' | 'customers' | 'loans' | 'cashier' | 'reports' | 'messaging' | 'settings'>('dashboard');

  const isAdminRoute = currentPath.startsWith('/admin');
  const isStaffAuthenticated = currentUser?.userType === 'staff';
  const isCustomerAttemptingAdmin = currentUser?.userType === 'customer' && isAdminRoute;

  // 1. ADMIN PORTAL ROUTE
  if (isAdminRoute) {
    if (!isStaffAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
          {/* Access Denied Warning Banner for Customers */}
          {isCustomerAttemptingAdmin && (
            <div className="bg-rose-950 border-b border-rose-800 text-rose-200 py-3 px-4 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Access Denied: Customer accounts are restricted from accessing the Admin Suite.</span>
              <button
                onClick={() => navigatePath('/')}
                className="underline font-bold text-white hover:text-rose-100 flex items-center gap-1 ml-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Go To Customer Portal
              </button>
            </div>
          )}

          <AdminLogin
            onSuccessNavigate={() => navigatePath('/admin/dashboard')}
            onGoToCustomerSite={() => navigatePath('/')}
          />
        </div>
      );
    }

    // Authenticated Staff View
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
        <AdminHeader />

        <main className="flex-1">
          {adminMode === 'android' ? (
            <div className="py-6">
              <AndroidSimulator />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Admin Navigation Sidebar */}
                <aside className="w-full md:w-64 bg-white rounded-2xl border border-slate-200/90 p-3 shadow-sm h-fit space-y-1">
                  <div className="px-3 py-2 text-[10px] uppercase font-black text-slate-400 border-b border-slate-100 mb-2 tracking-widest flex items-center justify-between">
                    <span>Staff Controls</span>
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">{activeStaff.role}</span>
                  </div>

                  <button
                    onClick={() => setAdminTab('dashboard')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                      adminTab === 'dashboard'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard Overview
                  </button>

                  <button
                    onClick={() => setAdminTab('customers')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                      adminTab === 'customers'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-4 h-4" /> Customer Directory
                  </button>

                  <button
                    onClick={() => setAdminTab('loans')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                      adminTab === 'loans'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <FileCheck className="w-4 h-4" /> Review Loan Applications
                  </button>

                  <button
                    onClick={() => setAdminTab('cashier')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                      adminTab === 'cashier'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" /> Cashier & Repayments
                  </button>

                  <button
                    onClick={() => setAdminTab('reports')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                      adminTab === 'reports'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <BarChart2 className="w-4 h-4" /> Reports & Analytics
                  </button>

                  <button
                    onClick={() => setAdminTab('messaging')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                      adminTab === 'messaging'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" /> Messaging & Alerts
                  </button>

                  <button
                    onClick={() => setAdminTab('settings')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                      adminTab === 'settings'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Settings className="w-4 h-4" /> System Settings
                  </button>
                </aside>

                {/* Admin View Body */}
                <div className="flex-1">
                  {adminTab === 'dashboard' && <AdminDashboard />}
                  {adminTab === 'customers' && <CustomerManagement />}
                  {adminTab === 'loans' && <LoanManagement />}
                  {adminTab === 'cashier' && <RepaymentCashier />}
                  {adminTab === 'reports' && <ReportsAnalytics />}
                  {adminTab === 'messaging' && <MessagingNotifications />}
                  {adminTab === 'settings' && <AdminSettings />}
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-4 px-6 text-center mt-auto">
          <p>© {new Date().getFullYear()} {companySettings.companyName} Admin Suite. Internal Confidential Operations.</p>
        </footer>
      </div>
    );
  }

  // 2. CUSTOMER PORTAL ROUTE (Public Website)
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <CustomerHeader />

      <main className="flex-1">
        {currentPath === '/login' && <CustomerLogin />}
        {currentPath === '/register' && <CustomerRegister />}
        {currentPath === '/forgot-password' && <CustomerForgotPassword />}
        {currentPath === '/profile' && <CustomerProfile />}
        {(currentPath === '/apply' || currentPath === '/loans') && <CustomerPortal />}
        {(currentPath === '/' || currentPath === '/customer') && <CustomerLanding />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
