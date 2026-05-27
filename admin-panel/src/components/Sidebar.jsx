import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MENU = [
  { path: '/dashboard',          icon: '▦',  label: 'Dashboard',          emoji: '📊' },
  { path: '/restaurants',        icon: '🍽️', label: 'Restaurants',         emoji: '🍽️' },
  { path: '/users',              icon: '👥', label: 'Customers',           emoji: '👥' },
  { path: '/delivery-partners',  icon: '🛵', label: 'Delivery Partners',   emoji: '🛵' },
  { path: '/orders',             icon: '📦', label: 'All Orders',          emoji: '📦' },
  { path: '/analytics',          icon: '📈', label: 'Analytics',           emoji: '📈' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={s.sidebar}>
      {/* Logo */}
      <div style={s.logoWrap}>
        <div style={s.logoImgWrap}>
          <img src="/quickbitex_logo.png" alt="QuickBiteX" style={s.logoImg} />
        </div>
        <div>
          <div style={s.logoText}>
            Quick<span style={s.logoAccent}>Bite</span><span style={s.logoX}>X</span>
          </div>
          <div style={s.logoSub}>Admin Console</div>
        </div>
      </div>

      {/* Admin Badge */}
      <div style={s.adminCard}>
        <div style={s.adminGlow} />
        <div style={s.adminAvatar}>
          {user?.profileImage
            ? <img src={user.profileImage} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} />
            : <span style={s.avatarLetter}>{user?.name?.[0]?.toUpperCase() || 'A'}</span>
          }
        </div>
        <div style={s.adminInfo}>
          <p style={s.adminName}>{user?.name || 'Admin'}</p>
          <span style={s.adminBadge}>⚡ Super Admin</span>
        </div>
      </div>

      {/* Nav Section */}
      <div style={s.navLabel}>NAVIGATION</div>
      <nav style={s.nav}>
        {MENU.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              style={{ ...s.navItem, ...(active ? s.navActive : {}) }}>
              {active && <div style={s.activeGlow} />}
              <span style={s.navIcon}>{item.emoji}</span>
              <span style={s.navLabel2}>{item.label}</span>
              {active && <span style={s.activeDot} />}
            </Link>
          );
        })}
      </nav>

      <div style={s.divider} />

      {/* Bottom */}
      <div style={s.bottomSection}>
        <div style={s.versionTag}>v1.0.0 · Production</div>
        <button onClick={() => { logout(); navigate('/login'); }} style={s.logout}>
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

const s = {
  sidebar: {
    width: 256,
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0d1117 0%, #0a0f1e 100%)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    borderRight: '1px solid rgba(255,255,255,0.05)',
    position: 'relative',
    overflow: 'hidden',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '28px 20px 22px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  logoImgWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    flexShrink: 0,
    border: '1.5px solid rgba(249,115,22,0.3)',
    boxShadow: '0 0 16px rgba(249,115,22,0.2)',
  },
  logoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  logoText: { fontSize: 18, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px' },
  logoAccent: { color: '#f97316' },
  logoX: { color: '#6366f1' },
  logoSub: { fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, marginTop: 2, textTransform: 'uppercase' },

  adminCard: {
    margin: '16px 14px',
    background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(99,102,241,0.08))',
    border: '1px solid rgba(249,115,22,0.15)',
    borderRadius: 14,
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    position: 'relative',
    overflow: 'hidden',
  },
  adminGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    background: 'radial-gradient(circle, rgba(249,115,22,0.2), transparent)',
    borderRadius: '50%',
  },
  adminAvatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f97316, #6366f1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    boxShadow: '0 0 12px rgba(249,115,22,0.3)',
  },
  avatarLetter: { color: '#fff', fontWeight: 800, fontSize: 16 },
  adminInfo: { zIndex: 1 },
  adminName: { color: '#f1f5f9', fontWeight: 700, fontSize: 13, marginBottom: 4 },
  adminBadge: {
    fontSize: 10,
    color: '#f97316',
    fontWeight: 700,
    background: 'rgba(249,115,22,0.15)',
    padding: '2px 9px',
    borderRadius: 20,
    border: '1px solid rgba(249,115,22,0.2)',
  },

  navLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.2)',
    fontWeight: 700,
    letterSpacing: 2,
    padding: '8px 20px 4px',
    textTransform: 'uppercase',
  },
  nav: { flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    padding: '11px 14px',
    borderRadius: 12,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: 500,
    position: 'relative',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  navActive: {
    background: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(99,102,241,0.1))',
    color: '#f97316',
    border: '1px solid rgba(249,115,22,0.2)',
  },
  activeGlow: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at left, rgba(249,115,22,0.1), transparent)',
  },
  navIcon: { fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 },
  navLabel2: { flex: 1, fontWeight: 600 },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#f97316',
    boxShadow: '0 0 8px rgba(249,115,22,0.8)',
    flexShrink: 0,
  },

  divider: { height: 1, background: 'rgba(255,255,255,0.05)', margin: '8px 14px' },
  bottomSection: { padding: '8px 14px 20px', display: 'flex', flexDirection: 'column', gap: 10 },
  versionTag: { fontSize: 10, color: 'rgba(255,255,255,0.15)', textAlign: 'center', fontWeight: 500 },
  logout: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 14px',
    background: 'rgba(239,68,68,0.07)',
    border: '1px solid rgba(239,68,68,0.12)',
    borderRadius: 12,
    color: 'rgba(239,68,68,0.7)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
  },
};
