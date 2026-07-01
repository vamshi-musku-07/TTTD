import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoadingScreen() {
  return (
    <div className="min-h-screen auth-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-6 h-6 border-2 border-[#e11d48] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-[#52525b] uppercase tracking-widest">Loading</p>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/app/events" replace />;
  return <Outlet />;
}
