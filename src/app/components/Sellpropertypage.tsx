import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import { Progress } from './ui/progress';

// Set these to match your actual Supabase project
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
type RequestType = 'Sale' | 'Rent';
type PropertyType = 'House' | 'Apartment' | 'Land' | 'Big Land';

interface Listing {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  cover_image_url?: string | null;
}

const fallbackListings: Listing[] = [
  {
    id: '1',
    slug: '520sqm-riverside-home',
    title: '520SQM Riverside Home',
    location: 'Gisenyi, Rubavu',
    price: 320000000,
    currency: 'RWF',
    bedrooms: 4,
    bathrooms: 3,
    cover_image_url: new URL('./asset/house 3.png', import.meta.url).href,
  },
  {
    id: '2',
    slug: '450sqm-family-house',
    title: '450SQM Family House',
    location: 'Gisa, Rubavu',
    price: 45000000,
    currency: 'RWF',
    bedrooms: 3,
    bathrooms: 2,
    cover_image_url: new URL('./asset/house 2.png', import.meta.url).href,
  },
  {
    id: '3',
    slug: '1393sqm-investment-plot',
    title: '1,393SQM Investment Plot',
    location: 'Rugerero, Rubavu',
    price: 150000000,
    currency: 'RWF',
    bedrooms: 0,
    bathrooms: 0,
    cover_image_url: new URL('./asset/house 1.png', import.meta.url).href,
  },
  {
    id: '4',
    slug: '650sqm-hilltop-estate',
    title: '650SQM Hilltop Estate',
    location: 'Rubavu District',
    price: 400000000,
    currency: 'RWF',
    bedrooms: 5,
    bathrooms: 4,
    cover_image_url: new URL('./asset/house 4.png', import.meta.url).href,
  },
];

const bedroomOptions = ['1', '2', '3', '4', '5', '6', '7', '8+'];
const bathroomOptions = ['1', '2', '3', '4+'];

function SellPropertyPage() {
  const [requestType, setRequestType] = useState<RequestType>('Sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('House');
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [price, setPrice] = useState('');
  const [upi, setUpi] = useState('');
  const [description, setDescription] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — real users never see or fill this
  const [files, setFiles] = useState<File[]>([]);
  const [latestListings, setLatestListings] = useState<Listing[]>(fallbackListings);
  const [listingError, setListingError] = useState<string>('');
  const [status, setStatus] = useState<SubmitState>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchLatestListings();
  }, []);

  async function fetchLatestListings() {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, slug, title, location_text, price, currency, bedrooms, bathrooms, cover_image_url')
        .eq('status', 'Available')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error || !data) {
        setListingError('Unable to load the latest listings right now.');
        return;
      }

      setLatestListings(
        data.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          location: item.location_text || 'Rubavu',
          price: item.price,
          currency: item.currency || 'RWF',
          bedrooms: item.bedrooms ?? null,
          bathrooms: item.bathrooms ?? null,
          cover_image_url: item.cover_image_url,
        })),
      );
    } catch (err) {
      console.error('Latest listings fetch failed:', err);
      setListingError('Unable to load the latest listings right now.');
    }
  }

  function validatePhone(value: string) {
    const normalized = value.trim();
    if (normalized === '') return '';
    const isValidPhone = /^\+250\s?7\d{2}\s?\d{3}\s?\d{3}$/.test(normalized);
    return isValidPhone ? '' : 'Use +250 7XX XXX XXX format.';
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setPhone(value);
    setPhoneError(validatePhone(value));
  }

  function validateEmail(value: string) {
    const normalized = value.trim();
    if (normalized === '') return '';
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    return isValidEmail ? '' : 'Enter a valid email address.';
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  }

  const propertySectionComplete = Boolean(
    requestType && propertyType && location.trim() && bedrooms && bathrooms && price.trim(),
  );
  const detailsSectionStarted = Boolean(description.trim() || upi.trim() || files.length > 0);
  const contactSectionComplete = Boolean(fullName.trim() && phone.trim() && !phoneError);
  const currentStep = contactSectionComplete ? 3 : detailsSectionStarted ? 2 : 1;

  const filledFields = [
    Boolean(location.trim()),
    Boolean(price.trim()),
    Boolean(bedrooms),
    Boolean(bathrooms),
    Boolean(description.trim() || upi.trim() || files.length > 0),
    Boolean(fullName.trim()),
    Boolean(phone.trim() && !phoneError),
  ];
  const progressValue = Math.round((filledFields.filter(Boolean).length / filledFields.length) * 100);

  const isValid = Boolean(
    fullName.trim() && phone.trim() && email.trim() && !phoneError && !emailError && location.trim() && price.trim() && bedrooms && bathrooms,
  );

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    setFiles((prev) => [...prev, ...Array.from(selectedFiles)]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadPhotos(): Promise<string[]> {
    const client = supabase;
    if (!client) {
      throw new Error('Supabase client unavailable');
    }

    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await client.storage.from('submission-photos').upload(fileName, file);

      if (uploadError) {
        console.error('Photo upload failed:', uploadError);
        continue;
      }

      const { data } = client.storage.from('submission-photos').getPublicUrl(fileName);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    // Honeypot tripped — a bot filled a field real users never see.
    // Pretend success so it doesn't learn to avoid this trick.
    if (website.trim() !== '') {
      setStatus('success');
      return;
    }

    setStatus('submitting');
    setError(null);

    try {
      const photoUrls = await uploadPhotos();

      const submission = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        location_text: location.trim(),
        price: Number(price),
        currency: 'RWF',
        property_type: propertyType,
        listing_type: requestType,
        bedrooms: Number(bedrooms.replace('+', '')),
        bathrooms: Number(bathrooms.replace('+', '')),
        description: description.trim() || null,
        upi: upi.trim() || null,
        photo_urls: photoUrls,
      };

      const client = supabase;
      if (!client) {
        throw new Error('Supabase client unavailable');
      }

      const { error: insertError } = await client.from('property_submissions').insert(submission);

      if (insertError) {
        throw insertError;
      }

      fetch(`${SUPABASE_URL}/functions/v1/send-submission-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(submission),
      }).catch((err) => console.error('Email notification failed (non-blocking):', err));

      setStatus('success');
      setFullName('');
      setPhone('');
      setEmail('');
      setLocation('');
      setPrice('');
      setPropertyType('House');
      setRequestType('Sale');
      setBedrooms('3');
      setBathrooms('2');
      setUpi('');
      setDescription('');
      setFiles([]);
      setPhoneError('');
      setEmailError('');
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Something went wrong submitting your property. Please try again, or contact us directly.');
      setStatus('error');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Sell Your Property</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Share your property details and let buyers in Rubavu discover it. This form collects the important listing information first, then contact details last.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#0D4F2A] font-semibold mb-2">Property submission</p>
                <h2 className="text-xl font-semibold text-gray-900">More details, less friction</h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{progressValue}% complete</p>
              </div>
            </div>
            <Progress
              value={progressValue}
              className="h-2 rounded-full bg-yellow-200"
              indicatorClassName="bg-yellow-600"
            />

            {status === 'success' ? (
              <div className="text-center py-10">
                <p className="text-xl font-semibold text-gray-900 mb-2">Property submitted!</p>
                <p className="text-gray-600 mb-6">
                  Thank you — our team will review your submission and contact you shortly.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Submit another property
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                {/* Honeypot field — visually hidden, unreachable by tab, ignored by real users */}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type of request *</label>
                    <select
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value as RequestType)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="Sale">Sell</option>
                      <option value="Rent">Rent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="House">House</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Land">Land</option>
                      <option value="Big Land">Big Land</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Location *</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Gisenyi, Rubavu"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bedrooms *</label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      {bedroomOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bathrooms *</label>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      {bathroomOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Price (RWF) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 28000000"
                    min={0}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI (Optional)</label>
                  <input
                    value={upi}
                    onChange={(e) => setUpi(e.target.value)}
                    placeholder="Unique Parcel Identifier, if available"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property description / additional details</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Add features, condition, plot boundaries, nearby landmarks, or other details buyers should know."
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="rounded-3xl border border-dashed border-gray-300 bg-slate-50 p-3 sm:p-5">
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Upload Property Photos</p>
                      <p className="text-sm text-gray-500">
                        Add up to 8 images for better buyer confidence.
                      </p>
                    </div>
                    <label
                      htmlFor="propertyPhotos"
                      className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Select photos
                    </label>
                  </div>
                  <input
                    id="propertyPhotos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="sr-only"
                  />
                  {files.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {files.map((file, index) => (
                        <div key={index} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-sm text-white"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 px-4 py-8 text-center text-sm text-gray-500">
                      No photos selected yet.
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-gray-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Contact details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="+250 7xx xxx xxx"
                        inputMode="tel"
                        autoComplete="tel"
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                      {phoneError ? <p className="mt-2 text-sm text-red-600">{phoneError}</p> : null}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="you@example.com"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    {emailError ? <p className="mt-2 text-sm text-red-600">{emailError}</p> : null}
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={!isValid || status === 'submitting'}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors"
                >
                  {status === 'submitting' ? 'Submitting…' : 'Submit Property'}
                </button>
              </form>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-slate-50 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#0D4F2A] font-semibold mb-4">Latest Listings</p>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">See what buyers are browsing</h3>
            <p className="text-sm text-gray-600 mb-5">
              These recent listings show the active market in Rubavu and keep your visit connected to the wider site.
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
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-gray-100">
                      <img
                        src={listing.cover_image_url || 'https://via.placeholder.com/80x80?text=Home'}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">{listing.title}</p>
                      <p className="text-xs text-gray-500">
                        {listing.location}
                        {' · '}
                        {listing.currency} {listing.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#0D4F2A] mt-1">
                        {listing.bedrooms ? `${listing.bedrooms} bd` : '—'} · {listing.bathrooms ? `${listing.bathrooms} ba` : '—'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link
              to="/properties"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-yellow-500  px-4 py-3 text-sm font-semibold text-white transition hover:bg-yellow-600"
            >
              Browse all listings
            </Link>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Why list here</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#0D4F2A]" />
                Fast local exposure to buyers searching for Rubavu properties.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#0D4F2A]" />
                Easy listing creation with no upfront commissions or complex paperwork.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#0D4F2A]" />
                Contact details are last, so you can complete the listing before committing.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default SellPropertyPage;