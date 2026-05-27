import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar  from '../components/Navbar';
import API     from '../api/axios';
import toast   from 'react-hot-toast';
import popup   from '../components/CustomToast';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('ALL');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await API.get('/admin/restaurants/pending');
      setRestaurants(res.data.data || []);
    } catch { popup.error('Load Failed', 'Could not load restaurants.'); }
    finally  { setLoading(false); }
  };

  const approve = async (id) => {
    try {
      await API.put(`/admin/restaurant/${id}/approve`);
      popup.success('Approved! ✅', 'Restaurant is now live on the platform.');
      load();
    } catch { popup.error('Approval Failed', 'Could not approve restaurant.'); }
  };

  const VEG = {
    PURE_VEG: { label:'Pure Veg',      color:'#22c55e', bg:'rgba(34,197,94,0.12)',   border:'rgba(34,197,94,0.25)'  },
    NON_VEG:  { label:'Non-Veg',       color:'#ef4444', bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.25)'  },
    BOTH:     { label:'Veg & Non-Veg', color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.25)' },
  };

  const filtered = restaurants.filter(r => {
    const ms = r.name.toLowerCase().includes(search.toLowerCase()) ||
               (r.city||'').toLowerCase().includes(search.toLowerCase());
    const mf = filter==='ALL' ? true : filter==='PENDING' ? !r.approved : r.approved;
    return ms && mf;
  });

  const counts = {
    ALL: restaurants.length,
    PENDING:  restaurants.filter(r=>!r.approved).length,
    APPROVED: restaurants.filter(r=> r.approved).length,
  };

  return (
    <div style={lay.page}>
      <Sidebar />
      <div style={lay.main}>
        <Navbar title="Restaurants" subtitle={`${restaurants.length} total restaurants on the platform`} />
        <div style={lay.content}>

          {/* Stats bar */}
          <div style={lay.statsBar}>
            {[
              { key:'ALL',      label:'Total',    icon:'🍽️', color:'#6366f1' },
              { key:'PENDING',  label:'Pending',  icon:'⏳', color:'#f59e0b' },
              { key:'APPROVED', label:'Live',     icon:'✅', color:'#22c55e' },
            ].map(s => (
              <button key={s.key} onClick={()=>setFilter(s.key)}
                style={{ ...lay.statBtn, borderColor: filter===s.key ? s.color : 'rgba(255,255,255,0.06)', background: filter===s.key ? `${s.color}15` : 'rgba(255,255,255,0.02)' }}>
                <span style={{fontSize:20}}>{s.icon}</span>
                <div style={lay.statBtnInfo}>
                  <span style={{...lay.statBtnCount, color: filter===s.key ? s.color : '#f1f5f9'}}>{counts[s.key]}</span>
                  <span style={lay.statBtnLabel}>{s.label}</span>
                </div>
              </button>
            ))}
            <div style={lay.searchWrap}>
              <span style={lay.searchIcon}>🔍</span>
              <input
                placeholder="Search by name or city..."
                value={search} onChange={e=>setSearch(e.target.value)}
                style={lay.search}
              />
            </div>
          </div>

          {loading ? <Loader /> : (
            <div style={lay.grid}>
              {filtered.length===0 ? (
                <div style={lay.emptyFull}>
                  <span style={{fontSize:56}}>🍽️</span>
                  <p style={lay.emptyTitle}>No restaurants found</p>
                  <p style={lay.emptyText}>Try adjusting your search or filter</p>
                </div>
              ) : filtered.map(r => {
                const vc = VEG[r.vegType] || VEG.BOTH;
                return (
                  <div key={r.id} style={lay.card}>
                    {/* Image */}
                    <div style={lay.imgWrap}>
                      {r.imageUrl
                        ? <img src={r.imageUrl} alt={r.name} style={lay.img}/>
                        : <div style={lay.imgPH}><span style={{fontSize:44}}>🍽️</span></div>
                      }
                      <div style={lay.imgOverlay}>
                        <span style={{...lay.vegChip, background:vc.bg, color:vc.color, border:`1px solid ${vc.border}`}}>{vc.label}</span>
                        <span style={{...lay.statusChip, background:r.approved?'rgba(34,197,94,0.15)':'rgba(245,158,11,0.15)', color:r.approved?'#22c55e':'#f59e0b', border:`1px solid ${r.approved?'rgba(34,197,94,0.3)':'rgba(245,158,11,0.3)'}`}}>
                          {r.approved ? '● Live' : '● Pending'}
                        </span>
                      </div>
                    </div>

                    <div style={lay.cardBody}>
                      <h3 style={lay.restName}>{r.name}</h3>
                      <div style={lay.metaList}>
                        <p style={lay.meta}><span style={lay.metaIcon}>🍴</span>{r.cuisineType||'Multi Cuisine'}</p>
                        <p style={lay.meta}><span style={lay.metaIcon}>📍</span>{r.addressLine}{r.city?`, ${r.city}`:''}</p>
                        <p style={lay.meta}><span style={lay.metaIcon}>📞</span>{r.phone||'Not provided'}</p>
                        <p style={lay.meta}><span style={lay.metaIcon}>🏢</span>GST: {r.gstNumber||'Not provided'}</p>
                      </div>

                      <div style={lay.statsRow}>
                        <div style={lay.statBox}>
                          <span style={lay.statVal}>⭐ {r.rating?.toFixed(1)||'0.0'}</span>
                          <span style={lay.statLabel}>Rating</span>
                        </div>
                        <div style={lay.statBox}>
                          <span style={lay.statVal}>{r.totalReviews||0}</span>
                          <span style={lay.statLabel}>Reviews</span>
                        </div>
                        <div style={lay.statBox}>
                          <span style={{...lay.statVal,color:r.open?'#22c55e':'#ef4444'}}>{r.open?'Open':'Closed'}</span>
                          <span style={lay.statLabel}>Status</span>
                        </div>
                      </div>

                      {!r.approved && (
                        <button onClick={()=>approve(r.id)} style={lay.approveBtn}>
                          ✅ Approve Restaurant
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div style={{display:'flex',justifyContent:'center',padding:80,flexDirection:'column',alignItems:'center',gap:14}}>
      <div style={{width:44,height:44,border:'3px solid rgba(249,115,22,0.2)',borderTop:'3px solid #f97316',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <p style={{color:'#475569',fontSize:13}}>Loading restaurants...</p>
    </div>
  );
}

const lay = {
  page: {display:'flex',minHeight:'100vh',background:'#060818'},
  main: {flex:1,overflow:'auto'},
  content: {padding:28,display:'flex',flexDirection:'column',gap:20},
  statsBar: {display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'},
  statBtn: {display:'flex',alignItems:'center',gap:12,padding:'14px 20px',borderRadius:14,border:'1px solid',cursor:'pointer',transition:'all 0.2s',flexShrink:0},
  statBtnInfo: {display:'flex',flexDirection:'column',alignItems:'flex-start',gap:2},
  statBtnCount: {fontSize:22,fontWeight:900,lineHeight:1},
  statBtnLabel: {fontSize:11,color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:0.5},
  searchWrap: {flex:1,minWidth:200,position:'relative',display:'flex',alignItems:'center'},
  searchIcon: {position:'absolute',left:14,fontSize:14,pointerEvents:'none'},
  search: {width:'100%',padding:'13px 14px 13px 40px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,fontSize:14,color:'#f1f5f9',outline:'none',fontFamily:'Inter,sans-serif'},
  grid: {display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:18},
  card: {background:'#0d1117',borderRadius:18,overflow:'hidden',border:'1px solid rgba(255,255,255,0.05)',transition:'transform 0.2s,box-shadow 0.2s'},
  imgWrap: {position:'relative',height:160},
  img: {width:'100%',height:'100%',objectFit:'cover'},
  imgPH: {height:'100%',background:'rgba(255,255,255,0.03)',display:'flex',alignItems:'center',justifyContent:'center'},
  imgOverlay: {position:'absolute',top:10,left:10,right:10,display:'flex',justifyContent:'space-between'},
  vegChip: {fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20,backdropFilter:'blur(8px)'},
  statusChip: {fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20,backdropFilter:'blur(8px)'},
  cardBody: {padding:18,display:'flex',flexDirection:'column',gap:12},
  restName: {fontSize:16,fontWeight:800,color:'#f1f5f9'},
  metaList: {display:'flex',flexDirection:'column',gap:4},
  meta: {fontSize:12,color:'#64748b',display:'flex',alignItems:'center',gap:6},
  metaIcon: {fontSize:12,flexShrink:0},
  statsRow: {display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8},
  statBox: {background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:10,padding:'10px 8px',textAlign:'center'},
  statVal: {display:'block',fontSize:13,fontWeight:800,color:'#f1f5f9',marginBottom:3},
  statLabel: {fontSize:10,color:'#475569',fontWeight:600},
  approveBtn: {width:'100%',padding:11,background:'rgba(34,197,94,0.12)',color:'#22c55e',border:'1px solid rgba(34,197,94,0.25)',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:13,fontFamily:'Inter,sans-serif'},
  emptyFull: {gridColumn:'1/-1',textAlign:'center',padding:80,display:'flex',flexDirection:'column',alignItems:'center',gap:10},
  emptyTitle: {color:'#f1f5f9',fontWeight:700,fontSize:18},
  emptyText: {color:'#475569',fontSize:14},
};
