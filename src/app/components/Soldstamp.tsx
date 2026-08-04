/**
 * Overlay badge used to mark a property as sold out.
 * Keeps the same orange label styling used for the sale/rent badges.
 */
export function SoldStamp({ size = 'small' }: { size?: 'large' | 'small' }) {
  const padding = size === 'large' ? 'px-4 py-2 text-sm sm:text-base' : 'px-3 py-1.5 text-[10px] sm:text-xs';

  return (
    <div className="-rotate-12 select-none">
      <span className={`inline-flex items-center justify-center bg-[#D56000] text-white font-semibold uppercase tracking-[0.18em] shadow-md ${padding}`}>
        SOLD OUT
      </span>
    </div>
  );
}