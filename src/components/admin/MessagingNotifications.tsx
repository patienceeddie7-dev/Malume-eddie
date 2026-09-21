import React, { useState } from 'react';
import { Send, MessageSquare, Bell, Smartphone, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MessagingNotifications: React.FC = () => {
  const { companySettings, customers, addNotification, notifications } = useApp();
  const [recipient, setRecipient] = useState<string>('all_customers');
  const [channel, setChannel] = useState<'SMS' | 'Email' | 'Push' | 'WhatsApp'>('SMS');
  const [title, setTitle] = useState('Payment Reminder');
  const [messageText, setMessageText] = useState(companySettings.messagingTemplates.repaymentDue);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    addNotification({
      recipientId: recipient,
      title,
      message: messageText,
      channel,
      type: 'system',
    });

    setDispatchedSuccess(true);
    setTimeout(() => setDispatchedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-teal-600" /> Messaging & SMS Alert Dispatch Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch branded SMS, Email, Push alerts, or WhatsApp notifications to borrowers using company identities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatch Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Send Notification / SMS Broadcast</h3>

          <form onSubmit={handleDispatch} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Recipient</label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value="all_customers">All Active Borrowers ({customers.length})</option>
                  <option value="all_staff">All Staff Members</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      Direct: {c.fullName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Delivery Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value="SMS">SMS Gateway ({companySettings.phone})</option>
                  <option value="Email">Email ({companySettings.email})</option>
                  <option value="Push">App Push Notification</option>
                  <option value="WhatsApp">WhatsApp Support Channel</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Notification Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Branded Message Content</label>
              <textarea
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl"
                rows={4}
              />
            </div>

            {dispatchedSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Message successfully queued & dispatched via {channel} gateway!
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-xl shadow transition-all text-sm flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Dispatch {channel} Alert
            </button>
          </form>
        </div>

        {/* Messaging History */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Recent Messaging Log</h3>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto text-xs">
            {notifications.slice(0, 8).map((n) => (
              <div key={n.id} className="py-2.5 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-teal-800">{n.title}</span>
                  <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">{n.channel}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                <div className="text-[9px] text-slate-400">{n.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
