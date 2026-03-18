import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="animate-fade-in pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 px-6 py-20 md:py-32 mb-12 text-center shadow-2xl">
        {/* Decorative ambient blurred blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass bg-white/10 border border-white/20 text-white text-sm font-medium mb-8 shadow-sm">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
            Reimagining Education
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200 mb-6 tracking-tight">
            Learn Without Limits
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed mb-10">
            A state-of-the-art Learning Management System designed to bridge the gap between passionate educators and eager minds worldwide.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-900 font-bold hover:bg-indigo-50 transition-all shadow-lg hover:-translate-y-1 hover:shadow-indigo-500/25"
          >
            Explore Courses
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>

      {/* Grid Features */}
      <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-10">Why Choose Our Platform?</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        
        {/* Student Card */}
        <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group hover:-translate-y-1">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">For Students</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Immersive learning experiences. Enroll in top-tier courses, watch HD video lectures, test your knowledge with interactive quizzes, and earn verifiable certificates.
          </p>
        </div>

        {/* Educator Card */}
        <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 group hover:-translate-y-1">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">For Instructors</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Powerful course creation tools. Upload rich media, build complex curriculums, track student engagement, and monetize your expertise effortlessly.
          </p>
        </div>

        {/* Technology Card */}
        <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group hover:-translate-y-1 md:col-span-2 lg:col-span-1">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Modern Tech Stack</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Built for speed and scale using React & TailwindCSS on the frontend. Powered by Node.js, Express, and MongoDB, with Razorpay integrations.
          </p>
        </div>

      </div>

      {/* Decorative Bottom Banner */}
      <div className="mt-16 w-full max-w-4xl mx-auto bg-slate-50 dark:bg-dark-800 border-l-4 border-primary-500 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to start your journey?</h4>
          <p className="text-slate-500 dark:text-slate-400">Join thousands of students learning new skills every day.</p>
        </div>
        <Link to="/signup/student" className="shrink-0 px-6 py-3 rounded-lg bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all">
          Create Free Account
        </Link>
      </div>

    </div>
  );
};

export default AboutPage;

