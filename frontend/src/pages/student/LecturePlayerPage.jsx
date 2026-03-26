import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  incrementLectureViewApi,
  bookmarkLectureApi,
  getLectureBookmarkApi,
  completeLectureApi,
  getLectureNotesApi
} from '../../services/lectureApi.js';
import { getLectureTestApi, getMyTestResultsApi } from '../../services/testApi.js';
import { createDoubtApi, listLectureDoubtsApi } from '../../services/doubtApi.js';
import PdfViewer from './PdfViewer.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const LecturePlayerPage = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const { lectureId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const lecture = location.state?.lecture;
  const videoRef = useRef(null);
  const [bookmark, setBookmark] = useState(null);
  const [lectureTest, setLectureTest] = useState(undefined); // undefined = loading, null = none
  const [doubts, setDoubts] = useState([]);
  const [doubtText, setDoubtText] = useState('');
  const [activeTab, setActiveTab] = useState('tests'); // 'tests', 'doubts', or 'notes'
  const [accessDenied, setAccessDenied] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lectureNotes, setLectureNotes] = useState(null);  // null = not yet fetched
  const [notesFetching, setNotesFetching] = useState(false);
  const [attemptsUsed, setAttemptsUsed] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        if (!isTeacher) {
          const viewKey = `viewed_lecture_${lectureId}`;
          if (!sessionStorage.getItem(viewKey)) {
            incrementLectureViewApi(lectureId).catch(console.error);
            sessionStorage.setItem(viewKey, 'true');
          }
          const bm = await getLectureBookmarkApi(lectureId).catch(() => null);
          if (bm) {
            setBookmark(bm);
            setIsCompleted(bm.isCompleted === true);
          }
        }
        const [t, d] = await Promise.all([
          getLectureTestApi(lectureId).catch(() => null),
          listLectureDoubtsApi(lectureId).catch(() => [])
        ]);
        setLectureTest(t || null);
        setDoubts(d || []);

        // Fetch attempts used for this test (students only)
        if (!isTeacher && t?._id) {
          try {
            const results = await getMyTestResultsApi();
            const used = results.filter((r) => r.test?._id === t._id || r.test === t._id).length;
            setAttemptsUsed(used);
          } catch (e) {}
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setAccessDenied(true);
        }
        setLectureTest(null);
      }
    };
    init();
  }, [lectureId, isTeacher]);

  // Fetch notes when Notes tab is first activated
  useEffect(() => {
    if (activeTab === 'notes' && lectureNotes === null && !notesFetching) {
      setNotesFetching(true);
      getLectureNotesApi(lectureId)
        .then((data) => setLectureNotes(data?.notesUrl ?? ''))
        .catch(() => setLectureNotes(''))
        .finally(() => setNotesFetching(false));
    }
  }, [activeTab, lectureId, lectureNotes, notesFetching]);

  // Block Ctrl/Cmd + C/P/S while Notes tab is active
  useEffect(() => {
    if (activeTab !== 'notes') return;
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'p', 's', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  useEffect(() => {
    if (bookmark?.lastWatchedSeconds && videoRef.current) {
      videoRef.current.currentTime = bookmark.lastWatchedSeconds;
    }
  }, [bookmark]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || isTeacher) return;
    bookmarkLectureApi(lectureId, Math.floor(videoRef.current.currentTime))
      .then(setBookmark)
      .catch((err) => {
        // Silently ignore 403s (e.g. when a Teacher is previewing the lecture)
        if (err.response?.status !== 403) {
          console.error('Failed to save bookmark:', err);
        }
      });
  };

  const handleComplete = async () => {
    if (isCompleted || isTeacher) return;
    try {
      await completeLectureApi(lectureId);
      setIsCompleted(true);
    } catch (err) {
      console.error('Failed to mark complete', err);
    }
  };

  const handleCreateDoubt = async () => {
    if (!doubtText.trim()) return;
    const created = await createDoubtApi({
      courseId: lecture.course,
      lectureId,
      message: doubtText
    });
    setDoubts((prev) => [created, ...prev]);
    setDoubtText('');
  };

  if (!lecture) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <p className="text-lg font-medium text-slate-900 dark:text-white">Lecture data missing</p>
        <p className="text-slate-500">Please navigate from the course page.</p>
      </div>
    );
  }

  // Access denied screen
  if (accessDenied) {
    const courseId = lecture?.course;
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4 animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-lg">
          You haven't enrolled in this course yet. Please purchase the course to watch this lecture.
        </p>
        {courseId ? (
          <Link
            to={`/student/course/${courseId}`}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            Enroll in this Course
          </Link>
        ) : (
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 transition-all shadow-lg"
          >
            Browse Courses
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-12 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 border-b border-slate-200 dark:border-dark-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{lecture.title}</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Now Playing
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isTeacher && bookmark && (
            <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-dark-800 px-3 py-1.5 rounded-full">
              Resumed at {Math.floor((bookmark.lastWatchedSeconds || 0) / 60)}:{(bookmark.lastWatchedSeconds % 60).toString().padStart(2, '0')}
            </span>
          )}
          {!isTeacher && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isCompleted}
              className={`px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg flex items-center gap-2 ${
                isCompleted 
                  ? 'bg-slate-200 dark:bg-dark-800 text-emerald-600 dark:text-emerald-400 cursor-default' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              {isCompleted ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Completed
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Mark Complete
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Video Player Section */}
      <div className="glass-card overflow-hidden shadow-2xl bg-black rounded-2xl relative border border-slate-800">
        <video
          ref={videoRef}
          src={lecture.videoUrl}
          controls
          controlsList="nodownload"
          className="w-full aspect-video outline-none"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleComplete}
        />
      </div>

      {/* Tabs */}
      <div className="glass-card shadow-sm border border-slate-200 dark:border-dark-800 overflow-hidden mt-8">
        <div className="flex border-b border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900/50">
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex-1 py-4 text-center font-semibold text-sm transition-all ${
              activeTab === 'tests'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 bg-white dark:bg-dark-950'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Knowledge Check Tests
          </button>
          <button
            onClick={() => setActiveTab('doubts')}
            className={`flex-1 py-4 text-center font-semibold text-sm transition-all ${
              activeTab === 'doubts'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 bg-white dark:bg-dark-950'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Q&A / Doubts
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-4 text-center font-semibold text-sm transition-all ${
              activeTab === 'notes'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 bg-white dark:bg-dark-950'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            📋 Lecture Notes
          </button>
        </div>

        <div className="p-6 md:p-8 min-h-[400px]">
          
          {/* Tests Tab Content */}
          {activeTab === 'tests' && (
            <div className="animate-fade-in">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Knowledge Check</h3>
                  {lectureTest === undefined ? (
                    <div className="flex justify-center py-12">
                      <svg className="animate-spin h-7 w-7 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </div>
                  ) : !lectureTest ? (
                    <div className="text-center py-12 text-slate-500">
                      No test has been assigned for this lecture yet.
                    </div>
                  ) : (
                    <div className="max-w-lg mx-auto">
                      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-900/20 to-indigo-900/10 p-8 text-center shadow-lg shadow-violet-500/10">
                        <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{lectureTest.title}</h4>
                        <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold my-4">
                          <span className="px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700">
                            {lectureTest.numQuestionsToServe || lectureTest.questionPool?.length || 0} Questions
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                            {lectureTest.duration ?? 30} min
                          </span>
                          {lectureTest.negativeMarking?.enabled && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700">
                              -{lectureTest.negativeMarking.value} Negative Marking
                            </span>
                          )}
                          {!isTeacher ? (
                            <span className={`px-2.5 py-1 rounded-full border font-bold ${
                              lectureTest.attemptLimit === 0
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                                : Math.max(0, lectureTest.attemptLimit - attemptsUsed) === 0
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}>
                              {lectureTest.attemptLimit === 0
                                ? '∞ Unlimited Attempts'
                                : `${Math.max(0, lectureTest.attemptLimit - attemptsUsed)} Attempt${Math.max(0, lectureTest.attemptLimit - attemptsUsed) !== 1 ? 's' : ''} Left`}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {lectureTest.attemptLimit === 0 ? 'Unlimited' : `${lectureTest.attemptLimit} Attempt${lectureTest.attemptLimit !== 1 ? 's' : ''}`}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                          Test is conducted in full-screen mode. Switching tabs will be tracked.
                        </p>
                        {!isTeacher && (() => {
                          const attemptsLeft = lectureTest.attemptLimit === 0
                            ? Infinity
                            : Math.max(0, lectureTest.attemptLimit - attemptsUsed);
                          const locked = attemptsLeft === 0;
                          return locked ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-sm">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                Attempt Limit Reached
                              </div>
                              <p className="text-xs text-slate-500">You have used all {lectureTest.attemptLimit} attempt{lectureTest.attemptLimit !== 1 ? 's' : ''}.</p>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(`/student/test/${lectureTest._id}`)}
                              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-violet-600 text-white font-bold text-base hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Take Test Now
                            </button>
                          );
                        })()}
                        {isTeacher && (
                          <p className="text-xs text-slate-500 italic">Students can attempt this test after watching the lecture.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
            </div>
          )}

          {/* Doubts Tab Content */}
          {activeTab === 'doubts' && (
            <div className="animate-fade-in max-w-4xl mx-auto">
              <div className="mb-10 bg-slate-50 dark:bg-dark-800/50 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-dark-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Have a question?</h3>
                <div className="space-y-4">
                  <textarea
                    className="w-full rounded-xl border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none shadow-sm"
                    rows={4}
                    placeholder="Describe your doubt in detail. Mention timestamps if it's about a specific part of the video..."
                    value={doubtText}
                    onChange={(e) => setDoubtText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCreateDoubt}
                      disabled={!doubtText.trim()}
                      className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Post Question
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                   Discussion 
                   <span className="bg-slate-200 dark:bg-dark-700 text-slate-700 dark:text-slate-300 text-xs py-0.5 px-2 rounded-full">{doubts.length}</span>
                </h3>
                
                {doubts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No doubts have been posted yet. Be the first to ask!
                  </div>
                ) : (
                  <div className="space-y-6">
                    {doubts.map((d) => (
                      <div key={d._id} className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-dark-700">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-dark-600 shrink-0 flex items-center justify-center font-bold text-slate-500">
                            Q
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-900 dark:text-white text-[15px] leading-relaxed mb-4">{d.message}</p>
                            
                            {d.replies?.length > 0 ? (
                              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-700 space-y-4">
                                {d.replies.map((r, idx) => (
                                  <div key={idx} className="flex gap-3 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 shrink-0 flex items-center justify-center font-bold text-xs">
                                      T
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">Instructor</p>
                                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{r.message}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Awaiting instructor response
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes Tab Content */}
          {activeTab === 'notes' && (
            <div className="animate-fade-in">
              {notesFetching ? (
                <div className="flex justify-center items-center py-20">
                  <svg className="animate-spin h-8 w-8 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
              ) : !lectureNotes ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">No notes uploaded yet</p>
                  <p className="text-sm text-slate-400 mt-1">The instructor hasn't added notes for this lecture.</p>
                </div>
              ) : (
                <div>
                  {/* Protected notes header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Lecture Notes
                    </h3>
                    <span className="text-xs text-slate-400 bg-slate-100 dark:bg-dark-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      Read-only
                    </span>
                  </div>

                  {/* PDF Viewer — secure canvas rendering, no download capability */}
                  <PdfViewer url={lectureNotes} />

                  <p className="text-xs text-slate-400 mt-3 text-center">
                    🔒 Notes are for reading only — downloading is not permitted.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LecturePlayerPage;

