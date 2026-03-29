import React, { useEffect, useState } from 'react';
import api from '../../services/apiClient.js';
import { AdminPageLayout } from './AdminDashboard.jsx';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/reviews', { params: { page, limit: 20 } });
      setReviews(r.data.data.reviews || []);
      setTotal(r.data.data.total || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    await api.delete(`/admin/reviews/${id}`);
    load();
  };

  const totalPages = Math.ceil(total / 20);

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <AdminPageLayout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Review & Rating Moderation</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor and remove inappropriate reviews.</p>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-dark-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Course</th>
                  <th className="px-4 py-3 text-left font-semibold">Student</th>
                  <th className="px-4 py-3 text-left font-semibold">Rating</th>
                  <th className="px-4 py-3 text-left font-semibold">Review</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : reviews.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No reviews found.</td></tr>
                ) : reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{r.course?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.student?.firstName || '—'} {r.student?.lastName || ''}</td>
                    <td className="px-4 py-3 text-amber-500">{renderStars(r.rating)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[300px] truncate">{r.reviewText || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(r._id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-dark-700">
              <p className="text-sm text-slate-500">{total} reviews total</p>
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

export default AdminReviewsPage;
