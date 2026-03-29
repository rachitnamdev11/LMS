import React, { useState } from 'react';
import api from '../../services/apiClient.js';
import { AdminPageLayout } from './AdminDashboard.jsx';

const AdminNotificationsPage = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const r = await api.post('/admin/notifications/broadcast', { title, message, targetAudience });
      setResult({ success: true, count: r.data.data.sent });
      setTitle('');
      setMessage('');
    } catch (err) {
      setResult({ success: false, error: err.response?.data?.message || 'Failed to send' });
    }
    setSending(false);
  };

  return (
    <AdminPageLayout>
      <div className="space-y-6 pb-10 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Broadcast Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Send announcements to all users, students only, or instructors only.</p>
        </div>

        <form onSubmit={handleSend} className="glass-card p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Target Audience</label>
            <div className="flex gap-3">
              {[{ value: 'all', label: 'All Users' }, { value: 'student', label: 'Students Only' }, { value: 'teacher', label: 'Instructors Only' }].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTargetAudience(opt.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${targetAudience === opt.value ? 'bg-red-600 text-white shadow-md' : 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-700'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New Course Launch 🎉"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement message here..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-600/20"
          >
            {sending ? 'Sending...' : 'Send Broadcast'}
          </button>

          {result && (
            <div className={`p-4 rounded-xl text-sm ${result.success ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
              {result.success ? `✅ Notification sent to ${result.count} users successfully!` : `❌ ${result.error}`}
            </div>
          )}
        </form>
      </div>
    </AdminPageLayout>
  );
};

export default AdminNotificationsPage;
