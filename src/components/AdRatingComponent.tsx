import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

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
      const currentTotal = (Number(ad?.totalRating) || (Number(ad?.rating || 4.9) * 5)) + rating;
      const currentCount = (Number(ad?.ratingCount) || 5) + 1;
      
      const updatedAd = {
        ...ad,
        totalRating: currentTotal,
        ratingCount: currentCount,
        rating: (currentTotal / currentCount).toFixed(1)
      };

      try {
        localStorage.setItem(`rated_ad_${ad?.id}`, 'true');
      } catch (e) {}

      toast.success(`⭐ Rated ${rating} Stars! Thank you for rating this banner.`);
      setHasRated(true);
      onRate(ad.id, rating, updatedAd);

      // Async backend call (non-blocking for static Vercel)
      fetch(`/api/advertisement/${ad.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
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
