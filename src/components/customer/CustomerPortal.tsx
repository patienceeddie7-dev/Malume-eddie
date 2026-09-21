import React, { useState } from 'react';
import {
  Calculator,
  FileText,
  DollarSign,
  ShieldCheck,
  Send,
  Download,
  AlertCircle,
  Sparkles,
  Bot,
  User,
  Upload,
  Calendar,
  CheckCircle,
  ArrowRight,
  Clock,
  HelpCircle,
  Building,
  MapPin,
  Phone,
  Tag,
  Box,
  Car,
  Home,
  Laptop
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SignatureCanvas } from '../SignatureCanvas';
import { PaymentModal } from '../PaymentModal';
import { printLoanAgreement, printRepaymentReceipt } from '../../lib/pdfGenerator';
import { calculateEligibility, calculateLoan } from '../../lib/loanEngine';
import { InterestType } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { CashFirstFlyerCard } from '../common/CashFirstFlyerCard';
import {
  BLACK_VECTOR_BORROWER,
  BLACK_VECTOR_ID_CARD,
  BLACK_VECTOR_VEHICLE,
  BLACK_VECTOR_LAND,
  BLACK_VECTOR_ELECTRONICS,
  BLACK_VECTOR_INCOME,
  BLACK_VECTOR_COLLATERAL
} from '../../lib/vectorIcons';

export const CustomerPortal: React.FC = () => {
  const {
    activeCustomer,
    registerCustomer,
    updateCustomerKYC,
    companySettings,
    submitLoanApplication,
    loanApplications,
    loans,
    repayments,
    currentPath,
    navigatePath
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'apply' | 'my_loans' | 'kyc' | 'support' | 'profile'>('overview');

  React.useEffect(() => {
    if (currentPath === '/apply') {
      setActiveTab('apply');
    } else if (currentPath === '/loans') {
      setActiveTab('my_loans');
    } else if (currentPath === '/profile') {
      setActiveTab('profile');
    }
  }, [currentPath]);

  // Customer Loans
  const myApplications = loanApplications.filter((a) => a.customerId === activeCustomer?.id);
  const myLoans = loans.filter((l) => l.customerId === activeCustomer?.id);
  const myRepayments = repayments.filter((r) => r.customerId === activeCustomer?.id);

  // Apply Form State
  const [applyAmount, setApplyAmount] = useState<number>(300000);
  const [applyPeriod, setApplyPeriod] = useState<number>(6);
  const [applyPeriodUnit, setApplyPeriodUnit] = useState<'Months' | 'Weeks' | 'Days'>('Months');
  const [applyInterestType, setApplyInterestType] = useState<InterestType>(companySettings.defaultInterestType);
  const [applyPurpose, setApplyPurpose] = useState<string>('Personal Expenses & Capital Growth');
  const [signatureData, setSignatureData] = useState<string>('');
  
  // Compulsory Fields State - Default to clean vector or empty (zero real photos)
  const [clientPhotoUrl, setClientPhotoUrl] = useState<string>(
    activeCustomer?.avatarUrl && !activeCustomer.avatarUrl.includes('unsplash')
      ? activeCustomer.avatarUrl
      : activeCustomer?.selfieUrl && !activeCustomer.selfieUrl.includes('unsplash')
      ? activeCustomer.selfieUrl
      : ''
  );
  const [collateralName, setCollateralName] = useState<string>('');
  const [collateralPhotoUrl, setCollateralPhotoUrl] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appSubmittedSuccess, setAppSubmittedSuccess] = useState<string | null>(null);
  const [applyValidationError, setApplyValidationError] = useState<string | null>(null);

  // Helper to convert uploaded files to Base64
  const handleImageFileUpload = (file: File, setter: (val: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setter(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regNationalId, setRegNationalId] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regOccupation, setRegOccupation] = useState('');
  const [regIncome, setRegIncome] = useState(4000);
  const [regExpenses, setRegExpenses] = useState(1800);

  // Payment Modal State
  const [payModalLoan, setPayModalLoan] = useState<any>(null);

  // AI Support Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: `Hello! Welcome to ${companySettings.companyName}. How can I assist you with loan applications, interest rates, or repayment schedules today?`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Eligibility Calculation
  const eligibility = calculateEligibility(activeCustomer?.monthlyIncome || 4000, activeCustomer?.monthlyExpenses || 1800);

  // Calculated Loan Preview
  const loanPreview = calculateLoan(
    applyAmount,
    applyPeriod,
    applyPeriodUnit,
    companySettings.defaultInterestRate,
    applyInterestType
  );

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) {
      setApplyValidationError('You must be signed in to submit a loan application. Please register or log in.');
      return;
    }

    if (!clientPhotoUrl) {
      setApplyValidationError('Compulsory requirement missing: Please upload or capture your Borrower Face Photo before submitting.');
      return;
    }
    if (!collateralName.trim()) {
      setApplyValidationError('Compulsory requirement missing: Please enter the Name and Description of your Collateral Item.');
      return;
    }
    if (!collateralPhotoUrl) {
      setApplyValidationError('Compulsory requirement missing: Please upload a Photo of your Collateral Item.');
      return;
    }
    if (!signatureData) {
      setApplyValidationError('Please provide your electronic signature in the signature box before submitting.');
      return;
    }

    setApplyValidationError(null);
    setIsSubmitting(true);
    setTimeout(() => {
      const app = submitLoanApplication({
        customerId: activeCustomer.id,
        customerName: activeCustomer.fullName,
        customerPhone: activeCustomer.phone,
        customerEmail: activeCustomer.email,
        amount: applyAmount,
        periodValue: applyPeriod,
        periodUnit: applyPeriodUnit,
        interestType: applyInterestType,
        interestRate: companySettings.defaultInterestRate,
        monthlyInstallment: loanPreview.monthlyInstallment,
        totalInterest: loanPreview.totalInterest,
        totalPayable: loanPreview.totalPayable,
        purpose: applyPurpose,
        signatureUrl: signatureData,
        clientPhotoUrl: clientPhotoUrl,
        collateralName: collateralName.trim(),
        collateralPhotoUrl: collateralPhotoUrl,
      });

      setIsSubmitting(false);
      setAppSubmittedSuccess(app.id);
      setActiveTab('my_loans');
    }, 1200);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerCustomer({
      fullName: regFullName,
      email: regEmail,
      phone: regPhone,
      nationalId: regNationalId,
      address: regAddress,
      occupation: regOccupation,
      monthlyIncome: regIncome,
      monthlyExpenses: regExpenses,
    });
  };

  const sendAiMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          history: chatMessages.slice(-6),
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: 'bot', text: data.reply || 'Thank you for reaching out to CashFirst Finance support.' }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `${companySettings.companyName} Support: Our interest rate is ${companySettings.defaultInterestRate}% per annum. Applications are processed within 24 hours.`,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!activeCustomer) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Register with {companySettings.companyName}</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Create an account to check eligibility and apply for instant loans.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+1 555-0199"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">National ID / Passport</label>
                <input
                  type="text"
                  required
                  value={regNationalId}
                  onChange={(e) => setRegNationalId(e.target.value)}
                  placeholder="ID-992019"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Occupation</label>
                <input
                  type="text"
                  required
                  value={regOccupation}
                  onChange={(e) => setRegOccupation(e.target.value)}
                  placeholder="Software Developer"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Monthly Income ({companySettings.currencySymbol || 'MWK'})</label>
                <input
                  type="number"
                  required
                  value={regIncome}
                  onChange={(e) => setRegIncome(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Monthly Expenses ({companySettings.currencySymbol || 'MWK'})</label>
                <input
                  type="number"
                  required
                  value={regExpenses}
                  onChange={(e) => setRegExpenses(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Residential Address</label>
              <input
                type="text"
                required
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                placeholder="Street name, City, State"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm mt-2"
            >
              Create Account & Check Eligibility
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Welcome back, {activeCustomer.fullName}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{companySettings.companyName} Portal</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl font-medium">
            {companySettings.tagline}. Fast loans with flexible repayment choices.
          </p>
        </div>

        {/* Eligibility Pill */}
        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl text-right shadow-inner">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Your Pre-Approved Loan Limit</div>
          <div className="text-2xl font-black text-blue-400">{formatCurrency(eligibility.eligibleAmount, companySettings.currencySymbol)}</div>
          <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
            Credit Score: {eligibility.creditScore} / 850
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" /> Account Overview
        </button>

        <button
          onClick={() => setActiveTab('apply')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'apply'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-4 h-4 text-blue-200" /> Apply for Loan
        </button>

        <button
          onClick={() => setActiveTab('my_loans')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap relative ${
            activeTab === 'my_loans'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" /> My Loans & Schedule
          {myLoans.length > 0 && (
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('kyc')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'kyc'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Upload className="w-4 h-4" /> KYC Documents
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeCustomer.kycStatus === 'Verified'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {activeCustomer.kycStatus}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'support'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bot className="w-4 h-4 text-amber-300" /> AI Support Assistant
        </button>
      </div>

      {/* Tab Contents */}

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2 tracking-tight">
                <Sparkles className="w-5 h-5 text-blue-600" /> Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setActiveTab('apply')}
                  className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <span className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
                      <DollarSign className="w-5 h-5" />
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 mt-3 text-sm">Apply for New Loan</h4>
                  <p className="text-xs text-slate-600 mt-1 font-medium">Get up to {formatCurrency(eligibility.eligibleAmount, companySettings.currencySymbol)} with fast approval.</p>
                </div>

                <div
                  onClick={() => setActiveTab('my_loans')}
                  className="p-4 bg-slate-100/80 border border-slate-200 rounded-xl hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <span className="p-2 bg-slate-900 text-white rounded-lg shadow-sm">
                      <FileText className="w-5 h-5" />
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-800 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 mt-3 text-sm">Make Loan Payment</h4>
                  <p className="text-xs text-slate-600 mt-1 font-medium">Pay via Mobile Money, Card, or Bank transfer.</p>
                </div>
              </div>
            </div>

            {/* Active Loan Card if any */}
            {myLoans.length > 0 ? (
              myLoans.map((loan) => (
                <div key={loan.id} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        Active Loan
                      </span>
                      <h4 className="text-lg font-extrabold text-slate-900 mt-1">Loan Account #{loan.id}</h4>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {loan.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Principal</span>
                      <span className="font-extrabold text-slate-800 text-sm">{formatCurrency(loan.principal, companySettings.currencySymbol)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Outstanding</span>
                      <span className="font-extrabold text-blue-600 text-sm">{formatCurrency(loan.balance, companySettings.currencySymbol)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Total Paid</span>
                      <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(loan.totalPaid, companySettings.currencySymbol)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Next Due Date</span>
                      <span className="font-extrabold text-slate-800 text-sm">{loan.nextPaymentDate}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                      <span>Repayment Progress</span>
                      <span>{Math.round((loan.totalPaid / loan.totalPayable) * 100)}% Paid</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (loan.totalPaid / loan.totalPayable) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => printLoanAgreement(loan, companySettings)}
                      className="text-xs text-slate-600 hover:text-slate-900 underline flex items-center gap-1 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Agreement
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayModalLoan(loan)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow"
                    >
                      Pay Installment Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-800">No Active Loans Found</p>
                <p className="font-medium">You currently do not have any active loan accounts. Ready to apply?</p>
                <button
                  onClick={() => setActiveTab('apply')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs mt-2"
                >
                  Start Application
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <CashFirstFlyerCard onApplyClick={() => setActiveTab('apply')} />

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-teal-600" /> Borrower Profile
              </h4>
              <div className="text-xs space-y-2 text-slate-600">
                <div className="flex justify-between"><span className="text-slate-400">Name:</span> <span className="font-semibold text-slate-800">{activeCustomer.fullName}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Email:</span> <span>{activeCustomer.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Phone:</span> <span>{activeCustomer.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">National ID:</span> <span>{activeCustomer.nationalId}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Occupation:</span> <span>{activeCustomer.occupation}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Monthly Income:</span> <span className="font-semibold">{formatCurrency(activeCustomer.monthlyIncome, companySettings.currencySymbol)}</span></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-teal-950 rounded-2xl p-5 text-white shadow-md space-y-3">
              <h4 className="font-bold text-sm flex items-center gap-2 text-teal-300">
                <HelpCircle className="w-4 h-4" /> Need Support?
              </h4>
              <p className="text-xs text-slate-300">
                Have questions about loan terms, repayment deadlines, or early settlements?
              </p>
              <div className="text-xs text-slate-300 space-y-1">
                <div>📞 Call: {companySettings.phone}</div>
                <div>📧 Email: {companySettings.email}</div>
                <div>📍 Office: {companySettings.address}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. APPLY FOR LOAN */}
      {activeTab === 'apply' && (
        <div className="space-y-6">
          <CashFirstFlyerCard />

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-teal-600" /> Apply for Loan - {companySettings.companyName}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your desired loan amount, tenure, and interest preference. Digitally sign the agreement to complete your application.
            </p>
          </div>

          <form onSubmit={handleApplySubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Inputs */}
            <div className="space-y-5 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-800 text-sm">Desired Loan Amount ({companySettings.currencySymbol || 'MWK'})</label>
                  <span className="text-lg font-black text-teal-700">{formatCurrency(applyAmount, companySettings.currencySymbol)}</span>
                </div>
                <input
                  type="range"
                  min={companySettings.minLoanAmount}
                  max={eligibility.eligibleAmount}
                  step={1000}
                  value={applyAmount}
                  onChange={(e) => setApplyAmount(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Min: {formatCurrency(companySettings.minLoanAmount, companySettings.currencySymbol)}</span>
                  <span>Max Pre-Approved: {formatCurrency(eligibility.eligibleAmount, companySettings.currencySymbol)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Repayment Period Value</label>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={applyPeriod}
                    onChange={(e) => setApplyPeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Period Unit</label>
                  <select
                    value={applyPeriodUnit}
                    onChange={(e) => setApplyPeriodUnit(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="Months">Months</option>
                    <option value="Weeks">Weeks</option>
                    <option value="Days">Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Interest Calculation Engine</label>
                <select
                  value={applyInterestType}
                  onChange={(e) => setApplyInterestType(e.target.value as InterestType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium bg-slate-50"
                >
                  <option value="Reducing Balance">Reducing Balance (Standard Amortization)</option>
                  <option value="Flat">Flat Interest Rate</option>
                  <option value="Monthly">Monthly Simple Rate</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Loan Purpose / Remarks</label>
                <input
                  type="text"
                  required
                  value={applyPurpose}
                  onChange={(e) => setApplyPurpose(e.target.value)}
                  placeholder="e.g. Business inventory, home renovation..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* COMPULSORY CLIENT PHOTO & COLLATERAL SECTION - PURE BLACK VECTORS */}
              <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    </div>
                    <span className="font-extrabold text-slate-900 text-xs">Compulsory Verification Requirements</span>
                  </div>
                  <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Mandatory 3/3
                  </span>
                </div>

                {/* 1. COMPULSORY CLIENT PHOTO */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center shadow-sm">
                      <User className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    </div>
                    <label className="font-bold text-slate-800 text-xs">
                      1. Client / Borrower Face Photo <span className="text-rose-600">*</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">Upload a clear passport photo / selfie, or select the standard black vector ID silhouette.</p>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl bg-black border-2 border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
                      {clientPhotoUrl && !clientPhotoUrl.includes('unsplash') ? (
                        <img src={clientPhotoUrl} alt="Client Photo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white p-1">
                          <User className="w-7 h-7 text-white stroke-[2.5]" />
                          <span className="text-[7.5px] font-black text-slate-300 uppercase tracking-tight mt-0.5">Face Vector</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap gap-2">
                        <label className="cursor-pointer bg-white border border-slate-300 hover:border-black text-slate-800 hover:text-black px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all">
                          <Upload className="w-3.5 h-3.5 text-slate-800" /> Upload File
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleImageFileUpload(e.target.files[0], setClientPhotoUrl);
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setClientPhotoUrl(BLACK_VECTOR_BORROWER)}
                          className="bg-black hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <User className="w-3.5 h-3.5 text-white" /> Use Black Vector Icon
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        {clientPhotoUrl && !clientPhotoUrl.includes('unsplash') ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Borrower profile set
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold">Borrower photo or vector icon required</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. COMPULSORY COLLATERAL NAME */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center shadow-sm">
                      <Tag className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    </div>
                    <label className="font-bold text-slate-800 text-xs">
                      2. Collateral Item Name / Asset Description <span className="text-rose-600">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    value={collateralName}
                    onChange={(e) => setCollateralName(e.target.value)}
                    placeholder="e.g. Toyota Vitz Reg MW-1092, Land Title Deed #401, Sony TV 65 Inch..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* 3. COMPULSORY COLLATERAL PHOTO */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center shadow-sm">
                      <Box className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    </div>
                    <label className="font-bold text-slate-800 text-xs">
                      3. Collateral Asset Photo <span className="text-rose-600">*</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">Upload a collateral photo or choose a standard black vector asset icon below.</p>

                  <div className="flex items-start gap-3">
                    <div className="w-24 h-16 rounded-xl bg-black border-2 border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
                      {collateralPhotoUrl && !collateralPhotoUrl.includes('unsplash') ? (
                        <img src={collateralPhotoUrl} alt="Collateral Photo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white p-1">
                          <Box className="w-7 h-7 text-white stroke-[2.5]" />
                          <span className="text-[7.5px] font-black text-slate-300 uppercase tracking-tight mt-0.5">Asset Vector</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <label className="cursor-pointer bg-white border border-slate-300 hover:border-black text-slate-800 hover:text-black px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all">
                          <Upload className="w-3.5 h-3.5 text-slate-800" /> Upload Collateral Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleImageFileUpload(e.target.files[0], setCollateralPhotoUrl);
                            }}
                          />
                        </label>
                      </div>

                      {/* Presets for quick black vector selection */}
                      <div className="flex flex-wrap items-center gap-1 text-[10px]">
                        <span className="text-slate-500 font-bold self-center mr-1">Black Vectors:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCollateralName('Toyota Vitz Reg MW-1092');
                            setCollateralPhotoUrl(BLACK_VECTOR_VEHICLE);
                          }}
                          className="bg-black hover:bg-slate-800 text-white border border-black px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1 transition-all"
                        >
                          <Car className="w-3 h-3 text-white" /> Vehicle Vector
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCollateralName('Plot Title Deed No. 8821');
                            setCollateralPhotoUrl(BLACK_VECTOR_LAND);
                          }}
                          className="bg-black hover:bg-slate-800 text-white border border-black px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1 transition-all"
                        >
                          <Home className="w-3 h-3 text-white" /> Land/Deed Vector
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCollateralName('Apple MacBook Pro M3');
                            setCollateralPhotoUrl(BLACK_VECTOR_ELECTRONICS);
                          }}
                          className="bg-black hover:bg-slate-800 text-white border border-black px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1 transition-all"
                        >
                          <Laptop className="w-3 h-3 text-white" /> Laptop Vector
                        </button>
                      </div>

                      <div className="text-[10px]">
                        {collateralPhotoUrl && !collateralPhotoUrl.includes('unsplash') ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Collateral asset verified
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold">Collateral photo or vector icon required</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Electronic Signature Box */}
              <div>
                <SignatureCanvas
                  onSave={(dataUrl) => setSignatureData(dataUrl)}
                  primaryColor={companySettings.primaryColor}
                />
              </div>
            </div>

            {/* Right Summary Calculation Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                  <h4 className="font-bold text-slate-900 text-sm">Loan Summary Breakdown</h4>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                    Rate: {companySettings.defaultInterestRate}%
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex justify-between"><span className="text-slate-500">Requested Principal:</span> <span className="font-bold text-slate-900">{formatCurrency(applyAmount, companySettings.currencySymbol)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Interest Engine:</span> <span>{applyInterestType}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Total Interest Payable:</span> <span className="font-bold text-teal-700">{formatCurrency(loanPreview.totalInterest, companySettings.currencySymbol)}</span></div>
                  <div className="flex justify-between text-sm border-t border-slate-200 pt-2 font-bold text-slate-900">
                    <span>Total Amount Payable:</span>
                    <span className="text-teal-800">{formatCurrency(loanPreview.totalPayable, companySettings.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <span>Estimated Monthly Payment:</span>
                    <span>{formatCurrency(loanPreview.monthlyInstallment, companySettings.currencySymbol)} / mo</span>
                  </div>
                </div>

                {/* Schedule preview snippet */}
                <div className="mt-4">
                  <span className="text-[11px] font-bold text-slate-700 block mb-2">Estimated Payment Dates Snippet:</span>
                  <div className="max-h-36 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-lg text-[11px] bg-white">
                    {loanPreview.schedule.map((item) => (
                      <div key={item.installmentNo} className="p-2 flex justify-between">
                        <span>Installment #{item.installmentNo} ({item.dueDate})</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(item.totalDue, companySettings.currencySymbol)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {applyValidationError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div className="font-semibold leading-relaxed">{applyValidationError}</div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting Agreement...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Electronically Sign & Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}

      {/* 3. MY LOANS & REPAYMENT SCHEDULE */}
      {activeTab === 'my_loans' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">My Submitted Applications</h3>
            {myApplications.length === 0 ? (
              <p className="text-xs text-slate-500">No applications submitted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="p-3">App ID</th>
                      <th className="p-3">Borrower & Collateral</th>
                      <th className="p-3">Submitted Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Tenure</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-800">{app.id}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-black text-white flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-700">
                              {app.clientPhotoUrl && !app.clientPhotoUrl.includes('unsplash') ? (
                                <img src={app.clientPhotoUrl} alt="Client Photo" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-white stroke-[2.5]" />
                              )}
                            </div>
                            <div className="text-[11px]">
                              <span className="font-semibold text-slate-800 block">{app.customerName}</span>
                              <span className="text-[10px] text-amber-800 font-medium">Collateral: {app.collateralName || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">{app.submittedAt}</td>
                        <td className="p-3 font-bold text-teal-700">{formatCurrency(app.amount, companySettings.currencySymbol)}</td>
                        <td className="p-3">{app.periodValue} {app.periodUnit}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              app.status === 'Approved' || app.status === 'Disbursed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => printLoanAgreement(app, companySettings)}
                            className="text-teal-700 hover:underline text-[11px] font-medium"
                          >
                            Print Agreement
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Loans detailed schedule */}
          {myLoans.map((loan) => (
            <div key={loan.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Loan #{loan.id} Repayment Schedule</h3>
                  <p className="text-xs text-slate-500">
                    Next Due Date: <strong>{loan.nextPaymentDate}</strong> | Outstanding Balance: <strong className="text-teal-700">{formatCurrency(loan.balance, companySettings.currencySymbol)}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setPayModalLoan(loan)}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow"
                >
                  Make Payment Now
                </button>
              </div>

              {/* Schedule Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="p-3">Installment #</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Principal</th>
                      <th className="p-3">Interest</th>
                      <th className="p-3">Penalty</th>
                      <th className="p-3">Total Due</th>
                      <th className="p-3">Paid Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loan.schedule.map((item) => (
                      <tr key={item.installmentNo} className={item.status === 'Overdue' ? 'bg-rose-50/50' : 'hover:bg-slate-50'}>
                        <td className="p-3 font-semibold">#{item.installmentNo}</td>
                        <td className="p-3 text-slate-600">{item.dueDate}</td>
                        <td className="p-3">{formatCurrency(item.principal, companySettings.currencySymbol)}</td>
                        <td className="p-3">{formatCurrency(item.interest, companySettings.currencySymbol)}</td>
                        <td className="p-3 text-rose-600 font-semibold">{formatCurrency(item.penalty, companySettings.currencySymbol)}</td>
                        <td className="p-3 font-bold text-slate-900">{formatCurrency(item.totalDue, companySettings.currencySymbol)}</td>
                        <td className="p-3 font-semibold text-emerald-700">{formatCurrency(item.paidAmount, companySettings.currencySymbol)}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'Overdue'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. KYC & DOCUMENTS */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">KYC Verification & Supporting Documents</h3>
              <p className="text-xs text-slate-500">Upload your National ID, Passport, or income verification to complete eligibility.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-800">
              KYC Status: {activeCustomer.kycStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* National ID */}
            <div className="border-2 border-slate-900 rounded-xl p-4 text-xs space-y-3 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-slate-900 block">1. National ID / Passport</span>
              </div>
              <div className="w-full h-32 rounded-lg bg-black flex items-center justify-center overflow-hidden border border-slate-800">
                {activeCustomer.nationalIdDocUrl && !activeCustomer.nationalIdDocUrl.includes('unsplash') ? (
                  <img src={activeCustomer.nationalIdDocUrl} alt="ID Document" className="w-full h-full object-contain" />
                ) : (
                  <img src={BLACK_VECTOR_ID_CARD} alt="ID Card Vector" className="w-full h-full object-contain p-2" />
                )}
              </div>
              <div className="space-y-1.5">
                <label className="cursor-pointer w-full bg-white border border-slate-300 hover:border-black text-slate-800 hover:text-black py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all">
                  <Upload className="w-3.5 h-3.5 text-slate-800" /> Upload National ID File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageFileUpload(e.target.files[0], (url) => {
                          updateCustomerKYC(activeCustomer.id, 'Pending', { nationalIdDocUrl: url });
                        });
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => updateCustomerKYC(activeCustomer.id, 'Pending', { nationalIdDocUrl: BLACK_VECTOR_ID_CARD })}
                  className="w-full bg-black hover:bg-slate-800 text-white font-semibold py-1.5 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all"
                >
                  <ShieldCheck className="w-3 h-3 text-white" /> Use Black Vector ID
                </button>
              </div>
            </div>

            {/* Selfie Photo */}
            <div className="border-2 border-slate-900 rounded-xl p-4 text-xs space-y-3 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-slate-900 block">2. Facial Selfie / Passport Vector</span>
              </div>
              <div className="w-full h-32 rounded-lg bg-black flex items-center justify-center overflow-hidden border border-slate-800">
                {activeCustomer.selfieUrl && !activeCustomer.selfieUrl.includes('unsplash') ? (
                  <img src={activeCustomer.selfieUrl} alt="Selfie" className="w-full h-full object-contain" />
                ) : (
                  <img src={BLACK_VECTOR_BORROWER} alt="Borrower Vector" className="w-full h-full object-contain p-2" />
                )}
              </div>
              <div className="space-y-1.5">
                <label className="cursor-pointer w-full bg-white border border-slate-300 hover:border-black text-slate-800 hover:text-black py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all">
                  <Upload className="w-3.5 h-3.5 text-slate-800" /> Upload Facial Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageFileUpload(e.target.files[0], (url) => {
                          updateCustomerKYC(activeCustomer.id, 'Pending', { selfieUrl: url, avatarUrl: url });
                        });
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => updateCustomerKYC(activeCustomer.id, 'Pending', { selfieUrl: BLACK_VECTOR_BORROWER, avatarUrl: BLACK_VECTOR_BORROWER })}
                  className="w-full bg-black hover:bg-slate-800 text-white font-semibold py-1.5 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all"
                >
                  <User className="w-3 h-3 text-white" /> Use Black Vector Icon
                </button>
              </div>
            </div>

            {/* Income Proof */}
            <div className="border-2 border-slate-900 rounded-xl p-4 text-xs space-y-3 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-slate-900 block">3. Proof of Income / Bank Statement</span>
              </div>
              <div className="w-full h-32 rounded-lg bg-black flex items-center justify-center overflow-hidden border border-slate-800">
                {activeCustomer.incomeProofUrl && !activeCustomer.incomeProofUrl.includes('unsplash') ? (
                  <img src={activeCustomer.incomeProofUrl} alt="Income proof" className="w-full h-full object-contain" />
                ) : (
                  <img src={BLACK_VECTOR_INCOME} alt="Income Vector" className="w-full h-full object-contain p-2" />
                )}
              </div>
              <div className="space-y-1.5">
                <label className="cursor-pointer w-full bg-white border border-slate-300 hover:border-black text-slate-800 hover:text-black py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all">
                  <Upload className="w-3.5 h-3.5 text-slate-800" /> Upload Statement File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageFileUpload(e.target.files[0], (url) => {
                          updateCustomerKYC(activeCustomer.id, 'Pending', { incomeProofUrl: url });
                        });
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => updateCustomerKYC(activeCustomer.id, 'Pending', { incomeProofUrl: BLACK_VECTOR_INCOME })}
                  className="w-full bg-black hover:bg-slate-800 text-white font-semibold py-1.5 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all"
                >
                  <FileText className="w-3 h-3 text-white" /> Use Black Vector Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. AI CUSTOMER SUPPORT CHAT & OFFICE LOCATIONS */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          {/* Office Branches Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" /> Our Physical Office Branches
              </h3>
              <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                Malawi Network
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lilongwe Branch */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-teal-600" /> Lilongwe Branch
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Open</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800"><MapPin className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> Location: New Shire, Lilongwe</p>
                  <p className="text-slate-500"><Phone className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> +265 1 820 100 / +265 999 820 100</p>
                  <p className="text-slate-500"><Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> Mon - Fri: 8:00 AM - 5:00 PM CAT</p>
                </div>
              </div>

              {/* Mzuzu Branch */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-teal-600" /> Mzuzu Branch
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Open</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800"><MapPin className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> Location: Dunduzu, Mzuzu</p>
                  <p className="text-slate-500"><Phone className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> +265 1 820 200 / +265 888 820 200</p>
                  <p className="text-slate-500"><Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> Mon - Fri: 8:00 AM - 5:00 PM CAT</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-teal-600" /> {companySettings.companyName} AI Loan Assistant
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                24/7 AI Online
              </span>
            </div>

          <div className="h-80 overflow-y-auto space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-teal-700 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="text-slate-400 text-xs italic flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Thinking...
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()}
              placeholder="Ask about loan eligibility, interest rates, or early settlements..."
              className="flex-1 px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
            <button
              onClick={sendAiMessage}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </div>
        </div>
      </div>
    )}

      {/* Payment Modal */}
      {payModalLoan && (
        <PaymentModal
          loan={payModalLoan}
          isOpen={!!payModalLoan}
          onClose={() => setPayModalLoan(null)}
        />
      )}
    </div>
  );
};
