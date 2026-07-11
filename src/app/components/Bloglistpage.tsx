import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import type { BlogPost } from '../../../lib/types';
import SEOHead from './SEOHead';

function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Failed to load blog posts:', error);
    } else {
      setPosts((data ?? []) as BlogPost[]);
    }
    setLoading(false);
  }

  return (
    <>
      <SEOHead
        title="Real Estate Tips & Market Updates"
        description="Investment advice, property buying guides, and market updates for Rubavu and Lake Kivu real estate."
        url="/blog"
      />
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Learning Center
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Real estate tips, investment advice, buying guides, and market updates for Rubavu and Lake Kivu.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-64" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No articles published yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="h-44 bg-gray-100 overflow-hidden">
                  {post.cover_image_url ? (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="inline-block bg-teal-50 text-teal-700 text-xs font-medium px-2 py-0.5 rounded mb-2">
                    {post.category}
                  </span>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{post.excerpt}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default BlogListPage;