import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'CUSTOMER') return <Navigate to="/login" />;
  return children;
}
