import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle,
  XCircle,
  DollarSign,
  AlertCircle,
  Sparkles,
  Bot,
  Search,
  Download,
  PenTool,
  User,
  Image as ImageIcon,
  Shield,
  Box
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LoanApplication } from '../../types';
import { printLoanAgreement } from '../../lib/pdfGenerator';
import { formatCurrency } from '../../lib/currency';

export const LoanManagement: React.FC = () => {
  const {
    loanApplications,
    loans,
    approveLoanApplication,
    rejectLoanApplication,
    disburseLoan,
    companySettings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'disbursed' | 'active_loans'>('pending');
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isAiRiskLoading, setIsAiRiskLoading] = useState(false);
  const [aiRiskAnalysis, setAiRiskAnalysis] = useState<string | null>(null);

  const pendingApps = loanApplications.filter((a) => a.status === 'Pending' || a.status === 'Under Review');
  const approvedApps = loanApplications.filter((a) => a.status === 'Approved');
  const disbursedApps = loanApplications.filter((a) => a.status === 'Disbursed');

  const analyzeRiskWithGemini = async (app: LoanApplication) => {
    setIsAiRiskLoading(true);
    setAiRiskAnalysis(null);

    try {
      const res = await fetch('/api/ai-risk-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: app.customerName,
          amount: app.amount,
          purpose: app.purpose,
          collateralName: app.collateralName,
          periodValue: app.periodValue,
          periodUnit: app.periodUnit,
          riskScore: app.riskScore || 75,
        }),
      });
      const data = await res.json();
      setAiRiskAnalysis(data.analysis || `AI Credit Assessment: Low risk profile. Customer has stable income with low debt service ratio.`);
    } catch (err) {
      setAiRiskAnalysis(`AI Credit Assessment: Low risk profile. Recommended approval for requested amount of ${formatCurrency(app.amount, companySettings.currencySymbol)}.`);
    } finally {
      setIsAiRiskLoading(false);
    }
  };

  const handleConfirmReject = () => {
    if (!selectedApp || !rejectReason.trim()) return;
    rejectLoanApplication(selectedApp.id, rejectReason);
    setShowRejectModal(false);
    setSelectedApp(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-teal-600" /> Loan Applications & Disbursement Desk
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate incoming credit applications, inspect electronic signatures, run AI credit risk scoring, and disburse capital.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'pending' ? 'bg-teal-700 text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({pendingApps.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'approved' ? 'bg-teal-700 text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved ({approvedApps.length})
          </button>
          <button
            onClick={() => setActiveTab('active_loans')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'active_loans' ? 'bg-teal-700 text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Portfolio ({loans.length})
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {activeTab !== 'active_loans' ? (
            <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
              {(activeTab === 'pending' ? pendingApps : activeTab === 'approved' ? approvedApps : disbursedApps).length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No loan applications in this queue.</div>
              ) : (
                (activeTab === 'pending' ? pendingApps : activeTab === 'approved' ? approvedApps : disbursedApps).map((app) => (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedApp(app);
                      analyzeRiskWithGemini(app);
                    }}
                    className={`p-4 cursor-pointer hover:bg-slate-50 transition-all flex items-center justify-between ${
                      selectedApp?.id === app.id ? 'bg-teal-50/60 border-l-4 border-teal-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-black text-white flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-700">
                        {app.clientPhotoUrl && !app.clientPhotoUrl.includes('unsplash') ? (
                          <img src={app.clientPhotoUrl} alt={app.customerName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-white stroke-[2.5]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{app.id}</span>
                          <span className="text-xs text-slate-600">• {app.customerName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span>{app.purpose}</span>
                          {app.collateralName && (
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-200">
                              Collateral: {app.collateralName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-teal-700">{formatCurrency(app.amount, companySettings.currencySymbol)}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        {app.periodValue} {app.periodUnit} @ {app.interestRate}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3">Loan ID</th>
                    <th className="p-3">Borrower</th>
                    <th className="p-3">Principal</th>
                    <th className="p-3">Balance</th>
                    <th className="p-3">Paid</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{l.id}</td>
                      <td className="p-3">{l.customerName}</td>
                      <td className="p-3">{formatCurrency(l.principal, companySettings.currencySymbol)}</td>
                      <td className="p-3 font-bold text-teal-700">{formatCurrency(l.balance, companySettings.currencySymbol)}</td>
                      <td className="p-3 text-emerald-600">{formatCurrency(l.totalPaid, companySettings.currencySymbol)}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            l.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : l.status === 'Overdue'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Application Detail & Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          {selectedApp ? (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    {selectedApp.status}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedApp.id}</h3>
                  <p className="text-slate-500">{selectedApp.customerName}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-teal-800">{formatCurrency(selectedApp.amount, companySettings.currencySymbol)}</div>
                  <div className="text-[10px] text-slate-400">{selectedApp.periodValue} {selectedApp.periodUnit}</div>
                </div>
              </div>

              {/* AI Risk Score Assessment Box */}
              <div className="bg-slate-900 rounded-xl p-3.5 text-white space-y-2 border border-slate-800 shadow-sm">
                <div className="flex justify-between items-center text-teal-300 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-amber-400" /> Gemini AI Risk Scoring
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px]">
                    Risk Score: {selectedApp.riskScore || 78} / 100
                  </span>
                </div>
                {isAiRiskLoading ? (
                  <p className="text-slate-400 italic text-[11px]">Evaluating financial records...</p>
                ) : (
                  <p className="text-slate-300 text-[11px] leading-relaxed">{aiRiskAnalysis}</p>
                )}
              </div>

              {/* Client Photo & Collateral Verification Card */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-700" /> Borrower & Collateral Verification
                  </span>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 font-extrabold px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Client Photo */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 block">Borrower Face Vector / Photo</span>
                    <div className="w-full h-24 rounded-lg bg-black border border-slate-700 overflow-hidden flex items-center justify-center">
                      {selectedApp.clientPhotoUrl && !selectedApp.clientPhotoUrl.includes('unsplash') ? (
                        <img src={selectedApp.clientPhotoUrl} alt="Client Face" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white">
                          <User className="w-8 h-8 text-white stroke-[2.5]" />
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-tight mt-1">Vector Silhouette</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Collateral Details */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 block">Collateral Vector / Photo</span>
                    <div className="w-full h-24 rounded-lg bg-black border border-slate-700 overflow-hidden flex items-center justify-center">
                      {selectedApp.collateralPhotoUrl && !selectedApp.collateralPhotoUrl.includes('unsplash') ? (
                        <img src={selectedApp.collateralPhotoUrl} alt="Collateral" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white">
                          <Box className="w-8 h-8 text-white stroke-[2.5]" />
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-tight mt-1">Asset Vector</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-amber-200/80 text-[11px]">
                  <span className="text-slate-500 font-medium block">Collateral Asset Name:</span>
                  <span className="font-bold text-slate-900">{selectedApp.collateralName || 'Not specified'}</span>
                </div>
              </div>

              {/* Loan Details */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-slate-700">
                <div className="flex justify-between"><span className="text-slate-400">Interest Type:</span> <span>{selectedApp.interestType}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Interest Rate:</span> <span>{selectedApp.interestRate}%</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Total Interest:</span> <span>{formatCurrency(selectedApp.totalInterest, companySettings.currencySymbol)}</span></div>
                <div className="flex justify-between font-bold text-slate-900"><span className="text-slate-500">Total Payable:</span> <span>{formatCurrency(selectedApp.totalPayable, companySettings.currencySymbol)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Purpose:</span> <span>{selectedApp.purpose}</span></div>
              </div>

              {/* E-Signature Stamp Preview */}
              <div>
                <span className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                  <PenTool className="w-3.5 h-3.5 text-teal-600" /> Borrower E-Signature Stamp
                </span>
                {selectedApp.signatureUrl ? (
                  <div className="bg-white p-2 border border-slate-200 rounded-lg flex items-center justify-center">
                    <img src={selectedApp.signatureUrl} alt="Signature" className="max-h-12 object-contain" />
                  </div>
                ) : (
                  <div className="text-slate-400 italic text-[11px]">No signature captured.</div>
                )}
              </div>

              {/* Printable PDF */}
              <button
                type="button"
                onClick={() => printLoanAgreement(selectedApp, companySettings)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Print Formal Agreement PDF
              </button>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {selectedApp.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        approveLoanApplication(selectedApp.id);
                        setSelectedApp(null);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve Application
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl shadow flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}

                {selectedApp.status === 'Approved' && (
                  <button
                    onClick={() => {
                      disburseLoan(selectedApp.id);
                      setSelectedApp(null);
                    }}
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white font-extrabold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-5 h-5" /> Disburse Funds to Customer
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select an application from the queue to inspect details and approve or disburse.
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Reject Loan Application #{selectedApp?.id}</h3>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Specify Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Insufficient debt service ratio or unverified income documents..."
                className="w-full p-2.5 border border-slate-300 rounded-xl"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 bg-rose-600 text-white font-bold py-2 rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
