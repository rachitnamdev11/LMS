import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudentEnrolledCoursesApi, getWishlistApi, toggleWishlistApi } from '../../services/courseApi.js';
import { getCourseLeaderboardApi } from '../../services/leaderboardApi.js';
import { getMyCertificatesApi } from '../../services/certificateApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import WishlistSection from '../../components/common/WishlistSection.jsx';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrolled, setEnrolled] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [e, c, wl] = await Promise.all([
          getStudentEnrolledCoursesApi(),
          getMyCertificatesApi(),
          getWishlistApi().catch(() => ({ courses: [] }))
        ]);
        setEnrolled(e || []);
        setCertificates(c || []);
        setWishlist(wl?.courses || []);

        // Load rank for the first enrolled course
        if (e && e[0]?._id) {
          try {
            const lb = await getCourseLeaderboardApi(e[0]._id);
            const cu = lb?.currentUser;
            if (cu) setMyRank(cu.rank);
          } catch (_) {
            // Error ignored
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-3xl p-8 sm:p-10 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Welcome back, {user?.firstName || 'Student'}! 👋</h1>
          <p className="text-primary-100 text-lg max-w-xl">
            Ready to continue your learning journey? You have {enrolled.length} active courses.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Enrolled Courses</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{enrolled.length}</p>
          </div>
        </div>
        
        <div className="glass-card p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
          </div>
          <div>
             <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Certificates Earned</p>
             <p className="text-2xl font-bold text-slate-900 dark:text-white">{certificates.length}</p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div>
             <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Leaderboard Rank</p>
             <p className="text-2xl font-bold text-slate-900 dark:text-white">
               {myRank ? `#${myRank}` : 'N/A'}
             </p>
             <Link to="/student/leaderboard" className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">View full leaderboard →</Link>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Grid */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Courses</h2>
             <p className="text-slate-500 dark:text-slate-400 mt-1">Jump right back into your active courses.</p>
          </div>
          <Link to="/courses" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Browse catalog &rarr;
          </Link>
        </div>
        
        {enrolled.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolled.map((c) => (
              <Link key={c._id} to={`/student/course/${c._id}`} className="group block">
                <div className="glass-card h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200 dark:border-dark-800">
                  <div className="aspect-video bg-slate-200 dark:bg-dark-800 relative overflow-hidden">
                    {c.thumbnailUrl ? (
                      <img src={c.thumbnailUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50">
                        <span className="text-indigo-300 dark:text-indigo-700 svg-icon">
                          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{c.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 flex-1">{c.description}</p>
                    <div className="w-full bg-slate-100 dark:bg-dark-800 rounded-full h-1.5 mt-auto">
                      <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${c.progressPercentage || 0}%` }}></div>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-2 text-right">{c.progressPercentage || 0}% Complete</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-dark-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-dark-700 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Courses Yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">You haven't enrolled in any courses. Explore our catalog to start learning.</p>
            <Link to="/courses" className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors inline-block">
              Explore Courses
            </Link>
          </div>
        )}
      </section>

      {/* ── Wishlist Section ── */}
      <WishlistSection wishlist={wishlist} setWishlist={setWishlist} />

      {/* Details Sections */}
      <section className="max-w-3xl">
        
        {/* Certificates */}
        <div className="glass-card flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex justify-between items-center bg-slate-50/50 dark:bg-dark-900/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
              My Certificates
            </h2>
          </div>
          <div className="p-0 flex-1">
            {certificates.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-dark-800">
                {certificates.map((cert) => (
                  <li key={cert._id} className="p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors flex items-center justify-between group">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{cert.course?.name || 'Unknown Course'}</p>
                      <p className="text-xs font-mono text-slate-500 mt-1">ID: {cert.certificateId}</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      View
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center flex flex-col justify-center h-full text-slate-500">
                <p>You haven't earned any certificates yet.</p>
                <p className="text-sm mt-1">Complete a course to get certified!</p>
              </div>
            )}
          </div>
        </div>

      </section>
    </div>
  );
};

export default StudentDashboard;

