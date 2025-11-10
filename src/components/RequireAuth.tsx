import { Navigate, useLocation } from 'react-router-dom';
import { authStorage } from '../lib/api';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const token = authStorage.getToken();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/app/login" replace state={{ from: location }} />;
  }
  return children;
}
