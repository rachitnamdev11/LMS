import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getCourseLeaderboardApi } from '../../services/leaderboardApi.js';
import { getStudentEnrolledCoursesApi } from '../../services/courseApi.js';
import { useAuth } from '../../hooks/useAuth.js';

// ── Sub-components ────────────────────────────────────────────────────────────

const PERIODS = [
  { key: 'all',   label: 'All Time' },
  { key: 'month', label: 'This Month' },
  { key: 'week',  label: 'This Week' },
];

const RankBadge = ({ rank }) => {
  if (rank === 1) return <span className="lb-medal lb-gold">🥇 1</span>;
  if (rank === 2) return <span className="lb-medal lb-silver">🥈 2</span>;
  if (rank === 3) return <span className="lb-medal lb-bronze">🥉 3</span>;
  return (
    <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-300">
      {rank}
    </span>
  );
};

const BadgePill = ({ badge }) => {
  if (!badge) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
      {badge.icon} {badge.label}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-dark-700 mx-auto" /></td>
    <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-slate-200 dark:bg-dark-700" /></td>
    <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-slate-200 dark:bg-dark-700 mx-auto" /></td>
    <td className="px-4 py-3"><div className="h-4 w-12 rounded bg-slate-200 dark:bg-dark-700 mx-auto" /></td>
    <td className="px-4 py-3"><div className="h-4 w-10 rounded bg-slate-200 dark:bg-dark-700 mx-auto" /></td>
    <td className="px-4 py-3"><div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-dark-700 mx-auto" /></td>
  </tr>
);

const formatTime = (secs) => {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
};

// ── Main Component ─────────────────────────────────────────────────────────────

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses]       = useState([]);
  const [courseId, setCourseId]     = useState('');
  const [period, setPeriod]         = useState('all');
  const [data, setData]             = useState(null);   // { leaderboard, currentUser }
  const [loading, setLoading]       = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError]           = useState('');

  // Load enrolled courses
  useEffect(() => {
    getStudentEnrolledCoursesApi()
      .then((list) => {
        setCourses(list || []);
        // Pre-select from URL or first course
        const urlCourse = searchParams.get('courseId');
        const firstId = urlCourse || (list && list[0]?._id) || '';
        setCourseId(firstId);
      })
      .finally(() => setCoursesLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch leaderboard when courseId or period changes
  const fetchLeaderboard = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError('');
    try {
      const apiPeriod = period === 'all' ? undefined : period;
      const result = await getCourseLeaderboardApi(courseId, apiPeriod);
      setData(result);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load leaderboard');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [courseId, period]);

  useEffect(() => {
    fetchLeaderboard();
    if (courseId) {
      setSearchParams({ courseId }, { replace: true });
    }
  }, [courseId, period]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCourse = courses.find((c) => c._id === courseId);
  const leaderboard    = data?.leaderboard || [];
  const currentUser    = data?.currentUser;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-fade-in pb-16">

      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-3xl p-8 sm:p-10 shadow-xl text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🏆</span>
            <h1 className="text-3xl sm:text-4xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-amber-100 text-lg max-w-xl">
            See how you rank against your peers in each course.
          </p>
        </div>
      </div>

      {/* ── Controls ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">

        {/* Course selector */}
        <div className="flex-1 max-w-sm">
          <label htmlFor="lb-course-select" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
            Select Course
          </label>
          {coursesLoading ? (
            <div className="h-10 w-full rounded-xl bg-slate-200 dark:bg-dark-700 animate-pulse" />
          ) : (
            <select
              id="lb-course-select"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-slate-900 dark:text-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            >
              {courses.length === 0 && (
                <option value="">No enrolled courses</option>
              )}
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Period tabs */}
        <div className="flex bg-slate-100 dark:bg-dark-800 rounded-xl p-1 gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                period === p.key
                  ? 'bg-white dark:bg-dark-700 text-amber-600 dark:text-amber-400 shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* ── Podium (top 3) ─────────────────────────────────────────── */}
      {!loading && leaderboard.length >= 1 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto">
          {/* 2nd place */}
          {leaderboard[1] ? (
            <div className="flex flex-col items-center mt-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-200 dark:bg-dark-700 flex items-center justify-center text-2xl font-bold text-slate-600 dark:text-slate-300 border-2 border-slate-300 dark:border-dark-600 shadow">
                {leaderboard[1].firstName?.[0]}{leaderboard[1].lastName?.[0]}
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-white mt-2 text-center truncate w-full">{leaderboard[1].firstName} {leaderboard[1].lastName}</p>
              <div className="mt-1 text-lg font-black text-slate-500">🥈</div>
              <div className="w-full mt-2 bg-slate-300 dark:bg-dark-600 rounded-t-lg text-center py-3 text-sm font-bold text-slate-700 dark:text-white">{leaderboard[1].totalScore}pts</div>
            </div>
          ) : <div />}

          {/* 1st place */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-2xl font-bold text-amber-700 dark:text-amber-300 border-[3px] border-amber-400 shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
                {leaderboard[0].firstName?.[0]}{leaderboard[0].lastName?.[0]}
              </div>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white mt-2 text-center truncate w-full">{leaderboard[0].firstName} {leaderboard[0].lastName}</p>
            <div className="mt-1 text-lg font-black">🥇</div>
            <div className="w-full mt-2 bg-amber-400 dark:bg-amber-600 rounded-t-lg text-center py-4 text-sm font-bold text-white shadow">{leaderboard[0].totalScore}pts</div>
          </div>

          {/* 3rd place */}
          {leaderboard[2] ? (
            <div className="flex flex-col items-center mt-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl font-bold text-orange-700 dark:text-orange-300 border-2 border-orange-300 dark:border-orange-700 shadow">
                {leaderboard[2].firstName?.[0]}{leaderboard[2].lastName?.[0]}
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-white mt-2 text-center truncate w-full">{leaderboard[2].firstName} {leaderboard[2].lastName}</p>
              <div className="mt-1 text-lg font-black text-orange-500">🥉</div>
              <div className="w-full mt-2 bg-orange-300 dark:bg-orange-700 rounded-t-lg text-center py-2 text-sm font-bold text-white">{leaderboard[2].totalScore}pts</div>
            </div>
          ) : <div />}
        </div>
      )}

      {/* ── Leaderboard Table ──────────────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedCourse?.name || 'Course'} Rankings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {PERIODS.find((p) => p.key === period)?.label} · {leaderboard.length} students ranked
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-dark-900/50 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">
                <th className="px-4 py-3 text-center w-16">Rank</th>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-center">Total Score</th>
                <th className="px-4 py-3 text-center">Accuracy</th>
                <th className="px-4 py-3 text-center">Tests</th>
                <th className="px-4 py-3 text-center">Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                : leaderboard.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-slate-500 dark:text-slate-400">
                      {courseId
                        ? 'No students have attempted tests in this course yet.'
                        : 'Select a course to view the leaderboard.'}
                    </td>
                  </tr>
                )
                : leaderboard.map((row) => {
                  const isMe = row.studentId?.toString() === currentUser?.studentId?.toString()
                    && !currentUser?.outsideTop50;
                  const isCurrentUserRow = isMe;
                  return (
                    <tr
                      key={row.studentId}
                      className={`transition-colors ${
                        isCurrentUserRow
                          ? 'bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400'
                          : 'hover:bg-slate-50 dark:hover:bg-dark-800/50'
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <RankBadge rank={row.rank} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                            isCurrentUserRow
                              ? 'bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300'
                              : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          }`}>
                            {row.firstName?.[0]}{row.lastName?.[0]}
                          </div>
                          <div>
                            <p className={`font-semibold ${isCurrentUserRow ? 'text-amber-700 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                              {row.firstName} {row.lastName}
                              {isCurrentUserRow && (
                                <span className="ml-2 text-xs font-medium px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded">You</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-800 dark:text-white">
                        {row.totalScore}
                        <span className="text-xs text-slate-400 font-normal">/{row.totalMarks}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-semibold ${
                          row.accuracy >= 75 ? 'text-emerald-600 dark:text-emerald-400'
                          : row.accuracy >= 50 ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-500 dark:text-red-400'
                        }`}>
                          {row.accuracy}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300 font-medium">
                        {row.testsAttempted}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <BadgePill badge={row.badge} />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* ── Current User Card (if outside top 50) ── */}
        {!loading && currentUser?.outsideTop50 && (
          <div className="border-t-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 p-4 sm:px-6">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-3">Your Ranking</p>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-300">
                  {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                </div>
                <div>
                  <p className="font-bold text-amber-700 dark:text-amber-400">
                    {currentUser.firstName} {currentUser.lastName}
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900 rounded">You</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm flex-wrap">
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white text-lg"># {currentUser.rank}</p>
                  <p className="text-xs text-slate-500">Rank</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white font-mono">{currentUser.totalScore}/{currentUser.totalMarks}</p>
                  <p className="text-xs text-slate-500">Score</p>
                </div>
                <div className="text-center">
                  <p className={`font-bold ${currentUser.accuracy >= 75 ? 'text-emerald-600' : currentUser.accuracy >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                    {currentUser.accuracy}%
                  </p>
                  <p className="text-xs text-slate-500">Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white">{currentUser.testsAttempted}</p>
                  <p className="text-xs text-slate-500">Tests</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default LeaderboardPage;
