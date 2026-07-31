import { useState } from 'react';

/**
 * Photo overlay used to mark a property as Sold.
 * Tries /sold-icon.png first; if that 404s or fails to load,
 * falls back to a rotated text ribbon so the state is never silently blank.
 */
export function SoldStamp({ size = 'large' }: { size?: 'large' | 'small' }) {
  const [imgError, setImgError] = useState(false);
  const dims = size === 'large' ? 'w-28 h-28 sm:w-36 sm:h-36' : 'w-20 h-20 sm:w-24 sm:h-24';

  if (imgError) {
    return (
      <div className="-rotate-12 select-none">
        <span className="bg-red-700 text-white text-sm sm:text-base font-bold uppercase tracking-widest px-6 py-1.5 shadow-lg border-2 border-white/80">
          Sold
        </span>
      </div>
    );
  }

  return (
    <img
      src="/sold-icon.png"
      alt="Sold"
      onError={() => setImgError(true)}
      className={`${dims} object-contain opacity-90 select-none`}
      draggable={false}
    />
  );
}