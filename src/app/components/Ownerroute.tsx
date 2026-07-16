import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';

function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { loading, isOwner } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
        Checking permissions…
      </div>
    );
  }

  if (!isOwner) {
    return <Navigate to="/admin/properties" replace />;
  }

  return <>{children}</>;
}

export default OwnerRoute;