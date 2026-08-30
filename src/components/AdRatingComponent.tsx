import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import { getOrCreateFingerprint } from '../utils/referralManager';
import { submitAdRatingToFirestore } from '../services/firebaseDataSync';

export function AdRatingComponent({ ad, onRate }: { ad: any, onRate: (adId: string, rating: number, ad: any) => void }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user already rated this banner in localStorage
  const [hasRated, setHasRated] = useState(() => {
    try {
      return localStorage.getItem(`rated_ad_${ad?.id}`) === 'true';
    } catch (e) {
      return false;
    }
  });

  const ratingVal = ad?.ratingCount ? (ad.totalRating / ad.ratingCount) : (ad?.rating || 4.9);
  const averageRating = Number(ratingVal).toFixed(1);

  const handleRate = async (rating: number) => {
    if (hasRated || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Get current logged-in user profile if available
      let currentUser: any = null;
      try {
        const saved = localStorage.getItem('user') || localStorage.getItem('Vyapar Bridge_user');
        if (saved) currentUser = JSON.parse(saved);
      } catch (e) {}

      // Get or create unique hardware/browser fingerprint ID
      const fingerprintId = getOrCreateFingerprint(currentUser || {
        id: localStorage.getItem('vyapar_user_id') || 'guest_' + Date.now(),
        username: currentUser?.name || currentUser?.businessName || 'visitor',
        phone: currentUser?.phone || ''
      });

      const voterName = currentUser?.name || currentUser?.businessName || 'Verified Trader';
      const voterRole = currentUser?.role || 'buyer';
      const voterCity = currentUser?.city || 'India';

      const ratingRecord = {
        id: `rate_${ad?.id}_${fingerprintId}`,
        adId: ad?.id,
        companyName: ad?.companyName || ad?.title || 'Brand Partner',
        rating,
        fingerprintId,
        userId: currentUser?.id || null,
        userName: voterName,
        userRole: voterRole,
        userCity: voterCity,
        timestamp: Date.now()
      };

      const existingRatingsList = Array.isArray(ad?.ratingsList) ? [...ad.ratingsList] : [];
      // Replace if already rated by same fingerprintId, else append
      const existingIdx = existingRatingsList.findIndex((r: any) => r.fingerprintId === fingerprintId);
      if (existingIdx >= 0) {
        existingRatingsList[existingIdx] = ratingRecord;
      } else {
        existingRatingsList.unshift(ratingRecord);
      }

      // Calculate real unique count per fingerprint ID
      const uniqueFingerprints = new Set(existingRatingsList.map((r: any) => r.fingerprintId || r.userId));
      const currentCount = Math.max(uniqueFingerprints.size, (Number(ad?.ratingCount) || 0) + 1);
      const sumRatings = existingRatingsList.reduce((acc: number, cur: any) => acc + (Number(cur.rating) || 5), 0);
      const currentTotal = sumRatings > 0 ? sumRatings : ((Number(ad?.totalRating) || (Number(ad?.rating || 4.9) * 5)) + rating);
      
      const updatedAd = {
        ...ad,
        totalRating: currentTotal,
        ratingCount: currentCount,
        rating: (currentTotal / currentCount).toFixed(1),
        ratingsList: existingRatingsList
      };

      try {
        localStorage.setItem(`rated_ad_${ad?.id}`, 'true');
      } catch (e) {}

      toast.success(`⭐ Rated ${rating} Stars! Device Fingerprint ${fingerprintId.slice(0, 12)}... recorded.`);
      setHasRated(true);
      onRate(ad.id, rating, updatedAd);

      // 1. Sync rating with Firestore
      try {
        submitAdRatingToFirestore(ratingRecord);
      } catch (fErr) {
        console.warn('Firestore ad rating sync note:', fErr);
      }

      // 2. Async backend call (server.ts)
      fetch(`/api/advertisement/${ad.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          fingerprintId,
          userId: currentUser?.id || null,
          userName: voterName,
          userRole: voterRole,
          userCity: voterCity
        })
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.ad) {
            onRate(ad.id, rating, data.ad);
          }
        }
      }).catch(err => {
        console.warn('Backend ad rating sync note:', err);
      });
    } catch (e) {
      console.error('Error submitting rating:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={clsx(
              "w-4 h-4 cursor-pointer transition-colors",
              (hoverRating || (hasRated ? 5 : 0)) >= star 
                ? "text-amber-400 fill-amber-400" 
                : "text-slate-600 hover:text-amber-400/50"
            )}
            onMouseEnter={() => !hasRated && setHoverRating(star)}
            onClick={() => handleRate(star)}
          />
        ))}
      </div>
      <span className="text-[11px] text-zinc-400 font-medium">
        {ad?.ratingCount ? `${averageRating} (${ad.ratingCount} ratings)` : 'No ratings yet'}
      </span>
    </div>
  );
}
