import { Navigate } from 'react-router-dom';
import { useAuth } from '@digihire/shared';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>;
  if (!user || user.user_metadata?.account_type !== 'talent') return <Navigate to="/login" replace />;
  return <>{children}</>;
}
