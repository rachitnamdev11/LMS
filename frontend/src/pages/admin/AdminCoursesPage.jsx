import React, { useEffect, useState } from 'react';
import api from '../../services/apiClient.js';
import { AdminPageLayout } from './AdminDashboard.jsx';

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const r = await api.get('/admin/courses', { params });
      setCourses(r.data.data.courses || []);
      setTotal(r.data.data.total || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  const handleApprove = async (id) => { await api.put(`/admin/courses/approve/${id}`); load(); };
  const handleReject = async (id) => {
    if (!window.confirm('Reject this course?')) return;
    await api.put(`/admin/courses/reject/${id}`);
    load();
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course and all its lectures? This cannot be undone.')) return;
    await api.delete(`/admin/courses/${id}`);
    load();
  };

  const totalPages = Math.ceil(total / 15);
  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <AdminPageLayout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Course Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Approve, reject, and manage all courses on the platform.</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
            <input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none" />
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Search</button>
          </form>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-slate-900 dark:text-white">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-dark-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Instructor</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Enrollments</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : courses.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No courses found.</td></tr>
                ) : courses.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 max-w-[200px] truncate">{c.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.instructor?.firstName || '—'} {c.instructor?.lastName || ''}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.category || '—'}</td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">₹{c.price}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[c.status] || statusColors.pending}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.enrolledStudents?.length || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {c.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(c._id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 transition-colors">Approve</button>
                            <button onClick={() => handleReject(c._id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 transition-colors">Reject</button>
                          </>
                        )}
                        {c.status === 'rejected' && (
                          <button onClick={() => handleApprove(c._id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 transition-colors">Approve</button>
                        )}
                        <button onClick={() => handleDelete(c._id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-dark-700">
              <p className="text-sm text-slate-500">{total} courses total</p>
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

export default AdminCoursesPage;
