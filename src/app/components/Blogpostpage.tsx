import { Link, useParams } from 'react-router-dom';
import SEOHead from './Seohead';

function BlogPostPage() {
  const { slug } = useParams();

  return (
    <>
      <SEOHead
        title="Blog Post"
        description="Read the latest updates and insights from Rubavu Buy and Sell Ltd."
        url={slug ? `/blog/${slug}` : '/blog'}
      />
      <section className="min-h-[60vh] bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
            Blog
          </p>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Blog post coming soon
          </h1>
          <p className="mb-8 text-base leading-relaxed text-gray-600">
            This blog detail page is being prepared. For now, you can return to the main blog listing to explore our latest updates.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center rounded-full bg-[#0D1F3C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Back to blog
          </Link>
        </div>
      </section>
    </>
  );
}

export default BlogPostPage;
