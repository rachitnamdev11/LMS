import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { getInstructorDoubtsApi, replyDoubtApi } from '../../services/doubtApi.js';
import { getInstructorStudentsApi } from '../../services/courseApi.js';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [isSubmitting, setIsSubmitting] = useState({});

  useEffect(() => {
    getInstructorDoubtsApi().then(setDoubts).catch(console.error);
    getInstructorStudentsApi().then(setStudentsData).catch(console.error);
  }, []);

  // Compute pending doubts
  const pendingDoubtsCount = doubts.filter(d => d.replies.length === 0).length;

  // Compute unique students
  const uniqueStudents = new Set();
  studentsData.forEach(course => {
    course.enrolledStudents?.forEach(student => {
      uniqueStudents.add(student._id);
    });
  });
  const totalStudentsCount = uniqueStudents.size;

  const handleReply = async (doubtId) => {
    if (!replyText[doubtId]?.trim()) return;
    setIsSubmitting(prev => ({ ...prev, [doubtId]: true }));
    try {
      const updatedDoubt = await replyDoubtApi(doubtId, replyText[doubtId]);
      setDoubts(prev => prev.map(d => d._id === doubtId ? updatedDoubt : d));
      setReplyText(prev => ({ ...prev, [doubtId]: '' }));
    } catch (err) {
      console.error('Failed to reply:', err);
    } finally {
      setIsSubmitting(prev => ({ ...prev, [doubtId]: false }));
    }
  };

  // Group doubts by lecture
  const doubtsByLecture = doubts.reduce((acc, d) => {
    if (!d.lecture || !d.course) return acc;
    const key = d.lecture._id;
    if (!acc[key]) {
      acc[key] = {
        courseTitle: d.course.title,
        lectureTitle: d.lecture.title,
        lectureOrder: d.lecture.order,
        doubts: []
      };
    }
    acc[key].doubts.push(d);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 rounded-3xl p-8 sm:p-10 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Welcome, Instructor {user?.firstName || ''}! 🎓</h1>
          <p className="text-emerald-100 text-lg max-w-xl">
            Manage your courses, lectures, tests, and interact with your students from one central hub.
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
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Courses</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">Active</p>
          </div>
        </div>
        
        <Link to="/teacher/students" className="glass-card p-6 flex items-center gap-5 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors border border-transparent hover:border-teal-200 dark:hover:border-teal-800">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center transition-transform hover:scale-110">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div>
             <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Students</p>
             <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalStudentsCount}</p>
          </div>
        </Link>

        <div className="glass-card p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          </div>
          <div>
             <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Doubts</p>
             <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingDoubtsCount}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/teacher/courses"
            className="group glass-card p-8 flex flex-col items-center justify-center text-center hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">My Courses</h3>
            <p className="text-slate-500 text-sm">Create, edit, and manage all your teaching materials.</p>
          </Link>
          
          <div className="group glass-card p-8 flex flex-col items-center justify-center text-center opacity-70 cursor-not-allowed">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-800 text-slate-400 flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analytics View</h3>
            <p className="text-slate-500 text-sm">Coming soon. Check your revenue and student engagement.</p>
          </div>
          
          <Link
            to="/teacher/doubts"
            className="group glass-card p-8 flex flex-col items-center justify-center text-center hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
          >
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Student Doubts</h3>
            <p className="text-slate-500 text-sm">Respond to student questions directly from the new Q&A hub.</p>
            {pendingDoubtsCount > 0 && (
              <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                {pendingDoubtsCount} Pending
              </span>
            )}
          </Link>
        </div>
      </section>

    </div>
  );
};

export default TeacherDashboard;
