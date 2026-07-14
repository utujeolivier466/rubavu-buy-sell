import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import type { BlogPost } from '../../../lib/types';

function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase!
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load posts:', error);
    } else {
      setPosts(data as BlogPost[]);
    }
    setLoading(false);
  }

  async function togglePublished(id: string, published: boolean) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, published } : p)));
    const { error } = await supabase!.from('blog_posts').update({ published }).eq('id', id);
    if (error) {
      console.error('Failed to update publish status:', error);
      fetchPosts();
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    const { error } = await supabase!.from('blog_posts').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete post:', error);
      alert('Could not delete this post. Please try again.');
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
    setDeletingId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog / Learning Center</h1>
        <Link
          to="/admin/blog/new"
          className="bg-[#D56000] hover:bg-[#A84A00] text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          + New Post
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-20" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-4">No articles yet.</p>
          <Link to="/admin/blog/new" className="text-[#D56000] hover:text-[#A84A00] font-medium">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{post.category}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublished(post.id, !post.published)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                        post.published ? 'bg-[#D56000]/10 text-[#D56000]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft — click to publish'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      to={`/admin/blog/${post.id}/edit`}
                      className="text-[#D56000] hover:text-[#A84A00] font-medium text-xs mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={deletingId === post.id}
                      className="text-red-500 hover:text-red-600 font-medium text-xs disabled:opacity-50"
                    >
                      {deletingId === post.id ? 'Deleting…' : 'Delete'}
                    </button>
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

export default AdminBlog;