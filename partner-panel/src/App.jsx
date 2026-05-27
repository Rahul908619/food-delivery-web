import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Owner pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import RegisterRestaurant from './pages/owner/RegisterRestaurant';
import MenuManager from './pages/owner/MenuManager';
import OrderManager from './pages/owner/OrderManager';
import Analytics from './pages/owner/Analytics';
import Reviews from './pages/owner/Reviews';

// Delivery pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import AvailableOrders from './pages/delivery/AvailableOrders';
import MyDeliveries from './pages/delivery/MyDeliveries';
import Earnings from './pages/delivery/Earnings';

const OWNER = ['RESTAURANT_OWNER'];
const DELIVERY = ['DELIVERY_PARTNER'];

function Layout({ children }) {
  return <div style={{ display: 'flex', minHeight: '100vh' }}>{children}</div>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1C1917',
              borderRadius: 14,
              padding: '14px 20px',
              fontSize: 14,
              fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid #F0F0F0',
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
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/partner/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/partner/reset-password" element={<ResetPassword />} />

          {/* Owner Routes */}
          <Route path="/owner/dashboard" element={<ProtectedRoute allowedRoles={OWNER}><Layout><OwnerDashboard /></Layout></ProtectedRoute>} />
          <Route path="/owner/restaurant" element={<ProtectedRoute allowedRoles={OWNER}><Layout><RegisterRestaurant /></Layout></ProtectedRoute>} />
          <Route path="/owner/menu" element={<ProtectedRoute allowedRoles={OWNER}><Layout><MenuManager /></Layout></ProtectedRoute>} />
          <Route path="/owner/orders" element={<ProtectedRoute allowedRoles={OWNER}><Layout><OrderManager /></Layout></ProtectedRoute>} />
          <Route path="/owner/analytics" element={<ProtectedRoute allowedRoles={OWNER}><Layout><Analytics /></Layout></ProtectedRoute>} />
          <Route path="/owner/reviews" element={<ProtectedRoute allowedRoles={OWNER}><Layout><Reviews /></Layout></ProtectedRoute>} />

          {/* Delivery Routes */}
          <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={DELIVERY}><Layout><DeliveryDashboard /></Layout></ProtectedRoute>} />
          <Route path="/delivery/available" element={<ProtectedRoute allowedRoles={DELIVERY}><Layout><AvailableOrders /></Layout></ProtectedRoute>} />
          <Route path="/delivery/my-deliveries" element={<ProtectedRoute allowedRoles={DELIVERY}><Layout><MyDeliveries /></Layout></ProtectedRoute>} />
          <Route path="/delivery/earnings" element={<ProtectedRoute allowedRoles={DELIVERY}><Layout><Earnings /></Layout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
