import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden rounded-3xl bg-dark-900 shadow-2xl">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/30 rounded-full blur-3xl opacity-50 mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-3xl opacity-40 mix-blend-screen"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight md:leading-tight text-white mb-6 animate-slide-up max-w-[90%] mx-auto">
            Master Your Future with <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 drop-shadow-[0_0_20px_rgba(129,140,248,0.4)]">
                Learn<span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500 font-black">X</span>
              </span>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            A unified learning platform designed to elevate your educational journey. Browse world-class courses, interact with top instructors, and track your true potential.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {!user ? (
              <>
                <Link
                  to="/signup/student"
                  className="px-8 py-4 rounded-full text-lg font-semibold bg-primary-600 text-white hover:bg-primary-500 hover:scale-105 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                >
                  Start Learning Now
                </Link>
                <Link
                  to="/courses"
                  className="px-8 py-4 rounded-full text-lg font-semibold bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all border border-white/10"
                >
                  Explore Courses
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={`/${user.role}/dashboard`}
                  className="px-8 py-4 rounded-full text-lg font-semibold bg-primary-600 text-white hover:bg-primary-500 hover:scale-105 transition-all shadow-lg"
                >
                  Go to {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
                </Link>
                <Link
                  to="/courses"
                  className="px-8 py-4 rounded-full text-lg font-semibold bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all border border-white/10"
                >
                  Browse Catalog
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why choose our platform?</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Discover a new standard of online education built with modern tools and highly engaging content.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Immersive Courses</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">High-quality video lectures and interactive materials designed to keep you engaged and mastering new skills.</p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Learn at your pace</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">No strict schedules. Pause, rewind, and learn whenever you want. Perfect for busy professionals and students.</p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Expert Instructors</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Get your doubts answered easily. Instructors are always available to help you succeed in your goals.</p>
          </div>
        </div>
      </section>

      {/* Instructor CTA */}
      {!user && (
        <section className="mt-8 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-800 dark:to-dark-900 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 border border-slate-200 dark:border-dark-800">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Become an Instructor</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">Share your knowledge with the world. Teach what you love and empower students globally.</p>
            <Link
              to="/signup/teacher"
              className="px-6 py-3 rounded-lg text-base font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-md inline-block"
            >
              Start Teaching Today
            </Link>
          </div>
          <div className="w-full md:w-1/3 aspect-square max-w-sm bg-gradient-to-tr from-primary-500 to-purple-500 rounded-3xl rotate-3 opacity-90 shadow-2xl flex items-center justify-center p-8">
            <div className="w-full h-full border-4 border-white/30 rounded-2xl flex items-center justify-center -rotate-6">
              <span className="text-white text-5xl font-black opacity-50 block rotate-12">TEACH</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;