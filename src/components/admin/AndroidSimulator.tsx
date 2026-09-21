import React, { useState } from 'react';
import {
  Smartphone,
  LayoutDashboard,
  Users,
  FileCheck,
  DollarSign,
  Settings as SettingsIcon,
  Bell,
  Search,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { CustomerManagement } from './CustomerManagement';
import { LoanManagement } from './LoanManagement';
import { RepaymentCashier } from './RepaymentCashier';
import { AdminSettings } from './AdminSettings';

export const AndroidSimulator: React.FC = () => {
  const { companySettings, activeStaff, setActiveStaffRole } = useApp();
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'customers' | 'loans' | 'cashier' | 'settings'>('dashboard');

  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* Device Label */}
      <div className="mb-4 flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <Smartphone className="w-4 h-4 text-teal-400" /> CashFirst Staff Android Mobile App Shell (Flutter Simulation)
      </div>

      {/* Smartphone Frame Container */}
      <div className="w-full max-w-[420px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-700 relative overflow-hidden">
        {/* Camera Punchhole Notch */}
        <div className="w-24 h-4 bg-slate-950 rounded-b-xl mx-auto mb-2 flex items-center justify-center gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60"></div>
        </div>

        {/* Mobile Screen Area */}
        <div className="bg-slate-50 rounded-[28px] overflow-hidden flex flex-col h-[750px] text-slate-900 border border-slate-800 relative">
          {/* Mobile Top Bar */}
          <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-4 pt-3 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <img src={companySettings.logoUrl} alt="Logo" className="w-7 h-7 rounded-lg object-cover" />
              <div>
                <h4 className="font-bold text-xs tracking-tight">{companySettings.companyName} Admin</h4>
                <p className="text-[9px] text-teal-200">{activeStaff.role} • Mobile Edition</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-300" />
            </div>
          </div>

          {/* Scrollable Mobile Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentTab === 'dashboard' && <AdminDashboard />}
            {currentTab === 'customers' && <CustomerManagement />}
            {currentTab === 'loans' && <LoanManagement />}
            {currentTab === 'cashier' && <RepaymentCashier />}
            {currentTab === 'settings' && <AdminSettings />}
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <div className="bg-slate-900 text-slate-400 border-t border-slate-800 p-2 grid grid-cols-5 gap-1 text-[10px] font-semibold">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex flex-col items-center py-1 transition-colors ${
                currentTab === 'dashboard' ? 'text-teal-400' : 'hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mb-0.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setCurrentTab('customers')}
              className={`flex flex-col items-center py-1 transition-colors ${
                currentTab === 'customers' ? 'text-teal-400' : 'hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4 mb-0.5" />
              <span>Borrowers</span>
            </button>

            <button
              onClick={() => setCurrentTab('loans')}
              className={`flex flex-col items-center py-1 transition-colors ${
                currentTab === 'loans' ? 'text-teal-400' : 'hover:text-slate-200'
              }`}
            >
              <FileCheck className="w-4 h-4 mb-0.5" />
              <span>Loans</span>
            </button>

            <button
              onClick={() => setCurrentTab('cashier')}
              className={`flex flex-col items-center py-1 transition-colors ${
                currentTab === 'cashier' ? 'text-teal-400' : 'hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4 mb-0.5" />
              <span>Cashier</span>
            </button>

            <button
              onClick={() => setCurrentTab('settings')}
              className={`flex flex-col items-center py-1 transition-colors ${
                currentTab === 'settings' ? 'text-teal-400' : 'hover:text-slate-200'
              }`}
            >
              <SettingsIcon className="w-4 h-4 mb-0.5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
