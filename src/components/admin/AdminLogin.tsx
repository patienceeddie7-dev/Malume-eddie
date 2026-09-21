import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  AlertCircle,
  Building2,
  KeyRound,
  CheckCircle2,
  UserPlus,
  Mail,
  Phone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdminLoginProps {
  onSuccessNavigate?: () => void;
  onGoToCustomerSite?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccessNavigate, onGoToCustomerSite }) => {
  const { loginWithUsernameAndPassword, signupStaff, companySettings, navigatePath, staffUsers } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(staffUsers.length === 0 ? 'register' : 'login');
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Admin Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both staff username/email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await loginWithUsernameAndPassword(username.trim(), password.trim(), 'staff');
      if (res.success) {
        setSuccessMsg(`Access Granted! Welcome back, ${res.user?.fullName} (${res.user?.role || 'Staff'}).`);
        setTimeout(() => {
          if (onSuccessNavigate) onSuccessNavigate();
          else navigatePath('/admin/dashboard');
        }, 800);
      } else {
        setErrorMsg(res.message || 'Invalid staff credentials or insufficient privileges.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during staff authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regUsername.trim() || !regPassword.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await signupStaff({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        username: regUsername.trim(),
        password: regPassword.trim(),
        role: 'Super Admin',
      });

      if (res.success) {
        setSuccessMsg('Initial Company Administrator created successfully! Redirecting...');
        setTimeout(() => {
          if (onSuccessNavigate) onSuccessNavigate();
          else navigatePath('/admin/dashboard');
        }, 1000);
      } else {
        setErrorMsg(res.message || 'Failed to create admin account.');
      }
    } catch (err) {
      setErrorMsg('An error occurred during administrator account creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-blue-400 font-bold uppercase tracking-wider shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Restricted Internal Access</span>
          </div>
          
          <div className="flex items-center justify-center gap-3 pt-2">
            {companySettings.logoUrl ? (
              <img src={companySettings.logoUrl} alt="Logo" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-lg" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                CF
              </div>
            )}
            <h1 className="text-2xl font-black tracking-tight text-white">{companySettings.companyName}</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">
            Staff & Administrative Portal. Authenticated Personnel Only.
          </p>
        </div>

        {/* Login / Register Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {mode === 'login' ? (
                  <>
                    <KeyRound className="w-5 h-5 text-blue-400" /> Staff Authentication
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 text-emerald-400" /> Create Administrator Account
                  </>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'login'
                  ? 'Enter your staff credentials to access management controls.'
                  : 'Register the primary company administrator for system management.'}
              </p>
            </div>
          </div>

          {/* Alert Banners */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div className="font-semibold">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="font-semibold">{successMsg}</div>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Staff Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter staff username or email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 text-xs font-bold"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Log In to Admin Suite
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1 text-[10px]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Director / Lead Admin"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl font-medium text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1 text-[10px]">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="admin@company.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl font-medium text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1 text-[10px]">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+265 990 000 000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl font-medium text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1 text-[10px]">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl font-medium text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1 text-[10px]">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl font-medium text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Creating Administrator Account...' : 'Create Admin Account'}
              </button>
            </form>
          )}

          {/* Toggle Register/Login link */}
          <div className="pt-4 border-t border-slate-800 text-center">
            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold"
              >
                + Register New Admin Account
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold"
              >
                ← Back to Staff Login
              </button>
            )}
          </div>
        </div>

        {/* Back to Customer Website Link */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              if (onGoToCustomerSite) onGoToCustomerSite();
              else navigatePath('/');
            }}
            className="text-xs text-slate-400 hover:text-white font-semibold transition-colors inline-flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" /> Back to Public Customer Website
          </button>
        </div>
      </div>
    </div>
  );
};
