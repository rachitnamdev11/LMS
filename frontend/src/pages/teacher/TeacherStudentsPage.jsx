import React, { useState, useEffect } from 'react';
import { getInstructorStudentsApi } from '../../services/courseApi.js';

const TeacherStudentsPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInstructorStudentsApi()
      .then(data => {
        // Filter out courses with no students if desired, or keep them
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-dark-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </span>
            Enrolled Students
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            A comprehensive list of all students categorized by their enrolled courses.
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="glass-card p-16 text-center text-slate-500 font-medium">
          <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <p className="text-xl text-slate-700 dark:text-slate-300 font-bold mb-2">No Courses Yet</p>
          <p>You haven't created any courses. Create a course to start enrolling students.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {courses.map(course => {
            const students = course.enrolledStudents || [];
            if (students.length === 0) return null; // Skip courses with 0 students (optional, but requested focused context)
            
            return (
              <div key={course._id} className="glass-card overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-dark-700">
                {/* Course Header */}
                <div className="bg-gradient-to-r from-slate-50 to-white dark:from-dark-800 dark:to-dark-800/80 p-5 px-6 border-b border-slate-200 dark:border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.name} className="w-14 h-14 object-cover rounded-lg shadow-sm" />
                    ) : (
                      <div className="w-14 h-14 bg-slate-200 dark:bg-dark-700 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {course.name}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {course.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-400 shrink-0 flex items-center gap-2 bg-white dark:bg-dark-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-700">
                    <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                    {students.length} Student{students.length > 1 ? 's' : ''}
                  </div>
                </div>

                {/* Students Grid */}
                <div className="p-6 bg-white dark:bg-dark-900 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map(student => (
                    <div key={student._id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-dark-800/50 border border-slate-100 dark:border-dark-800 hover:border-teal-200 dark:hover:border-teal-900/50 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-dark-600 shrink-0 flex items-center justify-center font-bold text-slate-500 text-xl overflow-hidden ring-4 ring-white dark:ring-dark-900">
                        {student.avatarUrl ? (
                          <img src={student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          student.firstName?.charAt(0) || 'S'
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {courses.every(c => c.enrolledStudents?.length === 0) && (
            <div className="glass-card p-16 text-center text-slate-500 font-medium">
              <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <p className="text-xl text-slate-700 dark:text-slate-300 font-bold mb-2">No Enrollments Yet</p>
              <p>Your courses are active, but waiting for the first students to enroll.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default TeacherStudentsPage;
