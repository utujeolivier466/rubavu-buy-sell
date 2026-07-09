import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import type { Property } from '../../../lib/types';

const WHATSAPP_NUMBER = '250782424382';

type InquirySource = 'whatsapp' | 'site_visit';
type SharePlatform = 'copy' | 'whatsapp' | 'facebook';

function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProperty();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

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

  function logInquiry(source: InquirySource) {
    if (!supabase) return;

    // Fire-and-forget: don't block the user's WhatsApp redirect on this
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

  const images: string[] = property.image_urls && property.image_urls.length > 0
    ? property.image_urls
    : [property.cover_image_url].filter((v): v is string => Boolean(v));

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link to="/properties" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        ← Back to properties
      </Link>

      {/* Photo Gallery */}
      <div className="mb-6">
        <div className="w-full h-64 sm:h-96 lg:h-[480px] rounded-lg overflow-hidden bg-gray-100 mb-3">
          {images.length > 0 ? (
            <img
              src={images[activeImage]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
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
                className={`shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                  activeImage === i ? 'border-yellow-500' : 'border-transparent'
                }`}
              >
                <img src={img} alt={`${property.title} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{property.title}</h1>
              <p className="text-gray-500 mt-1">{property.location_text}</p>
            </div>
            {property.is_hot_deal && (
              <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Hot Deal
              </span>
            )}
          </div>

          <p className="text-2xl font-bold text-gray-900 mb-4">
            {property.currency} {Number(property.price).toLocaleString()}
            {property.listing_type === 'Rent' && <span className="text-base font-normal text-gray-500"> / month</span>}
          </p>

          {/* Quick specs */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-700 border-y border-gray-200 py-4 mb-6">
            {property.size_sqm && <span><strong>{property.size_sqm}</strong> SQM</span>}
            {property.bedrooms != null && <span><strong>{property.bedrooms}</strong> Bedrooms</span>}
            {property.bathrooms != null && <span><strong>{property.bathrooms}</strong> Bathrooms</span>}
            <span className="capitalize"><strong>{property.property_type}</strong></span>
            {property.zoning && <span>Zoning: <strong>{property.zoning}</strong></span>}
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

          {/* Share buttons */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Share this property</h3>
            <div className="flex gap-2">
              <button onClick={() => handleShare('whatsapp')} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200">
                WhatsApp
              </button>
              <button onClick={() => handleShare('facebook')} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200">
                Facebook
              </button>
              <button onClick={() => handleShare('copy')} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-6 space-y-3">
            <button
              onClick={handleWhatsAppInquiry}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold text-sm"
            >
              Chat via WhatsApp
            </button>
            <button
              onClick={handleBookSiteVisit}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-semibold text-sm"
            >
              Book a Site Visit
            </button>

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