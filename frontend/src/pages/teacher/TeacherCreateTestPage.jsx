import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getLectureTestApi,
  createOrUpdateTestApi,
  publishTestApi,
  getTestAnalyticsApi
} from '../../services/testApi.js';

// ── Question type config ──────────────────────────────────────────────────────
const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice (MCQ)' },
  { value: 'truefalse', label: 'True / False' },
  { value: 'oneword', label: 'One Word Answer' },
  { value: 'fillblank', label: 'Fill in the Blank' }
];

const emptyQuestion = () => ({
  questionText: '',
  questionType: 'mcq',
  marks: 1,
  options: ['', '', '', ''],
  correctAnswer: '',
  imageUrl: '',
  codeSnippet: '',
  explanation: '',
  _tempId: Date.now() + Math.random()
});

// ── Sub-components ────────────────────────────────────────────────────────────

const InputField = ({ label, children, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-slate-300 mb-1.5">{label}</label>
    {children}
  </div>
);

const GlassInput = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${className}`}
  />
);

const GlassTextarea = ({ className = '', ...props }) => (
  <textarea
    {...props}
    className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none ${className}`}
  />
);

// ── MCQ Question Builder ──────────────────────────────────────────────────────
const McqBuilder = ({ q, onChange }) => {
  const updateOption = (i, val) => {
    const opts = [...q.options];
    opts[i] = val;
    onChange({ ...q, options: opts });
  };
  const addOption = () => onChange({ ...q, options: [...q.options, ''] });
  const removeOption = (i) => {
    const opts = q.options.filter((_, idx) => idx !== i);
    const correct = Number(q.correctAnswer) === i ? '' : Number(q.correctAnswer) > i ? Number(q.correctAnswer) - 1 : q.correctAnswer;
    onChange({ ...q, options: opts, correctAnswer: correct });
  };

  return (
    <div className="space-y-2 mt-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Options</p>
      {q.options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...q, correctAnswer: i })}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              Number(q.correctAnswer) === i
                ? 'border-emerald-400 bg-emerald-400'
                : 'border-slate-600 hover:border-emerald-400'
            }`}
          >
            {Number(q.correctAnswer) === i && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            )}
          </button>
          <GlassInput
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
          />
          {q.options.length > 2 && (
            <button type="button" onClick={() => removeOption(i)} className="text-red-400 hover:text-red-300 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Option
      </button>
      {q.correctAnswer === '' && <p className="text-xs text-amber-400">Please select the correct answer.</p>}
    </div>
  );
};

// ── Question Card ─────────────────────────────────────────────────────────────
const QuestionCard = ({ q, idx, onChange, onRemove }) => {
  const [expanded, setExpanded] = useState(true);
  const [showCode, setShowCode] = useState(!!q.codeSnippet);

  return (
    <div className="border border-white/10 rounded-2xl bg-white/5 backdrop-blur overflow-hidden transition-shadow hover:shadow-lg hover:shadow-violet-500/10">
      {/* Card header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-white/5">
        <span className="w-7 h-7 rounded-lg bg-violet-600/40 text-violet-300 font-bold text-sm flex items-center justify-center shrink-0">
          {idx + 1}
        </span>
        <p className="flex-1 text-sm font-medium text-slate-300 truncate">
          {q.questionText || <span className="text-slate-500 italic">Untitled question</span>}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs bg-violet-900/40 text-violet-300 px-2 py-0.5 rounded-full border border-violet-700/30">
            {QUESTION_TYPES.find(t => t.value === q.questionType)?.label || q.questionType}
          </span>
          <span className="text-xs text-amber-400 font-semibold">{q.marks} pt{q.marks !== 1 ? 's' : ''}</span>
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <InputField label="Question Text" className="md:col-span-2">
              <GlassTextarea
                value={q.questionText}
                onChange={(e) => onChange({ ...q, questionText: e.target.value })}
                placeholder="Enter your question..."
                rows={2}
              />
            </InputField>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Type">
                <select
                  value={q.questionType}
                  onChange={(e) => onChange({ ...q, questionType: e.target.value, correctAnswer: '', options: e.target.value === 'mcq' ? ['', '', '', ''] : [] })}
                  className="w-full rounded-xl border border-white/10 bg-[#1a1a2e] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                >
                  {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </InputField>
              <InputField label="Marks">
                <GlassInput
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={q.marks}
                  onChange={(e) => onChange({ ...q, marks: Number(e.target.value) })}
                />
              </InputField>
            </div>
          </div>

          {/* Type-specific inputs */}
          {q.questionType === 'mcq' && (
            <McqBuilder q={q} onChange={onChange} />
          )}

          {q.questionType === 'truefalse' && (
            <div className="flex gap-4 mt-3">
              {['true', 'false'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange({ ...q, correctAnswer: val })}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm capitalize border transition-all ${
                    q.correctAnswer === val
                      ? val === 'true'
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                        : 'bg-red-600/30 border-red-500 text-red-300'
                      : 'border-white/10 text-slate-400 hover:border-slate-400'
                  }`}
                >
                  {val === 'true' ? '✓ True' : '✗ False'}
                </button>
              ))}
            </div>
          )}

          {(q.questionType === 'oneword' || q.questionType === 'fillblank') && (
            <InputField label={q.questionType === 'fillblank' ? 'Correct Fill Answer' : 'Correct Answer'} className="mt-3">
              <GlassInput
                value={q.correctAnswer}
                onChange={(e) => onChange({ ...q, correctAnswer: e.target.value })}
                placeholder={q.questionType === 'fillblank' ? 'The answer to fill in the blank...' : 'Expected one-word answer...'}
              />
            </InputField>
          )}

          {/* Optional code snippet */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCode(s => !s)}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              {showCode ? 'Remove Code Snippet' : 'Add Code Snippet'}
            </button>
          </div>

          {showCode && (
            <InputField label="Code Snippet (shown with the question)">
              <GlassTextarea
                value={q.codeSnippet}
                onChange={(e) => onChange({ ...q, codeSnippet: e.target.value })}
                placeholder="// Paste your code here..."
                rows={4}
                className="font-mono text-xs"
              />
            </InputField>
          )}

          <InputField label="Explanation (shown after submission — optional)">
            <GlassInput
              value={q.explanation}
              onChange={(e) => onChange({ ...q, explanation: e.target.value })}
              placeholder="Explain why this is the correct answer..."
            />
          </InputField>
        </div>
      )}
    </div>
  );
};

// ── Analytics Panel ───────────────────────────────────────────────────────────
const AnalyticsPanel = ({ testId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTestAnalyticsApi(testId)
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, [testId]);

  if (loading) return <div className="text-slate-500 text-sm text-center py-8">Loading analytics…</div>;
  if (!analytics || analytics.totalStudents === 0) {
    return (
      <div className="text-center py-10 text-slate-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        No attempts yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Students', value: analytics.totalStudents, color: 'text-violet-400' },
          { label: 'Avg Score', value: `${analytics.avgScore?.toFixed(1)}`, color: 'text-emerald-400' },
        ].map(card => (
          <div key={card.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      {analytics.leaderboard?.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-300 mb-3">🏆 Leaderboard</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {analytics.leaderboard.map((s, i) => (
              <div key={s.studentId} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                  i === 0 ? 'bg-yellow-500/30 text-yellow-300' :
                  i === 1 ? 'bg-slate-400/20 text-slate-300' :
                  i === 2 ? 'bg-amber-700/30 text-amber-400' : 'text-slate-500 bg-white/5'
                }`}>{i + 1}</span>
                <span className="flex-1 text-sm text-white font-medium">{s.name}</span>
                <span className="text-xs text-emerald-400 font-bold">{s.score}/{s.totalMarks}</span>
                <span className="text-xs text-slate-500">{s.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak questions */}
      {analytics.questionStats?.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-300 mb-3">📉 Most Failed Questions</h4>
          <div className="space-y-2">
            {analytics.questionStats.slice(0, 5).map((qs) => (
              <div key={qs.questionId} className="p-3 rounded-xl bg-red-900/10 border border-red-900/30">
                <p className="text-sm text-slate-300 font-medium mb-1 line-clamp-1">{qs.questionText}</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-emerald-400">✓ {qs.correct} correct</span>
                  <span className="text-red-400">✗ {qs.incorrect} wrong</span>
                  <span className="text-slate-500">— {qs.unattempted} skipped</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const TeacherCreateTestPage = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();

  const [existingTestId, setExistingTestId] = useState(null);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [attemptLimit, setAttemptLimit] = useState(1);
  const [negativeMarking, setNegativeMarking] = useState({ enabled: false, value: 0.25 });
  const [questionPool, setQuestionPool] = useState([emptyQuestion()]);
  const [numQuestionsToServe, setNumQuestionsToServe] = useState(10);
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved'|'error'|null
  const [activeTab, setActiveTab] = useState('builder'); // 'builder'|'analytics'
  const [loading, setLoading] = useState(true);

  // Load existing test
  useEffect(() => {
    setLoading(true);
    getLectureTestApi(lectureId)
      .then((test) => {
        if (test) {
          setExistingTestId(test._id);
          setTitle(test.title || '');
          setDuration(test.duration || 30);
          setAttemptLimit(test.attemptLimit ?? 1);
          setNegativeMarking(test.negativeMarking || { enabled: false, value: 0.25 });
          setQuestionPool(test.questionPool?.length > 0 ? test.questionPool.map(q => ({ ...q, _tempId: q._id })) : [emptyQuestion()]);
          setNumQuestionsToServe(test.numQuestionsToServe || 10);
          setIsPublished(test.isPublished || false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lectureId]);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setSaveStatus(null);
    try {
      const payload = {
        lectureId,
        title: title || 'Lecture Test',
        duration: Number(duration),
        attemptLimit: Number(attemptLimit),
        negativeMarking,
        questionPool: questionPool.map(({ _tempId, ...rest }) => rest),
        numQuestionsToServe: Number(numQuestionsToServe)
      };
      await createOrUpdateTestApi(payload);
      // Reload to get ID
      const test = await getLectureTestApi(lectureId);
      if (test) setExistingTestId(test._id);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!existingTestId) {
      alert('Please save the test first before publishing.');
      return;
    }
    try {
      const res = await publishTestApi(existingTestId);
      setIsPublished(res.isPublished);
    } catch {
      alert('Failed to toggle publish status.');
    }
  };

  const updateQuestion = useCallback((tempId, updated) => {
    setQuestionPool(prev => prev.map(q => q._tempId === tempId ? { ...updated, _tempId: tempId } : q));
  }, []);

  const removeQuestion = useCallback((tempId) => {
    setQuestionPool(prev => prev.filter(q => q._tempId !== tempId));
  }, []);

  const addQuestion = () => {
    setQuestionPool(prev => [...prev, emptyQuestion()]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white pb-16">
      {/* Neon header bar */}
      <div className="sticky top-0 z-30 bg-[#0d0d1a]/95 backdrop-blur border-b border-white/10 px-4 md:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">
                {existingTestId ? 'Edit Test' : 'Create Test'}
              </h1>
              <p className="text-xs text-slate-500">Lecture test builder</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Publish toggle */}
            <button
              type="button"
              onClick={handleTogglePublish}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                isPublished
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-white/5 border-white/20 text-slate-400 hover:border-violet-500/50 hover:text-violet-300'
              }`}
            >
              {isPublished ? '🟢 Published' : '⚪ Unpublished'}
            </button>

            {/* Save button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 disabled:opacity-60 flex items-center gap-2 transition-all"
            >
              {saving ? (
                <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving…</>
              ) : saveStatus === 'saved' ? '✓ Saved!' : saveStatus === 'error' ? '✗ Error' : '💾 Save Test'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 space-y-8">

        {/* ── Settings card ── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 space-y-6 shadow-xl shadow-violet-900/10">
          <h2 className="text-base font-bold text-violet-300 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Test Settings
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <InputField label="Test Title">
              <GlassInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 3 Assessment"
              />
            </InputField>
            <InputField label="Duration (minutes)">
              <GlassInput
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </InputField>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <InputField label="Attempt Limit (0 = unlimited)">
              <GlassInput
                type="number"
                min={0}
                value={attemptLimit}
                onChange={(e) => setAttemptLimit(e.target.value)}
              />
            </InputField>
            <InputField label="Questions to Serve (from pool)">
              <GlassInput
                type="number"
                min={1}
                max={questionPool.length}
                value={numQuestionsToServe}
                onChange={(e) => setNumQuestionsToServe(e.target.value)}
              />
            </InputField>
          </div>

          {/* Negative Marking */}
          <div className="flex items-start gap-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNegativeMarking(nm => ({ ...nm, enabled: !nm.enabled }))}
                className={`relative w-11 h-6 rounded-full transition-all ${negativeMarking.enabled ? 'bg-violet-600' : 'bg-slate-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${negativeMarking.enabled ? 'translate-x-5' : ''}`} />
              </button>
              <span className="text-sm font-semibold text-slate-300">Negative Marking</span>
            </div>
            {negativeMarking.enabled && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Deduct</span>
                <GlassInput
                  type="number"
                  min={0}
                  step={0.25}
                  max={10}
                  value={negativeMarking.value}
                  onChange={(e) => setNegativeMarking(nm => ({ ...nm, value: Number(e.target.value) }))}
                  className="w-24"
                />
                <span className="text-sm text-slate-400">marks per wrong answer</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs: Builder | Analytics ── */}
        <div className="flex gap-2 border-b border-white/10 pb-0">
          {['builder', 'analytics'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-bold capitalize rounded-t-xl transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? 'text-violet-300 border-violet-500'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {tab === 'builder' ? '🧠 Question Builder' : '📊 Analytics'}
            </button>
          ))}
        </div>

        {/* ── Question Builder Tab ── */}
        {activeTab === 'builder' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Question Pool</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {questionPool.length} question{questionPool.length !== 1 ? 's' : ''} in pool · {numQuestionsToServe} will be served randomly
                </p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-300 font-bold text-sm hover:bg-violet-600/30 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Question
              </button>
            </div>

            {questionPool.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl text-slate-500">
                No questions yet. Click "Add Question" to begin.
              </div>
            ) : (
              <div className="space-y-4">
                {questionPool.map((q, idx) => (
                  <QuestionCard
                    key={q._tempId}
                    q={q}
                    idx={idx}
                    onChange={(updated) => updateQuestion(q._tempId, updated)}
                    onRemove={() => removeQuestion(q._tempId)}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addQuestion}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-white/10 text-slate-500 hover:border-violet-500/40 hover:text-violet-400 transition-all text-sm font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Another Question
            </button>
          </div>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === 'analytics' && existingTestId && (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
            <h2 className="text-base font-bold text-slate-300 mb-5">Test Performance Analytics</h2>
            <AnalyticsPanel testId={existingTestId} />
          </div>
        )}
        {activeTab === 'analytics' && !existingTestId && (
          <div className="text-center py-16 text-slate-500 border border-dashed border-white/10 rounded-2xl">
            Save your test first to see analytics.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCreateTestPage;
