import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import type { Property } from '../../../lib/types';
import SEOHead from './Seohead';

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const days = Math.floor(seconds / 86400);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

function RecentlySoldPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentlyClosed();
  }, []);

  async function fetchRecentlyClosed() {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('status', ['Sold', 'Rented'])
      .order('updated_at', { ascending: false })
      .limit(24);

    if (error) {
      console.error('Failed to load recently sold/rented properties:', error);
    } else {
      setProperties((data ?? []) as Property[]);
    }
    setLoading(false);
  }

  return (
    <>
      <SEOHead
        title="Recently Sold & Rented Properties"
        description="See our track record — properties recently sold and rented by Rubavu Buy and Sell Ltd in Rubavu District, Rwanda."
        url="/recently-sold"
      />
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Recently Sold & Rented
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            A track record of completed transactions — see what we've helped buyers and tenants secure recently.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-64" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No completed transactions to show yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((property) => {
              const badge = property.status === 'Sold'
                ? { label: 'Sold', className: 'bg-[#0D4F2A] text-white' }
                : { label: 'Rented', className: 'bg-[#D56000] text-white' };

              return (
                <Link
                  key={property.id}
                  to={`/properties/${property.slug}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  <div className="relative">
                    <img
                      src={property.cover_image_url || (property.image_urls && property.image_urls[0]) || ''}
                      alt={property.title}
                      loading="lazy"
                      className="w-full h-44 object-cover grayscale-[30%] group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className={`absolute top-3 right-3 text-sm font-semibold px-3 py-1.5 rounded-none shadow-sm ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{property.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{property.location_text}</p>
                    <p className="font-bold text-gray-900 mb-1">
                      {property.currency} {Number(property.price).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">{timeAgo(property.updated_at)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default RecentlySoldPage;