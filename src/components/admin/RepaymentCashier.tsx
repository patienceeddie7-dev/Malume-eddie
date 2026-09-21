import React, { useState } from 'react';
import { DollarSign, Printer, Search, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { printRepaymentReceipt } from '../../lib/pdfGenerator';
import { formatCurrency } from '../../lib/currency';

export const RepaymentCashier: React.FC = () => {
  const { loans, recordRepayment, companySettings, activeStaff, repayments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [transRef, setTransRef] = useState('');
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  const activeLoans = loans.filter((l) => l.status === 'Active' || l.status === 'Overdue');
  const selectedLoan = loans.find((l) => l.id === selectedLoanId);

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || amount <= 0) return;

    const rec = recordRepayment({
      loanId: selectedLoan.id,
      customerId: selectedLoan.customerId,
      customerName: selectedLoan.customerName,
      amount: Number(amount),
      paymentMethod: method,
      transactionRef: transRef || `${method.toUpperCase()}-CASHIER-${Date.now().toString().slice(-5)}`,
      recordedBy: `${activeStaff.name} (${activeStaff.role})`,
    });

    setLastReceipt(rec);
    setAmount(0);
    setTransRef('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-teal-600" /> Cashier Desk & Manual Repayment Counter
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Record over-the-counter repayments, issue official receipts, or calculate early settlement totals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Record Payment Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Record New Over-The-Counter Repayment</h3>

          <form onSubmit={handleRecord} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Active Loan Account</label>
              <select
                value={selectedLoanId}
                onChange={(e) => {
                  setSelectedLoanId(e.target.value);
                  const found = loans.find((l) => l.id === e.target.value);
                  if (found) setAmount(found.schedule.find((s) => s.status !== 'Paid')?.totalDue || found.balance);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800"
                required
              >
                <option value="">-- Choose Loan Account --</option>
                {activeLoans.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id} - {l.customerName} (Bal: {formatCurrency(l.balance, companySettings.currencySymbol)})
                  </option>
                ))}
              </select>
            </div>

            {selectedLoan && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-xs">
                <div><span className="text-slate-400 block">Borrower:</span> <span className="font-bold">{selectedLoan.customerName}</span></div>
                <div><span className="text-slate-400 block">Remaining Balance:</span> <span className="font-bold text-teal-700">{formatCurrency(selectedLoan.balance, companySettings.currencySymbol)}</span></div>
                <div><span className="text-slate-400 block">Next Due:</span> <span className="font-bold">{selectedLoan.nextPaymentDate}</span></div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Repayment Amount ({companySettings.currencySymbol || 'MWK'})</label>
                <input
                  type="number"
                  step="1"
                  required
                  min="1"
                  max={selectedLoan ? selectedLoan.balance : 50000000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Channel</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value="Cash">Cash (Over The Counter)</option>
                  <option value="M-Pesa">Mobile Money (Airtel / TNM)</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Transaction Ref / Slip Number (Optional)</label>
              <input
                type="text"
                value={transRef}
                onChange={(e) => setTransRef(e.target.value)}
                placeholder="e.g. SLIP-88201 or CASH-001"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedLoan || amount <= 0}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-xl shadow transition-all text-sm disabled:opacity-50"
            >
              Post Payment & Print Official Receipt
            </button>
          </form>

          {/* Last Receipt Notification */}
          {lastReceipt && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>
                  Recorded payment <strong>{formatCurrency(lastReceipt.amount, companySettings.currencySymbol)}</strong> for Loan #{lastReceipt.loanId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => printRepaymentReceipt(lastReceipt, selectedLoan || null, companySettings)}
                className="bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>
          )}
        </div>

        {/* Repayment History Log */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Recent Cashier Ledger</h3>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto text-xs">
            {repayments.slice(0, 8).map((r) => (
              <div key={r.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800">{r.customerName}</div>
                  <div className="text-[10px] text-slate-400">{r.loanId} • {r.paymentMethod}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-teal-700">{formatCurrency(r.amount, companySettings.currencySymbol)}</div>
                  <div className="text-[10px] text-slate-400">{r.date.split(' ')[0]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
