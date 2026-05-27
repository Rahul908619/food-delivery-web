import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#060818', flexDirection:'column', gap:14 }}>
      <div style={{ width:48, height:48, border:'3px solid rgba(249,115,22,0.2)', borderTop:'3px solid #f97316', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:'#64748b', fontSize:13, fontFamily:'Inter,sans-serif' }}>Authenticating...</p>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'ADMIN') return <Navigate to="/login" />;
  return children;
}
