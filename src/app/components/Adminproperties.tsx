import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import { useAuth } from '../context/Authcontext';
import type { Property } from '../../../lib/types';

const STATUS_STYLES: Record<string, string> = {
  Available: 'bg-[#D56000]/10 text-[#0D4F2A] border border-[#D56000]/20',
  Sold: 'bg-[#0D4F2A] text-white',
  Rented: 'bg-[#0D4F2A] text-white',
  Pending: 'bg-[#0D4F2A]/10 text-[#0D4F2A] border border-[#0D4F2A]/20',
};

function AdminProperties() {
  const { isOwner } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    if (!supabase) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load properties:', error);
    } else {
      setProperties(data as Property[]);
    }
    setLoading(false);
  }

  async function updateField(id: string, field: 'status' | 'is_featured', value: any) {
    if (!supabase) return;
    
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    const { error } = await supabase.from('properties').update({ [field]: value }).eq('id', id);
    if (error) {
      console.error(`Failed to update ${field}:`, error);
      void fetchProperties();
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!supabase) return;
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    const { error } = await supabase.from('properties').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete property:', error);
      alert('Could not delete this property. Please try again.');
    } else {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
    setDeletingId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <Link
          to="/admin/properties/new"
          className="bg-[#D56000] hover:bg-[#A84A00] text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          + Add Property
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-20" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-4">No properties yet.</p>
          <Link to="/admin/properties/new" className="text-[#D56000] hover:text-[#A84A00] font-medium">
            Add your first property →
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={property.cover_image_url || (property.image_urls && property.image_urls[0]) || ''}
                          alt={property.title}
                          className="w-12 h-12 rounded object-cover bg-gray-100 shrink-0"
                        />
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{property.title}</p>
                          <p className="text-xs text-gray-500">{property.location_text}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {property.currency} {Number(property.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={property.status}
                        onChange={(e) => updateField(property.id, 'status', e.target.value)}
                        className={`text-sm font-semibold rounded-none px-3 py-1.5 border-0 focus:outline-none focus:ring-2 focus:ring-[#D56000] ${STATUS_STYLES[property.status]}`}
                      >
                        <option value="Available">Available</option>
                        <option value="Pending">Pending</option>
                        <option value="Sold">Sold</option>
                        <option value="Rented">Rented</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateField(property.id, 'is_featured', !property.is_featured)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                          property.is_featured ? 'bg-[#D56000]/10 text-[#D56000]' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {property.is_featured ? '★ Featured' : '☆ Feature it'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/properties/${property.id}/edit`}
                        className="text-[#D56000] hover:text-[#A84A00] font-medium text-xs mr-4"
                      >
                        Edit
                      </Link>
                      {isOwner && (
                        <button
                          onClick={() => handleDelete(property.id, property.title)}
                          disabled={deletingId === property.id}
                          className="text-red-500 hover:text-red-600 font-medium text-xs disabled:opacity-50"
                        >
                          {deletingId === property.id ? 'Deleting…' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {properties.map((property) => (
              <div key={property.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <img
                    src={property.cover_image_url || (property.image_urls && property.image_urls[0]) || ''}
                    alt={property.title}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{property.title}</p>
                        <p className="text-xs text-gray-500 truncate">{property.location_text}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ${STATUS_STYLES[property.status]}`}>
                        {property.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-gray-700">
                        {property.currency} {Number(property.price).toLocaleString()}
                      </span>
                      <button
                        onClick={() => updateField(property.id, 'is_featured', !property.is_featured)}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                          property.is_featured ? 'bg-[#D56000]/10 text-[#D56000]' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {property.is_featured ? '★ Featured' : '☆ Feature it'}
                      </button>
                    </div>

                    <div className="mt-3">
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Status</label>
                      <select
                        value={property.status}
                        onChange={(e) => updateField(property.id, 'status', e.target.value)}
                        className={`w-full text-sm font-semibold rounded-lg px-2.5 py-2 border focus:outline-none focus:ring-2 focus:ring-[#D56000] ${STATUS_STYLES[property.status]}`}
                      >
                        <option value="Available">Available</option>
                        <option value="Pending">Pending</option>
                        <option value="Sold">Sold</option>
                        <option value="Rented">Rented</option>
                      </select>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Link
                        to={`/admin/properties/${property.id}/edit`}
                        className="flex-1 text-center bg-[#D56000] hover:bg-[#A84A00] text-white px-3 py-2.5 rounded-lg font-semibold text-sm"
                      >
                        Edit
                      </Link>
                      {isOwner && (
                        <button
                          onClick={() => handleDelete(property.id, property.title)}
                          disabled={deletingId === property.id}
                          className="flex-1 text-center text-red-500 hover:text-red-600 font-medium text-sm py-2.5 rounded-lg border border-red-200 disabled:opacity-50"
                        >
                          {deletingId === property.id ? 'Deleting…' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminProperties;