import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        Checking your session…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;