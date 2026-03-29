import React, { useEffect, useState } from 'react';
import api from '../../services/apiClient.js';
import { AdminPageLayout } from './AdminDashboard.jsx';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalTransactions: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const r = await api.get('/admin/payments', { params });
      setPayments(r.data.data.payments || []);
      setTotal(r.data.data.total || 0);
      setSummary(r.data.data.summary || { totalRevenue: 0, totalTransactions: 0 });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const handleRefund = async (id) => {
    if (!window.confirm('Issue refund for this payment?')) return;
    await api.put(`/admin/payments/refund/${id}`);
    load();
  };

  const totalPages = Math.ceil(total / 15);
  const statusColors = {
    created: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    refunded: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <AdminPageLayout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment & Revenue</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View transactions and manage refunds.</p>
        </div>

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{summary.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Total Revenue</p>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.totalTransactions}</p>
              <p className="text-sm text-slate-500">Total Transactions</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex items-center gap-4">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-slate-900 dark:text-white">
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="created">Created</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-dark-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Student</th>
                  <th className="px-4 py-3 text-left font-semibold">Course</th>
                  <th className="px-4 py-3 text-left font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No payments found.</td></tr>
                ) : payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{p.student?.firstName || '—'} {p.student?.lastName || ''}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.course?.name || '—'}</td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">₹{p.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[p.status] || ''}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      {p.status === 'paid' && (
                        <button onClick={() => handleRefund(p._id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 transition-colors">Refund</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-dark-700">
              <p className="text-sm text-slate-500">{total} payments total</p>
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

export default AdminPaymentsPage;
