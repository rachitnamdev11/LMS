import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourseDetailApi } from '../../services/courseApi.js';
import { createLectureApi, deleteLectureApi, addOrUpdateLectureNotesApi } from '../../services/lectureApi.js';
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
  // Notes state: tracks which lecture has its editor open, the chosen PDF file, and save status
  const [notesEditorOpen, setNotesEditorOpen] = useState({}); // { [lectureId]: boolean }
  const [notesPdfFile, setNotesPdfFile] = useState({});       // { [lectureId]: File }
  const [notesSaving, setNotesSaving] = useState({});         // { [lectureId]: 'saving'|'saved'|'error'|null }

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

  const handleToggleNotesEditor = (lecture) => {
    const lid = lecture._id;
    setNotesEditorOpen((prev) => ({ ...prev, [lid]: !prev[lid] }));
  };

  const handleSaveNotes = async (lectureId) => {
    const file = notesPdfFile[lectureId];
    if (!file) return;
    setNotesSaving((prev) => ({ ...prev, [lectureId]: 'saving' }));
    try {
      await addOrUpdateLectureNotesApi(lectureId, file);
      setNotesSaving((prev) => ({ ...prev, [lectureId]: 'saved' }));
      // Refresh lectures to show updated notesUrl
      load();
      setTimeout(() => setNotesSaving((prev) => ({ ...prev, [lectureId]: null })), 2500);
    } catch {
      setNotesSaving((prev) => ({ ...prev, [lectureId]: 'error' }));
      setTimeout(() => setNotesSaving((prev) => ({ ...prev, [lectureId]: null })), 3000);
    }
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
                  <li key={l._id} className="group transition-colors">
                    <div className="p-5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-dark-800/50">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-200">{l.title}</h4>
                        {l.description && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{l.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <Link
                            to={`/teacher/lectures/${l._id}/doubts`}
                            className="text-xs font-medium text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300"
                          >
                            View doubts →
                          </Link>
                          <Link
                            to={`/teacher/lectures/${l._id}/test`}
                            className="text-xs font-medium text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                            Manage Test
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleToggleNotesEditor(l)}
                            className="text-xs font-medium text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            {notesEditorOpen[l._id] ? 'Close Notes' : (l.notes ? 'Edit Notes' : 'Add Notes')}
                          </button>
                        </div>
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

                    {/* Inline Notes Editor — PDF upload, shown when open */}
                    {notesEditorOpen[l._id] && (
                      <div className="px-5 pb-5 border-t border-slate-100 dark:border-dark-800 bg-amber-50/40 dark:bg-amber-900/5">
                        <div className="pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              Upload Notes PDF
                            </h5>
                            {notesSaving[l._id] === 'saved' && (
                              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Uploaded!
                              </span>
                            )}
                            {notesSaving[l._id] === 'error' && (
                              <span className="text-xs font-semibold text-red-600">Upload failed. Try again.</span>
                            )}
                          </div>

                          {/* Show existing PDF info */}
                          {l.notesUrl && (
                            <div className="flex items-center gap-2 text-xs bg-white dark:bg-dark-900 border border-amber-200 dark:border-amber-800/40 rounded-lg px-3 py-2">
                              <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                              <span className="flex-1 font-medium text-slate-600 dark:text-slate-300">PDF already uploaded</span>
                              <a href={l.notesUrl} target="_blank" rel="noreferrer" className="text-amber-600 hover:text-amber-800 font-semibold underline">Preview</a>
                            </div>
                          )}

                          {/* PDF File Picker */}
                          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-xl cursor-pointer bg-white dark:bg-dark-900 hover:border-amber-400 transition-colors">
                            <div className="flex flex-col items-center justify-center py-2">
                              <svg className="w-7 h-7 mb-1.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                              {notesPdfFile[l._id] ? (
                                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 px-4 text-center truncate max-w-xs">{notesPdfFile[l._id].name}</p>
                              ) : (
                                <p className="text-sm text-slate-500"><span className="font-semibold text-amber-600">Click to select</span> a PDF file</p>
                              )}
                              <p className="text-xs text-slate-400 mt-0.5">PDF only · max 20MB</p>
                            </div>
                            <input
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setNotesPdfFile((prev) => ({ ...prev, [l._id]: file }));
                              }}
                            />
                          </label>

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setNotesEditorOpen((prev) => ({ ...prev, [l._id]: false }))}
                              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 dark:bg-dark-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-600 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveNotes(l._id)}
                              disabled={!notesPdfFile[l._id] || notesSaving[l._id] === 'saving'}
                              className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {notesSaving[l._id] === 'saving' ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                  Uploading...
                                </>
                              ) : 'Upload PDF'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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



