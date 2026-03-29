import React, { useEffect, useState } from 'react';
import api from '../../services/apiClient.js';
import { AdminPageLayout } from './AdminDashboard.jsx';

const ACTION_LABELS = {
  block_user: { label: 'Blocked User', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  unblock_user: { label: 'Unblocked User', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  delete_user: { label: 'Deleted User', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  approve_course: { label: 'Approved Course', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  reject_course: { label: 'Rejected Course', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  delete_course: { label: 'Deleted Course', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  delete_review: { label: 'Deleted Review', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  refund_payment: { label: 'Refunded Payment', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  broadcast_notification: { label: 'Broadcast Sent', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  resolve_complaint: { label: 'Resolved Complaint', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  update_settings: { label: 'Updated Settings', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
};

const AdminLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/logs', { params: { page, limit: 25 } });
      setLogs(r.data.data.logs || []);
      setTotal(r.data.data.total || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);
  const totalPages = Math.ceil(total / 25);

  return (
    <AdminPageLayout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Logs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Audit trail of all admin actions on the platform.</p>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-dark-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Time</th>
                  <th className="px-4 py-3 text-left font-semibold">Admin</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                  <th className="px-4 py-3 text-left font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No activity logs found.</td></tr>
                ) : logs.map((log) => {
                  const info = ACTION_LABELS[log.action] || { label: log.action, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
                  return (
                    <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{log.user?.email || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${info.color}`}>{info.label}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs max-w-[300px] truncate">
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-dark-700">
              <p className="text-sm text-slate-500">{total} logs total</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-dark-700 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">Previous</button>
                <span className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300">{page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-dark-700 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default AdminLogsPage;
