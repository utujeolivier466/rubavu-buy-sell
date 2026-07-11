import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';

const CATEGORIES = ['Real Estate Tips', 'Investment Advice', 'Buying Guides', 'Market Updates', 'General'];

function AdminBlogForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Real Estate Tips');
  const [authorName, setAuthorName] = useState('Rubavu Buy and Sell Team');
  const [published, setPublished] = useState(false);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      loadPost(id);
    }
  }, [id]);

  async function loadPost(postId: string) {
    setLoading(true);
    const { data, error } = await supabase!.from('blog_posts').select('*').eq('id', postId).single();

    if (error || !data) {
      setError('Could not load this post.');
      setLoading(false);
      return;
    }

    setTitle(data.title || '');
    setSlug(data.slug || '');
    setExcerpt(data.excerpt || '');
    setContent(data.content || '');
    setCategory(data.category || 'Real Estate Tips');
    setAuthorName(data.author_name || 'Rubavu Buy and Sell Team');
    setPublished(data.published || false);
    setExistingImage(data.cover_image_url || null);
    setLoading(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setNewFile(e.target.files[0]);
    }
  }

  async function uploadCoverImage(): Promise<string | null> {
    if (!newFile) return existingImage;

    const ext = newFile.name.split('.').pop();
    const fileName = `blog-${crypto.randomUUID()}.${ext}`;

    // Reuses the property-images bucket — this upload is admin-only
    // (behind the protected route), same access level as property photos.
    const { error: uploadError } = await supabase!.storage
      .from('property-images')
      .upload(fileName, newFile);

    if (uploadError) {
      console.error('Cover image upload failed:', uploadError);
      return existingImage;
    }

    const { data } = supabase!.storage.from('property-images').getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      setSaving(false);
      return;
    }

    const coverImageUrl = await uploadCoverImage();

    const generatedSlug = (slug.trim() || title.trim())
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const payload = {
      title: title.trim(),
      slug: generatedSlug || undefined,
      excerpt: excerpt.trim() || null,
      content: content.trim(),
      category,
      author_name: authorName.trim() || 'Rubavu Buy and Sell Team',
      published,
      cover_image_url: coverImageUrl,
    };

    const result = isEdit
      ? await supabase!.from('blog_posts').update(payload).eq('id', id)
      : await supabase!.from('blog_posts').insert(payload);

    if (result.error) {
      console.error('Failed to save post:', result.error);
      setError('Something went wrong saving this post. Please try again.');
      setSaving(false);
      return;
    }

    navigate('/admin/blog');
  }

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading post…</p>;
  }

  return (
    <div className="max-w-3xl">
      <Link to="/admin/blog" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Post' : 'New Post'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-200 rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Excerpt <span className="text-gray-400 font-normal">(shown on the blog list card and used for search previews)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
          {existingImage && !newFile && (
            <img src={existingImage} alt="" className="w-32 h-20 object-cover rounded-lg mb-2" />
          )}
          {newFile && (
            <img src={URL.createObjectURL(newFile)} alt="" className="w-32 h-20 object-cover rounded-lg mb-2" />
          )}
          <input type="file" accept="image/*" onChange={handleFileSelect} className="text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            placeholder="Write the article here. Leave a blank line between paragraphs."
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Plain text for now — line breaks are preserved automatically on the published page.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4"
          />
          Published (visible to the public immediately)
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Post'}
          </button>
          <Link
            to="/admin/blog"
            className="px-6 py-2.5 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AdminBlogForm;