import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTestResultApi } from '../../services/testApi.js';

// ── Enhanced Animated SVG Pie Chart ──────────────────────────────────────────
const PieChart = ({ correct, incorrect, unattempted }) => {
  const [animated, setAnimated] = useState(false);
  const total = correct + incorrect + unattempted;

  useEffect(() => {
    // Trigger animation shortly after mount
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (total === 0) return null;

  const R = 70;
  const CX = 90, CY = 90;
  const circumference = 2 * Math.PI * R;

  const segments = [
    { id: 'correct', value: correct, color: '#10b981', label: 'Correct', textColor: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'incorrect', value: incorrect, color: '#f43f5e', label: 'Incorrect', textColor: 'text-rose-400', bg: 'bg-rose-500/10' },
    { id: 'skipped', value: unattempted, color: '#64748b', label: 'Skipped', textColor: 'text-slate-400', bg: 'bg-slate-500/10' }
  ];

  let cumulative = 0;
  const arcs = segments.map(seg => {
    const pct = seg.value / total;
    // The dash array spans the full circumference. The first value is the visible length.
    const dashArray = `${circumference * pct} ${circumference}`;
    // The offset pushes the start of the dash backward along the circle.
    // SVG stroke-dashoffset goes counter-clockwise, so we negate it.
    const offset = -(circumference * cumulative);
    cumulative += pct;
    return { ...seg, dashArray, offset };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 w-full max-w-sm mx-auto">
      {/* Chart */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width="180" height="180" viewBox="0 0 180 180" className="drop-shadow-2xl">
          {/* Background Track */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1e1e2d" strokeWidth="28" />
          
          {/* Animated Segments */}
          {arcs.map((arc) => (
            <circle
              key={arc.id}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={arc.color}
              strokeWidth="28"
              strokeDasharray={arc.dashArray}
              // Animate from zero-length (offset = circumference) to actual length
              strokeDashoffset={animated ? arc.offset : circumference}
              strokeLinecap={arc.value > 0 ? "round" : "butt"}
              transform={`rotate(-90 ${CX} ${CY})`}
              className="transition-all duration-1000 ease-out"
            />
          ))}
          {/* Inner cutout */}
          <circle cx={CX} cy={CY} r={R - 14} fill="#0b0b14" />
          
          {/* Center Text */}
          <text x={CX} y={CY - 4} textAnchor="middle" fill="white" fontSize="24" fontWeight="900">{total}</text>
          <text x={CX} y={CY + 16} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600" letterSpacing="1">QUESTIONS</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3 w-full sm:w-auto">
        {segments.map(s => (
          <div key={s.id} className={`flex items-center justify-between sm:justify-start gap-4 px-4 py-2.5 rounded-xl border border-white/5 ${s.bg}`}>
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: s.color }} />
              <span className="text-slate-300 font-medium text-sm">{s.label}</span>
            </div>
            <span className={`font-black text-lg tabular-nums ${s.textColor}`}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Review Accordion Item ─────────────────────────────────────────────────────
const ReviewItem = ({ item, idx }) => {
  const [open, setOpen] = useState(false);
  const isCorrect = item.isCorrect;
  const isUnattempted = item.givenAnswer === null || item.givenAnswer === undefined || item.givenAnswer === '';

  const formatAnswer = (ans, type, options) => {
    if (ans === null || ans === undefined || ans === '') return 'Not attempted';
    if (type === 'mcq') return options?.[Number(ans)] ?? `Option ${ans}`;
    return String(ans);
  };

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      isUnattempted ? 'border-slate-700/50' :
      isCorrect ? 'border-emerald-500/30' : 'border-rose-500/30'
    }`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-4 p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
          isUnattempted ? 'bg-slate-700 text-slate-400' :
          isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
        }`}>
          {isUnattempted ? '—' : isCorrect ? '✓' : '✗'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200 leading-relaxed line-clamp-2">
            <span className="text-slate-500 mr-2">Q{idx + 1}.</span>{item.questionText}
          </p>
          <div className="flex items-center gap-4 mt-1 text-xs">
            <span className={isCorrect ? 'text-emerald-400' : isUnattempted ? 'text-slate-500' : 'text-rose-400'}>
              {isUnattempted ? 'Skipped' : isCorrect ? `+${item.marksAwarded} marks` : `${item.marksAwarded} marks`}
            </span>
          </div>
        </div>
        <svg className={`w-4 h-4 text-slate-500 shrink-0 transition-transform mt-1 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" /></svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-4">
          {/* Code snippet */}
          {item.codeSnippet && (
            <pre className="bg-[#0a0a16] border border-white/10 rounded-xl p-3 text-xs font-mono text-cyan-300 overflow-x-auto">
              {item.codeSnippet}
            </pre>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Your Answer</p>
              <p className={`font-semibold ${isUnattempted ? 'text-slate-500 italic' : isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatAnswer(item.givenAnswer, item.questionType, item.options)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-900/20 border border-emerald-800/30">
              <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Correct Answer</p>
              <p className="font-semibold text-emerald-300">
                {formatAnswer(item.correctAnswer, item.questionType, item.options)}
              </p>
            </div>
          </div>

          {item.explanation && (
            <div className="p-3 rounded-xl bg-violet-900/10 border border-violet-800/30">
              <p className="text-xs text-violet-400 font-semibold uppercase mb-1">💡 Explanation</p>
              <p className="text-sm text-slate-300 leading-relaxed">{item.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const TestResultPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTestResultApi(testId)
      .then(setData)
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load results'))
      .finally(() => setLoading(false));
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center text-white gap-4">
        <p className="text-xl font-bold text-red-400">{error}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl bg-violet-600 font-bold text-sm">Go Back</button>
      </div>
    );
  }

  const { result, review: rawReview, rank, totalParticipants, testTitle } = data || {};
  const review = Array.isArray(rawReview) ? rawReview : [];
  const { score = 0, totalMarks = 0, correctAnswers = 0, incorrectAnswers = 0, unattempted = 0, accuracy = 0 } = result || {};

  const scoreColor = accuracy >= 70 ? 'text-emerald-400' : accuracy >= 40 ? 'text-amber-400' : 'text-rose-400';
  const scoreBg = accuracy >= 70 ? 'from-emerald-900/40 to-teal-900/20 border-emerald-700/40' :
                  accuracy >= 40 ? 'from-amber-900/40 to-yellow-900/20 border-amber-700/40' :
                  'from-rose-900/40 to-red-900/20 border-rose-700/40';

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white pb-16">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d0d1a]/95 backdrop-blur px-4 md:px-8 py-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Test Results</h1>
            <p className="text-xs text-slate-500">{testTitle}</p>
          </div>
          <button
            onClick={() => navigate(-2)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Lecture
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8 space-y-8">

        {/* ── Score Card ── */}
        <div className={`rounded-2xl border bg-gradient-to-br ${scoreBg} p-8 text-center shadow-2xl`}>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-3">Your Score</p>
          <div className={`text-7xl font-black ${scoreColor} mb-2`}>
            {score}<span className="text-3xl text-slate-500">/{totalMarks}</span>
          </div>
          <p className={`text-2xl font-bold ${scoreColor} mb-6`}>{accuracy}% Accuracy</p>

          <div className="flex flex-wrap justify-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-400">{correctAnswers}</p>
              <p className="text-xs text-slate-500">Correct</p>
            </div>
            <div className="h-10 w-px bg-white/10 self-center" />
            <div className="text-center">
              <p className="text-2xl font-black text-rose-400">{incorrectAnswers}</p>
              <p className="text-xs text-slate-500">Incorrect</p>
            </div>
            <div className="h-10 w-px bg-white/10 self-center" />
            <div className="text-center">
              <p className="text-2xl font-black text-slate-400">{unattempted}</p>
              <p className="text-xs text-slate-500">Skipped</p>
            </div>
            {rank && (
              <>
                <div className="h-10 w-px bg-white/10 self-center" />
                <div className="text-center">
                  <p className="text-2xl font-black text-amber-400">#{rank}</p>
                  <p className="text-xs text-slate-500">Rank / {totalParticipants}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Pie Chart ── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col items-center">
          <h2 className="text-base font-bold text-slate-300 mb-5">Performance Breakdown</h2>
          <PieChart correct={correctAnswers} incorrect={incorrectAnswers} unattempted={unattempted} />
        </div>

        {/* ── Question Review ── */}
        <div>
          <h2 className="text-base font-bold text-slate-300 mb-4">📋 Question-by-Question Review</h2>
          <div className="space-y-3">
            {review.map((item, i) => (
              <ReviewItem key={item.questionId} item={item} idx={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultPage;
