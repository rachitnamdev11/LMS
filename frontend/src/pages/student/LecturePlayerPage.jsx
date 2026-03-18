import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  incrementLectureViewApi,
  bookmarkLectureApi,
  getLectureBookmarkApi,
  completeLectureApi
} from '../../services/lectureApi.js';
import { getLectureTestsApi, submitTestApi } from '../../services/testApi.js';
import { createDoubtApi, listLectureDoubtsApi } from '../../services/doubtApi.js';

const LecturePlayerPage = () => {
  const { lectureId } = useParams();
  const location = useLocation();
  const lecture = location.state?.lecture;
  const videoRef = useRef(null);
  const [bookmark, setBookmark] = useState(null);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [doubts, setDoubts] = useState([]);
  const [doubtText, setDoubtText] = useState('');
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' or 'doubts'

  useEffect(() => {
    const init = async () => {
      incrementLectureViewApi(lectureId);
      const [bm, t, d] = await Promise.all([
        getLectureBookmarkApi(lectureId).catch(() => null),
        getLectureTestsApi(lectureId).catch(() => []),
        listLectureDoubtsApi(lectureId).catch(() => [])
      ]);
      setBookmark(bm);
      setTests(t || []);
      setDoubts(d || []);
    };
    init();
  }, [lectureId]);

  useEffect(() => {
    if (bookmark?.lastWatchedSeconds && videoRef.current) {
      videoRef.current.currentTime = bookmark.lastWatchedSeconds;
    }
  }, [bookmark]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    bookmarkLectureApi(lectureId, Math.floor(videoRef.current.currentTime)).then(setBookmark);
  };

  const handleComplete = async () => {
    await completeLectureApi(lectureId);
    // Could add a toast notification here
  };

  const handleSelectTest = (t) => {
    setSelectedTest(t);
    setAnswers({});
    setResult(null);
  };

  const handleAnswerChange = (qIdx, optIdx) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitTest = async () => {
    if (!selectedTest) return;
    const payload = {
      testId: selectedTest._id,
      answers: Object.entries(answers).map(([qIdx, optIdx]) => ({
        questionIndex: Number(qIdx),
        selectedOptionIndex: optIdx
      }))
    };
    const res = await submitTestApi(payload);
    setResult(res);
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
          {bookmark && (
            <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-dark-800 px-3 py-1.5 rounded-full">
              Resumed at {Math.floor((bookmark.lastWatchedSeconds || 0) / 60)}:{(bookmark.lastWatchedSeconds % 60).toString().padStart(2, '0')}
            </span>
          )}
          <button
            type="button"
            onClick={handleComplete}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Mark Complete
          </button>
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
        </div>

        <div className="p-6 md:p-8 min-h-[400px]">
          
          {/* Tests Tab Content */}
          {activeTab === 'tests' && (
            <div className="animate-fade-in">
              {!selectedTest ? (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Available Tests for this Lecture</h3>
                  {tests.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      No tests have been assigned for this lecture yet.
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {tests.map((t) => (
                        <button
                          key={t._id}
                          onClick={() => handleSelectTest(t)}
                          className="text-left group p-6 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/10 transition-all flex justify-between items-center"
                        >
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">{t.title}</h4>
                            <p className="text-xs font-medium text-slate-500">{t.questions.length} questions</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-dark-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 text-slate-400 group-hover:text-primary-600 flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-dark-800">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedTest.title}</h3>
                    <button onClick={() => setSelectedTest(null)} className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
                      ← Back to tests
                    </button>
                  </div>
                  
                  {result ? (
                    <div className="bg-slate-50 dark:bg-dark-800 rounded-2xl p-8 border border-slate-200 dark:border-dark-700 text-center animate-slide-up">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-400 to-teal-500 hidden sm:flex items-center justify-center rounded-full text-white shadow-xl shadow-emerald-500/20 mb-6">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Test Completed!</h4>
                      <div className="inline-block bg-white dark:bg-dark-900 rounded-xl px-6 py-4 shadow-sm border border-slate-100 dark:border-dark-800 mb-6">
                         <div className="text-4xl font-black text-primary-600 dark:text-primary-400 mb-1">{result.score}<span className="text-xl text-slate-400">/{result.totalMarks}</span></div>
                         <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Total Score</p>
                      </div>
                      <div className="flex justify-center gap-8 text-sm font-medium">
                        <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> {result.correctAnswers} Correct</div>
                        <div className="text-rose-600 dark:text-rose-400 flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500"></span> {result.incorrectAnswers} Incorrect</div>
                      </div>
                      <button onClick={() => handleSelectTest(selectedTest)} className="mt-8 px-6 py-2 bg-slate-200 dark:bg-dark-700 font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-dark-600 transition-colors">
                        Retake Test
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {selectedTest.questions.map((q, idx) => (
                        <div key={idx} className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
                          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex gap-3">
                            <span className="text-primary-500">{idx + 1}.</span> {q.questionText}
                          </p>
                          <div className="space-y-3">
                            {q.options.map((opt, oIdx) => (
                              <label key={oIdx} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${answers[idx] === oIdx ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-500 shadow-sm shadow-primary-500/10' : 'bg-slate-50 dark:bg-dark-900/50 border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${answers[idx] === oIdx ? 'border-primary-600' : 'border-slate-400'}`}>
                                  {answers[idx] === oIdx && <div className="w-2.5 h-2.5 rounded-full bg-primary-600"></div>}
                                </div>
                                <span className={`font-medium ${answers[idx] === oIdx ? 'text-primary-900 dark:text-primary-100' : 'text-slate-700 dark:text-slate-300'}`}>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          onClick={handleSubmitTest}
                          disabled={Object.keys(answers).length !== selectedTest.questions.length}
                          className="px-8 py-3 rounded-xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit Answers
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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

        </div>
      </div>
    </div>
  );
};

export default LecturePlayerPage;

