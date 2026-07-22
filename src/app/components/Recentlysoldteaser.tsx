import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';

interface ClosedListing {
  id: string;
  slug: string;
  title: string;
  location_text: string;
  cover_image_url: string | null;
  status: string;
}

export function RecentlySoldTeaser() {
  const [items, setItems] = useState<ClosedListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from('properties')
      .select('id, slug, title, location_text, cover_image_url, status')
      .in('status', ['Sold', 'Rented'])
      .order('updated_at', { ascending: false })
      .limit(4)
      .then(({ data, error }) => {
        if (!error && data) setItems(data as ClosedListing[]);
        setLoading(false);
      });
  }, []);

  // Don't show the section at all if there's nothing to showcase yet —
  // an empty "trust" section undermines the point of having one.
  if (!loading && items.length === 0) return null;
  if (loading) return null;

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recently Sold & Rented</h2>
            <p className="text-sm text-gray-500 mt-1">A track record you can see for yourself</p>
          </div>
          <Link to="/recently-sold" className="text-teal-600 hover:text-teal-700 font-medium text-sm whitespace-nowrap">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {items.map((item) => {
            const badgeClass = item.status === 'Sold' ? 'bg-[#0D4F2A]' : 'bg-[#D56000]';
            return (
              <Link key={item.id} to={`/properties/${item.slug}`} className="group">
                <div className="relative rounded-lg overflow-hidden mb-2">
                  <img
                    src={item.cover_image_url || ''}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-28 sm:h-32 object-cover grayscale-[30%] group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-2 right-2 text-[11px] font-semibold text-white px-2.5 py-1 rounded-none shadow-sm ${badgeClass}`}>
                    {item.status === 'Sold' ? 'Sold' : 'Rented'}
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-700 line-clamp-1">{item.title}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}