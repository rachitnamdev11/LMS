import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { resetPasswordApi } from '../../services/authApi.js';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    
    const newValue = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = newValue;
    setOtp(newOtp);
    
    if (newValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(isNaN)) return;
    
    const newOtp = [...otp];
    pastedData.forEach((val, i) => { if (i < 6) newOtp[i] = val; });
    setOtp(newOtp);
    
    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await resetPasswordApi({ email, otp: otpString, newPassword: password });
      setMessage('Password reset successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. OTP may be invalid.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-dark-950 rounded-3xl shadow-2xl overflow-hidden min-h-[600px] max-w-4xl mx-auto border border-slate-200 dark:border-dark-800">
      
      {/* Branding Section */}
      <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-indigo-700 to-slate-900 p-10 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10">
          <Link to="/login" className="inline-flex items-center text-indigo-300 hover:text-white mb-8 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to login
          </Link>
          <h2 className="text-3xl font-black mb-4">Set a New Password</h2>
          <p className="text-indigo-200 text-lg">Secure your account with a strong new password to continue.</p>
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create New Password</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Enter the OTP sent to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span> and choose a new password.
            </p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 tracking-wider uppercase text-center sm:text-left">6-Digit OTP</label>
              <div className="flex justify-center sm:justify-start gap-2" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={digit}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm outline-none"
                    maxLength={1}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-300 dark:border-dark-700 bg-white dark:bg-dark-800 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || otp.join('').length < 6 || password.length < 6}
              className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-lg tracking-wide hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex justify-center items-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Resetting...
                </>
              ) : 'Set New Password'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
