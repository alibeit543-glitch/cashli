import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading fullScreen />;
  if (!user) return <Navigate to="/admin/login" />;
  if (!['admin', 'super_admin', 'moderator'].includes(user.role)) return <Navigate to="/dashboard" />;

  return children;
};

export default AdminRoute;
