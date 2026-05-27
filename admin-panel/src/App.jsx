import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login             from './pages/Login';
import Dashboard         from './pages/Dashboard';
import Restaurants       from './pages/Restaurants';
import Users             from './pages/Users';
import Orders            from './pages/Orders';
import DeliveryPartners  from './pages/DeliveryPartners';
import Analytics         from './pages/Analytics';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0D1117',
              color: '#F1F5F9',
              borderRadius: 14,
              padding: '14px 20px',
              fontSize: 14,
              fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.06)',
              maxWidth: 420,
            },
            success: {
              iconTheme: { primary: '#22C55E', secondary: '#fff' },
              style: { borderLeft: '4px solid #22C55E' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
              style: { borderLeft: '4px solid #EF4444' },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/restaurants"       element={<ProtectedRoute><Restaurants /></ProtectedRoute>} />
          <Route path="/users"             element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/orders"            element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/delivery-partners" element={<ProtectedRoute><DeliveryPartners /></ProtectedRoute>} />
          <Route path="/analytics"         element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
