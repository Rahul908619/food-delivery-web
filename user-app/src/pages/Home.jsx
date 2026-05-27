import { useState, useEffect, useCallback, useRef } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import LocationModal from '../components/LocationModal';
import RestaurantCard from '../components/RestaurantCard';
import { useLocation2 } from '../context/LocationContext';
import popup from '../components/CustomToast';

/* ══════════════════════════════════════════════════════════
   CUSTOM SVG ICONS — hand-coded, no emoji icons
   ══════════════════════════════════════════════════════════ */

const IconSearch = ({ size = 20, color = '#bbb' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="22" y2="22" />
  </svg>
);

const IconClose = ({ size = 13, color = '#999' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.8" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconPin = ({ color = '#f97316', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" fill={color} stroke="none" />
  </svg>
);

const IconGPS = ({ color = '#f97316', size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3.5" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
  </svg>
);

// eslint-disable-next-line no-unused-vars
const IconCity = ({ size = 22, color = '#888' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="9" width="10" height="13" rx="1" />
    <rect x="13" y="4" width="8" height="18" rx="1" />
    <line x1="6" y1="13" x2="6" y2="13.01" strokeWidth="2.5" />
    <line x1="6" y1="17" x2="6" y2="17.01" strokeWidth="2.5" />
    <line x1="17" y1="8" x2="17" y2="8.01" strokeWidth="2.5" />
    <line x1="17" y1="12" x2="17" y2="12.01" strokeWidth="2.5" />
    <line x1="17" y1="16" x2="17" y2="16.01" strokeWidth="2.5" />
  </svg>
);

const IconBowl = ({ size = 86 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <ellipse cx="50" cy="65" rx="42" ry="12" fill="rgba(0,0,0,0.15)" />
    <path d="M15 50 Q15 80 50 80 Q85 80 85 50 Z" fill="#fff8f0" />
    <path d="M15 50 Q15 80 50 80 Q85 80 85 50" stroke="#f97316" strokeWidth="3" fill="none" />
    <rect x="28" y="38" width="44" height="14" rx="7" fill="#f97316" />
    <circle cx="38" cy="44" r="4" fill="#fff" opacity="0.6" />
    <circle cx="50" cy="42" r="5" fill="#fff" opacity="0.5" />
    <circle cx="62" cy="44" r="4" fill="#fff" opacity="0.6" />
    <rect x="44" y="18" width="4" height="22" rx="2" fill="#f97316" />
    <rect x="52" y="14" width="4" height="26" rx="2" fill="#ea580c" />
  </svg>
);

const IconScooter = ({ size = 55 }) => (
  <svg width={size} height={size} viewBox="0 0 100 70" fill="none">
    <circle cx="22" cy="52" r="13" stroke="#f97316" strokeWidth="4" fill="#fff8f0" />
    <circle cx="22" cy="52" r="5" fill="#f97316" />
    <circle cx="78" cy="52" r="13" stroke="#f97316" strokeWidth="4" fill="#fff8f0" />
    <circle cx="78" cy="52" r="5" fill="#f97316" />
    <path d="M35 52 L55 25 L78 25 L78 52" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="#fff8f0" />
    <rect x="52" y="14" width="30" height="14" rx="5" fill="#f97316" />
    <path d="M18 38 L35 38 L42 25" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <rect x="24" y="32" width="12" height="8" rx="3" fill="#6366f1" />
  </svg>
);

const IconStar = ({ size = 22, color = '#fbbf24' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconBolt = ({ size = 24, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
    stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconShield = ({ size = 34, color = '#f97316' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconGift = ({ size = 34, color = '#6366f1' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
  </svg>
);

const IconDelivery = ({ size = 34, color = '#059669' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="17" r="2" />
    <circle cx="19" cy="17" r="2" />
    <path d="M1 17V10l5-7h10l5 7v7" />
    <path d="M7 10h10" />
    <path d="M12 3v7" />
  </svg>
);

const IconMapCoverage = ({ size = 34, color = '#f97316' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

/* ══════════════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════════════ */

const FILTERS = [
  { key: '',         label: 'All',           svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z' },
  { key: 'PURE_VEG', label: 'Pure Veg' },
  { key: 'NON_VEG',  label: 'Non-Veg' },
  { key: 'BOTH',     label: 'Veg & Non-Veg' },
];

// eslint-disable-next-line no-unused-vars
const VEG_FILTER_ICONS = {
  '':         { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z', color: '#888' },
  'PURE_VEG': null,
  'NON_VEG':  null,
  'BOTH':     null,
};

const CATEGORIES = [
  { label: 'Pizza',    icon: <PizzaIcon /> },
  { label: 'Burger',   icon: <BurgerIcon /> },
  { label: 'Biryani',  icon: <BiryaniIcon /> },
  { label: 'Thali',    icon: <ThaliIcon /> },
  { label: 'Chinese',  icon: <ChineseIcon /> },
  { label: 'Desserts', icon: <DessertIcon /> },
  { label: 'South',    icon: <SouthIcon /> },
  { label: 'Rolls',    icon: <RollIcon /> },
];

/* ── Micro food SVG icons for categories ── */
function PizzaIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <path d="M20 4 L36 34 L4 34 Z" fill="#fff7ed" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="16" cy="26" r="3" fill="#e53935" />
      <circle cx="24" cy="22" r="2.5" fill="#e53935" />
      <circle cx="20" cy="30" r="2" fill="#e53935" />
      <path d="M10 30 Q20 12 30 30" stroke="#f97316" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
    </svg>
  );
}

function BurgerIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="14" rx="14" ry="7" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
      <rect x="6" y="20" width="28" height="5" fill="#92400e" rx="1" />
      <rect x="6" y="19" width="28" height="3" fill="#4ade80" rx="1" />
      <ellipse cx="20" cy="26" rx="14" ry="4" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
      <circle cx="14" cy="14" r="2.5" fill="#ef4444" opacity="0.8" />
      <circle cx="22" cy="13" r="2" fill="#ef4444" opacity="0.8" />
    </svg>
  );
}

function BiryaniIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="28" rx="14" ry="5" fill="#d97706" stroke="#92400e" strokeWidth="2" />
      <path d="M6 24 Q6 14 20 14 Q34 14 34 24" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
      <ellipse cx="20" cy="24" rx="14" ry="4" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
      <circle cx="14" cy="20" r="2" fill="#f97316" />
      <circle cx="22" cy="19" r="1.5" fill="#e53935" />
      <circle cx="18" cy="22" r="1.5" fill="#f97316" />
      <line x1="20" y1="5" x2="20" y2="14" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ThaliIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="15" fill="#fff8f0" stroke="#f97316" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="9" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="15" cy="16" r="3.5" fill="#4ade80" />
      <circle cx="25" cy="16" r="3.5" fill="#fbbf24" />
      <circle cx="20" cy="24" r="3.5" fill="#f97316" />
      <circle cx="20" cy="20" r="2" fill="#fff" stroke="#f97316" strokeWidth="1" />
    </svg>
  );
}

function ChineseIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <path d="M8 30 Q8 18 20 16 Q32 18 32 30" fill="#fff4e6" stroke="#d97706" strokeWidth="2.5" />
      <ellipse cx="20" cy="30" rx="12" ry="4" fill="#d97706" />
      <line x1="11" y1="5" x2="16" y2="18" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="29" y1="5" x2="24" y2="18" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="14" cy="23" r="2" fill="#e53935" opacity="0.7" />
      <circle cx="22" cy="22" r="1.5" fill="#4ade80" opacity="0.8" />
    </svg>
  );
}

function DessertIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <rect x="10" y="20" width="20" height="14" rx="3" fill="#fce7d0" stroke="#f97316" strokeWidth="2" />
      <path d="M10 20 Q15 10 20 12 Q25 10 30 20" fill="#fff" stroke="#f97316" strokeWidth="2" />
      <path d="M14 20 Q17 13 20 15 Q23 13 26 20" fill="#fce7d0" />
      <circle cx="17" cy="26" r="2.5" fill="#e53935" />
      <circle cx="23" cy="24" r="2" fill="#4ade80" />
      <rect x="18" y="8" width="4" height="6" rx="2" fill="#f97316" />
    </svg>
  );
}

function SouthIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="24" rx="13" ry="6" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
      <path d="M8 22 Q8 8 20 6 Q32 8 32 22" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
      <line x1="20" y1="6" x2="20" y2="18" stroke="#fff" strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="15" cy="16" r="2" fill="#e53935" />
      <circle cx="25" cy="15" r="2" fill="#4ade80" />
    </svg>
  );
}

function RollIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <path d="M12 8 Q8 8 8 20 Q8 32 20 34 Q32 34 34 22 Q36 10 24 8 Z"
        fill="#fef3c7" stroke="#d97706" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="17" cy="18" r="2.5" fill="#e53935" />
      <circle cx="22" cy="22" r="2" fill="#4ade80" />
      <circle cx="24" cy="16" r="2" fill="#f97316" />
      <path d="M12 8 Q18 10 24 8" stroke="#d97706" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── Skeleton pulse ── */
const SkelPulse = ({ style: extra = {} }) => (
  <div style={{ background: 'linear-gradient(90deg,#e5e7eb 25%,#d1d5db 50%,#e5e7eb 75%)', backgroundSize: '400% 100%', animation: 'shimmer 1.5s infinite linear', borderRadius: 8, ...extra }} />
);

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function Home() {
  const { location } = useLocation2();

  const [restaurants,  setRestaurants]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [vegFilter,    setVegFilter]    = useState('');
  const [search,       setSearch]       = useState('');
  const [catSearch,    setCatSearch]    = useState('');
  const [showLocModal, setShowLocModal] = useState(false);
  const prevLocKey  = useRef(null);
  const isFetching  = useRef(false);   // guard: prevents concurrent calls

  /* ── Fetch restaurants ─────────────────────────────────── */
  const fetchRestaurants = useCallback(async (loc, filter = '') => {
    // Prevent multiple simultaneous calls (caused by 2 useEffects firing on mount)
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const params = {
        lat:    loc ? loc.lat    : 20.5937,   // India centre if no location
        lng:    loc ? loc.lng    : 78.9629,
        radius: loc ? (loc.radius || 40) : 5000, // huge radius = all restaurants
      };
      if (filter) params.vegFilter = filter;
      console.log('[Home] Fetching restaurants with params:', params);
      const res = await API.get('/customer/restaurants', { params });
      console.log('[Home] Restaurants loaded:', res.data?.data?.length ?? 0);
      setRestaurants(res.data.data || []);
    } catch (err) {
      const status = err.response?.status;
      console.error('[Home] Failed to load restaurants. Status:', status, err.response?.data ?? err.message);
      // Use a fixed toast ID so multiple calls only show ONE error message
      if (status === 401 || status === 403) {
        popup.sessionExpired();
      } else if (!err.response) {
        popup.networkError();
      } else {
        popup.error('Load Failed', `Failed to load restaurants (${status ?? 'error'})`);
      }
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  /* Single unified effect — runs once on mount, then again when location changes */
  useEffect(() => {
    const locKey = location
      ? `${location.lat?.toFixed(3)},${location.lng?.toFixed(3)}`
      : 'none';

    // Skip if we already fetched for this exact location key
    if (prevLocKey.current === locKey) return;
    prevLocKey.current = locKey;

    setVegFilter('');
    setSearch('');
    setCatSearch('');
    fetchRestaurants(location, '');
  // eslint-disable-next-line
  }, [location]);

  const handleFilter = (f) => {
    setVegFilter(f);
    fetchRestaurants(location, f);
  };

  const handleCatClick = (label) => {
    setCatSearch(prev => prev === label ? '' : label);
    setSearch('');
  };

  /* Combined client-side filter */
  const activeSearch = search || catSearch;
  const filtered = restaurants.filter(r =>
    activeSearch
      ? r.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        (r.cuisineType || '').toLowerCase().includes(activeSearch.toLowerCase())
      : true
  );

  /* ── Skeleton while first load ── */
  if (loading && restaurants.length === 0) {
    return (
      <div style={{ background: '#f8f8f8', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', borderRadius: 20, padding: '48px 32px', marginBottom: 24 }}>
            <SkelPulse style={{ width: '55%', height: 28, marginBottom: 14 }} />
            <SkelPulse style={{ width: '38%', height: 16, marginBottom: 24 }} />
            <SkelPulse style={{ width: '75%', height: 52, borderRadius: 16 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <SkelPulse style={{ height: 160, borderRadius: 0 }} />
                <div style={{ padding: 16 }}>
                  <SkelPulse style={{ width: '70%', height: 16, marginBottom: 10 }} />
                  <SkelPulse style={{ width: '50%', height: 12 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh' }}>
      <Navbar />

      {/* Location Modal */}
      {showLocModal && <LocationModal onClose={() => setShowLocModal(false)} />}

      {/* ══ HERO ══ */}
      <div style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroContent}>

          <div style={s.heroLeft}>

            {/* Location badge */}
            <button id="hero-location-btn" onClick={() => setShowLocModal(true)} style={s.locPill}>
              <span style={s.locDot} />
              <span style={s.locText}>
                {location
                  ? `${location.area}${location.city && location.city !== location.area ? `, ${location.city}` : ''}`
                  : 'Set your location'}
              </span>
              <span style={{ color: '#fff5', fontSize: 11, marginLeft: 4 }}>Change ›</span>
            </button>

            <h1 style={s.heroTitle}>
              Order food &<br />
              <span style={s.heroGrad}>get delivered </span>
              in 30 min
            </h1>
            <p style={s.heroSub}>
              {restaurants.length > 0
                ? `${restaurants.length} restaurants ${location ? `within ${location.radius || 40} km of you` : 'ready to deliver'}`
                : 'Best restaurants, fast delivery, all near you'}
            </p>

            {/* Search bar */}
            <div style={s.searchWrap}>
              <IconSearch size={20} color="#bbb" />
              <input
                id="home-search-input"
                style={s.searchInput}
                placeholder="Search for restaurant, cuisine or a dish..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCatSearch(''); }}
              />
              {search && (
                <button id="home-search-clear" onClick={() => setSearch('')} style={s.searchClearBtn}>
                  <IconClose size={13} color="#999" />
                </button>
              )}
            </div>
          </div>

          {/* Hero illustration — pure SVG */}
          <div style={s.heroRight}>
            <div style={s.heroIllu}>
              <div style={s.illuBowl}><IconBowl size={86} /></div>
              <div style={s.illuBike}><IconScooter size={55} /></div>
              <div style={s.illuStar1}><IconStar size={22} /></div>
              <div style={s.illuStar2}><IconStar size={16} color="#818cf8" /></div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CATEGORY CAROUSEL ══ */}
      <div style={s.catSection}>
        <h3 style={s.catHeading}>What's on your mind?</h3>
        <div style={s.catScroll}>
          {CATEGORIES.map(c => (
            <button key={c.label} onClick={() => handleCatClick(c.label)}
              style={{ ...s.catCard, ...(catSearch === c.label ? s.catCardActive : {}) }}>
              <div style={s.catEmoji}>{c.icon}</div>
              <span style={s.catLabel}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══ OFFERS BANNER ══ */}
      <div style={s.offerRow}>
        <div style={{ ...s.offerCard, background: 'linear-gradient(135deg,#ff6b35,#f97316)' }}>
          <div>
            <p style={s.offerBig}>60% OFF</p>
            <p style={s.offerSmall}>Up to ₹120 · Use <strong>SWAD60</strong></p>
          </div>
          <IconBolt size={38} color="rgba(255,255,255,0.3)" />
        </div>
        <div style={{ ...s.offerCard, background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}>
          <div>
            <p style={s.offerBig}>FREE DELIVERY</p>
            <p style={s.offerSmall}>Orders above ₹299 · <strong>FREEDEL</strong></p>
          </div>
          <IconDelivery size={38} color="rgba(255,255,255,0.3)" />
        </div>
        <div style={{ ...s.offerCard, background: 'linear-gradient(135deg,#059669,#34d399)' }}>
          <div>
            <p style={s.offerBig}>₹100 OFF</p>
            <p style={s.offerSmall}>New users only · <strong>NEW100</strong></p>
          </div>
          <IconGift size={38} color="rgba(255,255,255,0.3)" />
        </div>
      </div>

      {/* ══ FILTER PILLS ══ */}
      <div style={s.filterBar}>
        <div style={s.filterInner}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => handleFilter(f.key)}
              style={{ ...s.filterPill, ...(vegFilter === f.key ? s.filterActive : {}) }}>
              {f.label}
            </button>
          ))}
          {catSearch && (
            <button onClick={() => setCatSearch('')}
              style={{ ...s.filterPill, background: '#6366f1', color: '#fff', borderColor: '#6366f1' }}>
              <IconClose size={10} color="#fff" /> {catSearch}
            </button>
          )}
        </div>
      </div>

      {/* ══ RESTAURANT LIST ══ */}
      <div style={s.main}>

        {/* Location info bar */}
        <div style={s.locationInfoBar}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <IconPin color={location ? '#f97316' : '#aaa'} size={15} />
            <span style={s.locationInfoText}>
              {location
                ? `Showing restaurants within ${location.radius || 40} km of ${location.area}`
                : 'Showing all restaurants — Set location to find nearby restaurants'}
            </span>
          </div>
          {!location && (
            <button id="home-set-location-btn" onClick={() => setShowLocModal(true)} style={s.setLocBtn}>
              <IconGPS color="#fff" size={14} />
              <span style={{ marginLeft: 5 }}>Set Location</span>
            </button>
          )}
          {location && (
            <button id="home-change-location-btn" onClick={() => setShowLocModal(true)} style={s.changeLocBtn}>
              Change
            </button>
          )}
        </div>

        {loading ? (
          <div style={s.loadWrap}>
            <div style={s.spinner} />
            <p style={s.loadText}>
              {location ? `Finding restaurants near ${location.area}...` : 'Loading restaurants...'}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyWrap}>
            <IconSearch size={56} color="#ddd" />
            <h3 style={s.emptyTitle}>
              {activeSearch ? `No results for "${activeSearch}"` : 'No restaurants found'}
            </h3>
            <p style={s.emptyText}>
              {activeSearch
                ? 'Try a different search term'
                : location
                  ? `No restaurants within ${location.radius || 40} km of ${location.area}. Try changing your location.`
                  : 'No restaurants available yet.'}
            </p>
            {activeSearch
              ? <button onClick={() => { setSearch(''); setCatSearch(''); }} style={s.clearBtn}>Clear Search</button>
              : location && <button onClick={() => setShowLocModal(true)} style={s.clearBtn}>Change Location</button>
            }
          </div>
        ) : (
          <>
            <div style={s.resultHeader}>
              <h2 style={s.resultTitle}>
                {catSearch ? `${catSearch} restaurants` : location ? 'Restaurants near you' : 'All Restaurants'}
              </h2>
              <span style={s.resultBadge}>{filtered.length} options</span>
            </div>
            <div style={s.grid}>
              {filtered.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          </>
        )}
      </div>

      {/* ══ FOOTER FEATURES ══ */}
      {!loading && restaurants.length > 0 && (
        <div style={s.features}>
          <div style={s.featGrid}>
            {[
              { Icon: <IconBolt size={34} color="#f97316" />, t: '30 Min Delivery',       d: 'Super-fast delivery, always on time' },
              { Icon: <IconShield size={34} color="#6366f1" />, t: 'Secure Payments',     d: 'UPI, Cards, COD — always encrypted' },
              { Icon: <IconMapCoverage size={34} color="#059669" />, t: '40 km Coverage', d: 'All restaurants near your location' },
              { Icon: <IconGift size={34} color="#f97316" />, t: 'Daily Offers',          d: 'New coupons and deals every day' },
            ].map(f => (
              <div key={f.t} style={s.featCard}>
                <span style={s.featIcon}>{f.Icon}</span>
                <h4 style={s.featTitle}>{f.t}</h4>
                <p style={s.featDesc}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes gradientMove {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(4deg); }
        }
        @keyframes float2 {
          0%,100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-8px) rotate(-6deg) scale(1.07); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════ */
const s = {
  /* Hero */
  hero:          { position:'relative', overflow:'hidden', minHeight:340 },
  heroBg:        { position:'absolute', inset:0, background:'linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)' },
  heroContent:   { position:'relative', zIndex:2, display:'flex', alignItems:'center', maxWidth:1200, margin:'0 auto', padding:'48px 32px 56px', gap:40 },
  heroLeft:      { flex:1, minWidth:0 },
  locPill:       { display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:30, padding:'6px 16px 6px 10px', cursor:'pointer', marginBottom:20, backdropFilter:'blur(8px)' },
  locDot:        { width:8, height:8, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 8px #4ade80', flexShrink:0 },
  locText:       { fontSize:13, fontWeight:600, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:200 },
  heroTitle:     { fontSize:40, fontWeight:800, color:'#fff', lineHeight:1.15, marginBottom:16, fontFamily:'Poppins,Inter,sans-serif' },
  heroGrad:      { background:'linear-gradient(90deg,#f97316,#fbbf24,#f97316)', backgroundSize:'200% auto', animation:'gradientMove 3s linear infinite', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  heroSub:       { fontSize:15, color:'rgba(255,255,255,0.6)', marginBottom:28 },
  searchWrap:    { display:'flex', alignItems:'center', gap:10, background:'#fff', borderRadius:16, padding:'4px 6px 4px 18px', boxShadow:'0 12px 40px rgba(0,0,0,0.4)', maxWidth:520 },
  searchInput:   { flex:1, border:'none', outline:'none', padding:'14px 0', fontSize:15, background:'transparent', color:'#111', fontFamily:'inherit' },
  searchClearBtn:{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:28, height:28, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', marginRight:4, flexShrink:0 },
  heroRight:     { width:280, flexShrink:0 },
  heroIllu:      { position:'relative', width:240, height:200, margin:'0 auto' },
  illuBowl:      { position:'absolute', top:10, left:30, animation:'float 3s ease-in-out infinite', filter:'drop-shadow(0 20px 30px rgba(0,0,0,0.4))' },
  illuBike:      { position:'absolute', bottom:5, right:10, animation:'float2 2.5s ease-in-out infinite' },
  illuStar1:     { position:'absolute', top:8, right:28, animation:'float 2s ease-in-out infinite', opacity:0.7 },
  illuStar2:     { position:'absolute', top:60, right:0, animation:'float2 2.2s ease-in-out infinite', opacity:0.5 },

  /* Categories */
  catSection:    { background:'#fff', padding:'28px 24px 20px', borderBottom:'1px solid #f0f0f0' },
  catHeading:    { fontSize:18, fontWeight:800, color:'#111', marginBottom:18, fontFamily:'Poppins,sans-serif' },
  catScroll:     { display:'flex', gap:14, overflowX:'auto', paddingBottom:6 },
  catCard:       { display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'14px 18px', borderRadius:16, border:'1.5px solid #eee', background:'#fafafa', cursor:'pointer', flexShrink:0, transition:'all 0.2s', minWidth:84 },
  catCardActive: { background:'#fff7ed', borderColor:'#f97316', boxShadow:'0 4px 16px rgba(249,115,22,0.2)' },
  catEmoji:      { fontSize:36 },
  catLabel:      { fontSize:12, fontWeight:600, color:'#333' },

  /* Offers */
  offerRow:      { display:'flex', gap:16, padding:'20px 24px', overflowX:'auto', background:'#fff', borderBottom:'1px solid #f0f0f0' },
  offerCard:     { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderRadius:16, minWidth:260, flexShrink:0, color:'#fff', boxShadow:'0 4px 20px rgba(0,0,0,0.15)' },
  offerBig:      { fontSize:20, fontWeight:800, letterSpacing:0.3, marginBottom:4 },
  offerSmall:    { fontSize:12, opacity:0.85 },

  /* Filters */
  filterBar:     { background:'#fff', borderBottom:'1px solid #f0f0f0', position:'sticky', top:64, zIndex:90 },
  filterInner:   { display:'flex', gap:10, padding:'12px 24px', maxWidth:1200, margin:'0 auto', overflowX:'auto' },
  filterPill:    { display:'flex', alignItems:'center', gap:5, padding:'9px 22px', borderRadius:25, border:'1.5px solid #e0e0e0', background:'#fff', cursor:'pointer', fontWeight:600, fontSize:13, whiteSpace:'nowrap', color:'#444', fontFamily:'inherit', transition:'all 0.15s' },
  filterActive:  { background:'#f97316', color:'#fff', borderColor:'#f97316', boxShadow:'0 3px 12px rgba(249,115,22,0.3)' },

  /* Content */
  main:          { maxWidth:1200, margin:'0 auto', padding:'20px 24px 60px' },
  locationInfoBar:{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', borderRadius:12, padding:'10px 16px', marginBottom:20, border:'1px solid #f0f0f0' },
  locationInfoText:{ fontSize:13, color:'#666', fontWeight:500 },
  setLocBtn:     { display:'flex', alignItems:'center', background:'#f97316', color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit', flexShrink:0 },
  changeLocBtn:  { background:'#fff7ed', color:'#f97316', border:'1.5px solid #fed7aa', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit', flexShrink:0 },

  resultHeader:  { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 },
  resultTitle:   { fontSize:20, fontWeight:800, color:'#111', fontFamily:'Poppins,sans-serif' },
  resultBadge:   { background:'#fff7ed', color:'#f97316', padding:'5px 14px', borderRadius:20, fontSize:13, fontWeight:700 },
  grid:          { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 },

  loadWrap:      { textAlign:'center', padding:'80px 20px' },
  spinner:       { width:48, height:48, border:'4px solid #f0f0f0', borderTop:'4px solid #f97316', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto' },
  loadText:      { color:'#888', marginTop:20, fontSize:15 },

  emptyWrap:     { textAlign:'center', padding:'80px 20px', display:'flex', flexDirection:'column', alignItems:'center' },
  emptyTitle:    { fontSize:20, fontWeight:700, color:'#333', margin:'16px 0 10px' },
  emptyText:     { fontSize:14, color:'#888', maxWidth:380, lineHeight:1.7 },
  clearBtn:      { background:'#f97316', color:'#fff', border:'none', borderRadius:10, padding:'11px 28px', cursor:'pointer', fontWeight:700, marginTop:20, fontSize:14, fontFamily:'inherit' },

  /* Features footer */
  features:      { background:'linear-gradient(135deg,#1a1a2e,#16213e)', padding:'56px 24px' },
  featGrid:      { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20, maxWidth:1100, margin:'0 auto' },
  featCard:      { background:'rgba(255,255,255,0.05)', borderRadius:16, padding:'28px 24px', border:'1px solid rgba(255,255,255,0.08)', backdropFilter:'blur(10px)' },
  featIcon:      { display:'block', marginBottom:14 },
  featTitle:     { fontSize:15, fontWeight:700, color:'#fff', marginBottom:6 },
  featDesc:      { fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.6 },
};
