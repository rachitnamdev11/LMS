import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTeacherCoursesApi, createCourseApi, publishCourseApi, deleteCourseApi } from '../../services/teacherApi.js';
import { useAuth } from '../../hooks/useAuth.js';

const TeacherCoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    language: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null); // courseId being deleted

  const load = async () => {
    const res = await getTeacherCoursesApi();
    setCourses(res || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createCourseApi({ ...form, thumbnailFile });
      setForm({ name: '', description: '', price: 0, category: '', language: '' });
      setThumbnailFile(null);
      load();
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (courseId) => {
    await publishCourseApi(courseId);
    load();
  };

  const handleDelete = async (courseId, courseName) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone and all lectures within this course will be permanently removed.`);
    if (!confirmed) return;
    setDeleting(courseId);
    try {
      await deleteCourseApi(courseId);
      load();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Courses</h1>

      {/* Create Course Form */}
      <form onSubmit={handleCreate} className="glass-card p-6 md:p-8 space-y-6 border border-slate-200 dark:border-dark-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Course</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="e.g. React Masterclass"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Short description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Price (₹)</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="e.g. Web Dev"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Language</label>
            <input
              name="language"
              value={form.language}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="e.g. English"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-900/50 cursor-pointer"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="px-6 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {creating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Creating...
            </>
          ) : (
            'Create Course'
          )}
        </button>
      </form>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <div className="bg-slate-50 dark:bg-dark-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-dark-700 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Courses Yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Create your first course using the form above to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div key={c._id} className="group glass-card flex flex-col overflow-hidden border border-slate-200 dark:border-dark-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
              {/* Thumbnail */}
              <div className="aspect-video bg-slate-200 dark:bg-dark-800 relative overflow-hidden">
                {c.thumbnailUrl ? (
                  <img src={c.thumbnailUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50">
                    <svg className="w-12 h-12 text-indigo-300 dark:text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  </div>
                )}
                {/* Status Badge */}
                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.isPublished ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                  {c.isPublished ? 'Published' : 'Draft'}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{c.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{c.description}</p>
                
                {/* Instructor Info */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">
                    {user?.firstName?.charAt(0) || 'I'}
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="font-black text-slate-900 dark:text-white">₹{c.price}</span>
                  <div className="flex items-center gap-1">
                    {c.ratingsSummary && (
                      <>
                        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{Number(c.ratingsSummary.averageRating || 0).toFixed(1)}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {c.category && (
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-dark-800 px-2 py-1 rounded-md w-fit mb-4">{c.category}</span>
                )}

                {/* Actions */}
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-dark-800 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    {!c.isPublished && (
                      <button
                        type="button"
                        onClick={() => handlePublish(c._id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    <Link
                      to={`/teacher/courses/${c._id}/manage`}
                      className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Manage
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(c._id, c.name)}
                    disabled={deleting === c._id}
                    className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {deleting === c._id ? (
                      <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCoursesPage;


