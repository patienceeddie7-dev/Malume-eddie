import React from 'react';
import { ShieldCheck, Phone, MapPin, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CashFirstFlyerCard: React.FC<{ compact?: boolean; onApplyClick?: () => void }> = ({
  compact = false,
  onApplyClick
}) => {
  const { companySettings } = useApp();

  return (
    <div className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 rounded-3xl border-2 border-blue-500/30 text-white shadow-2xl overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="p-6 sm:p-8 space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <img src={companySettings.logoUrl} alt="Cash First Group" className="w-14 h-14 rounded-2xl bg-white p-1 shadow-lg ring-2 ring-emerald-500/40 object-contain" />
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">{companySettings.companyName}</h3>
              <p className="text-xs text-emerald-400 font-semibold tracking-wide mt-0.5">
                Fast, Secure & Confidential Application
              </p>
            </div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-emerald-400" /> Available 24/7
          </span>
        </div>

        {/* Main Interest Rates Card Box */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <span className="bg-blue-600 text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow">
              Official Interest Rates
            </span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Collateral Based Loan
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all">
              <span className="font-extrabold text-sm text-slate-200">1 Week</span>
              <span className="text-xs font-mono text-slate-500 tracking-widest hidden sm:inline">....................</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-sm px-3.5 py-1 rounded-lg">15%</span>
            </div>

            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all">
              <span className="font-extrabold text-sm text-slate-200">2 Weeks</span>
              <span className="text-xs font-mono text-slate-500 tracking-widest hidden sm:inline">....................</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-sm px-3.5 py-1 rounded-lg">25%</span>
            </div>

            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all">
              <span className="font-extrabold text-sm text-slate-200">3 Weeks</span>
              <span className="text-xs font-mono text-slate-500 tracking-widest hidden sm:inline">....................</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-sm px-3.5 py-1 rounded-lg">30%</span>
            </div>

            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all">
              <span className="font-extrabold text-sm text-slate-200">4 Weeks</span>
              <span className="text-xs font-mono text-slate-500 tracking-widest hidden sm:inline">....................</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-sm px-3.5 py-1 rounded-lg">40%</span>
            </div>
          </div>
        </div>

        {/* Loan Range & Collateral Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-950/80 border border-blue-800/60 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">Collateral Loan</span>
              <span className="font-black text-white text-sm">Amount Range</span>
            </div>
            <div className="text-right">
              <span className="font-black text-emerald-300 text-sm sm:text-base">MK20,000 - MK2,000,000</span>
            </div>
          </div>

          <div className="bg-emerald-950/80 border border-emerald-800/60 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="font-black text-white text-sm">Mzuzu & Lilongwe</span>
                <span className="text-[10px] text-emerald-300 block font-semibold">Branch Offices</span>
              </div>
            </div>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black border border-amber-300 px-2.5 py-1 rounded-full uppercase tracking-tight">
              Collateral is a MUST
            </span>
          </div>
        </div>

        {/* Contact Footer */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-700/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Contact Us Direct:</span>
              <span className="font-black text-white text-xs sm:text-sm">{companySettings.phone}</span>
            </div>
          </div>

          {onApplyClick && (
            <button
              onClick={onApplyClick}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-emerald-500/20"
            >
              Apply Online Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
