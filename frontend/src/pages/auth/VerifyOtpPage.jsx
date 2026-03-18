import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOtpApi } from '../../services/authApi.js';
import { useAuth } from '../../hooks/useAuth.js';

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authenticateUser } = useAuth();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtpApi({ email, otp });
      authenticateUser({ token: res.token, role: res.role, email, _id: res._id });
      if (res.role === 'student') navigate('/student/dashboard');
      else if (res.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Verify OTP</h1>
      <p className="text-xs mb-3 text-gray-500">OTP sent to {email}</p>
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
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-md bg-indigo-600 text-white text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
};

export default VerifyOtpPage;

