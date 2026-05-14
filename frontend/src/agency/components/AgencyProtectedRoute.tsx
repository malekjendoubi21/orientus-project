import { Navigate } from 'react-router-dom';
import { useAgencyAuth } from '../contexts/AgencyAuthContext';
import type { ReactNode } from 'react';

const AgencyProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { agencyUser, isLoading, mustChangePassword } = useAgencyAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (!agencyUser) {
    return <Navigate to="/agency/login" replace />;
  }

  // Bloquer l'accès tant que le mot de passe n'a pas été changé
  if (mustChangePassword) {
    return <Navigate to="/agency/set-first-password" replace />;
  }

  return <>{children}</>;
};

export default AgencyProtectedRoute;
