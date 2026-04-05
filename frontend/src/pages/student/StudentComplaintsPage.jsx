import React, { useEffect, useState } from 'react';
import { createComplaintApi, getMyComplaintsApi } from '../../services/complaintApi.js';
import { getStudentEnrolledCoursesApi } from '../../services/courseApi.js';

const REASON_OPTIONS = [
  { value: 'pirated_content', label: '🚫 Pirated / Stolen Content', desc: 'Content appears to be copied or pirated' },
  { value: 'inappropriate_content', label: '⚠️ Inappropriate Content', desc: 'Content is offensive or unsuitable' },
  { value: 'technical_issue', label: '🔧 Technical Issue', desc: 'Videos not playing, broken links, etc.' },
  { value: 'other', label: '💬 Other', desc: 'Any other concern not listed above' },
];

const REASON_LABELS = {
  pirated_content: 'Pirated Content',
  inappropriate_content: 'Inappropriate Content',
  technical_issue: 'Technical Issue',
  other: 'Other',
};

const STATUS_CONFIG = {
  true: { label: 'Resolved', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  false: { label: 'Open', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

const StudentComplaintsPage = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [courseId, setCourseId] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [courses, complaints] = await Promise.all([
        getStudentEnrolledCoursesApi(),
        getMyComplaintsApi(),
      ]);
      setEnrolledCourses(courses || []);
      setMyComplaints(complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId) { setSubmitError('Please select a course.'); return; }
    if (!reason) { setSubmitError('Please select a reason.'); return; }
    if (!description.trim()) { setSubmitError('Please describe your issue.'); return; }

    setSubmitting(true);
    setSubmitError('');
    try {
      await createComplaintApi({ courseId, reason, description });
      setSubmitSuccess(true);
      // Reset form
      setCourseId('');
      setReason('');
      setDescription('');
      // Refresh complaint history
      const updated = await getMyComplaintsApi();
      setMyComplaints(updated || []);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-16 max-w-4xl">

      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl -ml-10 -mb-10" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-5">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Report an Issue</h1>
          <p className="text-slate-300 text-lg max-w-xl">
            Help us improve the platform. Your complaints are reviewed by our admin team and addressed promptly.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ── Left: Complaint Form ── */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6 sm:p-8 border border-slate-200 dark:border-dark-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              New Complaint
            </h2>

            {submitSuccess && (
              <div className="mb-6 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold text-sm">Complaint submitted! Our team will review it shortly.</p>
              </div>
            )}

            {submitError && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold text-sm">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Course <span className="text-red-500">*</span>
                </label>
                {enrolledCourses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 dark:border-dark-700 px-4 py-5 text-center text-slate-500 dark:text-slate-400 text-sm">
                    You're not enrolled in any courses yet.
                  </div>
                ) : (
                  <select
                    id="complaint-course-select"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  >
                    <option value="">— Choose a course —</option>
                    {enrolledCourses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Reason Cards */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Type of Issue <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {REASON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      id={`reason-${opt.value}`}
                      onClick={() => setReason(opt.value)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        reason === opt.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-slate-200 dark:border-dark-700 hover:border-slate-300 dark:hover:border-dark-600 bg-white dark:bg-dark-900'
                      }`}
                    >
                      <p className={`font-semibold text-sm mb-1 ${reason === opt.value ? 'text-primary-700 dark:text-primary-300' : 'text-slate-800 dark:text-slate-200'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" htmlFor="complaint-description">
                  Describe the Issue <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="complaint-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Please provide as much detail as possible — timestamps, screenshots descriptions, etc."
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                />
                <p className="text-xs text-slate-400 mt-1.5 text-right">{description.length} / 1000</p>
              </div>

              {/* Submit */}
              <button
                id="submit-complaint-btn"
                type="submit"
                disabled={submitting || enrolledCourses.length === 0}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide transition-all shadow-md shadow-red-600/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Complaint
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: Info Panel ── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card p-6 border border-slate-200 dark:border-dark-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What happens next?
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              {[
                { step: '1', text: 'Your complaint is logged and assigned to our review team.' },
                { step: '2', text: 'We investigate the issue with the course instructor.' },
                { step: '3', text: 'Action is taken — from a warning to course removal.' },
                { step: '4', text: 'Your complaint status updates to Resolved.' },
              ].map(({ step, text }) => (
                <li key={step} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{step}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6 border border-slate-200 dark:border-dark-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Your complaints are confidential
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your identity is only shared with admin staff when investigating serious issues. Instructors are not informed who filed a complaint.
            </p>
          </div>
        </div>
      </div>

      {/* ── Complaint History ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          My Complaint History
          <span className="ml-1 text-xs font-semibold bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 px-2. py-0.5 rounded-full px-2">
            {myComplaints.length}
          </span>
        </h2>

        {myComplaints.length === 0 ? (
          <div className="glass-card p-12 text-center border border-dashed border-slate-200 dark:border-dark-700">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">No complaints yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">You haven't submitted any complaints. Use the form above to report an issue.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myComplaints.map((c) => {
              const status = STATUS_CONFIG[String(c.isResolved)];
              return (
                <div key={c._id} className="glass-card border border-slate-200 dark:border-dark-800 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Course thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-800 shrink-0">
                      {c.course?.thumbnailUrl ? (
                        <img src={c.course.thumbnailUrl} alt={c.course?.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm">{c.course?.name || 'Unknown Course'}</h3>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${status.cls}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">
                        {REASON_LABELS[c.reason] || c.reason}
                      </p>
                      {c.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{c.description}</p>
                      )}
                    </div>

                    {/* Date */}
                    <div className="text-xs text-slate-400 dark:text-slate-500 shrink-0 text-right">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentComplaintsPage;
