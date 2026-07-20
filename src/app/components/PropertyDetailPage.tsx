import { useState, useEffect, type TouchEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import type { Property } from '../../../lib/types';
import SEOHead from './Seohead';

const WHATSAPP_NUMBER = '250782424382';

type InquirySource = 'whatsapp' | 'site_visit';
type SharePlatform = 'copy' | 'whatsapp' | 'facebook';

// --- Small inline icons (no new dependency required) ---
function IconId() { return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h4M7 13h7"/></svg>; }
function IconType() { return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 11l9-7 9 7M5 10v10h14V10"/></svg>; }
function IconBed() { return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 18v-6a2 2 0 012-2h14a2 2 0 012 2v6M3 18v2M21 18v2M3 12V7a2 2 0 012-2h4a2 2 0 012 2v3"/></svg>; }
function IconBath() { return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12h16M6 12V6a2 2 0 012-2h1M5 12v6a2 2 0 002 2h10a2 2 0 002-2v-6"/></svg>; }
function IconSize() { return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6"/></svg>; }
function IconPurpose() { return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/></svg>; }
function IconLocation() { return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>; }
function IconShare() { return <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.7l7.6-4.4M8.2 13.3l7.6 4.4"/></svg>; }

function SpecItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
      <div className="text-yellow-600 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 leading-none mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-900 leading-none">{value}</p>
      </div>
    </div>
  );
}

function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [related, setRelated] = useState<Property[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    fetchProperty();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (property) fetchRelated(property);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property?.id]);

  async function fetchProperty() {
    if (!supabase) {
      setError('Supabase is not configured yet.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setActiveImage(0);

    const targetSlug = slug?.trim() || '';
    const { data, error } = await supabase
      .from('properties')
      .select('*, agents(name, position, photo_url, phone)')
      .eq('slug', targetSlug)
      .maybeSingle();

    if (error || !data) {
      console.error('Failed to load property:', error);
      setProperty(null);
      setError('This property could not be found. It may have been sold or removed.');
    } else {
      setProperty(data as Property);
    }
    setLoading(false);
  }

 async function fetchRelated(current: Property) {
  if (!supabase) return;

  const normalize = (s?: string | null) => s?.trim().toLowerCase() || '';
  const currentCity = normalize(current.city);

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .neq('id', current.id)
    .limit(20); // pull a wider pool, then filter client-side

  if (error || !data) {
    console.error('Failed to load related properties:', error);
    setRelated([]);
    return;
  }

  const matches = (data as Property[]).filter((p) => {
    const sameCity = currentCity && normalize(p.city) === currentCity;
    const sameType = p.property_type === current.property_type;
    return sameCity || sameType;
  });

  setRelated(matches.slice(0, 3));
} 

  function logInquiry(source: InquirySource) {
    if (!supabase) return;

    supabase.from('inquiries').insert({
      property_id: property?.id,
      source,
      message: `Inquiry from property page: ${property?.title || slug}`,
    }).then(({ error }) => {
      if (error) console.error('Inquiry log failed (non-blocking):', error);
    });
  }

  function handleWhatsAppInquiry() {
    if (!property) return;
    logInquiry('whatsapp');
    const message = encodeURIComponent(
      `Hi, I'm interested in "${property.title}" (${property.location_text}) listed at ${property.currency} ${Number(property.price).toLocaleString()}. Is it still available?`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  }

  function handleBookSiteVisit() {
    if (!property) return;
    logInquiry('site_visit');
    const message = encodeURIComponent(
      `Hi, I'd like to book a site visit for "${property.title}" (${property.location_text}).`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  }

  function handleShare(platform: SharePlatform) {
    const url = window.location.href;
    const text = property ? `Check out this property: ${property.title}` : 'Check out this property';

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
      return;
    }
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      return;
    }
  }

  const images: string[] = property?.image_urls && property.image_urls.length > 0
    ? property.image_urls
    : [property?.cover_image_url].filter((v): v is string => Boolean(v));

  const showNextImage = () => {
    if (images.length <= 1) return;
    setActiveImage((current) => (current + 1) % images.length);
  };

  const showPreviousImage = () => {
    if (images.length <= 1) return;
    setActiveImage((current) => (current - 1 + images.length) % images.length);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;

    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX;
    if (delta > 50) {
      showPreviousImage();
    } else if (delta < -50) {
      showNextImage();
    }
    setTouchStartX(null);
  };

  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      } else if (event.key === 'ArrowRight') {
        showNextImage();
      } else if (event.key === 'ArrowLeft') {
        showPreviousImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, images.length]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
        <div className="bg-gray-200 h-96 rounded-lg mb-6" />
        <div className="bg-gray-200 h-8 w-2/3 rounded mb-3" />
        <div className="bg-gray-200 h-4 w-1/3 rounded" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-700 text-lg mb-4">{error}</p>
        <Link to="/properties" className="text-yellow-600 hover:text-yellow-700 font-medium">
          ← Back to all properties
        </Link>
      </div>
    );
  }

  const featureList = [
    property.has_pool && 'Pool',
    property.has_parking && 'Parking',
    property.has_garden && 'Garden',
  ].filter((v): v is string => Boolean(v));

  const utilityList = [
    property.has_electricity && 'Electricity',
    property.has_water && 'Water',
    property.has_internet && 'Internet',
  ].filter((v): v is string => Boolean(v));

  const isUnavailable = property.status === 'Sold' || property.status === 'Rented';

  const statusBadge =
    property.status === 'Sold'
      ? { label: 'Sold', className: 'bg-[#0D4F2A] text-white' }
      : property.status === 'Rented'
      ? { label: 'Rented', className: 'bg-[#D56000] text-white' }
      : property.status === 'Pending'
      ? { label: 'Pending', className: 'bg-[#0D4F2A]/10 text-[#0D4F2A] border border-[#0D4F2A]/20' }
      : property.listing_type === 'Rent'
      ? { label: 'For Rent', className: 'bg-[#D56000] text-white' }
      : { label: 'For Sale', className: 'bg-[#D56000] text-white' };

  // Display ID fallback — replace with a real display_id column when you add one
  const displayId = (property as any).display_id || `RB-${property.id.toString().slice(0, 8).toUpperCase()}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEOHead
        title={property.title}
        description={(property.description || property.location_text || '').slice(0, 160)}
        url={`/properties/${property.slug}`}
        type="article"
      />
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4 flex flex-wrap items-center gap-1">
        <Link to="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <Link to="/properties" className="hover:text-gray-700">Properties</Link>
        {property.location_text && (
          <>
            <span>/</span>
            <span className="hover:text-gray-700">{property.location_text}</span>
          </>
        )}
        <span>/</span>
        <span className="text-gray-800 font-medium truncate max-w-[220px]">{property.title}</span>
      </nav>

      {/* Photo Gallery */}
      <div className="mb-6">
        <div className="w-full h-64 sm:h-96 lg:h-[480px] rounded-2xl overflow-hidden bg-gray-100 mb-3 shadow-sm">
          {images.length > 0 ? (
            <div
              className="relative h-full w-full"
              onTouchStart={images.length > 1 ? handleTouchStart : undefined}
              onTouchEnd={images.length > 1 ? handleTouchEnd : undefined}
            >
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="group relative h-full w-full"
              >
                <img
                  src={images[activeImage]}
                  alt={property.title}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${isUnavailable ? 'grayscale-[30%]' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={(event) => {
                        event.stopPropagation();
                        showPreviousImage();
                      }}
                      className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/60 p-2 text-white shadow-lg sm:inline-flex"
                    >
                      <span className="text-xl leading-none">‹</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={(event) => {
                        event.stopPropagation();
                        showNextImage();
                      }}
                      className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/60 p-2 text-white shadow-lg sm:inline-flex"
                    >
                      <span className="text-xl leading-none">›</span>
                    </button>
                  </>
                )}
                <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-sm text-white backdrop-blur-sm">
                  Tap to fullscreen • {activeImage + 1}/{images.length}
                </div>
              </button>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              No photos available
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                  activeImage === i ? 'border-yellow-500' : 'border-transparent'
                }`}
              >
                <img
                  src={img}
                  alt={`${property.title} ${i + 1}`}
                  loading={activeImage === i ? 'eager' : 'lazy'}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 p-3 sm:p-6"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="flex h-full flex-col">
            <div className="mb-3 flex items-center justify-between text-white">
              <p className="text-sm font-medium">{activeImage + 1} / {images.length}</p>
              <button
                type="button"
                aria-label="Close fullscreen view"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsFullscreen(false);
                }}
                className="rounded-full bg-white/10 px-3 py-2 text-sm backdrop-blur-sm"
              >
                Close
              </button>
            </div>
            <div
              className="relative flex-1 overflow-hidden rounded-3xl bg-black"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={images[activeImage]}
                alt={property.title}
                className="h-full w-full object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={(event) => {
                      event.stopPropagation();
                      showPreviousImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white shadow-lg"
                  >
                    <span className="text-2xl leading-none">‹</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={(event) => {
                      event.stopPropagation();
                      showNextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white shadow-lg"
                  >
                    <span className="text-2xl leading-none">›</span>
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex justify-center gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                      activeImage === i ? 'border-yellow-500' : 'border-white/20'
                    }`}
                  >
                    <img src={img} alt={`${property.title} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{property.title}</h1>
              <p className="text-gray-500 mt-1">{property.location_text}</p>
            </div>
            {statusBadge && (
              <span className={`text-sm font-semibold px-4 py-2 rounded-none shadow-sm ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            )}
          </div>

          {/* Price + Share row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <p className="text-2xl font-bold text-gray-900">
              {property.currency} {Number(property.price).toLocaleString()}
              {property.listing_type === 'Rent' && <span className="text-base font-normal text-gray-500"> / month</span>}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShare('whatsapp')}
                title="Share on WhatsApp"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <IconShare />
              </button>
              <button
                onClick={() => handleShare('facebook')}
                title="Share on Facebook"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <IconShare />
              </button>
              <button
                onClick={() => handleShare('copy')}
                title="Copy link"
                className="px-3 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Spec overview grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <SpecItem icon={<IconId />} label="ID No" value={displayId} />
            <SpecItem icon={<IconType />} label="Type" value={property.property_type} />
            <SpecItem icon={<IconBed />} label="Bd" value={property.bedrooms} />
            <SpecItem icon={<IconBath />} label="Ba" value={property.bathrooms} />
            <SpecItem icon={<IconSize />} label="Sqm" value={property.size_sqm} />
            <SpecItem icon={<IconPurpose />} label="Purpose" value={property.listing_type === 'Rent' ? 'For Rent' : 'For Sale'} />
            <SpecItem icon={<IconLocation />} label="Location" value={property.location_text} />
          </div>

          {/* Description */}
          {property.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>
          )}

          {/* Features */}
          {(featureList.length > 0 || utilityList.length > 0) && (
            <div className="mb-6 grid grid-cols-2 gap-6">
              {featureList.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Features</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {featureList.map((f) => <li key={f}>✓ {f}</li>)}
                  </ul>
                </div>
              )}
              {utilityList.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Utilities</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {utilityList.map((u) => <li key={u}>✓ {u}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* YouTube video */}
          {property.youtube_url && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Property Video</h2>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src={toYouTubeEmbed(property.youtube_url)}
                  title="Property video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Google Map */}
          {property.latitude && property.longitude && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Location</h2>
              <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                <iframe
                  className="w-full h-full"
                  src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                  title="Property location"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-6 space-y-3">
            {isUnavailable ? (
              <div className="text-center py-3">
                <p className="font-semibold text-gray-900 mb-1">
                  This property has been {property.status === 'Sold' ? 'sold' : 'rented'}.
                </p>
                <p className="text-sm text-gray-500 mb-4">Browse similar available properties instead.</p>
                <Link
                  to="/properties"
                  className="inline-block bg-[#0D4F2A] hover:bg-[#0A3B21] text-white px-4 py-2.5 rounded-lg font-semibold text-sm"
                >
                  View Available Properties
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={handleWhatsAppInquiry}
                  className="w-full bg-[#D56000] hover:bg-[#A84A00] text-white px-4 py-3 rounded-lg font-semibold text-sm"
                >
                  Chat via WhatsApp
                </button>
                <button
                  onClick={handleBookSiteVisit}
                  className="w-full bg-[#0D4F2A] hover:bg-[#0A3B21] text-white px-4 py-3 rounded-lg font-semibold text-sm"
                >
                  Book a Site Visit
                </button>
              </>
            )}

            {property.agents && (
              <div className="pt-4 mt-4 border-t border-gray-200 flex items-center gap-3">
                {property.agents.photo_url && (
                  <img
                    src={property.agents.photo_url}
                    alt={property.agents.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900 text-sm">{property.agents.name}</p>
                  <p className="text-xs text-gray-500">{property.agents.position}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related / Similar Properties */}
      {related.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs font-semibold text-yellow-600 tracking-wide mb-1">SIMILAR PROPERTIES</p>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Related Properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((p) => (
              <Link
                key={p.id}
                to={`/property/${p.slug}`}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-40 bg-gray-100">
                  {p.cover_image_url && (
                    <img src={p.cover_image_url} alt={p.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 mb-1">{p.property_type}</p>
                  <p className="font-semibold text-gray-900 text-sm mb-2 truncate">{p.title}</p>
                  <p className="text-xs text-gray-600">
                    {p.bedrooms != null && `${p.bedrooms} Bd`}{p.bathrooms != null && ` · ${p.bathrooms} Ba`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Converts a standard YouTube URL (watch?v=, youtu.be/, etc.) into an embeddable URL
function toYouTubeEmbed(url: string): string {
  try {
    const u = new URL(url);
    let videoId = u.searchParams.get('v');
    if (!videoId && u.hostname.includes('youtu.be')) {
      videoId = u.pathname.slice(1);
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  } catch {
    return url;
  }
}

export default PropertyDetailPage;