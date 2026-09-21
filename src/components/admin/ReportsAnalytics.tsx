import React, { useState } from 'react';
import { BarChart2, Download, Calendar, DollarSign, FileSpreadsheet, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/currency';

export const ReportsAnalytics: React.FC = () => {
  const { loans, repayments, companySettings, customers } = useApp();
  const [reportType, setReportType] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Annual'>('Monthly');

  const totalDisbursed = loans.reduce((acc, l) => acc + l.principal, 0);
  const totalCollected = repayments.reduce((acc, r) => acc + r.amount, 0);
  const totalInterestEarned = loans.reduce((acc, l) => acc + l.totalInterest, 0);
  const totalPenaltiesCollected = loans.reduce((acc, l) => acc + l.penaltiesAccrued, 0);

  const handleExportCSV = () => {
    const csvRows = [
      ['Report Type', reportType],
      ['Generated Date', new Date().toLocaleString()],
      ['Company', companySettings.companyName],
      [],
      ['Metric', `Value (${companySettings.currencyCode || 'MWK'})`],
      ['Total Loans Disbursed', totalDisbursed],
      ['Total Repayments Collected', totalCollected],
      ['Total Interest Earned', totalInterestEarned],
      ['Total Penalties Collected', totalPenaltiesCollected],
      ['Active Customers Count', customers.length],
      [],
      ['Loan ID', 'Customer', 'Principal', 'Balance', 'Status'],
      ...loans.map((l) => [l.id, l.customerName, l.principal, l.balance, l.status]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${companySettings.companyName}_${reportType}_Financial_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-teal-600" /> Executive Financial Reports & Portfolio Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export daily, weekly, monthly, or annual financial statements for CashFirst Finance.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV / Excel
          </button>
          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
          >
            <Printer className="w-4 h-4" /> Print PDF Summary
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl text-xs font-semibold max-w-md">
        {(['Daily', 'Weekly', 'Monthly', 'Annual'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setReportType(t)}
            className={`flex-1 py-2 rounded-lg transition-all ${
              reportType === t ? 'bg-teal-700 text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t} Report
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-semibold block">Total Loans Capital Issued</span>
          <div className="text-2xl font-black text-slate-900">{formatCurrency(totalDisbursed, companySettings.currencySymbol)}</div>
          <p className="text-[10px] text-slate-400">Total principal disbursed to date</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-semibold block">Total Repayments Collected</span>
          <div className="text-2xl font-black text-emerald-700">{formatCurrency(totalCollected, companySettings.currencySymbol)}</div>
          <p className="text-[10px] text-emerald-600">Principal + interest payments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-semibold block">Total Interest Yield</span>
          <div className="text-2xl font-black text-teal-800">{formatCurrency(totalInterestEarned, companySettings.currencySymbol)}</div>
          <p className="text-[10px] text-teal-600">Net interest income</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-semibold block">Total Penalties Accrued</span>
          <div className="text-2xl font-black text-rose-700">{formatCurrency(totalPenaltiesCollected, companySettings.currencySymbol)}</div>
          <p className="text-[10px] text-rose-600">Overdue fees charged</p>
        </div>
      </div>

      {/* Detailed Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Portfolio Breakdown Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3">Loan Account</th>
                <th className="p-3">Borrower Name</th>
                <th className="p-3">Principal</th>
                <th className="p-3">Interest Rate</th>
                <th className="p-3">Total Payable</th>
                <th className="p-3">Total Paid</th>
                <th className="p-3">Outstanding Balance</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">{l.id}</td>
                  <td className="p-3">{l.customerName}</td>
                  <td className="p-3">{formatCurrency(l.principal, companySettings.currencySymbol)}</td>
                  <td className="p-3">{l.interestRate}% ({l.interestType})</td>
                  <td className="p-3 font-bold">{formatCurrency(l.totalPayable, companySettings.currencySymbol)}</td>
                  <td className="p-3 text-emerald-700 font-semibold">{formatCurrency(l.totalPaid, companySettings.currencySymbol)}</td>
                  <td className="p-3 font-bold text-teal-800">{formatCurrency(l.balance, companySettings.currencySymbol)}</td>
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
      </div>
    </div>
  );
};
