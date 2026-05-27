import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider }      from './context/AuthContext';
import { LocationProvider }  from './context/LocationContext';
import ProtectedRoute        from './components/ProtectedRoute';

import Login          from './pages/Login';
import Register       from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import Home           from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart           from './pages/Cart';
import Checkout       from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Orders         from './pages/Orders';
import OrderTrack     from './pages/OrderTrack';
import Profile        from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1C1917',
                color: '#F5F5F4',
                borderRadius: 14,
                padding: '14px 20px',
                fontSize: 14,
                fontWeight: 600,
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.08)',
                maxWidth: 420,
              },
              success: {
                iconTheme: { primary: '#22C55E', secondary: '#fff' },
                style: { background: '#052E16', border: '1px solid rgba(34,197,94,0.25)' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#fff' },
                style: { background: '#450A0A', border: '1px solid rgba(239,68,68,0.25)' },
              },
            }}
          />
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/partner/reset-password" element={<ResetPassword />} />
            <Route path="/"                    element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/restaurant/:id"      element={<ProtectedRoute><RestaurantDetail /></ProtectedRoute>} />
            <Route path="/cart"                element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout"            element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/payment-success/:id" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/orders"              element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/order/:id/track"     element={<ProtectedRoute><OrderTrack /></ProtectedRoute>} />
            <Route path="/profile"             element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </LocationProvider>
    </AuthProvider>
  );
}
