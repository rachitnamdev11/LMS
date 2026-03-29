import React, { useEffect, useState } from 'react';
import api from '../../services/apiClient.js';
import { AdminPageLayout } from './AdminDashboard.jsx';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const r = await api.get('/admin/users', { params });
      setUsers(r.data.data.users || []);
      setTotal(r.data.data.total || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, roleFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleBlock = async (id) => {
    if (!window.confirm('Block this user?')) return;
    await api.put(`/admin/users/block/${id}`);
    load();
  };

  const handleUnblock = async (id) => {
    await api.put(`/admin/users/unblock/${id}`);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    await api.delete(`/admin/users/${id}`);
    load();
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <AdminPageLayout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View, block, and manage all platform users.</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Search</button>
          </form>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-slate-900 dark:text-white">
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-slate-900 dark:text-white">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-dark-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Joined</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No users found.</td></tr>
                ) : users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {u.firstName || u.lastName ? `${u.firstName} ${u.lastName}`.trim() : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.role === 'student' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : u.role === 'teacher' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.isBlocked ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {u.role !== 'admin' && (
                          <>
                            {u.isBlocked ? (
                              <button onClick={() => handleUnblock(u._id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">Unblock</button>
                            ) : (
                              <button onClick={() => handleBlock(u._id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">Block</button>
                            )}
                            <button onClick={() => handleDelete(u._id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-dark-700">
              <p className="text-sm text-slate-500">{total} users total</p>
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

export default AdminUsersPage;
