import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/libsupabaseClient';
import type { Inquiry, InquiryStatus } from '../../../lib/types';

interface InquiryRow extends Inquiry {
  properties?: { title: string; slug: string } | null;
}

const STATUS_STYLES: Record<InquiryStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-[#D56000]/10 text-[#D56000]',
  closed: 'bg-gray-100 text-gray-600',
};

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  site_visit: 'Site Visit',
  contact_form: 'Contact Form',
};

function AdminInquiries() {
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | InquiryStatus>('all');

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    if (!supabase) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, properties(title, slug)') as any;

    if (error) {
      console.error('Failed to load inquiries:', error);
    } else if (data) {
      setInquiries(data as InquiryRow[]);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: InquiryStatus) {
    if (!supabase) return;
    
    // Optimistic update so the dropdown feels instant
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));

    const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
    if (error) {
      console.error('Failed to update inquiry status:', error);
      void fetchInquiries(); // revert to real state on failure
    }
  }

  const filtered = filter === 'all' ? inquiries : inquiries.filter((i) => i.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
        <div className="flex gap-2">
          {(['all', 'new', 'contacted', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-[#D56000] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No inquiries in this view yet.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inquiry) => (
                <tr key={inquiry.id} className="border-b border-gray-100 last:border-0 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{inquiry.name || '—'}</p>
                    <p className="text-gray-500 text-xs">{inquiry.phone || inquiry.email || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {inquiry.properties?.title || <span className="text-gray-400">General inquiry</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {SOURCE_LABELS[inquiry.source] || inquiry.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <p className="line-clamp-2">{inquiry.message}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={inquiry.status}
                      onChange={(e) => updateStatus(inquiry.id, e.target.value as InquiryStatus)}
                      className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-[#D56000] ${STATUS_STYLES[inquiry.status]}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminInquiries;