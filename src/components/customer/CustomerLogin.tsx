import React, { useState } from 'react';
import {
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Building2,
  HelpCircle,
  KeyRound
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CustomerLogin: React.FC = () => {
  const { loginWithUsernameAndPassword, companySettings, navigatePath, customers } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both your username/email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await loginWithUsernameAndPassword(username.trim(), password.trim(), 'customer');
      if (res.success) {
        setSuccessMsg(`Welcome back, ${res.user?.fullName}!`);
        setTimeout(() => {
          navigatePath('/loans');
        }, 800);
      } else {
        setErrorMsg(res.message || 'Invalid customer credentials.');
      }
    } catch (err) {
      setErrorMsg('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Portal Login</h2>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Access your active loans, track pending applications, or submit new requests with {companySettings.companyName}.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div className="font-semibold">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="font-semibold">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
                Username or Email Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alexw or alex.wong@example.com"
                  className="w-full px-3.5 py-3 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigatePath('/forgot-password')}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-3 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-[11px] font-bold"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-600/30 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span>Logging In...</span>
              ) : (
                <>
                  <span>Sign In To Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-slate-500 text-xs">Don't have an account yet? </span>
            <button
              type="button"
              onClick={() => navigatePath('/register')}
              className="text-xs font-extrabold text-blue-600 hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
