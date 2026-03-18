import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPasswordApi } from '../../services/authApi.js';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await resetPasswordApi({ email, otp, newPassword: password });
      setMessage('Password reset successfully. You can login now.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Reset password</h1>
      <p className="text-xs mb-3 text-gray-500">OTP sent to {email}</p>
      {message && <p className="mb-3 text-sm text-green-500">{message}</p>}
      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">OTP</label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">New password</label>
          <input
            type="password"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded-md bg-indigo-600 text-white text-sm font-medium"
        >
          Reset password
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;

