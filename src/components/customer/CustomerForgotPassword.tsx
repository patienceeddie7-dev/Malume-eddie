import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, KeyRound, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CustomerForgotPassword: React.FC = () => {
  const { companySettings, navigatePath } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password?</h2>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Enter your registered email address and we'll send password recovery instructions.
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {submitted ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">Recovery Link Sent!</h3>
              <p className="text-xs text-slate-600">
                Password reset link has been dispatched to <span className="font-bold text-slate-900">{email}</span>. Please check your inbox and spam folder.
              </p>
              <button
                type="button"
                onClick={() => navigatePath('/login')}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-3 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-600/30 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigatePath('/login')}
              className="text-xs font-extrabold text-slate-600 hover:text-slate-900"
            >
              Back to Customer Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
