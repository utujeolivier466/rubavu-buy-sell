import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-[#0D1F3C] mb-2">404</p>
        <h1 className="text-xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist, may have been moved, or the property may no longer be available.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <Link
            to="/properties"
            className="flex items-center justify-center gap-2 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            <Search className="w-4 h-4" /> Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;