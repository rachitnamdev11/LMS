import React, { useEffect, useState } from 'react';
import api from '../../services/apiClient.js';
import { AdminPageLayout } from './AdminDashboard.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminPageLayout>
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
        </div>
      </AdminPageLayout>
    );
  }

  const enrollmentData = (data?.enrollmentTrend || []).map((item) => ({
    month: item._id,
    enrollments: item.count,
    revenue: item.revenue
  }));

  const categoryData = (data?.categoryDistribution || []).map((item) => ({
    name: item._id || 'Uncategorized',
    value: item.count
  }));

  // Process user growth data
  const userGrowthMap = {};
  (data?.userGrowth || []).forEach((item) => {
    if (!userGrowthMap[item._id.month]) userGrowthMap[item._id.month] = { month: item._id.month };
    userGrowthMap[item._id.month][item._id.role] = item.count;
  });
  const userGrowthData = Object.values(userGrowthMap).sort((a, b) => a.month.localeCompare(b.month));

  const completionRate = data?.completionRate || {};

  return (
    <AdminPageLayout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics & Reporting</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Platform-wide insights and trends.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-6 text-center">
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{Math.round(completionRate.avgProgress || 0)}%</p>
            <p className="text-sm text-slate-500 mt-1">Avg Completion Rate</p>
          </div>
          <div className="glass-card p-6 text-center">
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{completionRate.completed || 0}</p>
            <p className="text-sm text-slate-500 mt-1">Courses Completed</p>
          </div>
          <div className="glass-card p-6 text-center">
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{completionRate.totalTracked || 0}</p>
            <p className="text-sm text-slate-500 mt-1">Enrollments Tracked</p>
          </div>
        </div>

        {/* Enrollment & Revenue Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Enrollment Trend (6 months)</h3>
            {enrollmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="enrollments" fill="#6366f1" radius={[6, 6, 0, 0]} name="Enrollments" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-500 py-10 text-center">No enrollment data available.</p>}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Revenue Trend (6 months)</h3>
            {enrollmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={2} dot={{ r: 4 }} name="Revenue (₹)" />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-500 py-10 text-center">No revenue data available.</p>}
          </div>
        </div>

        {/* Category Distribution + User Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Course Categories</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-500 py-10 text-center">No category data available.</p>}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">User Growth (6 months)</h3>
            {userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="student" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students" />
                  <Bar dataKey="teacher" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Teachers" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-500 py-10 text-center">No growth data available.</p>}
          </div>
        </div>

        {/* Top Courses */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top 5 Courses by Enrollment</h3>
          {(data?.topCourses || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.topCourses} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="enrollments" fill="#22c55e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-500 py-10 text-center">No course enrollment data available.</p>}
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default AdminAnalyticsPage;
