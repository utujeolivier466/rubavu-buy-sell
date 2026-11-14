import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import type { Property } from '../../../lib/types';
import { getThumbnailUrl } from '../../lib/thumbnailUrl';
import SEOHead from './Seohead';

const PAGE_SIZE = 12;

function Propertiespage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [suggested, setSuggested] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') ?? '');
  const [cityFilter, setCityFilter] = useState(searchParams.get('city') ?? '');
  const [minPriceFilter, setMinPriceFilter] = useState(searchParams.get('min_price') ?? '');
  const [maxPriceFilter, setMaxPriceFilter] = useState(searchParams.get('max_price') ?? '');

  useEffect(() => {
    setTypeFilter(searchParams.get('type') ?? '');
    setCityFilter(searchParams.get('city') ?? '');
    setMinPriceFilter(searchParams.get('min_price') ?? '');
    setMaxPriceFilter(searchParams.get('max_price') ?? '');
    void fetchProperties(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function fetchProperties(from = 0, append = false) {
    if (!supabase) {
      setError('Supabase is not configured yet.');
      if (append) setLoadingMore(false);
      else {
        setLoading(false);
        setProperties([]);
        setSuggested([]);
      }
      return;
    }

    if (append) setLoadingMore(true);
    else {
      setLoading(true);
      setHasMore(false);
    }
    setError(null);

    let query = supabase
      .from('properties')
      .select('id, slug, title, location_text, city, price, currency, property_type, size_sqm, bedrooms, bathrooms, cover_image_url, cover_thumb_url, listing_type, is_lakefront, has_pool, has_parking, has_garden, has_electricity, has_water, has_internet, created_at')
      .eq('status', 'Available');

    const listingType = searchParams.get('listing_type');
    const q = searchParams.get('q');
    const city = searchParams.get('city');
    const bedrooms = searchParams.get('bedrooms');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const bathrooms = searchParams.get('bathrooms');
    const type = searchParams.get('type');
    const minSize = searchParams.get('min_size');
    const sort = searchParams.get('sort');
    const features = searchParams.getAll('feature');
    const utilities = searchParams.getAll('utility');
    const lakefront = searchParams.get('lakefront');

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

    if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error } = await query.range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error('Property search failed:', error);
      setError('Something went wrong loading properties. Please try again.');
      if (!append) setProperties([]);
      setHasMore(false);
    } else {
      const results = (data ?? []) as Property[];
      setProperties((current) => append ? [...current, ...results] : results);
      setHasMore(results.length === PAGE_SIZE);
      if (!append && results.length === 0) {
        void fetchSuggestions();
      } else if (!append) {
        setSuggested([]);
      }
    }

    if (append) setLoadingMore(false);
    else setLoading(false);
  }

  function handleFilterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    const filters = [
      ['type', typeFilter],
      ['city', cityFilter],
      ['min_price', minPriceFilter],
      ['max_price', maxPriceFilter],
    ];

    filters.forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    setSearchParams(params);
  }

  async function fetchSuggestions() {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('properties')
      .select('id, slug, title, location_text, city, price, currency, property_type, size_sqm, bedrooms, bathrooms, cover_image_url, cover_thumb_url, listing_type, created_at')
      .eq('status', 'Available')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
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
              {loading ? 'Searching…' : `${properties.length} ${properties.length === 1 ? 'Property' : 'Properties'} Found`}
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

        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <label className="text-sm text-gray-700">
            Property type
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2.5"
            >
              <option value="">All types</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Commercial">Commercial</option>
              <option value="Land">Land</option>
            </select>
          </label>
          <label className="text-sm text-gray-700">
            Location / city
            <input
              type="text"
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              placeholder="Any city"
              className="mt-1 w-full border border-gray-300 rounded-lg p-2.5"
            />
          </label>
          <label className="text-sm text-gray-700">
            Minimum price
            <input
              type="number"
              min="0"
              value={minPriceFilter}
              onChange={(event) => setMinPriceFilter(event.target.value)}
              placeholder="No minimum"
              className="mt-1 w-full border border-gray-300 rounded-lg p-2.5"
            />
          </label>
          <label className="text-sm text-gray-700">
            Maximum price
            <input
              type="number"
              min="0"
              value={maxPriceFilter}
              onChange={(event) => setMaxPriceFilter(event.target.value)}
              placeholder="No maximum"
              className="mt-1 w-full border border-gray-300 rounded-lg p-2.5"
            />
          </label>
          <button
            type="submit"
            className="self-end bg-[#0D4F2A] hover:bg-[#0A3B21] text-white rounded-lg px-4 py-2.5 font-medium"
          >
            Apply filters
          </button>
        </form>

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
        {!loading && properties.length > 0 && hasMore && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => void fetchProperties(properties.length, true)}
              disabled={loadingMore}
              className="px-6 py-3 bg-[#0D4F2A] hover:bg-[#0A3B21] disabled:opacity-60 text-white rounded-lg font-medium"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Propertiespage;
