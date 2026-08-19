import React, { useState, useEffect } from 'react';
import { Star, Sparkles, Send, CheckCircle2, MessageSquare, TrendingUp, Users, ShieldCheck, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  subscribeToPlatformStatsFromFirestore, 
  incrementVisitorCountInFirestore, 
  submitPlatformRatingToFirestore 
} from '../services/firebaseDataSync';

interface PlatformRatingWidgetProps {
  currentUser?: any;
}

export const PlatformRatingWidget: React.FC<PlatformRatingWidgetProps> = ({ currentUser }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState(currentUser?.name || currentUser?.businessName || '');
  const [userCity, setUserCity] = useState(currentUser?.city || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [isOpenForm, setIsOpenForm] = useState(false);

  const [stats, setStats] = useState({
    averageRating: 5.0,
    totalReviews: 24,
    totalVisitors: 5420,
    feedbacks: [] as any[]
  });

  const injectGoogleSeoSchema = (avgRating: number, countReviews: number, visitorCount: number) => {
    try {
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://vyaparbridge.in';
      const schemaScript = document.getElementById('vyaparbridge-aggregate-rating-schema');
      const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${currentOrigin}/#organization`,
            "name": "Vyapar Bridge",
            "url": currentOrigin,
            "logo": `${currentOrigin}/brand_logo.png`,
            "description": "India's premier B2B & B2C Commercial Commerce Network connecting manufacturers, wholesalers, dealers, logistics, software providers, and customers nationwide.",
            "sameAs": [
              "https://www.facebook.com/vyaparbridge",
              "https://twitter.com/vyaparbridge",
              "https://www.instagram.com/vyaparbridge"
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": String(avgRating || "4.9"),
              "bestRating": "5",
              "worstRating": "1",
              "ratingCount": String(Math.max(countReviews || 1, 24))
            }
          },
          {
            "@type": "WebSite",
            "@id": `${currentOrigin}/#website`,
            "url": currentOrigin,
            "name": "Vyapar Bridge Network",
            "description": "B2B E-Commerce Marketplace & Direct Trade Directory for India",
            "publisher": { "@id": `${currentOrigin}/#organization` },
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${currentOrigin}/?s={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          },
          {
            "@type": "SoftwareApplication",
            "name": "Vyapar Bridge App",
            "operatingSystem": "Android, iOS, Web, PWA",
            "applicationCategory": "BusinessApplication, ShoppingApplication",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": String(avgRating || "4.9"),
              "ratingCount": String(Math.max(countReviews || 1, 24))
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            }
          }
        ]
      };

      if (schemaScript) {
        schemaScript.textContent = JSON.stringify(schemaData);
      } else {
        const script = document.createElement('script');
        script.id = 'vyaparbridge-aggregate-rating-schema';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schemaData);
        document.head.appendChild(script);
      }
    } catch (e) {
      console.warn('SEO Schema injection note:', e);
    }
  };

  const fetchRatingStats = async () => {
    try {
      const res = await fetch('/api/platform/feedback');
      const ct = res.headers.get('content-type');
      if (!res.ok || !ct || !ct.includes('application/json')) return;
      const data = await res.json();
      if (data && data.averageRating !== undefined) {
        setStats(prev => ({
          averageRating: data.averageRating || prev.averageRating,
          totalReviews: data.totalReviews || prev.totalReviews,
          totalVisitors: data.totalVisitors || prev.totalVisitors,
          feedbacks: data.feedbacks || prev.feedbacks
        }));
        injectGoogleSeoSchema(data.averageRating, data.totalReviews, data.totalVisitors);
      }
    } catch (e) {
      console.error('Error fetching rating stats:', e);
    }
  };

  useEffect(() => {
    // 1. Increment visitor count in Firestore for real-time tracking
    incrementVisitorCountInFirestore().then(newCount => {
      if (newCount) {
        setStats(prev => ({ ...prev, totalVisitors: newCount }));
      }
    });

    // 2. Subscribe to realtime Firestore platform analytics
    const unsubscribe = subscribeToPlatformStatsFromFirestore((liveStats) => {
      setStats({
        averageRating: liveStats.averageRating,
        totalReviews: liveStats.totalReviews,
        totalVisitors: liveStats.totalVisitors,
        feedbacks: liveStats.feedbacks
      });
      injectGoogleSeoSchema(liveStats.averageRating, liveStats.totalReviews, liveStats.totalVisitors);
    });

    // 3. Fallback server API fetch
    fetchRatingStats();

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.name || currentUser.businessName || '');
      setUserCity(currentUser.city || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a star rating (1 to 5)');
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit to Firestore realtime DB
      await submitPlatformRatingToFirestore({
        rating,
        comment,
        userName: userName || 'Vyapar Member',
        userCity: userCity || 'India',
        userRole: currentUser?.role || 'visitor',
        userId: currentUser?.id || null
      });

      // Submit to Server API endpoint
      const res = await fetch('/api/platform/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment,
          userName: userName || 'Vyapar Member',
          userCity: userCity || 'India',
          userRole: currentUser?.role || 'visitor',
          userId: currentUser?.id || null
        })
      });

      toast.success('🎉 Rating published! Thank you for boosting Vyapar Bridge on Google Search!');
      setHasRated(true);
      setIsOpenForm(false);
      setComment('');
      fetchRatingStats();
    } catch (err) {
      console.error(err);
      toast.error('Network error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 bg-gradient-to-br from-indigo-900/90 via-slate-900 to-zinc-950 text-white rounded-3xl p-5 sm:p-6 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-lg text-slate-950 font-black shrink-0">
            <Star className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-wide text-amber-300 uppercase">
              Rate Vyapar Bridge
            </h3>
          </div>
        </div>

        {/* Live Rating Stats Summary */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shrink-0">
          <div className="text-center">
            <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1 leading-none">
              <span>{stats.averageRating}</span>
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">
              {stats.totalReviews} Reviews
            </div>
          </div>

          <div className="h-8 w-px bg-white/20" />

          <div className="text-center">
            <div className="text-lg font-black text-emerald-400 leading-none flex items-center gap-1">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{stats.totalVisitors.toLocaleString()}</span>
            </div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">
              Total Visitors
            </div>
          </div>
        </div>
      </div>

      {/* Action / Form Section */}
      {!isOpenForm ? (
        <div className="pt-4 flex items-center justify-center">
          <button
            onClick={() => setIsOpenForm(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Star className="w-4 h-4 fill-slate-950" />
            <span>{hasRated ? '★ Give Another Rating' : '⭐ Give 5-Star Rating & Feedback'}</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pt-4 space-y-4 animate-in fade-in duration-200">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">Select Star Rating *</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-black text-amber-400 ml-2">
                  {rating === 5 ? '⭐⭐⭐⭐⭐ Outstanding (5/5)' : `${rating}/5 Stars`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Your Name / Business Name *</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Ramesh Patel / Morbi Ceramics"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Your City / Location</label>
                <input
                  type="text"
                  value={userCity}
                  onChange={(e) => setUserCity(e.target.value)}
                  placeholder="e.g. Morbi, Gujarat / Delhi"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Feedback / Review Comment</label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with Vyapar Bridge app..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpenForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 fill-slate-950" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Rating'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
