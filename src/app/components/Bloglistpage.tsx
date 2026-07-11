import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import type { BlogPost } from '../../../lib/types';
import SEOHead from './Seohead';

function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadPosts() {
      setLoading(true);
      const { data, error } = await supabase!
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (ignore) return;

      if (error) {
        console.error('Failed to load blog posts:', error);
        setError('We could not load the latest posts right now.');
        setPosts([]);
      } else {
        setPosts((data as BlogPost[]) || []);
        setError(null);
      }

      setLoading(false);
    }

    loadPosts();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <SEOHead
        title="Blog & Learning Center"
        description="Stay updated with insights, tips, and guides about real estate investing and property buying in Rubavu District."
        url="/blog"
      />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-[#0D1F3C] via-[#0D1F3C] to-teal-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <p className="text-amber-400 font-semibold tracking-wide uppercase text-sm mb-3">
            Insights & Resources
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Blog & Learning Center
          </h1>
          <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
            Stay informed with expert insights, investment tips, and market updates about real estate in Rubavu District.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
              No published blog posts yet. Please check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug || post.id}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-teal-300"
                >
                  <div className="w-full h-48 bg-gradient-to-br from-teal-500 to-[#0D1F3C] flex items-center justify-center">
                    {post.cover_image_url ? (
                      <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-white text-center">
                        <div className="text-4xl font-bold opacity-50">{post.category?.[0] || 'B'}</div>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(post.published_at || post.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt || 'Read the full article for insights and guidance.'}
                    </p>

                    <div className="flex items-center text-teal-600 font-medium text-sm group-hover:gap-2 transition-all">
                      Read More
                      <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 sm:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Looking to Share Your Expertise?
          </h2>
          <p className="text-gray-600 mb-6">
            We'd love to feature guest posts and insights from real estate professionals. Get in touch to collaborate.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center rounded-full bg-[#0D1F3C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}

export default BlogListPage;