import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import SEOHead from './Seohead';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
type RequestType = 'Buy' | 'Rent';
type PropertyType = 'House' | 'Apartment' | 'Land' | 'Commercial';

interface Listing {
  id: string;
  slug: string;
  title: string;
  location_text: string;
  price: number;
  currency: string;
  cover_image_url: string | null;
}

const LOCATIONS = ['Rubavu', 'Nyabihu', 'Musanze', 'Rutsiro', 'Karongi'];
const bedroomOptions = ['1', '2', '3', '4', '5', '6+'];
const bathroomOptions = ['1', '2', '3', '4+'];

function RequestPropertyPage() {
  const [requestType, setRequestType] = useState<RequestType>('Buy');
  const [propertyType, setPropertyType] = useState<PropertyType>('House');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [location, setLocation] = useState('Rubavu');
  const [description, setDescription] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<SubmitState>('idle');
  const [error, setError] = useState<string | null>(null);

  const [latestListings, setLatestListings] = useState<Listing[]>([]);
  const [listingError, setListingError] = useState('');

  useEffect(() => {
    fetchLatestListings();
  }, []);

  async function fetchLatestListings() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('properties')
      .select('id, slug, title, location_text, price, currency, cover_image_url')
      .eq('status', 'Available')
      .order('created_at', { ascending: false })
      .limit(4);

    if (error || !data) {
      setListingError('Unable to load the latest listings right now.');
      return;
    }
    setLatestListings(data as Listing[]);
  }

  const isValid = Boolean(fullName.trim() && phone.trim() && location.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    if (website.trim() !== '') {
      // Honeypot tripped — pretend success, don't submit
      setStatus('success');
      return;
    }

    if (!supabase) {
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setError(null);

    const { error: insertError } = await supabase.from('property_requests').insert({
      request_type: requestType,
      property_type: propertyType,
      bedrooms: bedrooms ? Number(bedrooms.replace('+', '')) : null,
      bathrooms: bathrooms ? Number(bathrooms.replace('+', '')) : null,
      min_budget: minBudget ? Number(minBudget) : null,
      max_budget: maxBudget ? Number(maxBudget) : null,
      currency: 'RWF',
      desired_location: location,
      description: description.trim() || null,
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
    });

    if (insertError) {
      console.error('Property request submission failed:', insertError);
      setError('Something went wrong submitting your request. Please try again, or contact us directly.');
      setStatus('error');
      return;
    }

    setStatus('success');
    setFullName('');
    setPhone('');
    setEmail('');
    setDescription('');
    setMinBudget('');
    setMaxBudget('');
  }

  return (
    <>
      <SEOHead
        title="Request a Property in Rubavu | Find Houses, Land & Waterfront"
        description="Looking for a specific property in Rubavu? Tell us your requirements and our team will find matching houses, land, apartments, and waterfront properties — including off-market listings."
        url="/request-property"
      />
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Request a Property</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Can't find exactly what you're looking for? Tell us your requirements and our team will reach out —
            including properties not yet publicly listed.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
          {/* Form */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8">
            {status === 'success' ? (
              <div className="text-center py-10">
                <p className="text-xl font-semibold text-gray-900 mb-2">Request received!</p>
                <p className="text-gray-600 mb-6">
                  Thank you — our team will review your requirements and reach out with matching properties.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="font-medium"
                  style={{ color: '#D56000' }}
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot */}
                <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type of Request *</label>
                    <select
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value as RequestType)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
                    >
                      <option value="Buy">Buy</option>
                      <option value="Rent">Rent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
                    >
                      <option value="House">House</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Land">Land</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bedrooms</label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
                    >
                      {bedroomOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bathrooms</label>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
                    >
                      {bathroomOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget (RWF)</label>
                    <input
                      type="number"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                      placeholder="e.g. 20000000"
                      min={0}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget (RWF)</label>
                    <input
                      type="number"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      placeholder="e.g. 60000000"
                      min={0}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location *</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
                  >
                    {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Anything else that would help us find the right property — features, timeline, specific area, etc."
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
                  />
                </div>

                <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Contact Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+250 7xx xxx xxx"
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={!isValid || status === 'submitting'}
                  className="w-full text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  style={{ backgroundColor: isValid ? '#0D4F2A' : undefined }}
                  onMouseEnter={(e) => { if (isValid) e.currentTarget.style.backgroundColor = '#0A3B21'; }}
                  onMouseLeave={(e) => { if (isValid) e.currentTarget.style.backgroundColor = '#0D4F2A'; }}
                >
                  {status === 'submitting' ? 'Submitting…' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>

          {/* Proof sidebar */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] font-semibold mb-4" style={{ color: '#0D4F2A' }}>
                Latest Listings
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">See what's currently available</h3>
              <p className="text-sm text-gray-600 mb-5">
                While our team reviews your request, browse recent listings — your match might already be here.
              </p>
              {listingError ? (
                <p className="text-sm text-red-600">{listingError}</p>
              ) : (
                <div className="space-y-4">
                  {latestListings.map((listing) => (
                    <Link
                      key={listing.id}
                      to={`/properties/${listing.slug}`}
                      className="group flex items-center gap-3 rounded-3xl border border-gray-200 bg-white p-3 transition-shadow hover:shadow-lg"
                    >
                      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-gray-100 shrink-0">
                        <img
                          src={listing.cover_image_url || ''}
                          alt={listing.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">{listing.title}</p>
                        <p className="text-xs text-gray-500">
                          {listing.location_text} · {listing.currency} {listing.price.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                to="/properties"
                className="mt-5 inline-flex w-full items-center justify-center px-4 py-3 text-sm font-semibold text-white rounded-full transition-colors"
                style={{ backgroundColor: '#D56000' }}
              >
                Browse All Properties
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export default RequestPropertyPage;