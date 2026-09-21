import React, { useState } from 'react';
import { Settings, Building2, Sliders, ShieldCheck, FileText, CheckCircle2, Search, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InterestType, PenaltyType } from '../../types';

export const AdminSettings: React.FC = () => {
  const { companySettings, updateCompanySettings, auditLogs, activeStaff, resetSystemData } = useApp();
  const [activeTab, setActiveTab] = useState<'branding' | 'loan_rules' | 'penalties' | 'roles' | 'templates' | 'audit_logs'>('branding');

  // Local Branding Form State
  const [form, setForm] = useState(companySettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-teal-600" /> Admin System Settings & Company Branding
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure company identity, interest calculation rules, penalty rates, user roles, and audit compliance logs.
          </p>
        </div>

        {activeStaff.role === 'Super Admin' && (
          <button
            onClick={() => {
              if (confirm('Reset CASH FIRST GROUP system data to initial factory defaults?')) resetSystemData();
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Reset Factory Defaults
          </button>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl text-xs font-semibold overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'branding' ? 'bg-teal-700 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Company Branding
        </button>

        <button
          onClick={() => setActiveTab('loan_rules')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'loan_rules' ? 'bg-teal-700 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> Loan Limits & Rates
        </button>

        <button
          onClick={() => setActiveTab('penalties')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'penalties' ? 'bg-teal-700 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Penalty Engine Rules
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'templates' ? 'bg-teal-700 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Message Templates
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'audit_logs' ? 'bg-teal-700 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> System Audit Logs
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Company Brand Customization</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Logo URL</label>
              <input
                type="url"
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Color Code</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-10 h-9 rounded cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Support Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Headquarters Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Currency Code</label>
              <input
                type="text"
                required
                value={form.currencyCode || 'MWK'}
                onChange={(e) => setForm({ ...form, currencyCode: e.target.value })}
                placeholder="e.g. MWK"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold uppercase"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Currency Symbol</label>
              <input
                type="text"
                required
                value={form.currencySymbol || 'MWK'}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                placeholder="e.g. MWK or K"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
              />
            </div>
          </div>

          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Company branding successfully updated!
            </div>
          )}

          <button
            type="submit"
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl shadow transition-all"
          >
            Save Branding Changes
          </button>
        </form>
      )}

      {activeTab === 'loan_rules' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Loan Engine & Interest Calculation Rules</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Min Loan Limit ({form.currencySymbol || 'MWK'})</label>
              <input
                type="number"
                value={form.minLoanAmount}
                onChange={(e) => setForm({ ...form, minLoanAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Max Loan Limit ({form.currencySymbol || 'MWK'})</label>
              <input
                type="number"
                value={form.maxLoanAmount}
                onChange={(e) => setForm({ ...form, maxLoanAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.1"
                value={form.defaultInterestRate}
                onChange={(e) => setForm({ ...form, defaultInterestRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-teal-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default Interest Calculation Engine</label>
              <select
                value={form.defaultInterestType}
                onChange={(e) => setForm({ ...form, defaultInterestType: e.target.value as InterestType })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
              >
                <option value="Reducing Balance">Reducing Balance (Standard Amortization)</option>
                <option value="Flat">Flat Interest</option>
                <option value="Daily">Daily Interest Rate</option>
                <option value="Weekly">Weekly Interest Rate</option>
                <option value="Monthly">Monthly Simple Rate</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Business Hours</label>
              <input
                type="text"
                value={form.businessHours}
                onChange={(e) => setForm({ ...form, businessHours: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl shadow transition-all"
          >
            Save Loan Engine Parameters
          </button>
        </form>
      )}

      {activeTab === 'penalties' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Automated Penalty Engine Rules</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Penalty Fee Model</label>
              <select
                value={form.defaultPenaltyType}
                onChange={(e) => setForm({ ...form, defaultPenaltyType: e.target.value as PenaltyType })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
              >
                <option value="Fixed">Fixed Fee ({form.currencySymbol || 'MWK'})</option>
                <option value="Percentage">Percentage of Principal (%)</option>
                <option value="Daily">Daily Penalty ({form.currencySymbol || 'MWK'}/day)</option>
                <option value="Weekly">Weekly Penalty ({form.currencySymbol || 'MWK'}/week)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Penalty Charge Value</label>
              <input
                type="number"
                step="0.01"
                value={form.defaultPenaltyValue}
                onChange={(e) => setForm({ ...form, defaultPenaltyValue: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-rose-700"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Grace Period (Days)</label>
              <input
                type="number"
                value={form.gracePeriodDays}
                onChange={(e) => setForm({ ...form, gracePeriodDays: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl shadow transition-all"
          >
            Save Penalty Engine Config
          </button>
        </form>
      )}

      {activeTab === 'templates' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">SMS & Messaging Templates Editor</h3>

          <div className="space-y-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Loan Approval SMS Template</label>
              <input
                type="text"
                value={form.messagingTemplates.loanApproved}
                onChange={(e) =>
                  setForm({
                    ...form,
                    messagingTemplates: { ...form.messagingTemplates, loanApproved: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Repayment Due SMS Template</label>
              <input
                type="text"
                value={form.messagingTemplates.repaymentDue}
                onChange={(e) =>
                  setForm({
                    ...form,
                    messagingTemplates: { ...form.messagingTemplates, repaymentDue: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Loan Overdue Alert Template</label>
              <input
                type="text"
                value={form.messagingTemplates.loanOverdue}
                onChange={(e) =>
                  setForm({
                    ...form,
                    messagingTemplates: { ...form.messagingTemplates, loanOverdue: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl shadow transition-all"
          >
            Save Message Templates
          </button>
        </form>
      )}

      {activeTab === 'audit_logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">System Compliance & Security Audit Trail</h3>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">Staff Actor</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Action Code</th>
                  <th className="p-2.5">Target</th>
                  <th className="p-2.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-2.5 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-2.5 font-bold text-slate-800">{log.actorName}</td>
                    <td className="p-2.5 text-teal-700 font-semibold">{log.actorRole}</td>
                    <td className="p-2.5 text-indigo-700 font-semibold">{log.action}</td>
                    <td className="p-2.5 text-slate-700">{log.target}</td>
                    <td className="p-2.5 text-slate-600 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
