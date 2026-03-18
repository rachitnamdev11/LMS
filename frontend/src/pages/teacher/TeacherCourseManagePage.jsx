import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourseDetailApi } from '../../services/courseApi.js';
import { createLectureApi, deleteLectureApi } from '../../services/lectureApi.js';
import { useAuth } from '../../hooks/useAuth.js';

const TeacherCourseManagePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', order: 1 });
  const [videoFile, setVideoFile] = useState(null);
  const [creatingLecture, setCreatingLecture] = useState(false);

  const load = async () => {
    const res = await getCourseDetailApi(courseId);
    setCourse(res.course);
    setLectures(res.lectures || []);
  };

  useEffect(() => {
    load();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateLecture = async (e) => {
    e.preventDefault();
    setCreatingLecture(true);
    try {
      await createLectureApi(courseId, {
        title: form.title,
        description: form.description,
        order: form.order,
        videoFile
      });
      setForm({ title: '', description: '', order: 1 });
      setVideoFile(null);
      load();
    } finally {
      setCreatingLecture(false);
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    const confirmed = window.confirm('Are you sure you want to delete this lecture? This cannot be undone.');
    if (!confirmed) return;
    await deleteLectureApi(lectureId);
    load();
  };

  // Loading state
  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Manage: {course.name}
          </h1>
          <p className="text-slate-500 mt-1">Add, reorder, or remove lectures for this course.</p>
        </div>
        <Link
          to="/teacher/courses"
          className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          All Courses
        </Link>
      </div>

      {/* Add Lecture Form */}
      <form onSubmit={handleCreateLecture} className="glass-card p-6 md:p-8 space-y-6 border border-slate-200 dark:border-dark-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Lecture</h2>
        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="e.g. Introduction to React"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Brief description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Order</label>
            <input
              name="order"
              type="number"
              value={form.order}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 cursor-pointer"
          />
        </div>
        <button
          type="submit"
          disabled={creatingLecture}
          className="px-6 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {creatingLecture ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Uploading...
            </>
          ) : (
            'Add Lecture'
          )}
        </button>
      </form>

      {/* Lectures List */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lectures</h2>
          <p className="text-slate-500 font-medium">{lectures.length} total</p>
        </div>

        {lectures.length === 0 ? (
          <div className="bg-slate-50 dark:bg-dark-800/50 border border-dashed border-slate-300 dark:border-dark-700 rounded-2xl p-10 text-center text-slate-500">
            No lectures have been added yet. Use the form above to add your first lecture.
          </div>
        ) : (
          <div className="glass-card border border-slate-200 dark:border-dark-800 overflow-hidden shadow-sm">
            <ul className="divide-y divide-slate-100 dark:divide-dark-800">
              {lectures.map((l, index) => (
                <li key={l._id} className="group hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-200">{l.title}</h4>
                      {l.description && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{l.description}</p>
                      )}
                      <Link
                        to={`/teacher/lectures/${l._id}/doubts`}
                        className="text-xs font-medium text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 mt-1 inline-block"
                      >
                        View doubts →
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {l.videoUrl && (
                        <a
                          href={l.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-dark-600 transition-colors"
                        >
                          Preview
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteLecture(l._id)}
                        className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};

export default TeacherCourseManagePage;



