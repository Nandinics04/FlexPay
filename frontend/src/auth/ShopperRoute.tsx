import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from './AuthContext';

export function ShopperRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Loading..." />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
