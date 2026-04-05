import React, { useEffect, useState } from 'react';
import api from '../../services/apiClient.js';
import { AdminPageLayout } from './AdminDashboard.jsx';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  const loadCourses = async () => {
    try {
      const r = await api.get('/admin/courses', { params: { limit: 200 } });
      setCourses(r.data.data.courses || []);
    } catch (err) { console.error(err); }
  };

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, sortBy };
      if (selectedCourse) params.courseId = selectedCourse;
      const r = await api.get('/admin/reviews', { params });
      setReviews(r.data.data.reviews || []);
      setTotal(r.data.data.total || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { setPage(1); }, [selectedCourse, sortBy]);
  useEffect(() => { load(); }, [page, selectedCourse, sortBy]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    await api.delete(`/admin/reviews/${id}`);
    load();
  };

  const totalPages = Math.ceil(total / 20);

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Group reviews by course for display
  const grouped = reviews.reduce((acc, r) => {
    const courseId = r.course?._id || 'unknown';
    const courseName = r.course?.name || 'Unknown Course';
    if (!acc[courseId]) acc[courseId] = { name: courseName, reviews: [] };
    acc[courseId].reviews.push(r);
    return acc;
  }, {});

  return (
    <AdminPageLayout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Review & Rating Moderation</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor and remove inappropriate reviews. Filter and sort by course.</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Filter by Course</label>
            <select
              id="review-course-filter"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Sort By</label>
            <select
              id="review-sort-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="rating_desc">Rating: High → Low</option>
              <option value="rating_asc">Rating: Low → High</option>
            </select>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 self-end pb-2">
            {total} review{total !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Reviews grouped by course */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-500 dark:text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="font-medium">No reviews found.</p>
            {selectedCourse && <p className="text-sm mt-1">Try clearing the course filter.</p>}
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
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full">
                    {group.reviews.length} review{group.reviews.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {/* Review Rows */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white dark:bg-dark-900/30 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-dark-700">
                      <tr>
                        <th className="px-5 py-2.5 text-left font-semibold">Student</th>
                        <th className="px-5 py-2.5 text-left font-semibold">Rating</th>
                        <th className="px-5 py-2.5 text-left font-semibold">Review</th>
                        <th className="px-5 py-2.5 text-left font-semibold">Date</th>
                        <th className="px-5 py-2.5 text-center font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                      {group.reviews.map((r) => (
                        <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                          <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">
                            {r.student?.firstName || '—'} {r.student?.lastName || ''}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              {renderStars(r.rating)}
                              <span className="text-xs font-bold text-amber-500">{r.rating}.0</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-slate-600 dark:text-slate-400 max-w-[260px]">
                            <p className="truncate">{r.reviewText || <span className="italic opacity-60">No text</span>}</p>
                          </td>
                          <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <button
                              onClick={() => handleDelete(r._id)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-slate-500">{total} reviews total</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-dark-700 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">Previous</button>
              <span className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-dark-700 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
};

export default AdminReviewsPage;
