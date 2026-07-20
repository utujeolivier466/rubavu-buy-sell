import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import type { Agent } from '../../../lib/types';

interface FormState {
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  status: string;
  price: string;
  currency: string;
  size_sqm: string;
  bedrooms: string;
  bathrooms: string;
  zoning: string;
  location_text: string;
  city: string;
  latitude: string;
  longitude: string;
  has_pool: boolean;
  has_parking: boolean;
  has_garden: boolean;
  has_electricity: boolean;
  has_water: boolean;
  has_internet: boolean;
  youtube_url: string;
  is_featured: boolean;
  is_hot_deal: boolean;
  agent_id: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  property_type: 'House',
  listing_type: 'Sale',
  status: 'Available',
  price: '',
  currency: 'RWF',
  size_sqm: '',
  bedrooms: '',
  bathrooms: '',
  zoning: '',
  location_text: '',
  city: '',
  latitude: '',
  longitude: '',
  has_pool: false,
  has_parking: false,
  has_garden: false,
  has_electricity: false,
  has_water: false,
  has_internet: false,
  youtube_url: '',
  is_featured: false,
  is_hot_deal: false,
  agent_id: '',
};

function AdminPropertyForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase?.from('agents').select('*').then(({ data }: { data: any }) => {
      if (data) setAgents(data as Agent[]);
    });

    if (isEdit && id) {
      loadProperty(id);
    }
  }, [id]);

  async function loadProperty(propertyId: string) {
    if (!supabase) return;
    
    setLoading(true);
    const { data, error } = await supabase.from('properties').select('*').eq('id', propertyId).single();

    if (error || !data) {
      setError('Could not load this property.');
      setLoading(false);
      return;
    }

    setForm({
      title: data.title || '',
      description: data.description || '',
      property_type: data.property_type || 'House',
      listing_type: data.listing_type || 'Sale',
      status: data.status || 'Available',
      price: data.price?.toString() || '',
      currency: data.currency || 'RWF',
      size_sqm: data.size_sqm?.toString() || '',
      bedrooms: data.bedrooms?.toString() || '',
      bathrooms: data.bathrooms?.toString() || '',
      zoning: data.zoning || '',
      location_text: data.location_text || '',
      city: data.city || '',
      latitude: data.latitude?.toString() || '',
      longitude: data.longitude?.toString() || '',
      has_pool: data.has_pool || false,
      has_parking: data.has_parking || false,
      has_garden: data.has_garden || false,
      has_electricity: data.has_electricity || false,
      has_water: data.has_water || false,
      has_internet: data.has_internet || false,
      youtube_url: data.youtube_url || '',
      is_featured: data.is_featured || false,
      is_hot_deal: data.is_hot_deal || false,
      agent_id: data.agent_id || '',
    });
    setExistingImages(data.image_urls || []);
    setLoading(false);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setNewFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  }

  function removeExistingImage(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadNewImages(): Promise<string[]> {
    if (!supabase) return [];
    
    const uploadedUrls: string[] = [];

    for (const file of newFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Image upload failed:', uploadError);
        continue; // skip this file, keep going with the rest
      }

      const { data: publicUrlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrlData.publicUrl);
    }

    return uploadedUrls;
  }

  async function handleSubmit(e: React.FormEvent) {
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!form.title.trim() || !form.price || !form.location_text.trim()) {
      setError('Title, price, and location are required.');
      setSaving(false);
      return;
    }

    const uploadedUrls = await uploadNewImages();
    const allImages = [...existingImages, ...uploadedUrls];

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      property_type: form.property_type,
      listing_type: form.listing_type,
      status: form.status,
      price: Number(form.price),
      currency: form.currency,
      size_sqm: form.size_sqm ? Number(form.size_sqm) : null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      zoning: form.zoning.trim() || null,
      location_text: form.location_text.trim(),
      city: form.city.trim() || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      has_pool: form.has_pool,
      has_parking: form.has_parking,
      has_garden: form.has_garden,
      has_electricity: form.has_electricity,
      has_water: form.has_water,
      has_internet: form.has_internet,
      youtube_url: form.youtube_url.trim() || null,
      is_featured: form.is_featured,
      is_hot_deal: form.is_hot_deal,
      agent_id: form.agent_id || null,
      image_urls: allImages,
      cover_image_url: allImages[0] || null,
    };

    const result = isEdit
      ? await supabase.from('properties').update(payload).eq('id', id)
      : await supabase.from('properties').insert(payload);

    if (result.error) {
      console.error('Failed to save property:', result.error);
      setError('Something went wrong saving this property. Please try again.');
      setSaving(false);
      return;
    }

    navigate('/admin/properties');
  }

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading property…</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/properties" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Property' : 'Add New Property'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-200 rounded-lg p-6">
        {/* Basic info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Classification */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={form.property_type}
              onChange={(e) => updateField('property_type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option>House</option>
              <option>Apartment</option>
              <option>Commercial</option>
              <option>Land</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Listing</label>
            <select
              value={form.listing_type}
              onChange={(e) => updateField('listing_type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option>Sale</option>
              <option>Rent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option>Available</option>
              <option>Pending</option>
              <option>Sold</option>
              <option>Rented</option>
            </select>
          </div>
        </div>

        {/* Price & size */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <input
              value={form.currency}
              onChange={(e) => updateField('currency', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size (sqm)</label>
            <input
              type="number"
              value={form.size_sqm}
              onChange={(e) => updateField('size_sqm', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zoning</label>
            <input
              value={form.zoning}
              onChange={(e) => updateField('zoning', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
            <input
              type="number"
              value={form.bedrooms}
              onChange={(e) => updateField('bedrooms', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
            <input
              type="number"
              value={form.bathrooms}
              onChange={(e) => updateField('bathrooms', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              value={form.location_text}
              onChange={(e) => updateField('location_text', e.target.value)}
              placeholder="e.g. Gisenyi, Rubavu"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              value={form.latitude}
              onChange={(e) => updateField('latitude', e.target.value)}
              placeholder="-1.7028"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              value={form.longitude}
              onChange={(e) => updateField('longitude', e.target.value)}
              placeholder="29.2564"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-3">
          Tip: right-click the spot on Google Maps and copy the coordinates shown.
        </p>

        {/* Features */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Features</p>
          <div className="flex flex-wrap gap-4">
            {([
              ['has_pool', 'Pool'],
              ['has_parking', 'Parking'],
              ['has_garden', 'Garden'],
              ['has_electricity', 'Electricity'],
              ['has_water', 'Water'],
              ['has_internet', 'Internet'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => updateField(key, e.target.checked)}
                  className="w-4 h-4"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Video & agent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video URL</label>
            <input
              value={form.youtube_url}
              onChange={(e) => updateField('youtube_url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
            <select
              value={form.agent_id}
              onChange={(e) => updateField('agent_id', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">— None —</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Flags */}
        <div className="flex gap-6">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => updateField('is_featured', e.target.checked)}
              className="w-4 h-4"
            />
            Featured on homepage
          </label>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>

          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {existingImages.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {newFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {newFiles.map((file, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(file)} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="text-sm" />
          <p className="text-xs text-gray-400 mt-1">First photo becomes the cover image shown on cards.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#D56000] hover:bg-[#A84A00] disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Property'}
          </button>
          <Link
            to="/admin/properties"
            className="px-6 py-2.5 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AdminPropertyForm;