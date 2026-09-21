import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Ban,
  MessageSquare,
  ChevronRight,
  Edit3,
  Trash2,
  X,
  Save,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { formatCurrency } from '../../lib/currency';

export const CustomerManagement: React.FC = () => {
  const {
    customers,
    updateCustomerKYC,
    updateCustomerStatus,
    updateCustomerDetails,
    deleteCustomer,
    addNotification,
    loans,
    companySettings,
    activeStaff
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [msgInput, setMsgInput] = useState('');
  const [smsFeedbackMsg, setSmsFeedbackMsg] = useState<string | null>(null);

  // Super Admin Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});

  // Super Admin Delete Confirmation State
  const [isDeleting, setIsDeleting] = useState(false);

  const isSuperAdmin = activeStaff.role === 'Super Admin';

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.nationalId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (cust: Customer) => {
    setEditForm({ ...cust });
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    updateCustomerDetails(selectedCustomer.id, editForm);
    setSelectedCustomer((prev) => (prev ? { ...prev, ...editForm } : null));
    setIsEditing(false);
  };

  const handleConfirmDelete = () => {
    if (!selectedCustomer) return;
    const custId = selectedCustomer.id;
    deleteCustomer(custId);
    setSelectedCustomer(null);
    setIsDeleting(false);
  };

  const handleSendDirectSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !msgInput.trim()) return;

    addNotification({
      recipientId: selectedCustomer.id,
      title: `Message from ${companySettings.companyName} Staff`,
      message: msgInput,
      channel: 'SMS',
      type: 'system',
    });

    setSmsFeedbackMsg(`Direct SMS successfully sent to ${selectedCustomer.fullName} (${selectedCustomer.phone})`);
    setMsgInput('');
    setTimeout(() => {
      setSmsFeedbackMsg(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" /> Customer Relationship & KYC Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">Review borrower identity records, approve KYC documents, or manage account standing.</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, phone, national ID..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-600/30"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-700">
            <span>Customer Directory ({filteredCustomers.length})</span>
            {isSuperAdmin && (
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Super Admin Permissions Active
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No customers found matching "{searchTerm}".</div>
            ) : (
              filteredCustomers.map((cust) => {
                const custLoans = loans.filter((l) => l.customerId === cust.id);
                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    className={`p-4 cursor-pointer hover:bg-slate-50/80 transition-all flex items-center justify-between ${
                      selectedCustomer?.id === cust.id ? 'bg-teal-50/60 border-l-4 border-teal-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {cust.avatarUrl && !cust.avatarUrl.includes('unsplash') ? (
                        <img src={cust.avatarUrl} alt={cust.fullName} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-black text-white font-bold flex items-center justify-center border border-slate-700">
                          <User className="w-5 h-5 text-white stroke-[2.5]" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{cust.fullName}</h4>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                              cust.accountStatus === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : cust.accountStatus === 'Suspended'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {cust.accountStatus}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{cust.phone}</span> • <span>{cust.occupation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Active Loans</div>
                        <div className="text-xs font-bold text-teal-700">{custLoans.length} Loans</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Customer Detail Drawer */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {selectedCustomer ? (
            <div className="space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  {selectedCustomer.avatarUrl && !selectedCustomer.avatarUrl.includes('unsplash') ? (
                    <img src={selectedCustomer.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-slate-700" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-black text-white font-bold flex items-center justify-center border border-slate-700">
                      <User className="w-6 h-6 text-white stroke-[2.5]" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedCustomer.fullName}</h3>
                    <p className="text-slate-500 text-xs">Reg Date: {selectedCustomer.registeredAt}</p>
                  </div>
                </div>

                {/* Super Admin Quick Controls */}
                {isSuperAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(selectedCustomer)}
                      title="Edit Customer Record"
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200 flex items-center gap-1 text-xs font-semibold"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setIsDeleting(true)}
                      title="Delete Customer Record"
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors border border-rose-200 flex items-center gap-1 text-xs font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>

              {/* KYC Status Controls */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">KYC Status</span>
                  <span className="font-bold text-teal-700">{selectedCustomer.kycStatus}</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => updateCustomerKYC(selectedCustomer.id, 'Verified')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve KYC
                  </button>
                  <button
                    onClick={() => updateCustomerKYC(selectedCustomer.id, 'Rejected')}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject KYC
                  </button>
                </div>
              </div>

              {/* Account Status Controls */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">Account Standing Actions</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateCustomerStatus(selectedCustomer.id, 'Active')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => updateCustomerStatus(selectedCustomer.id, 'Suspended')}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-semibold"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => updateCustomerStatus(selectedCustomer.id, 'Blacklisted')}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <Ban className="w-3.5 h-3.5" /> Blacklist
                  </button>
                </div>
              </div>

              {/* Verified Info */}
              <div className="space-y-1.5 text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex justify-between"><span className="text-slate-400">Email:</span> <span className="font-semibold text-slate-800">{selectedCustomer.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Phone:</span> <span className="font-semibold text-slate-800">{selectedCustomer.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">National ID:</span> <span className="font-semibold text-slate-800">{selectedCustomer.nationalId}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Monthly Income:</span> <span className="font-bold text-slate-900">{formatCurrency(selectedCustomer.monthlyIncome, companySettings.currencySymbol)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Expenses:</span> <span>{formatCurrency(selectedCustomer.monthlyExpenses, companySettings.currencySymbol)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Address:</span> <span className="truncate max-w-[150px]">{selectedCustomer.address}</span></div>
                {selectedCustomer.employer && <div className="flex justify-between"><span className="text-slate-400">Employer:</span> <span>{selectedCustomer.employer}</span></div>}
                {selectedCustomer.bankName && <div className="flex justify-between"><span className="text-slate-400">Bank:</span> <span>{selectedCustomer.bankName} ({selectedCustomer.accountNumber})</span></div>}
              </div>

              {/* Direct SMS Dispatch */}
              <form onSubmit={handleSendDirectSMS} className="border-t border-slate-100 pt-3 space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-600" /> Send SMS Alert
                </label>
                <textarea
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  placeholder={`Type message to send via ${companySettings.companyName} SMS gateway...`}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  rows={2}
                />
                <button
                  type="submit"
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 rounded-lg text-xs"
                >
                  Send Direct SMS
                </button>
                {smsFeedbackMsg && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-medium flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{smsFeedbackMsg}</span>
                  </div>
                )}
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select a customer from the left list to review KYC documents and update standing.
            </div>
          )}
        </div>
      </div>

      {/* Super Admin Edit Modal */}
      {isEditing && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Edit Customer Record (Super Admin)</h3>
              </div>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName || ''}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">National ID / Passport</label>
                  <input
                    type="text"
                    required
                    value={editForm.nationalId || ''}
                    onChange={(e) => setEditForm({ ...editForm, nationalId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Occupation</label>
                  <input
                    type="text"
                    value={editForm.occupation || ''}
                    onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Employer / Company</label>
                  <input
                    type="text"
                    value={editForm.employer || ''}
                    onChange={(e) => setEditForm({ ...editForm, employer: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Monthly Income ({companySettings.currencySymbol})</label>
                  <input
                    type="number"
                    value={editForm.monthlyIncome || 0}
                    onChange={(e) => setEditForm({ ...editForm, monthlyIncome: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Monthly Expenses ({companySettings.currencySymbol})</label>
                  <input
                    type="number"
                    value={editForm.monthlyExpenses || 0}
                    onChange={(e) => setEditForm({ ...editForm, monthlyExpenses: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Next of Kin Name</label>
                  <input
                    type="text"
                    value={editForm.nextOfKinName || ''}
                    onChange={(e) => setEditForm({ ...editForm, nextOfKinName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Next of Kin Phone</label>
                  <input
                    type="text"
                    value={editForm.nextOfKinPhone || ''}
                    onChange={(e) => setEditForm({ ...editForm, nextOfKinPhone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={editForm.bankName || ''}
                    onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Account Number</label>
                  <input
                    type="text"
                    value={editForm.accountNumber || ''}
                    onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Customer Record?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete customer record for <strong className="text-slate-900">{selectedCustomer.fullName}</strong> ({selectedCustomer.email})? This operation will remove the record from Cloud Firestore and the database.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => setIsDeleting(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-4 h-4" /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
