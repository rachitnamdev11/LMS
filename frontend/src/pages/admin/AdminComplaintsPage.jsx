import React, { useEffect, useState } from 'react';
import api from '../../services/apiClient.js';
import { AdminPageLayout } from './AdminDashboard.jsx';

const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/complaints').then((r) => r.data.data);
      setComplaints(res || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id, removeCourse) => {
    if (removeCourse && !window.confirm('Resolve and remove the course?')) return;
    await api.post('/admin/complaints/resolve', { complaintId: id, removeCourse });
    load();
  };

  return (
    <AdminPageLayout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Complaints Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and resolve issues reported by users and instructors.</p>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-dark-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Course</th>
                  <th className="px-4 py-3 text-left font-semibold">Student</th>
                  <th className="px-4 py-3 text-left font-semibold">Reason</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : complaints.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No complaints.</td></tr>
                ) : complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{c.course?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.student?.firstName} {c.student?.lastName}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[250px] truncate">{c.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.isResolved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {c.isResolved ? 'Resolved' : 'Open'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {!c.isResolved && (
                          <>
                            <button onClick={() => handleResolve(c._id, false)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 transition-colors">
                              Resolve
                            </button>
                            <button onClick={() => handleResolve(c._id, true)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 transition-colors">
                              Remove Course
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default AdminComplaintsPage;
