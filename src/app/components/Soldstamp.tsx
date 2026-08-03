import { useState } from 'react';

/**
 * Photo overlay used to mark a property as Sold.
 * Uses the sold-icon1 asset when available; if it fails to load,
 * falls back to a rotated text ribbon so the state is never silently blank.
 */
export function SoldStamp({ size = 'small' }: { size?: 'large' | 'small' }) {
  const [imgError, setImgError] = useState(false);
  const dims = size === 'large' ? 'w-28 h-28 sm:w-32 sm:h-32' : 'w-20 h-20 sm:w-24 sm:h-24';

  if (imgError) {
    return (
      <div className="-rotate-12 select-none">
        <span className="bg-red-700 text-white text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 shadow-lg border border-white/80 rounded-[2px]">
          Sold
        </span>
      </div>
    );
  }

  return (
    <img
      src="/sold2.jpg"
      alt="Sold"
      onError={() => setImgError(true)}
      className={`${dims} object-contain opacity-100 select-none drop-shadow-[0_5px_12px_rgba(0,0,0,0.4)]`}
      draggable={false}
    />
  );
}