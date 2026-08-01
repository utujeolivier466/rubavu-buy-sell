import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/libsupabaseClient';
import { useAuth } from '../context/Authcontext';
import type { PropertyRequest, PropertyRequestStatus } from '../../../lib/types';

const STATUS_STYLES: Record<PropertyRequestStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  matched: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
};

function AdminPropertyRequests() {
  const { isOwner } = useAuth();
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | PropertyRequestStatus>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    const { data, error } = await supabase!
      .from('property_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load property requests:', error);
    } else {
      setRequests(data as PropertyRequest[]);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: PropertyRequestStatus) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    const { error } = await supabase!.from('property_requests').update({ status }).eq('id', id);
    if (error) {
      console.error('Failed to update status:', error);
      fetchRequests();
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete request from "${name}"? This cannot be undone.`)) return;

    setDeletingId(id);
    const { error } = await supabase!.from('property_requests').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete request:', error);
      alert('Could not delete this request. Please try again.');
    } else {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
    setDeletingId(null);
  }

  function formatBudget(req: PropertyRequest) {
    if (!req.min_budget && !req.max_budget) return 'Not specified';
    if (req.min_budget && req.max_budget) {
      return `${req.currency} ${Number(req.min_budget).toLocaleString()} \u2013 ${Number(req.max_budget).toLocaleString()}`;
    }
    if (req.max_budget) return `Up to ${req.currency} ${Number(req.max_budget).toLocaleString()}`;
    return `From ${req.currency} ${Number(req.min_budget).toLocaleString()}`;
  }

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Buyers and renters telling you what they're looking for.</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'new', 'contacted', 'matched', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              style={filter === f ? { backgroundColor: '#0D4F2A' } : undefined}
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
        <p className="text-gray-500 text-sm">No requests in this view yet.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{req.full_name}</p>
                  <p className="text-sm text-gray-500">{req.phone}{req.email ? ` \u00b7 ${req.email}` : ''}</p>
                </div>
                <select
                  value={req.status}
                  onChange={(e) => updateStatus(req.id, e.target.value as PropertyRequestStatus)}
                  className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 focus:outline-none focus:ring-2 ${STATUS_STYLES[req.status]}`}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="matched">Matched</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-700 mb-3">
                <p><span className="text-gray-400">Wants to:</span> {req.request_type}</p>
                <p><span className="text-gray-400">Type:</span> {req.property_type}</p>
                <p><span className="text-gray-400">Beds/Baths:</span> {req.bedrooms ?? '\u2014'} / {req.bathrooms ?? '\u2014'}</p>
                <p><span className="text-gray-400">Location:</span> {req.desired_location}</p>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                <span className="text-gray-400">Budget:</span> {formatBudget(req)}
              </p>
              {req.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{req.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-400">{new Date(req.created_at).toLocaleDateString()}</span>
                <a
                  href={`https://wa.me/${req.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium"
                  style={{ color: '#0D4F2A' }}
                >
                  Message on WhatsApp
                </a>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(req.id, req.full_name)}
                    disabled={deletingId === req.id}
                    className="text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
                  >
                    {deletingId === req.id ? 'Deleting…' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPropertyRequests;