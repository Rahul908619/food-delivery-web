import { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation2 } from '../context/LocationContext';
import LocationModal from './LocationModal';

/* ═══════════════════════════════════════════
   CUSTOM SVG ICONS — hand-coded, no emojis
   ═══════════════════════════════════════════ */

const IconHome = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#f97316' : '#666'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const IconOrders = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#f97316' : '#666'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="13" y2="16" />
  </svg>
);

const IconCart = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const IconPin = ({ color = '#f97316', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" fill={color} stroke="none" />
  </svg>
);

const IconChevronDown = ({ size = 11, color = '#aaa' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconProfile = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconPackage = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="#e53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconBolt = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"
    stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

/* ══════════════════════════════════════════════════ */

export default function Navbar() {
  const { user, logout }   = useAuth();
  const { location }       = useLocation2();
  const navigate           = useNavigate();
  const routeLoc           = useRouterLocation();
  const [showProfile,  setShowProfile]  = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const close    = () => setShowProfile(false);
  const isActive = (p) => routeLoc.pathname === p;

  return (
    <>
      <nav style={s.nav}>

        {/* ── Logo ── */}
        <Link to="/" style={s.logo} onClick={close}>
          <div style={s.logoBox}><IconBolt /></div>
          <span style={s.logoTxt}>
            Quick<span style={s.orange}>Bite</span><span style={s.indigo}>X</span>
          </span>
        </Link>

        {/* ── Location Button (Swiggy style) ── */}
        <button
          id="nav-location-btn"
          onClick={() => setShowLocation(true)}
          style={s.locBtn}
        >
          <IconPin color="#f97316" size={20} />
          <div style={s.locTextWrap}>
            <div style={s.locTop}>
              <span style={s.locAreaText}>
                {location ? location.area : 'Set Location'}
              </span>
              <IconChevronDown size={11} color="#888" />
            </div>
            {location && (
              <div style={s.locSub}>
                {location.city || location.displayLine}
              </div>
            )}
          </div>
        </button>

        {/* ── Nav Links ── */}
        <div style={s.links}>
          <Link to="/" id="nav-home"
            style={{ ...s.link, ...(isActive('/') ? s.linkOn : {}) }}
            onClick={close}>
            <IconHome active={isActive('/')} />
            <span>Home</span>
          </Link>
          <Link to="/orders" id="nav-orders"
            style={{ ...s.link, ...(isActive('/orders') ? s.linkOn : {}) }}
            onClick={close}>
            <IconOrders active={isActive('/orders')} />
            <span>Orders</span>
          </Link>
          <Link to="/cart" id="nav-cart" style={s.cartLink} onClick={close}>
            <IconCart />
            <span>Cart</span>
          </Link>
        </div>

        {/* ── Profile ── */}
        <div style={{ position: 'relative', zIndex: 101 }}>
          <button id="nav-profile-btn"
            onClick={() => setShowProfile(!showProfile)}
            style={s.profBtn}>
            <div style={s.ava}>
              {user?.name?.[0]?.toUpperCase() || <IconUser />}
            </div>
            <span style={s.profName}>{user?.name?.split(' ')[0]}</span>
            <IconChevronDown size={11} color="#aaa" />
          </button>

          {showProfile && (
            <div style={s.drop}>
              <div style={s.dropHead}>
                <div style={s.dropAva}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={s.dropName}>{user?.name}</p>
                  <p style={s.dropEmail}>{user?.email || user?.phone}</p>
                </div>
              </div>
              <div style={s.divider} />
              <Link to="/profile" style={s.dropItem} onClick={close}>
                <IconProfile /> My Profile
              </Link>
              <Link to="/orders" style={s.dropItem} onClick={close}>
                <IconPackage /> My Orders
              </Link>
              <div style={s.divider} />
              <button
                onClick={() => { logout(); navigate('/login'); }}
                style={s.dropOut}>
                <IconLogout /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* close profile dropdown on backdrop click */}
      {showProfile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={close} />
      )}

      {/* Location Modal */}
      {showLocation && (
        <LocationModal onClose={() => setShowLocation(false)} />
      )}
    </>
  );
}

const s = {
  nav:         { display:'flex', alignItems:'center', gap:16, padding:'0 24px', height:64, background:'#fff', boxShadow:'0 2px 10px rgba(0,0,0,0.07)', position:'sticky', top:0, zIndex:100, fontFamily:'Inter,sans-serif' },

  /* Logo */
  logo:        { display:'flex', alignItems:'center', gap:8, textDecoration:'none', flexShrink:0 },
  logoBox:     { width:36, height:36, background:'linear-gradient(135deg,#f97316,#ea580c)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' },
  logoTxt:     { fontSize:20, fontWeight:800, color:'#111' },
  orange:      { color:'#f97316' },
  indigo:      { color:'#6366f1' },

  /* Location */
  locBtn:      { display:'flex', alignItems:'center', gap:8, border:'1.5px solid #eee', borderRadius:12, padding:'7px 12px', background:'#fafafa', cursor:'pointer', maxWidth:220, flexShrink:0 },
  locTextWrap: { textAlign:'left', overflow:'hidden', minWidth:0 },
  locTop:      { display:'flex', alignItems:'center', gap:4 },
  locAreaText: { fontSize:14, fontWeight:700, color:'#111', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:140 },
  locSub:      { fontSize:11, color:'#aaa', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:1 },

  /* Nav links */
  links:       { display:'flex', alignItems:'center', gap:4, marginLeft:'auto' },
  link:        { display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9, textDecoration:'none', color:'#555', fontSize:14, fontWeight:500 },
  linkOn:      { background:'#fff7ed', color:'#f97316', fontWeight:700 },
  cartLink:    { display:'flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:9, background:'#fff7ed', color:'#f97316', textDecoration:'none', fontSize:14, fontWeight:700, border:'1.5px solid #fed7aa', flexShrink:0 },

  /* Profile */
  profBtn:     { display:'flex', alignItems:'center', gap:8, border:'1.5px solid #eee', borderRadius:30, padding:'5px 12px 5px 5px', background:'#fff', cursor:'pointer', flexShrink:0 },
  ava:         { width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#f97316,#6366f1)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15 },
  profName:    { fontSize:14, fontWeight:600, color:'#111' },

  /* Dropdown */
  drop:        { position:'absolute', top:'calc(100% + 8px)', right:0, background:'#fff', borderRadius:16, boxShadow:'0 12px 40px rgba(0,0,0,0.14)', minWidth:240, overflow:'hidden', border:'1px solid #f0f0f0', zIndex:200 },
  dropHead:    { display:'flex', alignItems:'center', gap:12, padding:'16px', background:'#fafafa' },
  dropAva:     { width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#f97316,#6366f1)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:18, flexShrink:0 },
  dropName:    { fontWeight:700, fontSize:15, color:'#111', marginBottom:2 },
  dropEmail:   { fontSize:12, color:'#888' },
  divider:     { height:1, background:'#f0f0f0' },
  dropItem:    { display:'flex', alignItems:'center', gap:10, padding:'12px 16px', textDecoration:'none', color:'#333', fontSize:14, fontWeight:500 },
  dropOut:     { display:'flex', alignItems:'center', gap:10, padding:'12px 16px', width:'100%', background:'none', border:'none', color:'#e53935', fontSize:14, fontWeight:600, cursor:'pointer', textAlign:'left', fontFamily:'inherit' },
};
