'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewsCount?: number;
  size?: number;
  showCount?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  reviewsCount,
  size = 14,
  showCount = true,
  className = '',
}: StarRatingProps) {
  // Format score to 1 decimal place (e.g. 4.9)
  const formattedScore = rating.toFixed(1);
  const formattedCount = reviewsCount
    ? reviewsCount >= 1000
      ? `${(reviewsCount / 1000).toFixed(1)}k`
      : reviewsCount.toString()
    : null;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center text-[#FFD700]">
        {[1, 2, 3, 4, 5].map((index) => {
          const filled = index <= Math.floor(rating);
          const half = !filled && index === Math.ceil(rating) && rating % 1 >= 0.3;
          return (
            <Star
              key={index}
              size={size}
              className={`${
                filled
                  ? 'fill-[#FFD700] text-[#FFD700] filter drop-shadow-[0_0_4px_rgba(255,215,0,0.6)]'
                  : half
                  ? 'fill-[#FFD700]/60 text-[#FFD700]'
                  : 'text-slate-600'
              } transition-colors`}
            />
          );
        })}
      </div>
      <span className="text-xs font-semibold text-amber-300 tracking-tight">
        {formattedScore}
      </span>
      {showCount && formattedCount && (
        <span className="text-xs text-slate-400 font-normal">
          ({formattedCount})
        </span>
      )}
    </div>
  );
}
