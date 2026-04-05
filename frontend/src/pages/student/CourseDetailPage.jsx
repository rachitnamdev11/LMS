import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseDetailApi, checkEnrollmentApi, getWishlistApi, toggleWishlistApi } from '../../services/courseApi.js';
import { createEnrollmentOrderApi, verifyPaymentApi } from '../../services/paymentApi.js';
import { addCourseReviewApi } from '../../services/reviewApi.js';
import { useAuth } from '../../hooks/useAuth.js';

const CourseDetailPage = () => {
  const { user } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);
  const [userReview, setUserReview] = useState(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Wishlist & Share state
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCourseDetailApi(courseId);
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  // Check enrollment status separately (only for logged-in users)
  useEffect(() => {
    if (!user) {
      setEnrollmentChecked(true);
      return;
    }
    checkEnrollmentApi(courseId)
      .then((res) => {
        setIsEnrolled(res?.enrolled === true);
        if (res?.userReview) {
          setUserReview(res.userReview);
          setRating(res.userReview.rating);
          setReviewText(res.userReview.reviewText || '');
        }
      })
      .catch(() => setIsEnrolled(false))
      .finally(() => setEnrollmentChecked(true));
  }, [courseId, user]);

  // Fetch wishlist state (students only)
  useEffect(() => {
    if (!user || user.role !== 'student') return;
    getWishlistApi()
      .then((data) => {
        const courses = data?.courses || [];
        setInWishlist(courses.some((c) => (c._id || c) === courseId || (c._id || c)?.toString() === courseId));
      })
      .catch(console.error);
  }, [courseId, user]);

  const handleWishlistToggle = async () => {
    if (!user || user.role !== 'student') return;
    setWishlistLoading(true);
    try {
      await toggleWishlistApi(courseId);
      setInWishlist((prev) => !prev);
    } catch (err) {
      console.error('Wishlist error', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(data?.course?.name || 'Check out this course on LearnX!');

  const socialLinks = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
      color: 'bg-green-500 hover:bg-green-600',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.561 4.14 1.54 5.876L.057 23.886a.5.5 0 00.611.63l6.197-1.624A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.894 9.894 0 01-5.031-1.374l-.36-.214-3.735.979 1.002-3.646-.234-.375A9.86 9.86 0 012.1 12C2.1 6.534 6.534 2.1 12 2.1S21.9 6.534 21.9 12 17.466 21.9 12 21.9z" />
        </svg>
      )
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    },
    {
      name: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
      color: 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    }
  ];

  const handleBuy = async () => {
    setProcessingPayment(true);
    try {
      const order = await createEnrollmentOrderApi(courseId);

      const loadScript = (src) =>
        new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = src;
          script.onload = () => resolve(true);
          script.onerror = () => reject(new Error('Failed to load script'));
          document.body.appendChild(script);
        });

      await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!window.Razorpay || !razorpayKey) {
        console.error('Razorpay not configured');
        alert("Payment gateway is not configured properly.");
        setProcessingPayment(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Learning Platform',
        description: `Enroll in ${data?.course?.name}`,
        theme: { color: '#4f46e5' },
        handler: async (response) => {
          try {
            await verifyPaymentApi({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            // Mark as enrolled locally and show success banner
            setIsEnrolled(true);
            setEnrollmentChecked(true);
            setPaymentSuccess(true);
            setProcessingPayment(false);
          } catch (err) {
            console.error(err);
            alert("Payment verification failed. Please contact support.");
            setProcessingPayment(false);
          }
        },
        modal: {
           ondismiss: function() {
              setProcessingPayment(false);
           }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Failed to initiate payment.");
      setProcessingPayment(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setReviewError('Please select a rating');
      return;
    }
    setSubmittingReview(true);
    setReviewError('');
    try {
      await addCourseReviewApi({ courseId, rating, reviewText });
      setReviewSuccess(true);
      const res = await getCourseDetailApi(courseId);
      setData(res);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 glass-card text-center border border-red-200 dark:border-red-900">
        <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Oops! Something went wrong</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-slate-200 dark:bg-dark-800 rounded-lg hover:bg-slate-300 dark:hover:bg-dark-700 transition-colors font-medium">
          Go Back
        </button>
      </div>
    );
  }

  const { course, lectures } = data || {};

  return (
    <div className="animate-fade-in pb-16">
      
      {/* Course Banner Component */}
      <div className="bg-slate-900 dark:bg-dark-950 rounded-3xl overflow-hidden shadow-2xl relative mb-12 border border-slate-800">
        <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${course?.thumbnailUrl || ''})`, filter: 'blur(20px) brightness(0.5)' }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40 z-0"></div>
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start md:items-center">
          {course?.thumbnailUrl && (
            <div className="hidden md:block w-1/3 aspect-video shrink-0 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800">
              <img src={course.thumbnailUrl} alt={course.name} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="flex-1 text-white">
             <div className="flex gap-2 mb-4">
               {course?.language && (
                 <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider text-slate-200">
                   {course.language}
                 </span>
               )}
               <span className="px-3 py-1 bg-primary-500/20 backdrop-blur-md border border-primary-500/30 rounded-full text-xs font-bold uppercase tracking-wider text-primary-200">
                 Bestseller
               </span>
             </div>
             
             <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
               {course?.name}
             </h1>
             <p className="text-lg md:text-xl text-slate-300 mb-6 max-w-3xl line-clamp-3">
               {course?.description}
             </p>
             
             <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </div>
                  {course?.ratingsSummary?.totalRatings > 0 ? (
                    <>
                      <span className="text-white font-bold">{Number(course.ratingsSummary.averageRating).toFixed(1)}</span>
                      <span>({course.ratingsSummary.totalRatings} ratings)</span>
                    </>
                  ) : (
                    <span className="text-slate-300 italic">No ratings yet</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <span>{course?.enrolledStudents?.length || 0} students enrolled</span>
                </div>
                
                <div className="flex items-center gap-2">
                   <span className="text-slate-400">Created by:</span>
                   <span className="text-primary-300 font-bold underline decoration-primary-500/50 underline-offset-4">
                     {course?.instructor?.firstName || 'Unknown'} {course?.instructor?.lastName || ''}
                   </span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 relative">
        
        {/* Main Content Area */}
        <div className="w-full lg:w-2/3 space-y-12">
           
           {/* What you'll learn */}
           <section className="glass-card p-8">
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">What you'll learn</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 "Build modern, robust, and scalable applications",
                 "Master the fundamental concepts behind the technologies",
                 "Deploy your applications to production environments",
                 "Learn best practices from industry experts"
               ].map((item, i) => (
                 <div key={i} className="flex items-start gap-3">
                   <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   <span className="text-slate-700 dark:text-slate-300">{item}</span>
                 </div>
               ))}
             </div>
           </section>

           {/* Course Content / Curriculum */}
           <section>
             <div className="flex items-end justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Course Content</h2>
                <p className="text-slate-500 font-medium">{lectures?.length || 0} lectures</p>
             </div>
             
             <div className="glass-card shadow-sm border border-slate-200 dark:border-dark-800 overflow-hidden">
               {lectures?.length > 0 ? (
                 (user?.role === 'teacher' && String(course?.instructor?._id) === String(user?.profileId)) || isEnrolled ? (
                   <ul className="divide-y divide-slate-100 dark:divide-dark-800">
                     {lectures.map((l, index) => (
                       <li key={l._id} className="group hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                         <div className="p-5 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shrink-0">
                               {index + 1}
                             </div>
                             <div>
                               <h4 className="font-semibold text-slate-900 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{l.title}</h4>
                               <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                 Video Lecture
                               </p>
                             </div>
                           </div>
                           {l.videoUrl && (
                             <button
                               type="button"
                               onClick={() => navigate(`/student/lecture/${l._id}`, { state: { lecture: { ...l, course: courseId } } })}
                               className="opacity-0 group-hover:opacity-100 px-4 py-2 rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 text-sm font-semibold transition-all transform hover:scale-105 shadow-sm whitespace-nowrap"
                             >
                               Watch & Notes
                             </button>
                           )}
                         </div>
                       </li>
                     ))}
                   </ul>
                 ) : (
                   <div className="p-10 text-center relative pointer-events-none">
                     <div className="absolute inset-0 bg-slate-50/50 dark:bg-dark-900/50 backdrop-blur-[2px]"></div>
                     <div className="w-16 h-16 bg-slate-200 dark:bg-dark-800 text-slate-500 rounded-full flex items-center justify-center mb-4 mx-auto relative z-10 shadow-inner">
                       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                     </div>
                     <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2 relative z-10">Curriculum Locked</h3>
                     <p className="text-slate-500 max-w-sm mx-auto relative z-10">Enroll in this course to unlock access to the premium video lectures and resources.</p>
                   </div>
                 )
               ) : (
                 <div className="p-10 text-center text-slate-500">
                   No curriculum has been uploaded for this course yet.
                 </div>
               )}
             </div>
           </section>

            {/* Rate border Custom Rate logic */}
            {user?.role === 'student' && isEnrolled && (
              <section className="glass-card p-8 border border-slate-200 dark:border-dark-800 mt-12 shadow-sm rounded-2xl">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Rate this Course</h2>
                {userReview || reviewSuccess ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 p-6 rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="font-semibold text-lg">{reviewSuccess ? "Thank you for rating this course!" : "You have already rated this course"}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-emerald-100 dark:border-emerald-800/50">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className={`w-6 h-6 ${(userReview?.rating || rating) >= star ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      {(userReview?.reviewText || reviewText) && (
                        <p className="text-slate-700 dark:text-slate-300 italic">"{(userReview?.reviewText || reviewText)}"</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    {reviewError && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
                        {reviewError}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                          >
                            <svg className={`w-10 h-10 ${star <= (hoverRating || rating) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" htmlFor="reviewText">Write a Review (Optional)</label>
                      <textarea
                        id="reviewText"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
                        rows="4"
                        placeholder="How was your experience taking this course?"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-3 rounded-xl bg-primary-600 text-white font-bold tracking-wide hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </section>
            )}
        </div>

        {/* Sticky Sidebar */}
        <div className="w-full lg:w-1/3">
            {/* ── Sidebar purchase/access card ── */}
            <div className="sticky top-28 glass-card border-t-4 border-t-primary-500 overflow-hidden shadow-2xl">
              {/* Mobile-only thumbnail inside card */}
              {course?.thumbnailUrl && (
                <div className="md:hidden w-full aspect-video border-b border-slate-200 dark:border-dark-800">
                  <img src={course.thumbnailUrl} alt={course.name} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-8">
                {/* Payment success banner */}
                {paymentSuccess && (
                  <div className="mb-5 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl px-4 py-3">
                    <svg className="w-5 h-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm font-semibold">Payment successful! You're now enrolled.</p>
                  </div>
                )}

                {/* Hide price if user is enrolled or is the teacher */}
                {!(isEnrolled || (user?.role === 'teacher' && String(course?.instructor?._id) === String(user?.profileId))) && (
                  <div className="text-4xl font-black text-slate-900 dark:text-white mb-6">
                    ₹{course?.price}
                  </div>
                )}

                {/* Teacher who owns the course */}
                {user?.role === 'teacher' && String(course?.instructor?._id) === String(user?.profileId) ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/teacher/courses/${courseId}/manage`)}
                    className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg tracking-wide hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mb-4 flex items-center justify-center gap-2"
                  >
                    Manage Your Course
                  </button>

                /* Student: enrollment status still loading */
                ) : !enrollmentChecked ? (
                  <div className="w-full py-4 rounded-xl bg-slate-100 dark:bg-dark-800 animate-pulse mb-4 h-14" />

                /* Student: already enrolled → Go to Course */
                ) : isEnrolled ? (
                  user?.role === 'student' ? (
                    <button
                      type="button"
                      onClick={() => navigate('/student/dashboard')}
                      className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold text-lg tracking-wide hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mb-4 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Go to Course
                    </button>
                  ) : (
                    <div className="w-full py-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-center tracking-wide mb-4 border border-emerald-200 dark:border-emerald-800">
                      Video Unlocked
                    </div>
                  )

                /* Not enrolled → Enroll Now / Buy */
                ) : (
                  <button
                    type="button"
                    onClick={handleBuy}
                    disabled={processingPayment}
                    className="w-full py-4 rounded-xl bg-primary-600 text-white font-bold text-lg tracking-wide hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mb-4 flex items-center justify-center gap-2"
                  >
                    {processingPayment ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        Enroll Now — ₹{course?.price}
                      </>
                    )}
                  </button>
                )}
              
              {!(isEnrolled || (user?.role === 'teacher' && String(course?.instructor?._id) === String(user?.profileId))) && (
                <p className="text-center text-xs text-slate-500 mb-8 mt-4">Secure payment powered by Razorpay. 30-Day Money-Back Guarantee.</p>
              )}
              
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white">This course includes:</h3>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-3">
                     <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                     {lectures?.length || 0} on-demand video lectures
                  </li>
                  <li className="flex items-center gap-3">
                     <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                     Full lifetime access
                  </li>
                  <li className="flex items-center gap-3">
                     <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                     Access on mobile and TV
                  </li>
                  <li className="flex items-center gap-3">
                     <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     Certificate of completion
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-dark-800 flex justify-between gap-4">
                <button
                  id="share-course-btn"
                  onClick={() => setShareOpen(true)}
                  className="flex-1 py-2 font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
                <div className="w-px bg-slate-200 dark:bg-dark-800" />
                {user?.role === 'student' ? (
                  <button
                    id="wishlist-toggle-btn"
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={`flex-1 py-2 font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 ${
                      inWishlist
                        ? 'text-pink-600 dark:text-pink-400 hover:text-slate-600 dark:hover:text-slate-300'
                        : 'text-slate-700 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {inWishlist ? 'Wishlisted' : 'Add to Wishlist'}
                  </button>
                ) : (
                  <button className="flex-1 py-2 font-semibold text-slate-700 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Add to Wishlist
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShareOpen(false)}>
          <div
            className="relative w-full max-w-sm bg-white dark:bg-dark-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-dark-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-dark-700 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Share this Course</h3>
              <button onClick={() => setShareOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors text-slate-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Copy Link */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Course Link</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={window.location.href}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-700 bg-slate-50 dark:bg-dark-800 text-slate-700 dark:text-slate-300 outline-none"
                  />
                  <button
                    id="copy-course-link-btn"
                    onClick={handleCopyLink}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${linkCopied ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600'}`}
                  >
                    {linkCopied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              {/* Social Buttons */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">Share on</p>
                <div className="grid grid-cols-3 gap-3">
                  {socialLinks.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-white text-xs font-semibold transition-all ${s.color}`}
                    >
                      {s.icon}
                      {s.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8 animate-fade-in" onClick={() => setPreviewVideoUrl(null)}>
          <div className="relative w-full max-w-5xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-4 right-4 text-white hover:text-red-500 z-10 transition-colors bg-black/50 hover:bg-black/80 p-2 rounded-full backdrop-blur-md"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="aspect-video w-full bg-black">
              <video
                src={previewVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                controlsList="nodownload"
              ></video>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default CourseDetailPage;

