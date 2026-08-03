import { useState } from 'react';

/**
 * Photo overlay used to mark a property as Sold.
 * Tries /sold-icon.png first; if that 404s or fails to load,
 * falls back to a rotated text ribbon so the state is never silently blank.
 */
export function SoldStamp({ size = 'small' }: { size?: 'large' | 'small' }) {
  const [imgError, setImgError] = useState(false);
  const dims = size === 'large' ? 'w-28 h-28 sm:w-36 sm:h-36' : 'w-16 h-16 sm:w-20 sm:h-20';

  if (imgError) {
    return (
      <div className="-rotate-12 select-none">
        <span className="bg-red-700 text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] px-2.5 py-1 shadow-lg border-2 border-white/80 rounded-sm">
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
      className={`${dims} object-contain opacity-90 select-none drop-shadow-md`}
      draggable={false}
    />
  );
}