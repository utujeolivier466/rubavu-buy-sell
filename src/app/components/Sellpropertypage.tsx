import { useState } from 'react';
import { supabase } from '../../../lib/libsupabaseClient';

// Set these to match your actual Supabase project
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

function SellPropertyPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [propertyType, setPropertyType] = useState('House');
  const [upi, setUpi] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<SubmitState>('idle');
  const [error, setError] = useState<string | null>(null);

  const isValid = fullName.trim() && phone.trim() && location.trim() && price;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
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

      const { error: uploadError } = await client.storage
        .from('submission-photos')
        .upload(fileName, file);

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

    setStatus('submitting');
    setError(null);

    try {
      const photoUrls = await uploadPhotos();

      const submission = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        location_text: location.trim(),
        price: Number(price),
        currency: 'RWF',
        property_type: propertyType,
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

      // Fire-and-forget: don't block success on the email step.
      // The submission is already safely stored either way.
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
      setLocation('');
      setPrice('');
      setPropertyType('House');
      setUpi('');
      setFiles([]);
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Something went wrong submitting your property. Please try again, or contact us directly.');
      setStatus('error');
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          Sell Your Property
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Own a property in Rubavu you'd like to sell? Submit the details below and our team will review it and get in touch.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-8 shadow-sm">
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+250 7xx xxx xxx"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Price (RWF) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option>House</option>
                  <option>Apartment</option>
                  <option>Commercial</option>
                  <option>Land</option>
                </select>
              </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Property Photos</label>
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {files.map((file, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(file)} alt="" className="w-20 h-20 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="text-sm" />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={!isValid || status === 'submitting'}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
            >
              {status === 'submitting' ? 'Submitting…' : 'Submit Property'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default SellPropertyPage;