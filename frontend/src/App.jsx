import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import LoginPage from './pages/auth/LoginPage.jsx';
import StudentSignupPage from './pages/auth/StudentSignupPage.jsx';
import TeacherSignupPage from './pages/auth/TeacherSignupPage.jsx';
import VerifyOtpPage from './pages/auth/VerifyOtpPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import CourseCatalogPage from './pages/student/CourseCatalogPage.jsx';
import CourseDetailPage from './pages/student/CourseDetailPage.jsx';
import LecturePlayerPage from './pages/student/LecturePlayerPage.jsx';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import TeacherCoursesPage from './pages/teacher/TeacherCoursesPage.jsx';
import TeacherCourseManagePage from './pages/teacher/TeacherCourseManagePage.jsx';
import TeacherLectureDoubtsPage from './pages/teacher/TeacherLectureDoubtsPage.jsx';
import TeacherDoubtsPage from './pages/teacher/TeacherDoubtsPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage.jsx';
import Layout from './layouts/Layout.jsx';
import HomePage from './pages/common/HomePage.jsx';
import AboutPage from './pages/common/AboutPage.jsx';
import HelpPage from './pages/common/HelpPage.jsx';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Wait for auth to initialize before making routing decisions
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin text-primary-600">
           <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <Layout>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup/student" element={<StudentSignupPage />} />
      <Route path="/signup/teacher" element={<TeacherSignupPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/courses" element={<CourseCatalogPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      {/* student-specific routes */}
      <Route
        path="/student/course/:courseId"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <CourseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/lecture/:lectureId"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <LecturePlayerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/courses"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/courses/:courseId/manage"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherCourseManagePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/lectures/:lectureId/doubts"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherLectureDoubtsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/doubts"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDoubtsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminComplaintsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Layout>
);

export default App;

