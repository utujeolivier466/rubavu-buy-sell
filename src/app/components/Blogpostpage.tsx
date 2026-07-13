import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import type { BlogPost } from '../../../lib/types';
import SEOHead from './Seohead';

function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadPost() {
      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: slugMatch, error: slugError } = await supabase!
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .eq('slug', slug)
        .maybeSingle();

      if (ignore) return;

      if (slugMatch) {
        setPost(slugMatch as BlogPost);
        setError(null);
        setLoading(false);
        return;
      }

      const { data: idMatch, error: idError } = await supabase!
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .eq('id', slug)
        .maybeSingle();

      if (ignore) return;

      if (idError) {
        console.error('Failed to load blog post:', idError || slugError);
        setError('This article could not be loaded right now.');
        setPost(null);
      } else {
        setPost((idMatch as BlogPost | null) || null);
        setError(null);
      }

      setLoading(false);
    }

    loadPost();
    return () => {
      ignore = true;
    };
  }, [slug]);

  return (
    <>
      <SEOHead
        title={post?.title || 'Blog Post'}
        description={post?.excerpt || 'Read the latest updates and insights from Rubavu Buy and Sell Ltd.'}
        url={slug ? `/blog/${slug}` : '/blog'}
      />
      <section className="min-h-[60vh] bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 animate-pulse rounded bg-gray-100" />
              <div className="h-4 animate-pulse rounded bg-gray-100" />
            </div>
          ) : error || !post ? (
            <>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#0D4F2A]">
                Blog
              </p>
              <h1 className="mb-4 text-3xl font-bold text-gray-900">
                Article not found
              </h1>
              <p className="mb-8 text-base leading-relaxed text-gray-600">
                {error || 'The requested article is not available or may not be published yet.'}
              </p>
            </>
          ) : (
            <>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#0D4F2A]">
                {post.category}
              </p>
              <h1 className="mb-4 text-3xl font-bold text-gray-900">{post.title}</h1>
              <p className="mb-6 text-sm text-gray-500">
                By {post.author_name} • {new Date(post.published_at || post.created_at).toLocaleDateString()}
              </p>
              {post.cover_image_url && (
                <img src={post.cover_image_url} alt={post.title} className="mb-8 h-64 w-full rounded-2xl object-cover" />
              )}
              <div className="whitespace-pre-line text-base leading-relaxed text-gray-700">
                {post.content}
              </div>
            </>
          )}
          <Link
            to="/blog"
            className="mt-8 inline-flex items-center rounded-full bg-[#0D1F3C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0A3B21]"
          >
            Back to blog
          </Link>
        </div>
      </section>
    </>
  );
}

export default BlogPostPage;
