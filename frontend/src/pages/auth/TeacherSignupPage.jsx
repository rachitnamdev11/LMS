import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupApi } from '../../services/authApi.js';

const TeacherSignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    address: '',
    qualifications: '',
    experience: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Strict validation
    const requiredFields = [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email Address' },
      { key: 'password', label: 'Password' },
      { key: 'age', label: 'Age' },
      { key: 'gender', label: 'Gender' },
      { key: 'address', label: 'Address' },
      { key: 'qualifications', label: 'Qualifications' },
      { key: 'experience', label: 'Experience' }
    ];

    for (const field of requiredFields) {
      if (!form[field.key] || form[field.key].toString().trim() === '') {
        setError(`Please fill out the ${field.label} field. All fields are mandatory.`);
        return;
      }
    }

    setLoading(true);
    try {
      const profile = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender,
        address: form.address,
        qualifications: form.qualifications,
        experience: form.experience,
      };
      await signupApi({ email: form.email, password: form.password, role: 'teacher', profile });
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-300 dark:border-dark-700 bg-white dark:bg-dark-800 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow shadow-sm text-sm';
  const labelClass = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';

  return (
    <div className="flex flex-col-reverse md:flex-row bg-white dark:bg-dark-950 rounded-3xl shadow-2xl overflow-hidden min-h-[600px] max-w-5xl mx-auto border border-slate-200 dark:border-dark-800">

      {/* Form Section */}
      <div className="w-full md:w-7/12 p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-slate-50 dark:bg-dark-900">
        <div className="max-w-lg w-full mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Instructor Sign Up</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Apply to teach and inspire learners worldwide.</p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First Name</label>
                <input name="firstName" className={inputClass} placeholder="Jane" value={form.firstName} onChange={handleChange} required />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input name="lastName" className={inputClass} placeholder="Doe" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email Address</label>
              <input name="email" type="email" className={inputClass} placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>Password</label>
              <input name="password" type="password" className={inputClass} placeholder="Create a strong password" value={form.password} onChange={handleChange} required />
            </div>

            {/* Age + Gender row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Age</label>
                <input name="age" type="number" min="18" className={inputClass} placeholder="e.g. 30" value={form.age} onChange={handleChange} required />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <div className="relative">
                  <select name="gender" className={inputClass + ' appearance-none pr-10'} value={form.gender} onChange={handleChange} required>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className={labelClass}>Address</label>
              <input name="address" className={inputClass} placeholder="City, State / Country" value={form.address} onChange={handleChange} required />
            </div>

            {/* Qualifications */}
            <div>
              <label className={labelClass}>Qualifications</label>
              <input name="qualifications" className={inputClass} placeholder="e.g. M.Sc. Computer Science, AWS Certified" value={form.qualifications} onChange={handleChange} required />
            </div>

            {/* Experience */}
            <div>
              <label className={labelClass}>Teaching / Industry Experience</label>
              <input name="experience" className={inputClass} placeholder="e.g. 5 years in software development" value={form.experience} onChange={handleChange} required />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-emerald-600 text-white font-bold tracking-wide hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 disabled:opacity-70 transition-all shadow-md"
            >
              {loading ? 'Submitting Application...' : 'Apply as Instructor'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-dark-800 text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">Log In</Link>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Want to learn instead?{' '}
              <Link to="/signup/student" className="font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Sign up as Student</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Branding Section */}
      <div className="w-full md:w-5/12 bg-gradient-to-br from-emerald-600 to-teal-800 p-10 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-20 -mt-20"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/30 rounded-full blur-3xl -mr-20 -mb-20"></div>

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black mb-3">Share Your Expertise</h2>
          <p className="text-teal-100 text-base leading-relaxed">
            Become an instructor and inspire the next generation of professionals.
          </p>
        </div>

        <div className="relative z-10 mt-10 md:mt-0">
          <div className="glass-card !bg-white/10 !border-white/20 p-6 rounded-2xl mb-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">JS</div>
              <div>
                <p className="font-bold text-sm">John Smith</p>
                <p className="text-xs text-teal-200">Instructor since 2023 · 2,400+ students</p>
              </div>
            </div>
            <p className="text-sm italic font-medium leading-relaxed text-teal-50">
              "This platform gave me the tools to reach thousands of students globally. The experience has been incredibly rewarding."
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '500+', sub: 'Active Courses' },
              { label: '98%', sub: 'Student Satisfaction' },
            ].map(({ label, sub }) => (
              <div key={sub} className="bg-white/10 border border-white/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-black">{label}</p>
                <p className="text-xs text-teal-200 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default TeacherSignupPage;
