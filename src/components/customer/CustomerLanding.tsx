import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  Building2,
  Phone,
  Mail,
  MapPin,
  Users,
  FileText,
  DollarSign,
  ChevronRight,
  Star,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateLoan } from '../../lib/loanEngine';
import { formatCurrency } from '../../lib/currency';

export const CustomerLanding: React.FC = () => {
  const { companySettings, navigatePath, currentUser } = useApp();

  // Calculator Widget State
  const [calcAmount, setCalcAmount] = useState<number>(300000);
  const [calcPeriod, setCalcPeriod] = useState<number>(6);
  const [calcUnit, setCalcUnit] = useState<'Months' | 'Weeks' | 'Days'>('Months');

  const previewLoan = calculateLoan(
    calcAmount,
    calcPeriod,
    calcUnit,
    companySettings.defaultInterestRate,
    companySettings.defaultInterestType
  );

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 lg:py-24">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold tracking-wide uppercase shadow-inner">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>CASH FIRST GROUP HOLDINGS & LOANS</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
                Instant Loans.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
                  Zero Complications.
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-medium leading-relaxed mx-auto lg:mx-0">
                {companySettings.tagline || 'Empowering individuals and businesses with fast, transparent micro-loans.'} Apply online in 3 minutes, receive instant approval, and get disbursed directly to Mobile Money or Bank Account.
              </p>

              {/* Trust Stats Bar */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-800 text-center lg:text-left max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-blue-400">24 Hours</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Fast Disbursement</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">{companySettings.defaultInterestRate}% p.a.</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Competitive Rates</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400">100% Digital</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">E-Signature Ready</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <button
                  type="button"
                  onClick={() => navigatePath(currentUser ? '/apply' : '/register')}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-extrabold shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Apply For Instant Loan</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {!currentUser && (
                  <button
                    type="button"
                    onClick={() => navigatePath('/login')}
                    className="px-6 py-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span>Existing Borrower Login</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Calculator Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 backdrop-blur-md space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      Loan Estimator
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">Calculate Your Loan</h3>
                  </div>
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>

                {/* Amount Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600">Borrow Amount</span>
                    <span className="text-lg font-black text-blue-600">
                      {formatCurrency(calcAmount, companySettings.currencySymbol)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={companySettings.minLoanAmount || 50000}
                    max={companySettings.maxLoanAmount || 5000000}
                    step={25000}
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Min: {formatCurrency(companySettings.minLoanAmount || 50000, companySettings.currencySymbol)}</span>
                    <span>Max: {formatCurrency(companySettings.maxLoanAmount || 5000000, companySettings.currencySymbol)}</span>
                  </div>
                </div>

                {/* Tenure Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tenure Value</label>
                    <input
                      type="number"
                      min={1}
                      max={36}
                      value={calcPeriod}
                      onChange={(e) => setCalcPeriod(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Period Unit</label>
                    <select
                      value={calcUnit}
                      onChange={(e) => setCalcUnit(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Months">Months</option>
                      <option value="Weeks">Weeks</option>
                      <option value="Days">Days</option>
                    </select>
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Interest Engine:</span>
                    <span className="font-semibold text-slate-800">{companySettings.defaultInterestType}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Interest ({companySettings.defaultInterestRate}%):</span>
                    <span className="font-bold text-blue-600">{formatCurrency(previewLoan.totalInterest, companySettings.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Payable Amount:</span>
                    <span className="font-black text-slate-900">{formatCurrency(previewLoan.totalPayable, companySettings.currencySymbol)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-emerald-800 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
                    <span>Monthly Installment:</span>
                    <span>{formatCurrency(previewLoan.monthlyInstallment, companySettings.currencySymbol)} / mo</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigatePath(currentUser ? '/apply' : '/register')}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-600/30 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>Proceed With Loan Application</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              Seamless Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">How to Get Your Loan in 3 Simple Steps</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">No paperwork hassles or queue lines. Everything is processed digitally from your smartphone or computer.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 hover:shadow-lg transition-all relative group">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md shadow-blue-600/30">
                1
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Create Account & KYC</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Register with your basic identity details, phone number, and national ID. Upload a face photo for instant verification.
              </p>
              <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
                <span>Takes ~2 minutes</span> <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 hover:shadow-lg transition-all relative group">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md shadow-teal-600/30">
                2
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Apply & E-Sign</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Select your loan amount, upload collateral details, and draw your electronic signature on the legal loan agreement.
              </p>
              <div className="text-xs font-bold text-teal-600 flex items-center gap-1">
                <span>Instant summary</span> <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 hover:shadow-lg transition-all relative group">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/30">
                3
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Approval & Funds Received</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Our credit underwriting team reviews your submission. Upon approval, capital is disbursed directly to your account.
              </p>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span>Fast payout</span> <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-slate-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
              Trust & Security
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">Why Borrowers Trust {companySettings.companyName}</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">Built with financial security, clear pricing, and human customer support at heart.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Role-Based Data Security</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Your financial information is encrypted and isolated from unauthorized access.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                <DollarSign className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">No Hidden Fees</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">What you see in the calculator is exactly what you pay. Transparent interest breakdown.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Flexible Repayments</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Repay in daily, weekly, or monthly installments tailored to your income schedule.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Credit Score Growth</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">On-time repayments raise your credit limit and qualify you for lower interest tiers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1 */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                {companySettings.logoUrl ? (
                  <img src={companySettings.logoUrl} alt="Logo" className="w-9 h-9 rounded-xl object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-base">CF</div>
                )}
                <span className="font-black text-white text-base tracking-tight">{companySettings.companyName}</span>
              </div>
              <p className="text-slate-400 max-w-md font-medium leading-relaxed">
                {companySettings.tagline || 'Licensed financial services provider offering fast micro-loans, capital growth, and transparent credit.'}
              </p>
              <div className="pt-2 text-slate-500 font-semibold">
                Business Hours: {companySettings.businessHours}
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Quick Links</h5>
              <ul className="space-y-2 font-medium">
                <li><button onClick={() => navigatePath('/')} className="hover:text-white transition-colors">Home Landing</button></li>
                <li><button onClick={() => navigatePath('/apply')} className="hover:text-white transition-colors">Apply for Loan</button></li>
                <li><button onClick={() => navigatePath('/loans')} className="hover:text-white transition-colors">My Loans & Status</button></li>
                <li><button onClick={() => navigatePath('/register')} className="hover:text-white transition-colors">Create Borrower Account</button></li>
                <li><button onClick={() => navigatePath('/login')} className="hover:text-white transition-colors">Customer Login</button></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Contact Information</h5>
              <ul className="space-y-2 font-medium">
                <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-blue-400" /> {companySettings.phone}</li>
                <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-blue-400" /> {companySettings.email}</li>
                <li className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-blue-400 mt-0.5" /> {companySettings.address}</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 font-medium">
            <div>© {new Date().getFullYear()} {companySettings.companyName}. All rights reserved.</div>
            <div>
              {/* Discrete Staff Access Link */}
              <button
                type="button"
                onClick={() => navigatePath('/admin/login')}
                className="text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1 text-[11px] font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Staff & Admin Portal Access
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
