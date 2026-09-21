import React, { useState } from 'react';
import { User, ShieldCheck, Upload, CheckCircle, AlertCircle, Save, Phone, Mail, Building, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/currency';

export const CustomerProfile: React.FC = () => {
  const { activeCustomer, updateCustomerKYC, updateCustomerDetails, companySettings, navigatePath } = useApp();

  if (!activeCustomer) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Please Log In First</h2>
        <p className="text-xs text-slate-500">You must be logged in to view and update your customer profile.</p>
        <button
          onClick={() => navigatePath('/login')}
          className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const [fullName, setFullName] = useState(activeCustomer.fullName);
  const [email, setEmail] = useState(activeCustomer.email);
  const [phone, setPhone] = useState(activeCustomer.phone);
  const [nationalId, setNationalId] = useState(activeCustomer.nationalId || '');
  const [address, setAddress] = useState(activeCustomer.address || '');
  const [occupation, setOccupation] = useState(activeCustomer.occupation || '');
  const [income, setIncome] = useState(activeCustomer.monthlyIncome || 0);
  const [expenses, setExpenses] = useState(activeCustomer.monthlyExpenses || 0);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerDetails(activeCustomer.id, {
      fullName,
      email,
      phone,
      nationalId,
      address,
      occupation,
      monthlyIncome: income,
      monthlyExpenses: expenses,
    });
    setSavedMsg('Profile updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-black border-2 border-slate-700 overflow-hidden flex items-center justify-center font-black text-2xl text-white shadow-inner">
            {activeCustomer.avatarUrl && !activeCustomer.avatarUrl.includes('unsplash') ? (
              <img src={activeCustomer.avatarUrl} alt={activeCustomer.fullName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-9 h-9 text-white stroke-[2.5]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">{activeCustomer.fullName}</h1>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                  activeCustomer.kycStatus === 'Verified'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                KYC: {activeCustomer.kycStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">@{activeCustomer.username || activeCustomer.email}</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Account Status</div>
          <div className="text-xs font-bold text-emerald-400">{activeCustomer.accountStatus}</div>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{savedMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
        <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" /> Personal & Contact Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">National ID / Passport Number</label>
            <input
              type="text"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Occupation / Employer</label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Monthly Income ({companySettings.currencySymbol})</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Monthly Expenses ({companySettings.currencySymbol})</label>
            <input
              type="number"
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Profile Details
        </button>
      </form>
    </div>
  );
};
