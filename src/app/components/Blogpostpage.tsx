import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import type { BlogPost } from '../../../lib/types';
import SEOHead from './SEOHead';

function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function fetchPost() {
    if (!supabase) {
      setError('Supabase is not configured yet.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug?.trim() || '')
      .eq('published', true)
      .maybeSingle();

    if (error || !data) {
      console.error('Failed to load post:', error);
      setError('This article could not be found.');
    } else {
      setPost(data as BlogPost);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="bg-gray-200 h-64 rounded-lg mb-6" />
        <div className="bg-gray-200 h-8 w-2/3 rounded mb-3" />
        <div className="bg-gray-200 h-4 w-1/3 rounded" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-700 text-lg mb-4">{error}</p>
        <Link to="/blog" className="text-yellow-600 hover:text-yellow-700 font-medium">
          ← Back to Learning Center
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt || post.content.slice(0, 155)}
        image={post.cover_image_url || undefined}
        url={`/blog/${post.slug}`}
        type="article"
      />
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <Link to="/blog" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
          ← Back to Learning Center
        </Link>

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-56 sm:h-80 object-cover rounded-lg mb-6"
          />
        )}

        <span className="inline-block bg-teal-50 text-teal-700 text-xs font-medium px-2 py-0.5 rounded mb-3">
          {post.category}
        </span>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
          <span>{post.author_name}</span>
          <span>•</span>
          <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</span>
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
      </div>
    </>
  );
}

export default BlogPostPage;