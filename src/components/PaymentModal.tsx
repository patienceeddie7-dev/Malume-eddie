import React, { useState } from 'react';
import { X, Smartphone, CreditCard, Building2, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { Loan, PaymentMethod } from '../types';
import { useApp } from '../context/AppContext';
import { printRepaymentReceipt } from '../lib/pdfGenerator';
import { formatCurrency } from '../lib/currency';

interface PaymentModalProps {
  loan: Loan;
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ loan, isOpen, onClose, defaultAmount }) => {
  const { recordRepayment, companySettings } = useApp();
  const symbol = companySettings.currencySymbol || 'MWK';
  const [method, setMethod] = useState<PaymentMethod>('M-Pesa');
  const [amount, setAmount] = useState<number>(defaultAmount || Math.min(loan.balance, loan.schedule.find(s => s.status !== 'Paid')?.totalDue || loan.balance));
  const [phoneNumber, setPhoneNumber] = useState('+265 999 123 456');
  const [accountNumber, setAccountNumber] = useState('1009823411');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  if (!isOpen) return null;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setIsProcessing(true);

    // Simulate 1.5s secure payment provider authorization flow
    setTimeout(() => {
      const rec = recordRepayment({
        loanId: loan.id,
        customerId: loan.customerId,
        customerName: loan.customerName,
        amount: Number(amount),
        paymentMethod: method,
        transactionRef: `${method.toUpperCase().replace('-', '')}-${Date.now().toString().slice(-6)}`,
        phoneNumber: method === 'M-Pesa' ? phoneNumber : undefined,
        recordedBy: 'Payment Gateway',
      });

      setLastReceipt(rec);
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1500);
  };

  const handleDone = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-teal-300 text-xs font-medium uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Secure Payment Gateway
          </div>
          <h3 className="text-xl font-bold">Loan Repayment - {loan.id}</h3>
          <p className="text-xs text-slate-300 mt-1">Outstanding Balance: {formatCurrency(loan.balance, symbol)}</p>
        </div>

        {/* Content */}
        {!isSuccess ? (
          <form onSubmit={handlePayment} className="p-5 space-y-4">
            {/* Method Select */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('M-Pesa')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                    method === 'M-Pesa'
                      ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-600/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-teal-600" />
                  Airtel / TNM
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('Card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                    method === 'Card'
                      ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-600/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-sky-600" />
                  Credit/Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('Bank Transfer')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                    method === 'Bank Transfer'
                      ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-600/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Bank Transfer
                </button>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Repayment Amount ({symbol})</label>
              <input
                type="number"
                step="1"
                min="1"
                max={loan.balance}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full px-3 py-2.5 text-lg font-bold text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                <span>Min: {formatCurrency(100, symbol)}</span>
                <button
                  type="button"
                  onClick={() => setAmount(loan.balance)}
                  className="text-teal-700 font-semibold hover:underline"
                >
                  Pay Full Balance ({formatCurrency(loan.balance, symbol)})
                </button>
              </div>
            </div>

            {/* Fields based on method */}
            {method === 'M-Pesa' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Money Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                />
                <p className="text-[11px] text-slate-500 mt-1">An Airtel Money or TNM Mpamba prompt will be sent to your phone.</p>
              </div>
            )}

            {method === 'Card' && (
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {method === 'Bank Transfer' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-800">
              🔒 <strong>Security Note:</strong> {companySettings.companyName} never stores your payment PIN or banking passwords.
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authorizing Payment...
                </>
              ) : (
                `Confirm & Pay ${formatCurrency(Number(amount), symbol)}`
              )}
            </button>
          </form>
        ) : (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900">Payment Successful!</h4>
              <p className="text-xs text-slate-600 mt-1">
                Your payment of <strong>{formatCurrency(amount, symbol)}</strong> has been processed and credited to Loan #{loan.id}.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs text-left border border-slate-200 space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Receipt Ref:</span> <span className="font-semibold">{lastReceipt?.id}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Transaction ID:</span> <span className="font-semibold">{lastReceipt?.transactionRef}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">New Loan Balance:</span> <span className="font-semibold text-teal-700">{formatCurrency(Math.max(0, loan.balance - amount), symbol)}</span></div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => printRepaymentReceipt(lastReceipt, loan, companySettings)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 rounded-xl text-xs transition-all"
              >
                🖨️ Download Receipt
              </button>
              <button
                type="button"
                onClick={handleDone}
                className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-xl text-xs transition-all"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
