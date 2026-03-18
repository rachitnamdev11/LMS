import React from 'react';
import { Link } from 'react-router-dom';

const HelpPage = () => {
  return (
    <div className="animate-fade-in pb-20 max-w-4xl mx-auto px-4 mt-8">
      {/* Sleek Header Section */}
      <div className="relative mb-16 px-6 py-12 rounded-[2rem] bg-gradient-to-r from-slate-900 to-indigo-950 overflow-hidden shadow-2xl">
        {/* Subtle background SVG pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40V0H40V40z" fill="none"/>
                <circle cx="20" cy="20" r="1.5" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/20">
            <svg className="w-8 h-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 tracking-tight">
            How can we help?
          </h1>
          <p className="text-slate-300 max-w-lg text-lg">
            Everything you need to navigate the Learning Management System effortlessly.
          </p>
        </div>
      </div>

      {/* Innovative Timeline/Stepper Layout (No Cards) */}
      <div className="relative ml-4 md:ml-12 border-l-2 border-slate-200 dark:border-dark-700 space-y-16 py-8">
        
        {/* Step 1: Students */}
        <div className="relative pl-10 md:pl-16">
          <div className="absolute -left-[21px] top-1 w-10 h-10 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center text-white border-4 border-slate-50 dark:border-dark-900 z-10">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">For Students</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">
              Sign up or log in to get started. Navigate to your <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-800 text-slate-800 dark:text-slate-300 font-mono text-sm border border-slate-200 dark:border-dark-700">Student Dashboard</span> to resume your enrolled courses, pick up where you left off, and track your overall progress.
            </p>
          </div>
        </div>

        {/* Step 2: Instructors */}
        <div className="relative pl-10 md:pl-16">
          <div className="absolute -left-[21px] top-1 w-10 h-10 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center text-white border-4 border-slate-50 dark:border-dark-900 z-10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">For Instructors</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">
              Log in to access your specialized <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-800 text-slate-800 dark:text-slate-300 font-mono text-sm border border-slate-200 dark:border-dark-700">Teacher Dashboard</span>. Visit <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-800 text-slate-800 dark:text-slate-300 font-mono text-sm border border-slate-200 dark:border-dark-700">My Courses</span> to upload rich media lectures, build curriculums, and interact with your students via discussions.
            </p>
          </div>
        </div>

        {/* Step 3: Global Catalog */}
        <div className="relative pl-10 md:pl-16">
          <div className="absolute -left-[21px] top-1 w-10 h-10 rounded-full bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center text-white border-4 border-slate-50 dark:border-dark-900 z-10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Course Catalog</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">
              Browse the global array of public courses available directly from the{' '}
              <Link to="/courses" className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors uppercase tracking-wide text-sm border-b-2 border-purple-200 dark:border-purple-900 hover:border-purple-600">
                Course Directory
              </Link>.
              Both prospective students and educators utilize the same unified catalog.
            </p>
          </div>
        </div>

        {/* Step 4: Account Issues */}
        <div className="relative pl-10 md:pl-16">
          <div className="absolute -left-[21px] top-1 w-10 h-10 rounded-full bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center justify-center text-white border-4 border-slate-50 dark:border-dark-900 z-10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Account Security</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">
              Facing issues with your login, OTP emails, or password resets? Access our secure recovery systems directly from the{' '}
              <Link to="/login" className="font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors uppercase tracking-wide text-sm border-b-2 border-rose-200 dark:border-rose-900 hover:border-rose-600">
                Authentication Portal
              </Link>.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default HelpPage;

