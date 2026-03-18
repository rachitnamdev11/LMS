import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listLectureDoubtsApi, replyDoubtApi } from '../../services/doubtApi.js';

const TeacherLectureDoubtsPage = () => {
  const { lectureId } = useParams();
  const [doubts, setDoubts] = useState([]);
  const [replyText, setReplyText] = useState({});

  const load = async () => {
    const res = await listLectureDoubtsApi(lectureId);
    setDoubts(res || []);
  };

  useEffect(() => {
    load();
  }, [lectureId]);

  const handleReplyChange = (id, value) => {
    setReplyText((prev) => ({ ...prev, [id]: value }));
  };

  const handleReply = async (id) => {
    const msg = replyText[id];
    if (!msg || !msg.trim()) return;
    await replyDoubtApi(id, msg.trim());
    setReplyText((prev) => ({ ...prev, [id]: '' }));
    load();
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Lecture doubts</h1>
      <ul className="space-y-3 text-xs">
        {doubts.map((d) => (
          <li
            key={d._id}
            className="border border-gray-200 dark:border-gray-700 rounded-md p-3"
          >
            <p className="text-gray-900 dark:text-gray-50 mb-1">
              <span className="font-semibold">
                {d.student?.firstName} {d.student?.lastName}
              </span>
              : {d.message}
            </p>
            {d.replies?.length > 0 && (
              <div className="mt-1 space-y-1">
                {d.replies.map((r, idx) => (
                  <p key={idx} className="text-[11px] text-gray-500">
                    Reply: {r.message}
                  </p>
                ))}
              </div>
            )}
            <div className="mt-2 space-y-1">
              <textarea
                rows={2}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1 text-[11px]"
                placeholder="Write a reply..."
                value={replyText[d._id] || ''}
                onChange={(e) => handleReplyChange(d._id, e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleReply(d._id)}
                className="px-2 py-1 rounded-md bg-indigo-600 text-white"
              >
                Send reply
              </button>
            </div>
          </li>
        ))}
        {doubts.length === 0 && (
          <p className="text-xs text-gray-500">No doubts for this lecture.</p>
        )}
      </ul>
    </div>
  );
};

export default TeacherLectureDoubtsPage;

