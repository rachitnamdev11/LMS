import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleWishlistApi } from '../../services/courseApi.js';

const WishlistSection = ({ wishlist, setWishlist }) => {
  const [removingWishlist, setRemovingWishlist] = useState(null);

  return (
    <section>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            My Wishlist
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Courses you've saved for later.</p>
        </div>
        <Link to="/courses" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
          Browse catalog &rarr;
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-slate-50 dark:bg-dark-800/50 border border-dashed border-slate-300 dark:border-dark-700 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No courses wishlisted yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6 text-sm">Browse the course catalog and click the heart icon to save courses you're interested in.</p>
          <Link
            to="/courses"
            className="px-6 py-2.5 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-semibold hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors inline-block text-sm"
          >
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((c) => (
            <div
              key={c._id}
              className="group glass-card flex flex-col overflow-hidden hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 hover:-translate-y-1 border border-slate-200 dark:border-dark-800"
            >
              <div className="aspect-video bg-slate-200 dark:bg-dark-800 relative overflow-hidden">
                {c.thumbnailUrl ? (
                  <img src={c.thumbnailUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30">
                    <svg className="w-10 h-10 text-pink-300 dark:text-pink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                )}
                <button
                  onClick={async () => {
                    setRemovingWishlist(c._id);
                    try {
                      await toggleWishlistApi(c._id);
                      setWishlist((prev) => prev.filter((w) => w._id !== c._id));
                    } catch (_) { /* ignore */ }
                    setRemovingWishlist(null);
                  }}
                  disabled={removingWishlist === c._id}
                  title="Remove from wishlist"
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/40 hover:bg-red-600 backdrop-blur-sm text-white transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                  {removingWishlist === c._id ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </button>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{c.name}</h3>
                {c.instructor && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {c.instructor.firstName} {c.instructor.lastName}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-dark-800">
                  <span className="text-lg font-black text-slate-900 dark:text-white">₹{c.price}</span>
                  <Link
                    to={c._id ? `/student/course/${c._id}` : `/courses`}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default WishlistSection;
