import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import type { Property } from '../../../lib/types';
import { getThumbnailUrl } from '../../lib/thumbnailUrl';
import SEOHead from './Seohead';

const PAGE_SIZE = 12;
const SCROLL_STATE_KEY = 'properties-page-state';

function Propertiespage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [suggested, setSuggested] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const nextFromRef = useRef(0);
  const fetchingRef = useRef(false);
  const restoreScrollYRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let restoreCount = PAGE_SIZE;
    const stateKey = `${SCROLL_STATE_KEY}:${searchParams.toString()}`;
    restoreScrollYRef.current = null;

    try {
      const savedState = sessionStorage.getItem(stateKey);
      if (savedState) {
        const parsedState = JSON.parse(savedState) as { count?: number; scrollY?: number };
        if (typeof parsedState.count === 'number' && parsedState.count >= 0) {
          if (parsedState.count > 0) restoreCount = parsedState.count;
          restoreScrollYRef.current =
            typeof parsedState.scrollY === 'number' ? parsedState.scrollY : 0;
        }
      }
    } catch (restoreError) {
      console.error('Failed to restore properties page position:', restoreError);
    }

    setProperties([]);
    setSuggested([]);
    setLoading(true);
    setLoadingMore(false);
    setHasMore(false);
    setError(null);
    nextFromRef.current = 0;
    fetchingRef.current = true;

    async function loadInitialPages() {
      const loaded: Property[] = [];
      let from = 0;
      let moreAvailable = true;

      try {
        do {
          const { data, error } = await fetchPage(from, searchParams);
          if (cancelled) return;
          if (error) {
            console.error('Property search failed:', error);
            setError('Something went wrong loading properties. Please try again.');
            moreAvailable = false;
            break;
          }

          const results = (data ?? []) as Property[];
          const seenIds = new Set(loaded.map((property) => property.id));
          for (const property of results) {
            if (!seenIds.has(property.id)) {
              seenIds.add(property.id);
              loaded.push(property);
            }
          }
          from += results.length;
          moreAvailable = results.length === PAGE_SIZE;
          if (!moreAvailable) break;
        } while (loaded.length < restoreCount);

        if (cancelled) return;
        nextFromRef.current = from;
        setProperties(loaded);
        setHasMore(moreAvailable);
        if (loaded.length === 0) {
          void fetchSuggestions();
        }
      } catch (fetchError) {
        console.error('Property search failed:', fetchError);
        if (!cancelled) {
          setError(
            supabase
              ? 'Something went wrong loading properties. Please try again.'
              : 'Supabase is not configured yet.',
          );
          setProperties([]);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) {
          fetchingRef.current = false;
          setLoading(false);
        }
      }
    }

    void loadInitialPages();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (loading || restoreScrollYRef.current === null) return;

    const scrollY = restoreScrollYRef.current;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
      try {
        sessionStorage.removeItem(`${SCROLL_STATE_KEY}:${searchParams.toString()}`);
      } catch (removeError) {
        console.error('Failed to clear restored properties page position:', removeError);
      }
      restoreScrollYRef.current = null;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loading, properties.length, searchParams]);

  async function fetchPage(from: number, params: URLSearchParams) {
    if (!supabase) {
      throw new Error('Supabase is not configured yet.');
    }

    let query = supabase
      .from('properties')
      .select('id, slug, title, location_text, city, price, currency, property_type, size_sqm, bedrooms, bathrooms, cover_image_url, cover_thumb_url, listing_type, is_lakefront, has_pool, has_parking, has_garden, has_electricity, has_water, has_internet, created_at')
      .eq('status', 'Available');

    const listingType = params.get('listing_type');
    const q = params.get('q');
    const city = params.get('city');
    const bedrooms = params.get('bedrooms');
    const minPrice = params.get('min_price');
    const maxPrice = params.get('max_price');
    const bathrooms = params.get('bathrooms');
    const type = params.get('type');
    const minSize = params.get('min_size');
    const features = params.getAll('feature');
    const utilities = params.getAll('utility');
    const lakefront = params.get('lakefront');

    if (listingType) query = query.eq('listing_type', listingType);
    if (city) query = query.eq('city', city);
    if (bedrooms) query = query.gte('bedrooms', Number(bedrooms));
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    if (bathrooms) query = query.gte('bathrooms', Number(bathrooms));
    if (type) query = query.eq('property_type', type);
    if (minSize) query = query.gte('size_sqm', Number(minSize));
    if (lakefront === 'true') query = query.eq('is_lakefront', true);

    if (q) {
      const sanitizedQuery = q
        .trim()
        .replace(/[(),]/g, ' ')
        .replace(/\s+/g, ' ');
      if (sanitizedQuery) {
        query = query.or(`title.ilike.%${sanitizedQuery}%,location_text.ilike.%${sanitizedQuery}%`);
      }
    }

    if (features.includes('pool')) query = query.eq('has_pool', true);
    if (features.includes('parking')) query = query.eq('has_parking', true);
    if (features.includes('garden')) query = query.eq('has_garden', true);
    if (utilities.includes('electricity')) query = query.eq('has_electricity', true);
    if (utilities.includes('water')) query = query.eq('has_water', true);
    if (utilities.includes('internet')) query = query.eq('has_internet', true);

    return query
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
  }

  async function loadNextPage() {
    if (fetchingRef.current || !hasMore || loading) return;

    fetchingRef.current = true;
    setLoadingMore(true);
    setError(null);
    try {
      const { data, error } = await fetchPage(nextFromRef.current, searchParams);
      if (error) {
        console.error('Property search failed:', error);
        setError('Something went wrong loading properties. Please try again.');
        setHasMore(false);
        return;
      }

      const results = (data ?? []) as Property[];
      setProperties((current) => {
        const seenIds = new Set(current.map((property) => property.id));
        const newProperties = results.filter((property) => {
          if (seenIds.has(property.id)) return false;
          seenIds.add(property.id);
          return true;
        });
        return [...current, ...newProperties];
      });
      nextFromRef.current += results.length;
      setHasMore(results.length === PAGE_SIZE);
    } catch (fetchError) {
      console.error('Property search failed:', fetchError);
      setError('Something went wrong loading properties. Please try again.');
      setHasMore(false);
    } finally {
      fetchingRef.current = false;
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadNextPage();
        }
      },
      { rootMargin: '0px 0px 400px 0px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, searchParams]);

  function saveReturnPosition() {
    try {
      sessionStorage.setItem(
        `${SCROLL_STATE_KEY}:${searchParams.toString()}`,
        JSON.stringify({ count: Math.max(properties.length, PAGE_SIZE), scrollY: window.scrollY }),
      );
    } catch (saveError) {
      console.error('Failed to save properties page position:', saveError);
    }
  }

  async function fetchSuggestions() {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('properties')
      .select('id, slug, title, location_text, city, price, currency, property_type, size_sqm, bedrooms, bathrooms, cover_image_url, cover_thumb_url, listing_type, created_at')
      .eq('status', 'Available')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(4);

    if (!error) {
      setSuggested((data ?? []) as Property[]);
    }
  }

  const activeFilterCount = Array.from(searchParams.keys()).length;

  const listingsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Properties for Sale and Rent in Rubavu',
    url: 'https://www.rubavubuyandsell.com/properties',
    itemListElement: properties.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://www.rubavubuyandsell.com/properties/${p.slug}`,
      name: p.title,
      image: p.cover_image_url || undefined,
    })),
  };

  return (
    <>
      <SEOHead
        title="Properties for Sale & Rent in Rubavu | Houses, Land & Waterfront"
        description="Browse title-ready houses, land, apartments, and Lake Kivu waterfront properties for sale and rent in Rubavu, Gisenyi, Musanze, and across Rwanda."
        url="/properties"
        type="website"
        jsonLd={listingsJsonLd}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Properties
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading
                ? 'Loading available listings.'
                : activeFilterCount > 0
                ? 'Filtered results are shown below.'
                : 'Browse all available properties.'}
            </p>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setSearchParams({})}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-100 animate-pulse rounded-lg h-72" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="py-8">
            <div className="text-center mb-10">
              <p className="text-gray-500 text-lg mb-2">No properties match your search yet.</p>
              <p className="text-gray-400 text-sm">Try widening your filters, or take a look at these instead.</p>
            </div>
            {suggested.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">You might also like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {suggested.map((property) => (
                    <Link
                      key={property.id}
                      to={`/properties/${property.slug}`}
                      onClick={saveReturnPosition}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
                    >
                      <div className="relative h-44 overflow-hidden bg-gray-100">
                        <img
                          src={getThumbnailUrl(property.cover_thumb_url ?? property.cover_image_url ?? '')}
                          alt={property.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{property.title}</h3>
                        <p className="text-xs text-gray-500 mb-2">{property.location_text}</p>
                        <p className="font-bold text-gray-900">
                          {property.currency} {Number(property.price).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-3">Looking for something specific? Tell us directly.</p>
              <a
                href="https://wa.me/250782424382"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#D56000] hover:bg-[#A84A00] text-white px-5 py-2.5 rounded-lg font-medium"
              >
                Ask us on WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((property) => (
              <Link
                key={property.id}
                to={`/properties/${property.slug}`}
                onClick={saveReturnPosition}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={getThumbnailUrl(property.cover_thumb_url ?? property.cover_image_url ?? '')}
                    alt={property.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{property.title}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    {property.size_sqm ? `${property.size_sqm} SQM` : ''}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">{property.location_text}</p>
                  <span className="inline-block bg-[#0D4F2A]/10 text-[#0D4F2A] text-xs font-medium px-2 py-0.5 rounded mb-2">
                    {property.property_type}
                  </span>
                  <p className="font-bold text-gray-900">
                    {property.currency} {Number(property.price).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!loading && properties.length > 0 && (
          <>
            <div ref={sentinelRef} aria-hidden="true" className="h-px" />
            <p className="py-4 text-center text-sm text-gray-500" aria-live="polite">
              {loadingMore ? 'Loading…' : !hasMore && !error ? 'You’ve seen all properties' : ''}
            </p>
          </>
        )}
      </div>
    </>
  );
}

export default Propertiespage;
