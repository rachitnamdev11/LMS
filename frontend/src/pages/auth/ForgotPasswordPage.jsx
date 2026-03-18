import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPasswordApi } from '../../services/authApi.js';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await forgotPasswordApi(email);
      setMessage('OTP sent. Check your email inbox.');
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-dark-950 rounded-3xl shadow-2xl overflow-hidden min-h-[500px] max-w-4xl mx-auto border border-slate-200 dark:border-dark-800">
      
      {/* Branding Section */}
      <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-primary-600 to-indigo-800 p-10 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10">
          <Link to="/login" className="inline-flex items-center text-indigo-200 hover:text-white mb-8 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to login
          </Link>
          <h2 className="text-3xl font-black mb-4">Forgot Password?</h2>
          <p className="text-indigo-100 text-lg">No worries, we'll send you reset instructions.</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-slate-50 dark:bg-dark-900 relative">
        <div className="max-w-md w-full mx-auto">
          
          <div className="md:hidden mb-6">
            <Link to="/login" className="inline-flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to login
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h1>
            <p className="text-slate-500 dark:text-slate-400">Enter your email and we'll send you a 6-digit OTP code to reset your password.</p>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-3 animate-fade-in">
              <svg className="w-5 h-5 auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-3 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-300 dark:border-dark-700 bg-white dark:bg-dark-800 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow shadow-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold tracking-wide hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md mt-6 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </>
              ) : 'Send Reset Link'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
