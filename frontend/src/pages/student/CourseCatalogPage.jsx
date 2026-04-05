import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchCoursesApi, toggleWishlistApi, getStudentEnrolledCoursesApi } from '../../services/courseApi.js';
import { useAuth } from '../../hooks/useAuth.js';

const CourseCatalogPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [searchRes, enrolledRes] = await Promise.all([
        searchCoursesApi({ q }),
        user?.role === 'student' ? getStudentEnrolledCoursesApi().catch(() => []) : Promise.resolve([])
      ]);
      setCourses(searchRes.items || []);
      
      if (enrolledRes?.length) {
        setEnrolledCourseIds(new Set(enrolledRes.map(c => c._id)));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWishlist = async (id) => {
    await toggleWishlistApi(id);
    // Optionally refresh or toggle local state
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header & Search */}
      <div className="bg-slate-900 dark:bg-dark-950 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 w-full md:w-1/2">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Courses</span>
          </h1>
          <p className="text-slate-300 text-lg">
            Find the perfect program to accelerate your career or pick up a new hobby.
          </p>
        </div>

        <div className="relative z-10 w-full md:w-1/2 flex justify-end">
          <div className="w-full max-w-md relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="What do you want to learn?"
              className="w-full pl-12 pr-24 py-4 rounded-full border border-slate-700 bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all backdrop-blur-sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
            <button
              type="button"
              onClick={load}
              className="absolute right-2 top-2 bottom-2 px-6 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-500 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {courses.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-dark-800/50 border border-dashed border-slate-300 dark:border-dark-700 rounded-3xl">
              <div className="mx-auto w-16 h-16 bg-slate-200 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No courses found</h3>
              <p className="text-slate-500">Try adjusting your search terms to find what you're looking for.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {courses.map((c) => (
                <div key={c._id} className="group glass-card h-full flex flex-col overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 hover:-translate-y-2 border border-slate-200 dark:border-dark-800">
                  <div className="aspect-video bg-slate-200 dark:bg-dark-800 relative overflow-hidden">
                    {c.thumbnailUrl ? (
                      <img src={c.thumbnailUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-800 dark:to-dark-900">
                        <span className="text-slate-400 svg-icon">
                          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </span>
                      </div>
                    )}
                    {(!user || user?.role === 'student') && !enrolledCourseIds.has(c._id) && (
                      <button
                        onClick={(e) => { e.preventDefault(); handleWishlist(c._id); }}
                        className="absolute top-3 right-3 p-2 bg-white/50 dark:bg-dark-900/50 backdrop-blur-md rounded-full text-slate-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-dark-900 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      </button>
                    )}
                    {c.language && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-dark-900/70 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider">
                        {c.language}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2 gap-2">
                       <h2 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                         {c.name}
                       </h2>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 flex-1">{c.description}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-dark-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                        {c.instructor?.firstName?.charAt(0) || 'I'}
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                        {c.instructor?.firstName} {c.instructor?.lastName}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-dark-800">
                      <div className="flex items-center gap-1">
                        {c.ratingsSummary ? (
                          <>
                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{Number(c.ratingsSummary.averageRating || 0).toFixed(1)}</span>
                            <span className="text-xs text-slate-500">({c.ratingsSummary.totalRatings || 0})</span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500">New Course</span>
                        )}
                      </div>
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        ₹{c.price}
                      </p>
                    </div>
                  </div>
                  
                  {/* Invisible link overlay for entire card clickability */}
                  <Link to={`/student/course/${c._id}`} className="absolute inset-0 z-0">
                    <span className="sr-only">View {c.name}</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseCatalogPage;

