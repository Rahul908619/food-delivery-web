import { useState, useEffect, useRef } from 'react';
import { useLocation2 } from '../context/LocationContext';
import toast from 'react-hot-toast';

/* ─── Custom SVG icons — hand-coded, no copy-paste emojis ─── */
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="22" y2="22" />
  </svg>
);

const IconPin = ({ color = '#fc5c04', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" fill={color} stroke="none" />
  </svg>
);

const IconClock = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15.5 14.5" />
  </svg>
);

const IconGPS = ({ color = '#fc5c04', size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3.5" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
  </svg>
);

const IconClose = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconChevron = ({ size = 16, color = '#fc5c04' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/* ─── Mini spinner (pure CSS anim) ─── */
const Spinner = ({ color = '#fc5c04', size = 16 }) => (
  <div style={{
    width: size, height: size,
    border: `2px solid #eee`,
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0,
  }} />
);

/* ─── Popular cities data ─── */
const CITIES = [
  { name: 'Delhi',      lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai',     lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore',  lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad',  lat: 17.3850, lng: 78.4867 },
  { name: 'Chennai',    lat: 13.0827, lng: 80.2707 },
  { name: 'Pune',       lat: 18.5204, lng: 73.8567 },
  { name: 'Kolkata',    lat: 22.5726, lng: 88.3639 },
  { name: 'Jaipur',     lat: 26.9124, lng: 75.7873 },
  { name: 'Ludhiana',   lat: 30.9010, lng: 75.8573 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
];

export default function LocationModal({ onClose }) {
  const { detectGPS, searchLocation, saveLocation, detecting } = useLocation2();
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [recent,   setRecent]   = useState(
    JSON.parse(localStorage.getItem('qbx_recent') || '[]')
  );
  const [searching, setSearching] = useState(false);
  const inputRef = useRef();
  const timerRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  /* Debounced search */
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (query.trim().length < 3) { setResults([]); return; }
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      const data = await searchLocation(query);
      setResults(data);
      setSearching(false);
    }, 500);
    return () => clearTimeout(timerRef.current);
  }, [query]); // eslint-disable-line

  const addToRecent = (loc) => {
    const prev = JSON.parse(localStorage.getItem('qbx_recent') || '[]');
    const updated = [loc, ...prev.filter(r => r.displayLine !== loc.displayLine)].slice(0, 3);
    localStorage.setItem('qbx_recent', JSON.stringify(updated));
    setRecent(updated);
  };

  const handleGPS = async () => {
    try {
      toast.loading('Getting your location...', { id: 'gps' });
      const loc = await detectGPS();
      toast.success(`Location set: ${loc.area}`, { id: 'gps' });
      addToRecent(loc);
      onClose();
    } catch (err) {
      toast.error(
        err.code === 1
          ? 'Location permission denied. Please allow in browser settings.'
          : 'Could not get location. Try searching.',
        { id: 'gps' }
      );
    }
  };

  const handleSelect = (loc) => {
    saveLocation(loc);
    addToRecent(loc);
    toast.success(`Location set: ${loc.area}`);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={s.backdrop} />

      {/* Side Panel */}
      <div style={s.panel}>

        {/* Header */}
        <div style={s.header}>
          <h2 style={s.title}>Set delivery location</h2>
          <button onClick={onClose} style={s.closeBtn} aria-label="Close">
            <IconClose size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div style={s.searchWrap}>
          <IconSearch />
          <input
            ref={inputRef}
            style={s.searchInput}
            placeholder="Search for area, street name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {searching && <Spinner />}
          {query && !searching && (
            <button onClick={() => { setQuery(''); setResults([]); }} style={s.clearBtn} aria-label="Clear">
              <IconClose size={14} />
            </button>
          )}
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div style={s.section}>
            {results.map((r, i) => (
              <button key={i} onClick={() => handleSelect(r)} style={s.rowBtn}>
                <div style={s.rowIconWrap}><IconPin color="#fc5c04" size={18} /></div>
                <div style={s.rowText}>
                  <p style={s.rowMain}>{r.area}</p>
                  <p style={s.rowSub}>{[r.city, r.state].filter(Boolean).join(', ')}</p>
                </div>
                <div style={{ marginLeft: 'auto', opacity: 0.4 }}><IconChevron size={14} /></div>
              </button>
            ))}
          </div>
        )}

        {/* GPS + Recent + Cities — shown when not searching */}
        {!query && (
          <>
            {/* GPS Button */}
            <button onClick={handleGPS} disabled={detecting} style={s.gpsBtn}>
              <div style={s.gpsDot}>
                {detecting
                  ? <Spinner color="#fc5c04" size={18} />
                  : <IconGPS color="#fc5c04" size={20} />
                }
              </div>
              <div style={s.rowText}>
                <p style={s.gpsMain}>
                  {detecting ? 'Detecting location...' : 'Get current location'}
                </p>
                <p style={s.gpsSub}>Using GPS</p>
              </div>
              {!detecting && <IconChevron size={16} color="#fc5c04" />}
            </button>

            {/* Recent Searches */}
            {recent.length > 0 && (
              <div style={s.section}>
                <p style={s.sectionLabel}>RECENT SEARCHES</p>
                {recent.map((r, i) => (
                  <button key={i} onClick={() => handleSelect(r)} style={s.rowBtn}>
                    <div style={s.rowIconWrap}><IconClock size={18} /></div>
                    <div style={s.rowText}>
                      <p style={s.rowMain}>{r.area}</p>
                      <p style={s.rowSub}>{r.displayLine}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', opacity: 0.4 }}><IconChevron size={14} /></div>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Cities */}
            <div style={s.section}>
              <p style={s.sectionLabel}>POPULAR CITIES</p>
              <div style={s.cityGrid}>
                {CITIES.map(city => (
                  <button key={city.name}
                    onClick={() => handleSelect({
                      lat: city.lat, lng: city.lng,
                      area: city.name, city: city.name,
                      state: '', displayLine: city.name,
                      radius: 40,
                    })}
                    style={s.cityChip}
                  >
                    <IconPin color="#fc5c04" size={13} />
                    <span style={{ marginLeft: 5 }}>{city.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

const s = {
  backdrop:    { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:999, backdropFilter:'blur(2px)' },
  panel:       { position:'fixed', top:0, left:0, bottom:0, width:400, maxWidth:'100vw', background:'#fff', zIndex:1000, overflowY:'auto', boxShadow:'6px 0 40px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column' },
  header:      { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'22px 20px 14px', borderBottom:'1px solid #f3f3f3', flexShrink:0 },
  title:       { fontSize:18, fontWeight:800, color:'#111', fontFamily:'Poppins,sans-serif' },
  closeBtn:    { background:'#f5f5f5', border:'none', borderRadius:'50%', width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' },

  searchWrap:  { display:'flex', alignItems:'center', gap:10, margin:'14px 16px 6px', border:'1.5px solid #e8e8e8', borderRadius:10, padding:'0 12px', background:'#fafafa', flexShrink:0 },
  searchInput: { flex:1, border:'none', outline:'none', padding:'13px 0', fontSize:14, background:'transparent', color:'#111', fontFamily:'inherit' },
  clearBtn:    { background:'none', border:'none', color:'#aaa', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:'2px' },

  gpsBtn:      { display:'flex', alignItems:'center', gap:14, width:'100%', padding:'16px 20px', border:'none', borderTop:'1px solid #f5f5f5', borderBottom:'1px solid #f5f5f5', background:'#fff', cursor:'pointer', textAlign:'left', flexShrink:0 },
  gpsDot:      { width:42, height:42, borderRadius:'50%', background:'#fff5f0', border:'1.5px solid #ffd5c2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  gpsMain:     { fontWeight:700, fontSize:14, color:'#fc5c04', marginBottom:2, fontFamily:'inherit' },
  gpsSub:      { fontSize:12, color:'#aaa' },

  section:     { padding:'16px 20px 0', flexShrink:0 },
  sectionLabel:{ fontSize:10, fontWeight:700, color:'#bbb', letterSpacing:1.3, marginBottom:8, fontFamily:'inherit' },

  rowBtn:      { display:'flex', alignItems:'center', gap:12, width:'100%', padding:'12px 0', border:'none', borderBottom:'1px solid #f8f8f8', background:'none', cursor:'pointer', textAlign:'left' },
  rowIconWrap: { width:36, height:36, background:'#fafafa', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'1px solid #f0f0f0' },
  rowText:     { flex:1, minWidth:0 },
  rowMain:     { fontWeight:600, fontSize:14, color:'#111', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  rowSub:      { fontSize:12, color:'#aaa', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },

  cityGrid:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, paddingBottom:28, marginTop:4 },
  cityChip:    { display:'flex', alignItems:'center', padding:'10px 12px', border:'1.5px solid #eee', borderRadius:10, background:'#fafafa', cursor:'pointer', fontSize:13, fontWeight:500, color:'#333', textAlign:'left', fontFamily:'inherit', transition:'border-color 0.15s' },
};
