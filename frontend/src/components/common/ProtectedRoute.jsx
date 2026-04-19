import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
