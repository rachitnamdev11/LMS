import React, { useEffect, useState } from 'react';
import api from '../../services/apiClient.js';
import { AdminPageLayout } from './AdminDashboard.jsx';

const REASON_LABELS = {
  pirated_content: 'Pirated Content',
  inappropriate_content: 'Inappropriate Content',
  technical_issue: 'Technical Issue',
  other: 'Other'
};

const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'open' | 'resolved'

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
    if (removeCourse && !window.confirm('Resolve and permanently remove the course? This cannot be undone.')) return;
    await api.post('/admin/complaints/resolve', { complaintId: id, removeCourse });
    load();
  };

  // Apply status filter
  const filtered = complaints.filter((c) => {
    if (filterStatus === 'open') return !c.isResolved;
    if (filterStatus === 'resolved') return c.isResolved;
    return true;
  });

  // Group by course
  const grouped = filtered.reduce((acc, c) => {
    const courseId = c.course?._id || 'unknown';
    const courseName = c.course?.name || 'Unknown Course';
    if (!acc[courseId]) acc[courseId] = { name: courseName, complaints: [] };
    acc[courseId].complaints.push(c);
    return acc;
  }, {});

  const openCount = complaints.filter((c) => !c.isResolved).length;
  const resolvedCount = complaints.filter((c) => c.isResolved).length;

  return (
    <AdminPageLayout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Complaints Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and resolve issues reported by students and instructors, grouped by course.</p>
        </div>

        {/* Summary + Filter */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl overflow-hidden text-sm font-semibold">
            {[
              { label: `All (${complaints.length})`, value: 'all' },
              { label: `Open (${openCount})`, value: 'open' },
              { label: `Resolved (${resolvedCount})`, value: 'resolved' }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`px-4 py-2 transition-colors ${filterStatus === opt.value ? 'bg-red-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped Complaints */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-500 dark:text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">No complaints found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([courseId, group]) => (
              <div key={courseId} className="glass-card overflow-hidden">
                {/* Course Header */}
                <div className="px-5 py-3 bg-slate-50 dark:bg-dark-800/70 border-b border-slate-200 dark:border-dark-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{group.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{group.complaints.filter(c => !c.isResolved).length} open</span>
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full">
                      {group.complaints.length} total
                    </span>
                  </div>
                </div>

                {/* Complaint rows */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white dark:bg-dark-900/30 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-dark-700">
                      <tr>
                        <th className="px-5 py-2.5 text-left font-semibold">Submitter</th>
                        <th className="px-5 py-2.5 text-left font-semibold">Role</th>
                        <th className="px-5 py-2.5 text-left font-semibold">Reason</th>
                        <th className="px-5 py-2.5 text-left font-semibold">Description</th>
                        <th className="px-5 py-2.5 text-left font-semibold">Status</th>
                        <th className="px-5 py-2.5 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                      {group.complaints.map((c) => {
                        const isTeacher = c.submitterRole === 'teacher';
                        const submitter = isTeacher ? c.teacher : c.student;
                        const submitterName = submitter
                          ? `${submitter.firstName || ''} ${submitter.lastName || ''}`.trim() || '—'
                          : '—';

                        return (
                          <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">
                              {submitterName}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                isTeacher
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                {isTeacher ? 'Instructor' : 'Student'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                              {REASON_LABELS[c.reason] || c.reason}
                            </td>
                            <td className="px-5 py-3 text-slate-600 dark:text-slate-400 max-w-[220px]">
                              <p className="truncate">{c.description || <span className="italic opacity-60">—</span>}</p>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.isResolved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {c.isResolved ? 'Resolved' : 'Open'}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-center gap-2">
                                {!c.isResolved && (
                                  <>
                                    <button
                                      onClick={() => handleResolve(c._id, false)}
                                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 transition-colors whitespace-nowrap"
                                    >
                                      Resolve
                                    </button>
                                    <button
                                      onClick={() => handleResolve(c._id, true)}
                                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 transition-colors whitespace-nowrap"
                                    >
                                      Remove Course
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
};

export default AdminComplaintsPage;
