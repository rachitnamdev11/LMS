import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { startTestSessionApi, saveProgressApi, submitTestApi } from '../../services/testApi.js';

// ─── Constants ─────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  unseen:     'bg-slate-700/50 text-slate-400 border-slate-600/80',
  answered:   'bg-emerald-500/20 text-emerald-300 border-emerald-500/60',
  marked:     'bg-amber-500/20  text-amber-300  border-amber-500/60',
  unanswered: 'bg-rose-500/20   text-rose-300   border-rose-500/60',
};
const MAX_VIOLATIONS  = 3;
const AUTOSAVE_MS     = 12000;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const SK = (id) => `exam_session_${id}`;
const ls = {
  save:  (id, d) => { try { localStorage.setItem(SK(id), JSON.stringify(d)); } catch {} },
  load:  (id)    => { try { return JSON.parse(localStorage.getItem(SK(id))); } catch { return null; } },
  clear: (id)    => { try { localStorage.removeItem(SK(id)); } catch {} },
};

// Safely convert Map-serialised-to-object answers from API
const normalizeAnswers = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return { ...raw };
};

// ─── Submit Confirmation Modal ─────────────────────────────────────────────────
const SubmitModal = ({ answeredCount, totalCount, onConfirm, onCancel, isLastQ }) => (
  <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-[#12122e] border border-violet-500/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-violet-500/20 text-center">
      <div className="w-16 h-16 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
        </svg>
      </div>
      <h2 className="text-xl font-black text-white mb-2">
        {isLastQ ? 'Submit Test?' : 'Submit Test Early?'}
      </h2>
      <p className="text-slate-400 text-sm mb-1">
        {isLastQ
          ? "You've reached the last question."
          : 'Are you sure you want to submit now?'}
      </p>
      <div className="flex gap-4 justify-center my-4 text-sm font-semibold">
        <span className="text-emerald-400">✓ {answeredCount} answered</span>
        <span className="text-rose-400">✗ {totalCount - answeredCount} unanswered</span>
      </div>
      <p className="text-xs text-slate-500 mb-6">This action cannot be undone.</p>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-white/5 border border-white/15 text-slate-300 font-bold text-sm hover:bg-white/10 transition-all">
          Cancel
        </button>
        <button type="button" onClick={onConfirm}
          className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-sm shadow-lg shadow-violet-600/30 transition-all">
          Submit Now ✓
        </button>
      </div>
    </div>
  </div>
);

// ─── Question Renderer ─────────────────────────────────────────────────────────
const QuestionView = React.memo(({ question, answer, onAnswer }) => {
  if (!question) return null;
  const opts = question.options || [];

  return (
    <div className="space-y-5">
      <p className="text-white text-lg font-semibold leading-relaxed">{question.questionText}</p>

      {question.codeSnippet && (
        <pre className="bg-black/60 border border-white/10 rounded-xl p-4 text-sm font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
          {question.codeSnippet}
        </pre>
      )}

      {question.imageUrl && (
        <img src={question.imageUrl} alt="Diagram" className="max-h-52 rounded-xl border border-white/10 object-contain" />
      )}

      {/* MCQ */}
      {question.questionType === 'mcq' && (
        <div className="space-y-3">
          {opts.map((opt, i) => (
            <button key={i} type="button" onClick={() => onAnswer(i)}
              className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-150 ${
                answer === i
                  ? 'bg-violet-600/25 border-violet-400 shadow-violet-500/20 shadow-lg'
                  : 'border-white/10 bg-white/5 hover:border-violet-400/50 hover:bg-violet-600/10'
              }`}>
              <span className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                answer === i ? 'border-violet-400 bg-violet-500 text-white' : 'border-slate-600 text-slate-400'
              }`}>{String.fromCharCode(65 + i)}</span>
              <span className={`font-medium text-base ${answer === i ? 'text-violet-100' : 'text-slate-300'}`}>{opt}</span>
            </button>
          ))}
        </div>
      )}

      {/* True / False */}
      {question.questionType === 'truefalse' && (
        <div className="flex gap-4 mt-4">
          {[['true', '✓ True', 'border-emerald-500 bg-emerald-500/20 text-emerald-300'],
            ['false', '✗ False', 'border-rose-500 bg-rose-500/20 text-rose-300']].map(([val, label, activeCls]) => (
            <button key={val} type="button" onClick={() => onAnswer(val)}
              className={`flex-1 py-6 rounded-2xl font-black text-xl border-2 transition-all ${
                answer === val ? activeCls : 'border-white/10 bg-white/5 text-slate-400 hover:border-slate-400'
              }`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* One Word */}
      {question.questionType === 'oneword' && (
        <div>
          <input type="text" value={answer ?? ''} onChange={e => onAnswer(e.target.value)}
            placeholder="Type your answer here…"
            className="w-full rounded-xl border-2 border-white/10 bg-white/5 px-5 py-4 text-white text-lg
                       placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:bg-violet-900/10 transition-all"
            autoComplete="off" autoCapitalize="off" spellCheck="false" />
          <p className="text-xs text-slate-500 mt-1.5">Answer is case-insensitive</p>
        </div>
      )}

      {/* Fill in the Blank */}
      {question.questionType === 'fillblank' && (
        <div>
          <div className="flex items-center gap-3 flex-wrap mt-2">
            <span className="text-slate-400 font-semibold text-base">Answer:</span>
            <input type="text" value={answer ?? ''} onChange={e => onAnswer(e.target.value)}
              placeholder="Fill in the blank…"
              className="flex-1 min-w-[220px] border-b-2 border-violet-500 bg-transparent px-2 py-3 text-white text-lg
                         placeholder-slate-600 focus:outline-none transition-all"
              autoComplete="off" autoCapitalize="off" spellCheck="false" />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Answer is case-insensitive (india = India = INDIA)</p>
        </div>
      )}
    </div>
  );
});

// ─── Main Page ─────────────────────────────────────────────────────────────────
const StudentTestPage = () => {
  const { testId }  = useParams();
  const navigate    = useNavigate();

  const [loading,    setLoading]    = useState(false); // Initially false to show the Start button UI
  const [error,      setError]      = useState(null);
  const [questions,  setQuestions]  = useState([]);
  const [answers,    setAnswers]    = useState({});
  const [mfr,        setMfr]        = useState([]);
  const [visited,    setVisited]    = useState({});
  const [idx,        setIdx]        = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(null);
  const [totalSecs,  setTotalSecs]  = useState(30 * 60);
  const [submitting, setSubmitting] = useState(false);
  const [violations, setViolations] = useState(0);
  const [warning,    setWarning]    = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isLastQPopup, setIsLastQPopup] = useState(false);
  const [testStarted, setTestStarted] = useState(false); // Controls when to enter FS

  // Refs: always-current values for callbacks without stale closures
  const violRef    = useRef(0);
  const timerRef   = useRef(null);
  const saveRef    = useRef(null);
  const answersRef = useRef({});
  const mfrRef     = useRef([]);
  const timeRef    = useRef(null);   // for submit handler to read timeLeft

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { mfrRef.current = mfr; },        [mfr]);
  useEffect(() => { timeRef.current = timeLeft; },  [timeLeft]);

  // ── Submit ───────────────────────────────────────────────────────────────────
  const doSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setShowSubmitModal(false);
    clearInterval(timerRef.current);
    clearInterval(saveRef.current);
    try {
      const elapsed = totalSecs - (timeRef.current ?? 0);
      await submitTestApi(testId, {
        answers:         answersRef.current,
        markedForReview: mfrRef.current,
        violationCount:  violRef.current,
        timeSpentSeconds: Math.max(0, elapsed),
      });
      ls.clear(testId);
      navigate(`/student/test/${testId}/result`, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Unknown error';
      alert('Submission failed: ' + msg);
      setSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting, testId, totalSecs]);

  // ── Fullscreen ───────────────────────────────────────────────────────────────
  const enterFs = useCallback(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
    setIsFullscreen(true);
  }, []);

  // ── Violation ────────────────────────────────────────────────────────────────
  const lastViolTime = useRef(0);

  const addViolation = useCallback((reason) => {
    const now = Date.now();
    // Debounce: prevent multiple strikes within 2 seconds
    if (now - lastViolTime.current < 2000) return;
    lastViolTime.current = now;

    violRef.current += 1;
    const n = violRef.current;
    setViolations(n);
    console.warn(`[Anti-Cheat] Strike ${n}: ${reason}`);

    if (n >= MAX_VIOLATIONS) {
      setWarning(`Test auto-submitted due to multiple violations.`);
      setTimeout(doSubmit, 2500);
    } else {
      const attemptsLeft = MAX_VIOLATIONS - n;
      if (reason === 'Fullscreen exit') {
        setWarning(`Exiting fullscreen is not allowed during the test. Attempts left: ${attemptsLeft}`);
      } else {
        setWarning(`Warning: Tab switch detected. Attempts left: ${attemptsLeft}`);
      }
      setTimeout(() => setWarning(null), 5000);
    }
  }, [doSubmit]);

  // ── Init ─────────────────────────────────────────────────────────────────────
  const startExam = useCallback(async () => {
    try {
      console.log('[Test] Starting exam...');
      // 1. Enter Fullscreen FIRST (must be sync with the click event)
      const el = document.documentElement;
      const requestFs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || el.mozRequestFullScreen;
      
      if (requestFs) {
        await requestFs.call(el).catch(err => {
          console.warn('Fullscreen blocked by browser:', err);
        });
      } else {
        console.warn('Fullscreen API is not supported by this browser.');
      }
      setIsFullscreen(true);
      setTestStarted(true);
      setLoading(true); // Show loader while fetching Questions

      // 2. Load Test Data
      const data = await startTestSessionApi(testId);

      const qs = Array.isArray(data?.servedQuestions)
        ? data.servedQuestions.filter(Boolean)
        : [];
      setQuestions(qs);

      const remaining = typeof data?.timeRemainingSecs === 'number'
        ? data.timeRemainingSecs
        : (typeof data?.testDurationSecs === 'number' ? data.testDurationSecs : 30 * 60);
      const total = typeof data?.testDurationSecs === 'number'
        ? data.testDurationSecs : 30 * 60;


        setTotalSecs(total);
        setTimeLeft(Math.max(0, remaining));
        timeRef.current = Math.max(0, remaining);

        // Restore answers
        const sessionAnswers = normalizeAnswers(data?.session?.answers);
        const cached         = ls.load(testId);
        const cachedAnswers  = normalizeAnswers(cached?.answers);

        if (data?.isResume || cached) {
          const merged = { ...sessionAnswers, ...cachedAnswers };
          setAnswers(merged);
          answersRef.current = merged;

          const sessionMfr = Array.isArray(data?.session?.markedForReview)
            ? data.session.markedForReview.map(String) : [];
          const cachedMfr  = Array.isArray(cached?.mfr) ? cached.mfr : [];
          const mergedMfr  = [...new Set([...sessionMfr, ...cachedMfr])];
          setMfr(mergedMfr);
          mfrRef.current = mergedMfr;
        }
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to load test';
        setError(msg);
      } finally {
        setLoading(false);
      }
  }, [testId]);

  // ── Timer countdown ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { doSubmit(); return; }

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        const next = t - 1;
        timeRef.current = next;
        if (next <= 0) { clearInterval(timerRef.current); }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft !== null]);  // only fire when timeLeft first becomes non-null

  useEffect(() => {
    if (timeLeft === 0) doSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // ── Anti-cheat ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!testStarted) return; // Only track violations AFTER they click start
    console.log('[Anti-Cheat] Event listeners mounted.');

    const checkFs = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      if (!fsEl) {
        setIsFullscreen(false);
        addViolation('Fullscreen exit');
      }
    };

    const onHide = () => { 
      console.log('[Anti-Cheat] visibilitychange fired. hidden:', document.hidden, 'state:', document.visibilityState);
      if (document.hidden || document.visibilityState === 'hidden') {
        addViolation('Tab hidden / switch');
      }
    };

    const onBlur = () => { 
      console.log('[Anti-Cheat] window.blur fired.');
      // Chrome sometimes fires blur when opening dev tools or native UI. 
      // We count it as a violation if the document itself loses focus.
      if (!document.hasFocus()) {
        addViolation('Window focus lost'); 
      }
    };

    const onFocus = () => {
      console.log('[Anti-Cheat] window.focus fired.');
    };

    const noCtx  = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('contextmenu', noCtx);

    const fsEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    fsEvents.forEach(evt => document.addEventListener(evt, checkFs));
    
    return () => {
      console.log('[Anti-Cheat] Event listeners unmounted.');
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('contextmenu', noCtx);
      fsEvents.forEach(evt => document.removeEventListener(evt, checkFs));
    };
  }, [addViolation, testStarted]);

  // ── Auto save ────────────────────────────────────────────────────────────────
  useEffect(() => {
    saveRef.current = setInterval(() => {
      const a = answersRef.current;
      const m = mfrRef.current;
      ls.save(testId, { answers: a, mfr: m });
      saveProgressApi(testId, { answers: a, markedForReview: m, violationCount: violRef.current }).catch(() => {});
    }, AUTOSAVE_MS);
    return () => clearInterval(saveRef.current);
  }, [testId]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const currentQ  = questions[idx] ?? null;
  const currentId = currentQ?._id ? String(currentQ._id) : null;

  const getStatus = useCallback((q) => {
    const qid = String(q._id);
    if (mfr.includes(qid)) return 'marked';
    const a = answers[qid];
    if (a !== undefined && a !== '') return 'answered';
    if (visited[qid]) return 'unanswered';
    return 'unseen';
  }, [mfr, answers, visited]);

  const goTo = (i) => {
    if (currentId) setVisited(v => ({ ...v, [currentId]: true }));
    setIdx(i);
    setSidebarOpen(false);
  };

  const handleAnswer = (val) => {
    if (!currentId) return;
    const next = { ...answersRef.current, [currentId]: val };
    setAnswers(next);
    answersRef.current = next;
    ls.save(testId, { answers: next, mfr: mfrRef.current });
  };

  const toggleMfr = () => {
    if (!currentId) return;
    setMfr(prev =>
      prev.includes(currentId)
        ? prev.filter(x => x !== currentId)
        : [...prev, currentId]
    );
  };

  const handleSaveAndNext = () => {
    if (currentId) setVisited(v => ({ ...v, [currentId]: true }));
    if (idx >= questions.length - 1) {
      // Last question — show submit popup
      setIsLastQPopup(true);
      setShowSubmitModal(true);
    } else {
      goTo(idx + 1);
    }
  };

  const answeredCount = questions.filter(q => {
    const a = answers[String(q._id)];
    return a !== undefined && a !== '';
  }).length;

  const markedCount = mfr.length;

  // Timer visual
  const timerPct  = timeLeft !== null && totalSecs > 0
    ? Math.min(100, Math.max(0, (timeLeft / totalSecs) * 100)) : 100;
  const isWarning = timerPct <= 20;
  const isCritical = timeLeft !== null && timeLeft <= 60;
  const timerBg   = timerPct > 50 ? 'bg-emerald-500' : timerPct > 20 ? 'bg-amber-500' : 'bg-rose-500';
  const timerRing = timerPct > 50 ? 'text-emerald-400' : timerPct > 20 ? 'text-amber-400' : 'text-rose-400';

  // ── Loading / Error ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="fixed inset-0 bg-[#08080f] flex flex-col items-center justify-center gap-5 text-white">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-violet-900/50 border-t-violet-500 animate-spin" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-violet-300/20 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-white">Loading your test…</p>
        <p className="text-sm text-slate-500 mt-1">Setting up your personalized question set</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 bg-[#08080f] flex flex-col items-center justify-center gap-6 text-white px-6">
      <div className="w-20 h-20 rounded-full bg-rose-900/25 border border-rose-600/30 flex items-center justify-center">
        <svg className="w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>
      <div className="text-center max-w-sm">
        <p className="text-xl font-bold text-rose-300 mb-2">Failed to load test</p>
        <p className="text-sm text-slate-400">{error}</p>
      </div>
      <button onClick={() => navigate(-1)}
        className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-sm transition-all shadow-lg shadow-violet-600/30">
        ← Go Back
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#08080f] text-white flex flex-col select-none overflow-hidden">

      {/* ── Submit Modal ── */}
      {showSubmitModal && (
        <SubmitModal
          answeredCount={answeredCount}
          totalCount={questions.length}
          isLastQ={isLastQPopup}
          onConfirm={doSubmit}
          onCancel={() => { setShowSubmitModal(false); setIsLastQPopup(false); }}
        />
      )}

      {/* ── Violation toast ── */}
      {warning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[250] bg-rose-950 border border-rose-500/70
                        text-white px-6 py-3 rounded-2xl shadow-2xl shadow-rose-500/30 text-sm font-semibold
                        max-w-md text-center pointer-events-none animate-bounce">
          {warning}
        </div>
      )}

      {/* ── Start Exam Overlay ── */}
      {!testStarted && (
        <div className="fixed inset-0 z-[500] bg-[#08080f] flex items-center justify-center p-4">
          <div className="bg-[#12122a] border border-violet-500/30 rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Ready to Start?</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              This exam is proctored. It will run in fullscreen mode. Any attempt to exit fullscreen or switch tabs will be recorded as a violation.
            </p>
            <button onClick={startExam}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold transition-all shadow-lg shadow-violet-600/30 text-white">
              Start Exam Now
            </button>
          </div>
        </div>
      )}

      {/* ── Submitting overlay ── */}
      {submitting && (
        <div className="fixed inset-0 z-[190] bg-[#08080f]/95 backdrop-blur flex flex-col items-center justify-center gap-6">
          <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
          <div className="text-center">
            <p className="text-2xl font-black text-violet-300">Submitting your test…</p>
            <p className="text-slate-500 text-sm mt-1">Please don't close this window</p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          HEADER — Timer + Stats + Submit (ALWAYS VISIBLE, FIXED TOP)
      ═══════════════════════════════════════════════════════════════════════ */}
      <header className="shrink-0 z-30 bg-[#0e0e1e] border-b border-white/10 shadow-lg">
        {/* Full-width timer progress bar */}
        <div className="h-1.5 w-full bg-white/5">
          <div className={`h-full ${timerBg} transition-all duration-1000 ${isCritical ? 'animate-pulse' : ''}`}
            style={{ width: `${timerPct}%` }} />
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          {/* Mobile palette toggle */}
          <button type="button" onClick={() => setSidebarOpen(o => !o)}
            className="md:hidden shrink-0 w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          {/* ─── TIMER — big, bold, unmissable ─── */}
          <div className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2 border ${
            isCritical
              ? 'bg-rose-950/80 border-rose-500/50 shadow-rose-500/30 shadow-md'
              : isWarning
              ? 'bg-amber-950/80 border-amber-500/40'
              : 'bg-violet-950/60 border-violet-500/20'
          }`}>
            <svg className={`w-4 h-4 ${timerRing} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className={`text-2xl font-black tabular-nums tracking-tight ${timerRing} ${isCritical ? 'animate-pulse' : ''}`}>
              {timeLeft !== null ? fmt(timeLeft) : '--:--'}
            </span>
            {isCritical && (
              <span className="text-xs font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded-full">LOW</span>
            )}
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold flex-1">
            <span className="px-2.5 py-1 rounded-full bg-emerald-900/30 border border-emerald-800/50 text-emerald-400">
              ✓ {answeredCount} answered
            </span>
            {markedCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-900/30 border border-amber-800/50 text-amber-400">
                🔖 {markedCount} marked
              </span>
            )}
            <span className="text-slate-600">/ {questions.length} total</span>
          </div>
          <div className="flex-1 sm:hidden" />

          {/* Q counter */}
          <span className="hidden md:block text-sm font-bold text-slate-400 shrink-0">
            Q {idx + 1}/{questions.length}
          </span>

          {/* Submit button — always visible */}
          <button type="button" disabled={submitting}
            onClick={() => { setIsLastQPopup(false); setShowSubmitModal(true); }}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95
                       disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-violet-600/40
                       border border-violet-400/20 transition-all">
            Submit
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          BODY — Sidebar + Question area
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── Question Palette Sidebar ── */}
        <aside className={`
          shrink-0 border-r border-white/10 bg-[#0c0c1c] flex flex-col overflow-hidden
          transition-all duration-300
          ${sidebarOpen ? 'w-64 absolute md:static inset-y-0 left-0 z-50 shadow-2xl shadow-black/60' : 'w-0 md:w-52'}
        `}>
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Questions</span>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-white">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Legend */}
          <div className="shrink-0 px-3 py-2 border-b border-white/10 grid grid-cols-2 gap-x-2 gap-y-1.5">
            {[
              ['answered',   'Answered'],
              ['marked',     'Marked'],
              ['unanswered', 'Visited'],
              ['unseen',     'Unseen'],
            ].map(([s, l]) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded border ${STATUS_STYLE[s]}`} />
                <span className="text-[10px] text-slate-500 font-medium">{l}</span>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => {
                const qid = String(q._id);
                const st  = i === idx ? 'current' : getStatus(q);
                return (
                  <button key={qid} type="button" onClick={() => goTo(i)}
                    title={`Q${i + 1}`}
                    className={`h-9 rounded-lg border text-xs font-bold transition-all ${
                      i === idx
                        ? 'bg-violet-600 border-violet-400 text-white shadow-lg shadow-violet-500/40'
                        : STATUS_STYLE[st] || STATUS_STYLE.unseen
                    }`}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Palette summary */}
          <div className="shrink-0 p-3 border-t border-white/10 space-y-1">
            {[
              ['Total',     questions.length,                  'text-white'],
              ['Answered',  answeredCount,                     'text-emerald-400'],
              ['Marked',    markedCount,                       'text-amber-400'],
              ['Remaining', questions.length - answeredCount,  'text-rose-400'],
            ].map(([k, v, c]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-slate-500">{k}</span>
                <span className={`font-black ${c}`}>{v}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Sidebar backdrop for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-black/50" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Main Question Area ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Scrollable question content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 md:px-10 py-8">

              {/* Q header row */}
              <div className="flex items-center flex-wrap gap-2 mb-8">
                <span className="px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-bold">
                  Q {idx + 1} / {questions.length}
                </span>
                {currentQ && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                    {{ mcq: 'Multiple Choice', truefalse: 'True / False', oneword: 'One Word', fillblank: 'Fill in Blank' }[currentQ.questionType] || currentQ.questionType}
                  </span>
                )}
                <span className="ml-auto px-2.5 py-1 rounded-lg bg-amber-900/20 border border-amber-800/40 text-amber-400 text-xs font-bold">
                  {currentQ?.marks ?? 1} mark{(currentQ?.marks ?? 1) !== 1 ? 's' : ''}
                </span>
                {mfr.includes(currentId) && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-900/20 border border-amber-800/40 text-amber-400 text-xs font-bold">
                    🔖 Marked
                  </span>
                )}
              </div>

              {/* Question body */}
              <div key={currentId}>
                {currentQ
                  ? <QuestionView question={currentQ} answer={answers[currentId]} onAnswer={handleAnswer} />
                  : <p className="text-slate-500 text-center py-12">No question found.</p>
                }
              </div>
            </div>
          </div>

          {/* ─── Bottom Navigation Bar (FIXED TO BOTTOM, ALWAYS VISIBLE) ─── */}
          <footer className="shrink-0 bg-[#0e0e1e] border-t border-white/10 px-4 md:px-10 py-3 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">

              {/* Previous */}
              <button type="button" disabled={idx === 0}
                onClick={() => goTo(Math.max(0, idx - 1))}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                           text-sm font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-30
                           disabled:cursor-not-allowed transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                Prev
              </button>

              <div className="flex items-center gap-2">
                {/* Mark for Review */}
                <button type="button" onClick={toggleMfr}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    mfr.includes(currentId)
                      ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 hover:bg-amber-500/25'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-amber-400/40 hover:text-amber-400'
                  }`}>
                  🔖 {mfr.includes(currentId) ? 'Unmark' : 'Mark'}
                </button>

                {/* Save & Next / Save & Submit */}
                <button type="button" onClick={handleSaveAndNext}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm shadow-lg transition-all ${
                    idx >= questions.length - 1
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/20'
                  }`}>
                  {idx >= questions.length - 1 ? (
                    <>Finish & Submit <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg></>
                  ) : (
                    <>Save & Next <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></>
                  )}
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default StudentTestPage;
