import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Lock,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  IdCard,
  UserPlus,
  LogIn,
  X,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  BadgeCheck,
  KeyRound
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
  defaultType?: 'customer' | 'staff';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  defaultType = 'customer'
}) => {
  const { loginWithUsernameAndPassword, signupCustomer, signupStaff } = useApp();

  const [authTab, setAuthTab] = useState<'login' | 'signup'>(defaultTab);
  const [userType, setUserType] = useState<'customer' | 'staff'>(defaultType);

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Extra Customer Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [occupation, setOccupation] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(500000);

  // Extra Staff Fields
  const [staffRole, setStaffRole] = useState<UserRole>('Loan Officer');
  const [employeeCode, setEmployeeCode] = useState('');

  // UI State
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setEmail('');
    setPhone('');
    setNationalId('');
    setOccupation('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await loginWithUsernameAndPassword(username.trim(), password.trim(), userType);
      if (res.success) {
        setSuccessMsg(`Welcome back, ${res.user?.fullName}! Logged in successfully.`);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('An unexpected login error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoUsername: string, targetType: 'customer' | 'staff') => {
    setLoading(true);
    setErrorMsg('');
    setUserType(targetType);
    try {
      const res = await loginWithUsernameAndPassword(demoUsername, 'password123', targetType);
      if (res.success) {
        setSuccessMsg(`Logged in as demo user (${res.user?.fullName})`);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 800);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim()) {
      setErrorMsg('Username is required.');
      return;
    }
    if (username.trim().length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      return;
    }
    if (!password) {
      setErrorMsg('Password is required.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      if (userType === 'customer') {
        const res = await signupCustomer({
          username: username.trim(),
          password,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || '+265 990 000 000',
          nationalId: nationalId.trim() || `ID-${Math.floor(10000000 + Math.random() * 90000000)}`,
          occupation: occupation.trim() || 'General Specialist',
          monthlyIncome: Number(monthlyIncome) || 350000,
          monthlyExpenses: Math.round((Number(monthlyIncome) || 350000) * 0.4),
          address: 'Lilongwe, Malawi',
        });

        if (res.success) {
          setSuccessMsg('Account created successfully! Logging you in...');
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1200);
        } else {
          setErrorMsg(res.message);
        }
      } else {
        // Staff Signup
        const res = await signupStaff({
          username: username.trim(),
          password,
          name: fullName.trim(),
          email: email.trim(),
          role: staffRole,
          employeeCode: employeeCode.trim(),
        });

        if (res.success) {
          setSuccessMsg(`Staff account created for ${fullName}! Logged in as ${staffRole}.`);
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1200);
        } else {
          setErrorMsg(res.message);
        }
      }
    } catch (err) {
      setErrorMsg('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                CASH FIRST GROUP <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold uppercase border border-blue-500/30">Secure Auth</span>
              </h2>
              <p className="text-xs text-slate-400">Sign in to your account or register a new user profile</p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Account Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setUserType('customer');
                setErrorMsg('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                userType === 'customer'
                  ? 'bg-white text-blue-900 shadow-md border border-slate-200/60 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>Customer Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUserType('staff');
                setErrorMsg('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                userType === 'staff'
                  ? 'bg-slate-900 text-white shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Admin / Staff Portal</span>
            </button>
          </div>

          {/* Auth Tab Switcher (Login vs Signup) */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => {
                setAuthTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                authTab === 'login'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={() => {
                setAuthTab('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                authTab === 'signup'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Create Account (Sign Up)
            </button>
          </div>

          {/* Alert Banners */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div className="font-semibold">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="font-semibold">{successMsg}</div>
            </div>
          )}

          {/* LOGIN FORM */}
          {authTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username or Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={userType === 'customer' ? 'e.g. alexw or alex.wright@example.com' : 'e.g. admin or s.jenkins@cashfirst.com'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span>Remember my login</span>
                </label>
                <span className="text-blue-600 hover:underline cursor-pointer font-medium">Forgot password?</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Sign In to {userType === 'customer' ? 'Customer Account' : 'Staff Dashboard'}
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {authTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Registering as <strong className="uppercase font-bold">{userType === 'customer' ? 'Customer User' : 'Staff / Admin Member'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Username *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="e.g. john_doe"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <BadgeCheck className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Specific Fields */}
              {userType === 'customer' && (
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+265 999 000 111"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        National ID Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <IdCard className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value)}
                          placeholder="ID-10293847"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Occupation / Business
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Briefcase className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          placeholder="e.g. Civil Servant / Trader"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Monthly Income (MWK)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <DollarSign className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="number"
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                          placeholder="500000"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Staff Specific Fields */}
              {userType === 'staff' && (
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Staff Role *
                      </label>
                      <select
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Manager">Branch Manager</option>
                        <option value="Loan Officer">Loan Officer</option>
                        <option value="Cashier">Cashier</option>
                        <option value="Auditor">System Auditor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Employee Key / Code (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <KeyRound className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={employeeCode}
                          onChange={(e) => setEmployeeCode(e.target.value)}
                          placeholder="e.g. EMP-2026"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Create {userType === 'customer' ? 'Customer' : 'Staff'} Account
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Login Section */}
          <div className="pt-4 border-t border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
              <span>Quick Demo Accounts (1-Click Login)</span>
              <span className="text-slate-400 font-medium">Password: password123</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin', 'staff')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600">admin</div>
                <div className="text-[10px] text-slate-500 font-medium">Super Admin</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('erostova', 'staff')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600">erostova</div>
                <div className="text-[10px] text-slate-500 font-medium">Loan Officer</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('mvance', 'staff')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600">mvance</div>
                <div className="text-[10px] text-slate-500 font-medium">Cashier</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('alexw', 'customer')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600">alexw</div>
                <div className="text-[10px] text-slate-500 font-medium">Alex Wright (Cust)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('sophiam', 'customer')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600">sophiam</div>
                <div className="text-[10px] text-slate-500 font-medium">Sophia M. (Cust)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('rchen', 'customer')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600">rchen</div>
                <div className="text-[10px] text-slate-500 font-medium">Robert Chen (Cust)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
