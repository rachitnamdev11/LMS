import React, { useState, useEffect } from 'react';
import { getInstructorAnalyticsApi } from '../../services/courseApi.js';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Download, Calendar } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const TeacherAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    getInstructorAnalyticsApi(days)
      .then((res) => {
        setData(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  const handleExport = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Course Name,Enrollments,Completion Rate (%),Engagement Rate (Views),Revenue\n"
      + data.courseWiseAnalytics.map(e => `"${e.name}",${e.enrollments},${e.completionRate},${e.engagementRate},${e.revenue}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_${days}_days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin text-emerald-600">
           <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        </div>
      </div>
    );
  }

  const { global, revenueTrends, courseWiseAnalytics } = data || {
    global: { totalRevenue: 0, totalStudents: 0, activeStudents: 0, averageCompletionRate: 0 },
    revenueTrends: [],
    courseWiseAnalytics: []
  };

  // Prepare Pie Chart data (Engagement per course)
  const pieData = courseWiseAnalytics.map(c => ({
    name: c.name,
    value: c.engagementRate
  })).filter(c => c.value > 0);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track your revenue and student engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-1">
            <Calendar className="w-4 h-4 text-slate-400 ml-2" />
            <select 
              value={days} 
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={365}>All Time</option>
            </select>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">₹{global.totalRevenue.toLocaleString()}</h3>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="font-medium text-slate-500 dark:text-slate-400">Total Students</p>
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{global.totalStudents}</h3>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="font-medium text-slate-500 dark:text-slate-400">Active Students</p>
            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{global.activeStudents}</h3>
            <span className="text-sm font-medium text-slate-500">last {days}d</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="font-medium text-slate-500 dark:text-slate-400">Avg Completion</p>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{global.averageCompletionRate}%</h3>
        </div>
      </div>

      {/* Global Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Revenue Trends</h3>
          <div className="h-72 w-full">
            {revenueTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="date" tick={{fill: '#6b7280', fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fill: '#6b7280', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#10b981' }}
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No revenue data in this period</div>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Engagement Distribution (Views)</h3>
          <div className="h-72 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No engagement data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Course-wise Analytics Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Course Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-300">Course Name</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-300">Enrollments</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-300">Completion</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-300">Total Views</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-300">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {courseWiseAnalytics.length > 0 ? (
                courseWiseAnalytics.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-900 dark:text-white truncate max-w-xs">{course.name}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {course.enrollments}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 max-w-[100px]">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{ width: `${course.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{course.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                      {course.engagementRate} views
                    </td>
                    <td className="py-4 px-6 font-medium text-emerald-600 dark:text-emerald-400">
                      ₹{course.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalytics;
