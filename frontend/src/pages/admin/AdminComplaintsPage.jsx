import React, { useEffect, useState } from 'react';
import api from '../../services/apiClient.js';

const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);

  const load = async () => {
    const res = await api.get('/admin/complaints').then((r) => r.data.data);
    setComplaints(res || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleResolve = async (id, removeCourse) => {
    await api.post('/admin/complaints/resolve', { complaintId: id, removeCourse });
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Complaints</h1>
      <table className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          <tr>
            <th className="px-2 py-1 text-left">Course</th>
            <th className="px-2 py-1 text-left">Student</th>
            <th className="px-2 py-1 text-left">Reason</th>
            <th className="px-2 py-1 text-left">Status</th>
            <th className="px-2 py-1" />
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c._id} className="border-t border-gray-200 dark:border-gray-700">
              <td className="px-2 py-1">{c.course?.name}</td>
              <td className="px-2 py-1">
                {c.student?.firstName} {c.student?.lastName}
              </td>
              <td className="px-2 py-1">{c.reason}</td>
              <td className="px-2 py-1">{c.isResolved ? 'Resolved' : 'Open'}</td>
              <td className="px-2 py-1 space-x-1">
                {!c.isResolved && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleResolve(c._id, false)}
                      className="px-2 py-1 rounded bg-emerald-600 text-white"
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolve(c._id, true)}
                      className="px-2 py-1 rounded bg-red-600 text-white"
                    >
                      Remove course
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {complaints.length === 0 && (
            <tr>
              <td className="px-2 py-2 text-center text-gray-500" colSpan={5}>
                No complaints.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminComplaintsPage;

