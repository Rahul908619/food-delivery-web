import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar  from '../components/Navbar';
import API     from '../api/axios';
import toast   from 'react-hot-toast';
import popup   from '../components/CustomToast';

export default function DeliveryPartners() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(()=>{ load(); },[]);

  const load = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers((res.data.data||[]).filter(u=>u.role==='DELIVERY_PARTNER'));
    } catch { popup.error('Load Failed', 'Could not load delivery partners.'); }
    finally  { setLoading(false); }
  };

  const toggleBlock = async (userId, isActive) => {
    try {
      await API.put(`/admin/user/${userId}/block`);
      popup.success(isActive ? 'Partner Blocked' : 'Partner Unblocked', isActive ? 'Delivery partner has been blocked.' : 'Delivery partner access restored.');
      load();
    } catch { popup.error('Action Failed', 'Could not update partner status.'); }
  };

  const visible = users.filter(u=>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.email||'').includes(search) ||
    (u.phone||'').includes(search)
  );

  const activeCount  = users.filter(u=> u.active).length;
  const blockedCount = users.filter(u=>!u.active).length;

  return (
    <div style={lay.page}>
      <Sidebar />
      <div style={lay.main}>
        <Navbar title="Delivery Partners" subtitle={`${users.length} registered delivery partners`} />
        <div style={lay.content}>

          {/* Stats */}
          <div style={lay.statsGrid}>
            {[
              { label:'Total Partners', value:users.length,  color:'#6366f1', bg:'rgba(99,102,241,0.1)',  border:'rgba(99,102,241,0.2)',  icon:'🛵' },
              { label:'Active',         value:activeCount,   color:'#22c55e', bg:'rgba(34,197,94,0.1)',   border:'rgba(34,197,94,0.2)',   icon:'✅' },
              { label:'Blocked',        value:blockedCount,  color:'#ef4444', bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.2)',   icon:'🚫' },
            ].map((s,i)=>(
              <div key={i} style={{...lay.statCard,background:s.bg,border:`1px solid ${s.border}`}}>
                <div style={{...lay.statIconWrap,background:`${s.color}20`}}>
                  <span style={{fontSize:22}}>{s.icon}</span>
                </div>
                <div>
                  <p style={{...lay.statVal,color:s.color}}>{s.value}</p>
                  <p style={lay.statLabel}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={lay.searchWrap}>
            <span style={lay.searchIcon}>🔍</span>
            <input placeholder="Search partners by name, email or phone..." value={search} onChange={e=>setSearch(e.target.value)} style={lay.search}/>
          </div>

          {loading ? <Loader/> : (
            <div style={lay.grid}>
              {visible.length===0 ? (
                <div style={lay.emptyFull}>
                  <span style={{fontSize:56}}>🛵</span>
                  <p style={lay.emptyTitle}>No partners found</p>
                  <p style={lay.emptyText}>Try adjusting your search</p>
                </div>
              ) : visible.map(u=>(
                <div key={u.id} style={lay.card}>
                  {/* Header */}
                  <div style={lay.cardTop}>
                    <div style={lay.avatar}>
                      {u.profileImage
                        ? <img src={u.profileImage} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}}/>
                        : <span style={lay.avatarLetter}>{u.name?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <div style={{flex:1}}>
                      <p style={lay.partnerName}>{u.name}</p>
                      <p style={lay.partnerSub}>{u.email||u.phone||'—'}</p>
                    </div>
                    <span style={{...lay.statusBadge, background:u.active?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)', color:u.active?'#22c55e':'#ef4444', border:`1px solid ${u.active?'rgba(34,197,94,0.25)':'rgba(239,68,68,0.25)'}`}}>
                      {u.active?'● Active':'● Blocked'}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div style={lay.detailGrid}>
                    {[
                      {label:'Partner ID', value:`#${u.id}`},
                      {label:'Phone',      value:u.phone||'N/A'},
                      {label:'Email',      value:u.email||'N/A'},
                      {label:'Joined',     value:new Date(u.createdAt).toLocaleDateString('en-IN')},
                    ].map((d,i)=>(
                      <div key={i} style={lay.detailBox}>
                        <span style={lay.detailLabel}>{d.label}</span>
                        <span style={lay.detailVal}>{d.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action */}
                  <button onClick={()=>toggleBlock(u.id,u.active)} style={{
                    ...lay.actionBtn,
                    background:u.active?'rgba(239,68,68,0.1)':'rgba(34,197,94,0.1)',
                    color:u.active?'#ef4444':'#22c55e',
                    border:`1px solid ${u.active?'rgba(239,68,68,0.25)':'rgba(34,197,94,0.25)'}`,
                  }}>
                    {u.active?'🚫 Block Partner':'✅ Unblock Partner'}
                  </button>
                </div>
              ))}
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
      <p style={{color:'#475569',fontSize:13}}>Loading partners...</p>
    </div>
  );
}

const lay = {
  page:{display:'flex',minHeight:'100vh',background:'#060818'},
  main:{flex:1,overflow:'auto'},
  content:{padding:28,display:'flex',flexDirection:'column',gap:20},
  statsGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16},
  statCard:{borderRadius:16,padding:'18px 20px',display:'flex',alignItems:'center',gap:16},
  statIconWrap:{width:50,height:50,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  statVal:{fontSize:28,fontWeight:900,lineHeight:1,marginBottom:4},
  statLabel:{fontSize:12,color:'#64748b',fontWeight:600},
  searchWrap:{position:'relative',display:'flex',alignItems:'center'},
  searchIcon:{position:'absolute',left:14,fontSize:14,pointerEvents:'none'},
  search:{width:'100%',padding:'13px 14px 13px 40px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,fontSize:14,color:'#f1f5f9',outline:'none',fontFamily:'Inter,sans-serif'},
  grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16},
  card:{background:'#0d1117',borderRadius:18,padding:20,border:'1px solid rgba(255,255,255,0.05)',display:'flex',flexDirection:'column',gap:16},
  cardTop:{display:'flex',alignItems:'center',gap:12},
  avatar:{width:50,height:50,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden',border:'2px solid rgba(34,197,94,0.3)'},
  avatarLetter:{color:'#fff',fontWeight:800,fontSize:20},
  partnerName:{fontWeight:700,fontSize:15,color:'#f1f5f9',marginBottom:3},
  partnerSub:{fontSize:12,color:'#475569'},
  statusBadge:{padding:'4px 11px',borderRadius:20,fontSize:11,fontWeight:700,flexShrink:0},
  detailGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10},
  detailBox:{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:10,padding:'10px 12px'},
  detailLabel:{display:'block',fontSize:10,color:'#475569',fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4},
  detailVal:{display:'block',fontSize:13,fontWeight:600,color:'#f1f5f9'},
  actionBtn:{width:'100%',padding:11,borderRadius:11,fontWeight:700,cursor:'pointer',fontSize:13,fontFamily:'Inter,sans-serif',transition:'all 0.2s'},
  emptyFull:{textAlign:'center',padding:80,display:'flex',flexDirection:'column',alignItems:'center',gap:10,gridColumn:'1/-1'},
  emptyTitle:{color:'#f1f5f9',fontWeight:700,fontSize:18},
  emptyText:{color:'#475569',fontSize:14},
};
