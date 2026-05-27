import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OWNER_MENU = [
  { path: '/owner/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/owner/restaurant', icon: '🍽️', label: 'My Restaurant' },
  { path: '/owner/menu', icon: '📋', label: 'Menu Manager' },
  { path: '/owner/orders', icon: '📦', label: 'Orders' },
  { path: '/owner/analytics', icon: '📊', label: 'Analytics' },
  { path: '/owner/reviews', icon: '⭐', label: 'Reviews' },
];

const DELIVERY_MENU = [
  { path: '/delivery/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/delivery/available', icon: '📍', label: 'Available Orders' },
  { path: '/delivery/my-deliveries', icon: '🛵', label: 'My Deliveries' },
  { path: '/delivery/earnings', icon: '💰', label: 'Earnings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isOwner = user?.role === 'RESTAURANT_OWNER';
  const menu = isOwner ? OWNER_MENU : DELIVERY_MENU;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
            <line x1="10" y1="8" x2="10" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="13" y1="8" x2="13" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="11.5" y1="16" x2="11.5" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 8 Q11.5 12 13 8" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M20 9 L16 19 H20.5 L17 29 L27 16 H22 L26 9 Z" fill="white" opacity="0.95"/>
          </svg>
        </div>
        <div>
          <div style={styles.logoText}>
            <span style={styles.logoWhite}>Quick</span>
            <span style={styles.logoWhite}>Bite</span>
            <span style={styles.logoRed}>X</span>
          </div>
          <p style={styles.logoRole}>{isOwner ? 'Owner Panel' : 'Delivery Panel'}</p>
        </div>
      </div>

      {/* User Info */}
      <div style={styles.userCard}>
        <div style={styles.avatar}>
          {user?.profileImage
            ? <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : <span>{user?.name?.[0]?.toUpperCase()}</span>
          }
        </div>
        <div style={styles.userInfo}>
          <p style={styles.userName}>{user?.name}</p>
          <p style={styles.userEmail}>{user?.email || user?.phone}</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav style={styles.nav}>
        {menu.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}>
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
              {active && <div style={styles.activeDot} />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout} style={styles.logoutBtn}>
        🚪 Logout
      </button>
    </div>
  );
}

const styles = {
  sidebar: { width: 250, minHeight: '100vh', background: '#1C1917', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 },
  logo: { display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  logoIcon: { width: 44, height: 44, background: 'linear-gradient(135deg, #E23744, #FF6B35)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoText: { display: 'flex', alignItems: 'baseline' },
  logoWhite: { fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.5px' },
  logoRed: { fontSize: 18, fontWeight: 900, color: '#E23744', fontFamily: 'Poppins, sans-serif' },
  logoRole: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  userCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', margin: '12px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 12 },
  avatar: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #E23744, #FF6B35)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0, overflow: 'hidden' },
  userInfo: { overflow: 'hidden' },
  userName: { color: '#fff', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  nav: { flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 500, fontSize: 14, position: 'relative', transition: 'all 0.2s', textDecoration: 'none' },
  navItemActive: { background: 'rgba(226,55,68,0.15)', color: '#E23744' },
  navIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  navLabel: { flex: 1 },
  activeDot: { width: 6, height: 6, borderRadius: '50%', background: '#E23744' },
  logoutBtn: { margin: '0 12px', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left' },
};
