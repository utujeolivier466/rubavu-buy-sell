import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import type { PropertySubmission, SubmissionStatus } from '../../../lib/types';

interface SubmissionRow extends PropertySubmission {
  properties?: { slug: string; title: string } | null; // populated once converted
}

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  pending: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-yellow-100 text-yellow-700',
  converted: 'bg-green-100 text-green-700',
  rejected: 'bg-gray-100 text-gray-500',
};

function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | SubmissionStatus>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    setLoading(true);

    if (!supabase) {
      setLoading(false);
      return;
    }

    // Joins the live property (if this submission was already pushed live)
    // so we can show a working "View Listing" link on reload, not just
    // right after conversion.
    const { data, error } = await supabase
      .from('property_submissions')
      .select('*, properties:converted_property_id(slug, title)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load submissions:', error);
    } else {
      setSubmissions(data as SubmissionRow[]);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: SubmissionStatus) {
    if (!supabase) {
      return;
    }

    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    const { error } = await supabase.from('property_submissions').update({ status }).eq('id', id);
    if (error) {
      console.error('Failed to update status:', error);
      fetchSubmissions();
    }
  }

  async function handlePushLive(submission: SubmissionRow) {
    if (submission.status === 'converted') return;

    if (!supabase) {
      alert('The database connection is not available right now.');
      return;
    }

    if (!window.confirm(`Push this property live? It will immediately appear on the public site.`)) {
      return;
    }

    setProcessingId(submission.id);

    const title = `${submission.property_type} for Sale in ${submission.location_text}`;

    const { data: newProperty, error: insertError } = await supabase
      .from('properties')
      .insert({
        title,
        description: submission.description || null,
        property_type: submission.property_type,
        listing_type: submission.listing_type || 'Sale',
        bedrooms: submission.bedrooms ?? null,
        bathrooms: submission.bathrooms ?? null,
        status: 'Available',
        price: submission.price,
        currency: submission.currency,
        location_text: submission.location_text,
        zoning: submission.upi ? `UPI: ${submission.upi}` : null,
        image_urls: submission.photo_urls || [],
        cover_image_url: submission.photo_urls?.[0] || null,
        is_featured: false,
        is_hot_deal: false,
      })
      .select()
      .single();

    if (insertError || !newProperty) {
      console.error('Failed to push listing live:', insertError);
      alert('Could not push this listing live. Please try again.');
      setProcessingId(null);
      return;
    }

    const { error: updateError } = await supabase
      .from('property_submissions')
      .update({ status: 'converted', converted_property_id: newProperty.id })
      .eq('id', submission.id);

    if (updateError) {
      console.error('Listing was created, but linking it back to the submission failed:', updateError);
    }

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submission.id
          ? { ...s, status: 'converted', converted_property_id: newProperty.id, properties: { slug: newProperty.slug, title: newProperty.title } }
          : s
      )
    );
    setProcessingId(null);
  }

  const filtered = filter === 'all' ? submissions : submissions.filter((s) => s.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Inquiries</h1>
          <p className="text-sm text-gray-500 mt-1">Properties submitted by owners through the public "Sell Your Property" form.</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'reviewed', 'converted', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-yellow-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-32" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No submissions in this view yet.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((submission) => (
            <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row gap-4">
              {/* Photos */}
              <div className="flex gap-2 shrink-0 overflow-x-auto sm:w-40">
                {submission.photo_urls?.length ? (
                  submission.photo_urls.slice(0, 3).map((url) => (
                    <img key={url} src={url} alt="" className="w-16 h-16 sm:w-full sm:h-16 object-cover rounded-lg shrink-0" />
                  ))
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 shrink-0">
                    No photos
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{submission.full_name}</p>
                    <p className="text-sm text-gray-500">{submission.phone}</p>
                  </div>
                  <select
                    value={submission.status}
                    onChange={(e) => updateStatus(submission.id, e.target.value as SubmissionStatus)}
                    disabled={submission.status === 'converted'}
                    className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-70 ${STATUS_STYLES[submission.status]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="converted">Converted to Listing</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-700 mb-3">
                  <p><span className="text-gray-400">Location:</span> {submission.location_text}</p>
                  <p><span className="text-gray-400">Price:</span> {submission.currency} {Number(submission.price).toLocaleString()}</p>
                  <p><span className="text-gray-400">Type:</span> {submission.property_type} · {submission.listing_type || 'Sale'}</p>
                  <p><span className="text-gray-400">Beds/Baths:</span> {submission.bedrooms ?? '—'} / {submission.bathrooms ?? '—'}</p>
                  <p><span className="text-gray-400">Email:</span> {submission.email || '—'}</p>
                  <p><span className="text-gray-400">UPI:</span> {submission.upi || '—'}</p>
                </div>
                {submission.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{submission.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <span className="text-gray-400">{new Date(submission.created_at).toLocaleDateString()}</span>
                  <a
                    href={`https://wa.me/${submission.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Message on WhatsApp
                  </a>

                  {submission.status === 'converted' && submission.properties ? (
                    <Link
                      to={`/properties/${submission.properties.slug}`}
                      target="_blank"
                      className="text-teal-600 hover:text-teal-700 font-medium"
                    >
                      View Live Listing →
                    </Link>
                  ) : (
                    <button
                      onClick={() => handlePushLive(submission)}
                      disabled={processingId === submission.id}
                      className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white px-3 py-1.5 rounded-lg font-medium text-xs transition-colors"
                    >
                      {processingId === submission.id ? 'Pushing live…' : 'Push Live'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminSubmissions;