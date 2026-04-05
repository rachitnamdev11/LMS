import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/apiClient.js';

// ─── Notification Bell Component ──────────────────────────────────────────────
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/me');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60s for new notifications
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const markRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => markRead(n._id)));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'announcement': return '📢';
      case 'test_result': return '📝';
      case 'doubt_reply': return '💬';
      case 'lecture_added': return '🎬';
      case 'course_updated': return '📚';
      default: return '🔔';
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        type="button"
        onClick={() => { setOpen((prev) => !prev); if (!open) fetchNotifications(); }}
        className="relative p-2 rounded-full hover:bg-slate-200 dark:hover:bg-dark-800 transition-colors text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {open && (
        <div
          id="notification-panel"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[480px] flex flex-col glass-card shadow-2xl border border-white/20 dark:border-dark-700 rounded-2xl overflow-hidden z-[100] animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-dark-700 shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li
                    key={n._id}
                    onClick={() => !n.isRead && markRead(n._id)}
                    className={`flex gap-3 px-4 py-3 border-b border-slate-100 dark:border-dark-700 last:border-0 cursor-pointer transition-colors ${
                      n.isRead
                        ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-dark-800/50'
                        : 'bg-primary-50 dark:bg-primary-900/10 hover:bg-primary-100 dark:hover:bg-primary-900/20'
                    }`}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{getTypeIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <div className="shrink-0 w-2 h-2 rounded-full bg-primary-500 mt-2" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Layout ──────────────────────────────────────────────────────────────
const Layout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-900 transition-colors duration-300">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass px-4 sm:px-6 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 text-2xl font-black tracking-tight transition-all duration-300 hover:scale-105 hover:opacity-90" onClick={closeMenu}>
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-primary-500 to-fuchsia-500 text-white shadow-lg shadow-primary-500/20">
              <svg className="w-5 h-5 ml-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
              Learn<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-fuchsia-500 dark:from-primary-400 dark:to-fuchsia-400 font-extrabold">X</span>
            </span>
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link to="/courses" className="hover:text-primary-500 transition-colors">Courses</Link>
            <Link to="/about" className="hover:text-primary-500 transition-colors">About</Link>
            <Link to="/help" className="hover:text-primary-500 transition-colors">Help</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-dark-800 transition-colors text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Notification Bell — only for logged-in students and teachers */}
          {user && (user.role === 'student' || user.role === 'teacher') && (
            <NotificationBell />
          )}

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden lg:block text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user.email} <span className="opacity-60">({user.role})</span>
                </span>
                <Link
                  to={`/${user.role}/dashboard`}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup/student"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg transition-all"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Hamburger Button (mobile only) */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-dark-800 transition-colors text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Toggle Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="fixed top-[69px] left-0 right-0 z-50 md:hidden glass border-t border-white/20 dark:border-white/10 px-4 py-4 flex flex-col gap-2 animate-fade-in">
            <Link to="/courses" onClick={closeMenu} className="py-3 px-4 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">
              Courses
            </Link>
            <Link to="/about" onClick={closeMenu} className="py-3 px-4 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">
              About
            </Link>
            <Link to="/help" onClick={closeMenu} className="py-3 px-4 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">
              Help
            </Link>
            <div className="border-t border-slate-200 dark:border-dark-700 my-1" />
            {user ? (
              <>
                <p className="px-4 text-xs text-slate-500 dark:text-slate-400">{user.email} ({user.role})</p>
                <Link
                  to={`/${user.role}/dashboard`}
                  onClick={closeMenu}
                  className="py-3 px-4 rounded-lg text-sm font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => { logout(); closeMenu(); }}
                  className="py-3 px-4 rounded-lg text-sm font-semibold text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="py-3 px-4 rounded-lg text-sm font-semibold text-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup/student"
                  onClick={closeMenu}
                  className="py-3 px-4 rounded-lg text-sm font-semibold text-center bg-primary-600 text-white hover:bg-primary-700 shadow-md transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 dark:border-dark-800 py-8 mt-auto bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} LearnX Education Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
