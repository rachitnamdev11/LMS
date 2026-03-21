import React, { useState, useEffect } from 'react';
import { getInstructorDoubtsApi, replyDoubtApi } from '../../services/doubtApi.js';

const TeacherDoubtsPage = () => {
  const [doubts, setDoubts] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [isSubmitting, setIsSubmitting] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInstructorDoubtsApi()
      .then(data => {
        setDoubts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const pendingDoubtsCount = doubts.filter(d => d.replies.length === 0).length;

  const handleReply = async (doubtId) => {
    if (!replyText[doubtId]?.trim()) return;
    setIsSubmitting(prev => ({ ...prev, [doubtId]: true }));
    try {
      const updatedDoubt = await replyDoubtApi(doubtId, replyText[doubtId]);
      setDoubts(prev => prev.map(d => d._id === doubtId ? updatedDoubt : d));
      setReplyText(prev => ({ ...prev, [doubtId]: '' }));
    } catch (err) {
      console.error('Failed to reply:', err);
    } finally {
      setIsSubmitting(prev => ({ ...prev, [doubtId]: false }));
    }
  };

  // Group doubts by lecture
  const doubtsByLecture = doubts.reduce((acc, d) => {
    if (!d.lecture || !d.course) return acc;
    const key = d.lecture._id;
    if (!acc[key]) {
      acc[key] = {
        courseTitle: d.course.title,
        lectureTitle: d.lecture.title,
        lectureOrder: d.lecture.order,
        doubts: []
      };
    }
    acc[key].doubts.push(d);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8 pb-12">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-dark-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
            </span>
            Student Doubts Q&A
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage and reply to student questions across all your courses.
          </p>
        </div>
        
        <div className="glass-card px-6 py-4 flex items-center gap-4 border border-rose-200 dark:border-rose-900/30">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Action Required</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{pendingDoubtsCount} <span className="text-lg font-bold text-rose-500/70">Pending</span></p>
          </div>
        </div>
      </div>

      {Object.keys(doubtsByLecture).length === 0 ? (
        <div className="glass-card p-16 text-center text-slate-500 font-medium">
          <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="text-xl text-slate-700 dark:text-slate-300 font-bold mb-2">You're all caught up!</p>
          <p>You have no student doubts yet waiting for replies.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(doubtsByLecture).map(([lectureId, group]) => (
            <div key={lectureId} className="glass-card overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-dark-700">
              
              {/* Lecture Group Header */}
              <div className="bg-gradient-to-r from-slate-50 to-white dark:from-dark-800 dark:to-dark-800/80 p-5 px-6 border-b border-slate-200 dark:border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold uppercase tracking-wider">
                      {group.courseTitle}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">/</span>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
                      Video No. {group.lectureOrder || 'N/A'}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    {group.lectureTitle}
                  </h3>
                </div>
                <div className="text-sm font-bold text-slate-400 shrink-0">
                  {group.doubts.length} Question{group.doubts.length > 1 ? 's' : ''}
                </div>
              </div>

              {/* Doubts List */}
              <div className="divide-y divide-slate-100 dark:divide-dark-700/60 bg-white dark:bg-dark-900">
                {group.doubts.map(doubt => {
                  const isResolved = doubt.replies?.length > 0;

                  return (
                    <div key={doubt._id} className={`p-6 sm:p-8 transition-colors ${!isResolved ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                      <div className="flex flex-col sm:flex-row gap-5">
                        
                        {/* Student Avatar */}
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-dark-600 shrink-0 flex items-center justify-center font-bold text-slate-500 text-lg overflow-hidden ring-4 ring-slate-50 dark:ring-dark-800">
                          {doubt.student?.avatarUrl ? (
                            <img src={doubt.student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            doubt.student?.firstName?.charAt(0) || 'S'
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-lg">
                                {doubt.student?.firstName} {doubt.student?.lastName}
                              </p>
                              <span className="text-xs font-semibold text-slate-400">
                                {new Date(doubt.createdAt).toLocaleDateString()} at {new Date(doubt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {isResolved ? (
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Answered
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 rounded-full text-xs font-bold flex items-center gap-1 border border-rose-200 dark:border-rose-800">
                                Pending
                              </span>
                            )}
                          </div>
                          
                          <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-indigo-500 rounded-full"></div>
                            <p className="text-slate-800 dark:text-slate-200 text-[16px] leading-relaxed mb-5 pl-4 py-1">
                              {doubt.message}
                            </p>
                          </div>

                          {/* Replies */}
                          {isResolved ? (
                            <div className="mt-6 space-y-4">
                              {doubt.replies.map((reply, idx) => (
                                <div key={idx} className="flex gap-4 bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white shrink-0 flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/30">
                                    Me
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3 mb-1.5">
                                      <p className="text-sm font-extrabold text-indigo-700 dark:text-indigo-400">My Reply</p>
                                      <span className="text-[11px] font-semibold text-indigo-400 dark:text-indigo-500">
                                        {new Date(reply.createdAt || doubt.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">{reply.message}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-5 flex xl:items-start gap-4">
                              <textarea
                                className="flex-1 rounded-xl border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-950 px-5 py-3.5 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none shadow-inner text-[15px] min-h-[96px]"
                                placeholder={`Write a reply to ${doubt.student?.firstName || 'the student'}...`}
                                value={replyText[doubt._id] || ''}
                                onChange={(e) => setReplyText(prev => ({ ...prev, [doubt._id]: e.target.value }))}
                              />
                              <button
                                type="button"
                                onClick={() => handleReply(doubt._id)}
                                disabled={!replyText[doubt._id]?.trim() || isSubmitting[doubt._id]}
                                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-[15px] hover:from-primary-700 hover:to-indigo-700 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 h-[96px] flex flex-col items-center justify-center gap-2"
                              >
                                {isSubmitting[doubt._id] ? (
                                  <>
                                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    <span>Send Reply</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default TeacherDoubtsPage;
