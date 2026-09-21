import React from 'react';
import {
  Users,
  FileCheck,
  Clock,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/currency';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { customers, loanApplications, loans, repayments, activeStaff, companySettings } = useApp();

  // Metrics
  const totalCustomers = customers.length;
  const activeLoansList = loans.filter((l) => l.status === 'Active' || l.status === 'Overdue');
  const pendingApps = loanApplications.filter((a) => a.status === 'Pending' || a.status === 'Under Review');
  const overdueLoans = loans.filter((l) => l.status === 'Overdue');

  const totalOutstanding = loans.reduce((acc, l) => acc + l.balance, 0);
  const totalCollectedToDate = repayments.reduce((acc, r) => acc + r.amount, 0);

  // Today's collections
  const todayStr = new Date().toLocaleDateString();
  const todayCollections = repayments
    .filter((r) => r.date.includes(todayStr) || r.date.includes('2026-07-26'))
    .reduce((acc, r) => acc + r.amount, 0);

  // Financial Chart Data (Monthly Disbursements vs Collections)
  const chartData = [
    { month: 'Mar', disbursements: 12000, collections: 8500 },
    { month: 'Apr', disbursements: 18000, collections: 14200 },
    { month: 'May', disbursements: 15000, collections: 16800 },
    { month: 'Jun', disbursements: 22000, collections: 19500 },
    { month: 'Jul', disbursements: 28000, collections: totalCollectedToDate || 22400 },
  ];

  // Portfolio Risk Breakdown
  const riskData = [
    { name: 'Low Risk (Active)', value: loans.filter((l) => l.status === 'Active').length || 2, color: '#2563EB' },
    { name: 'Overdue / Warning', value: overdueLoans.length || 1, color: '#E11D48' },
    { name: 'Pending Approval', value: pendingApps.length || 1, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex justify-between items-center shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-400" /> Executive Staff Suite
          </div>
          <h2 className="text-xl font-extrabold mt-1 tracking-tight">Logged in as {activeStaff.name} ({activeStaff.role})</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Role Permission Scope: {activeStaff.role === 'Super Admin' ? 'Full System & Settings Control' : `${activeStaff.role} Operations`}
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Hours</div>
          <div className="text-xs font-extrabold text-blue-300">{companySettings.businessHours}</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-2 hover:-translate-y-0.5 transition-transform">
          <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCustomers}</div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-1 rounded-full w-4/5"></div>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +12% this month
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-2 hover:-translate-y-0.5 transition-transform">
          <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <span>Active Loans</span>
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{activeLoansList.length}</div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-1 rounded-full w-2/3"></div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">In good standing</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-2 hover:-translate-y-0.5 transition-transform">
          <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <span>Pending Apps</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingApps.length}</div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-1 rounded-full w-1/2"></div>
          </div>
          <div className="text-[10px] text-amber-700 font-bold">Requires Review</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-2 hover:-translate-y-0.5 transition-transform">
          <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <span>Today's Cashier</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{formatCurrency(todayCollections, companySettings.currencySymbol)}</div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-1 rounded-full w-3/4"></div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Live cashier tally</div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-2 hover:-translate-y-0.5 transition-transform">
          <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <span>Outstanding</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatCurrency(totalOutstanding, companySettings.currencySymbol)}</div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-1 rounded-full w-4/5"></div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Principal + Interest</div>
        </div>

        {/* Metric 6 */}
        <div className="bg-white rounded-2xl p-4 border border-rose-200 bg-rose-50/20 shadow-sm space-y-2 hover:-translate-y-0.5 transition-transform">
          <div className="flex justify-between items-center text-rose-700 text-[10px] font-bold uppercase tracking-wider">
            <span>Overdue Loans</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{overdueLoans.length}</div>
          <div className="w-full bg-rose-100 h-1 rounded-full overflow-hidden">
            <div className="bg-rose-600 h-1 rounded-full w-full"></div>
          </div>
          <div className="text-[10px] text-rose-600 font-bold">Auto Penalties Active</div>
        </div>
      </div>

      {/* Financial Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Monthly Disbursements vs. Collections ({companySettings.currencySymbol || 'MWK'})</h3>
              <p className="text-xs text-slate-500 font-medium">Loan capital issued vs repayments collected over time</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} style={{ fontSize: '11px', fontWeight: 600 }} />
                <YAxis tickLine={false} style={{ fontSize: '11px', fontWeight: 600 }} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val, companySettings.currencySymbol), '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="disbursements" name="Disbursements" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="collections" name="Collections" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Portfolio Risk Distribution</h3>
          <p className="text-xs text-slate-500 font-medium">Loan health breakdown across active portfolio</p>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val} loans`, 'Count']} />
                <Legend style={{ fontSize: '11px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
