import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import StudentComplaintsPage from './pages/student/StudentComplaintsPage.jsx';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import TeacherCoursesPage from './pages/teacher/TeacherCoursesPage.jsx';
import TeacherCourseManagePage from './pages/teacher/TeacherCourseManagePage.jsx';
import TeacherLectureDoubtsPage from './pages/teacher/TeacherLectureDoubtsPage.jsx';
import TeacherDoubtsPage from './pages/teacher/TeacherDoubtsPage.jsx';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage.jsx';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics.jsx';
import TeacherCreateTestPage from './pages/teacher/TeacherCreateTestPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import StudentTestPage from './pages/student/StudentTestPage.jsx';
import TestResultPage from './pages/student/TestResultPage.jsx';
import LeaderboardPage from './pages/student/LeaderboardPage.jsx';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminCoursesPage from './pages/admin/AdminCoursesPage.jsx';
import AdminReviewsPage from './pages/admin/AdminReviewsPage.jsx';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage.jsx';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage.jsx';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage.jsx';
import AdminLogsPage from './pages/admin/AdminLogsPage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';
import Layout from './layouts/Layout.jsx';
import HomePage from './pages/common/HomePage.jsx';
import AboutPage from './pages/common/AboutPage.jsx';
import HelpPage from './pages/common/HelpPage.jsx';

// ── Auth guard ────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin text-primary-600">
          <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

// ── Routes that must render WITHOUT the global navbar/footer ──────────────────
// StudentTestPage and TestResultPage are full-screen exam UIs.
// Rendering them inside Layout causes the sticky z-50 navbar to cover the exam UI.
const FULLSCREEN_PATHS = ['/student/test/'];

const App = () => {
  const { pathname } = useLocation();
  const isFullscreen = FULLSCREEN_PATHS.some((p) => pathname.startsWith(p));

  if (isFullscreen) {
    // Render ONLY the exam routes — no Layout, no navbar
    return (
      <Routes>
        <Route
          path="/student/test/:testId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentTestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/test/:testId/result"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <TestResultPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    );
  }

  // All other pages inside the global Layout
  return (
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

        {/* Student routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
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
          path="/student/leaderboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/complaints"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentComplaintsPage />
            </ProtectedRoute>
          }
        />

        {/* Teacher routes */}
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
          path="/teacher/students"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherStudentsPage />
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
          path="/teacher/analytics"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/lectures/:lectureId/test"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherCreateTestPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReviewsPage />
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
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminNotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSettingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
