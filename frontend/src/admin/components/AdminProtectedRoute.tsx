import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requireOwner?: boolean;
}

const AdminProtectedRoute = ({ children, requireOwner = false }: AdminProtectedRouteProps) => {
  const { isAuthenticated, isLoading, isOwner, mustChangePassword } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Bloquer l'accès au dashboard tant que le mot de passe n'a pas été changé
  if (mustChangePassword) {
    return <Navigate to="/admin/set-first-password" replace />;
  }

  if (requireOwner && !isOwner) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
