import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../hooks/useAuth.js';

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
          <Link to="/" className="text-2xl font-bold tracking-tight text-gradient transition-transform hover:scale-105" onClick={closeMenu}>
            LMS
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link to="/courses" className="hover:text-primary-500 transition-colors">Courses</Link>
            <Link to="/about" className="hover:text-primary-500 transition-colors">About</Link>
            <Link to="/help" className="hover:text-primary-500 transition-colors">Help</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
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
          <p>&copy; {new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

