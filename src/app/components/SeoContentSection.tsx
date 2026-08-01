import { Link } from 'react-router-dom';

/**
 * Keyword-rich SEO content for the homepage.
 * For a new site, Google needs substantial crawlable text to understand
 * what the page is about. This section targets local real estate keywords:
 * "real estate Rubavu", "buy property Gisenyi", "Lake Kivu waterfront", etc.
 */
export function SeoContentSection() {
  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Real Estate in Rubavu, Rwanda — Buy, Sell & Invest
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Rubavu Buy and Sell Ltd</strong> is a professional real estate agency based in{' '}
            <strong>Gisenyi, Rubavu District</strong>, on the shores of Lake Kivu in Rwanda's Western Province.
            We help local and international clients <strong>buy property in Rubavu</strong>,{' '}
            <strong>sell houses and land</strong>, and make confident real estate investments with
            title-ready, verified listings.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Properties in Gisenyi & Lake Kivu</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            From <strong>waterfront plots</strong> and <strong>lake-view houses</strong> to{' '}
            <strong>apartments</strong>, <strong>commercial buildings</strong>, and{' '}
            <strong>agricultural land</strong>, our listings cover Rubavu town and surrounding cells.
            Whether you are looking for a <strong>home for sale in Rubavu</strong>, a{' '}
            <strong>house for rent in Gisenyi</strong>, or a <strong>commercial property for investment</strong>,
            we can help you find the right match.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Why Invest in Rubavu?</h3>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 space-y-1">
            <li>Prime location on <strong>Lake Kivu</strong>, one of Rwanda's fastest-growing tourism and business hubs.</li>
            <li>Close to the <strong>Gisenyi–Goma border</strong> and cross-border trade with DR Congo.</li>
            <li>Growing demand for <strong>residential and holiday rental property</strong>.</li>
            <li><strong>Title-ready land and houses</strong> with verified documentation.</li>
            <li>Strong price appreciation potential in <strong>Rubavu District</strong>.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Our Services</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We offer <strong>property buying assistance</strong>, <strong>property selling</strong>,{' '}
            <strong>property marketing</strong>, <strong>real estate investment advice</strong>,{' '}
            <strong>property valuation</strong>, and <strong>market analysis</strong> across Rubavu and the
            wider Western Province of Rwanda.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/properties"
              className="inline-block bg-[#0D4F2A] hover:bg-[#0A3B21] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              Browse Properties in Rubavu
            </Link>
            <Link
              to="/sell-property"
              className="inline-block bg-[#D56000] hover:bg-[#A84A00] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              Sell Your Property
            </Link>
            <Link
              to="/request-property"
              className="inline-block border border-[#0D4F2A] text-[#0D4F2A] hover:bg-[#0D4F2A] hover:text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              Request a Property
            </Link>
            <Link
              to="/faq"
              className="inline-block border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              Real Estate FAQs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

