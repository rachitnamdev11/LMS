import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-800 rounded-3xl p-8 sm:p-10 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">System Administrator</h1>
          <p className="text-rose-100 text-lg max-w-xl">
            Monitor teachers, students, courses, payments, and system health globally.
          </p>
        </div>
      </div>

      {/* Action Items Overview (Placeholders) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">2.4k</p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</p>
        </div>
        
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">150</p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Courses</p>
        </div>

        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">12</p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Complaints</p>
        </div>
        
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center bg-emerald-50/50 dark:bg-emerald-900/10">
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">99.9%</p>
          <p className="text-sm font-medium text-emerald-600/70 dark:text-emerald-400/70">System Uptime</p>
        </div>
      </div>

      {/* Admin Modules */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Management Modules</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/complaints"
            className="group glass-card p-8 flex flex-col items-center justify-center text-center hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
          >
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Complaints Center</h3>
            <p className="text-slate-500 text-sm">Review and resolve issues reported by users and instructors.</p>
          </Link>
          
          <div className="group glass-card p-8 flex flex-col items-center justify-center text-center opacity-70 cursor-not-allowed">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-800 text-slate-400 flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">User Management</h3>
            <p className="text-slate-500 text-sm">Coming soon. Ban, suspend, or verify accounts.</p>
          </div>
          
          <div className="group glass-card p-8 flex flex-col items-center justify-center text-center opacity-70 cursor-not-allowed">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-800 text-slate-400 flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Financial Reports</h3>
            <p className="text-slate-500 text-sm">Coming soon. Review platform revenue and payouts.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AdminDashboard;

