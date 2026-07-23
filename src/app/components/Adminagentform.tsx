import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';

function AdminAgentForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      loadAgent(id);
    }
  }, [id]);

  async function loadAgent(agentId: string) {
    setLoading(true);
    const { data, error } = await supabase!.from('agents').select('*').eq('id', agentId).single();

    if (error || !data) {
      setError('Could not load this agent.');
      setLoading(false);
      return;
    }

    setName(data.name || '');
    setPosition(data.position || '');
    setBio(data.bio || '');
    setPhone(data.phone || '');
    setExistingPhoto(data.photo_url || null);
    setLoading(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setNewFile(e.target.files[0]);
    }
  }

  async function uploadPhoto(): Promise<string | null> {
    if (!newFile) return existingPhoto;

    const ext = newFile.name.split('.').pop();
    const fileName = `agent-${crypto.randomUUID()}.${ext}`;

    // Reuses the property-images bucket — admin-only upload, same trust level.
    const { error: uploadError } = await supabase!.storage
      .from('property-images')
      .upload(fileName, newFile);

    if (uploadError) {
      console.error('Photo upload failed:', uploadError);
      return existingPhoto;
    }

    const { data } = supabase!.storage.from('property-images').getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!name.trim() || !position.trim()) {
      setError('Name and position are required.');
      setSaving(false);
      return;
    }

    const photoUrl = await uploadPhoto();

    const payload = {
      name: name.trim(),
      position: position.trim(),
      bio: bio.trim() || null,
      phone: phone.trim() || null,
      photo_url: photoUrl,
    };

    const result = isEdit
      ? await supabase!.from('agents').update(payload).eq('id', id)
      : await supabase!.from('agents').insert(payload);

    if (result.error) {
      console.error('Failed to save agent:', result.error);
      setError('Something went wrong saving this agent. Please try again.');
      setSaving(false);
      return;
    }

    navigate('/admin/agents');
  }

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading agent…</p>;
  }

  return (
    <div className="max-w-lg">
      <Link to="/admin/agents" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Agent' : 'Add Agent'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-200 rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
          <input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Senior Sales Agent"
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio <span className="text-gray-400 font-normal">(shown on the About page team card)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="A short paragraph about this person's background and role."
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+250 7xx xxx xxx"
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
          {existingPhoto && !newFile && (
            <img src={existingPhoto} alt="" className="w-20 h-20 rounded-full object-cover mb-2" />
          )}
          {newFile && (
            <img src={URL.createObjectURL(newFile)} alt="" className="w-20 h-20 rounded-full object-cover mb-2" />
          )}
          <input type="file" accept="image/*" onChange={handleFileSelect} className="text-sm" />
          <p className="text-xs text-gray-400 mt-1">Optional — a placeholder with initials shows if no photo is set.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Agent'}
          </button>
          <Link
            to="/admin/agents"
            className="px-6 py-2.5 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AdminAgentForm;