import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar  from '../components/Navbar';
import API     from '../api/axios';
import toast   from 'react-hot-toast';
import popup   from '../components/CustomToast';

const ROLE_CONFIG = {
  CUSTOMER:         { color:'#6366f1', bg:'rgba(99,102,241,0.12)',  border:'rgba(99,102,241,0.25)',  label:'Customer'         },
  RESTAURANT_OWNER: { color:'#f97316', bg:'rgba(249,115,22,0.12)',  border:'rgba(249,115,22,0.25)',  label:'Restaurant Owner' },
  DELIVERY_PARTNER: { color:'#22c55e', bg:'rgba(34,197,94,0.12)',   border:'rgba(34,197,94,0.25)',   label:'Delivery Partner' },
  ADMIN:            { color:'#ef4444', bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.25)',   label:'Admin'            },
};

export default function Users() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('ALL');

  useEffect(()=>{ load(); },[]);

  const load = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.data || []);
    } catch { popup.error('Load Failed', 'Could not load users.'); }
    finally  { setLoading(false); }
  };

  const toggleBlock = async (userId, isActive) => {
    try {
      await API.put(`/admin/user/${userId}/block`);
      popup.success(isActive ? 'User Blocked' : 'User Unblocked', isActive ? 'User has been blocked from the platform.' : 'User access has been restored.');
      load();
    } catch { popup.error('Action Failed', 'Could not update user status.'); }
  };

  const ROLES = ['ALL','CUSTOMER','RESTAURANT_OWNER','DELIVERY_PARTNER'];
  const byRole  = filter==='ALL' ? users : users.filter(u=>u.role===filter);
  const visible = byRole.filter(u=>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.email||'').toLowerCase().includes(search.toLowerCase()) ||
    (u.phone||'').includes(search)
  );

  return (
    <div style={lay.page}>
      <Sidebar />
      <div style={lay.main}>
        <Navbar title="User Management" subtitle={`${users.length} total registered users`} />
        <div style={lay.content}>

          {/* Role Filter Tabs */}
          <div style={lay.topBar}>
            <div style={lay.tabs}>
              {ROLES.map(r => {
                const cnt = r==='ALL' ? users.length : users.filter(u=>u.role===r).length;
                const rc  = ROLE_CONFIG[r];
                const active = filter===r;
                return (
                  <button key={r} onClick={()=>setFilter(r)} style={{
                    ...lay.tab,
                    background: active ? (rc?.bg||'rgba(249,115,22,0.12)') : 'rgba(255,255,255,0.02)',
                    borderColor: active ? (rc?.color||'#f97316') : 'rgba(255,255,255,0.06)',
                    color: active ? (rc?.color||'#f97316') : '#64748b',
                  }}>
                    {r.replace(/_/g,' ')}
                    <span style={{...lay.tabCnt, background: active ? (rc?.color||'#f97316'): 'rgba(255,255,255,0.08)', color: active ? '#fff' : '#64748b'}}>{cnt}</span>
                  </button>
                );
              })}
            </div>
            <div style={lay.searchWrap}>
              <span style={lay.searchIcon}>🔍</span>
              <input placeholder="Search name, email or phone..." value={search} onChange={e=>setSearch(e.target.value)} style={lay.search}/>
            </div>
          </div>

          {loading ? <Loader/> : (
            <div style={lay.tableWrap}>
              <table style={lay.table}>
                <thead>
                  <tr style={lay.thead}>
                    {['User','Contact','Role','Status','Joined','Action'].map(h=>(
                      <th key={h} style={lay.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.length===0 ? (
                    <tr><td colSpan={6} style={{textAlign:'center',padding:56,color:'#475569',fontSize:14}}>
                      No users found
                    </td></tr>
                  ) : visible.map((u,i) => {
                    const rc = ROLE_CONFIG[u.role]||ROLE_CONFIG.CUSTOMER;
                    return (
                      <tr key={u.id} style={{...lay.tr, background: i%2===0 ? 'transparent' : 'rgba(255,255,255,0.012)'}}>
                        {/* User */}
                        <td style={lay.td}>
                          <div style={lay.userCell}>
                            <div style={{...lay.avatar, background:`linear-gradient(135deg,${rc.color}88,${rc.color}44)`}}>
                              {u.profileImage
                                ? <img src={u.profileImage} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}}/>
                                : <span style={{color:'#fff',fontWeight:800,fontSize:14}}>{u.name?.[0]?.toUpperCase()}</span>
                              }
                            </div>
                            <div>
                              <p style={lay.userName}>{u.name}</p>
                              <p style={lay.userId}>#{u.id}</p>
                            </div>
                          </div>
                        </td>
                        {/* Contact */}
                        <td style={lay.td}>
                          <p style={lay.contactLine}>{u.email||'—'}</p>
                          <p style={lay.contactLine}>{u.phone||'—'}</p>
                        </td>
                        {/* Role */}
                        <td style={lay.td}>
                          <span style={{...lay.rolePill,background:rc.bg,color:rc.color,border:`1px solid ${rc.border}`}}>{rc.label}</span>
                        </td>
                        {/* Status */}
                        <td style={lay.td}>
                          <span style={{...lay.statusPill, background:u.active?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)', color:u.active?'#22c55e':'#ef4444', border:`1px solid ${u.active?'rgba(34,197,94,0.25)':'rgba(239,68,68,0.25)'}`}}>
                            {u.active ? '● Active' : '● Blocked'}
                          </span>
                        </td>
                        {/* Joined */}
                        <td style={lay.td}>
                          <span style={lay.dateText}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</span>
                        </td>
                        {/* Action */}
                        <td style={lay.td}>
                          {u.role!=='ADMIN' && (
                            <button onClick={()=>toggleBlock(u.id,u.active)} style={{
                              ...lay.actionBtn,
                              background:u.active?'rgba(239,68,68,0.1)':'rgba(34,197,94,0.1)',
                              color:u.active?'#ef4444':'#22c55e',
                              border:`1px solid ${u.active?'rgba(239,68,68,0.25)':'rgba(34,197,94,0.25)'}`,
                            }}>
                              {u.active ? '🚫 Block' : '✅ Unblock'}
                            </button>
                          )}
                          {u.role==='ADMIN' && <span style={lay.adminTag}>Protected</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
      <p style={{color:'#475569',fontSize:13}}>Loading users...</p>
    </div>
  );
}

const lay = {
  page:{display:'flex',minHeight:'100vh',background:'#060818'},
  main:{flex:1,overflow:'auto'},
  content:{padding:28,display:'flex',flexDirection:'column',gap:20},
  topBar:{display:'flex',gap:14,flexWrap:'wrap',alignItems:'center'},
  tabs:{display:'flex',gap:8,flexWrap:'wrap'},
  tab:{padding:'9px 16px',borderRadius:20,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:7,transition:'all 0.2s',fontFamily:'Inter,sans-serif'},
  tabCnt:{padding:'2px 8px',borderRadius:10,fontSize:11,fontWeight:700,transition:'all 0.2s'},
  searchWrap:{flex:1,minWidth:200,position:'relative',display:'flex',alignItems:'center'},
  searchIcon:{position:'absolute',left:14,fontSize:14,pointerEvents:'none'},
  search:{width:'100%',padding:'12px 14px 12px 40px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,fontSize:14,color:'#f1f5f9',outline:'none',fontFamily:'Inter,sans-serif'},
  tableWrap:{background:'#0d1117',borderRadius:18,overflow:'hidden',border:'1px solid rgba(255,255,255,0.05)'},
  table:{width:'100%',borderCollapse:'collapse'},
  thead:{},
  th:{padding:'14px 18px',textAlign:'left',fontSize:10,fontWeight:700,color:'#475569',background:'rgba(255,255,255,0.02)',borderBottom:'1px solid rgba(255,255,255,0.05)',textTransform:'uppercase',letterSpacing:1},
  tr:{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 0.15s'},
  td:{padding:'14px 18px',verticalAlign:'middle'},
  userCell:{display:'flex',alignItems:'center',gap:11},
  avatar:{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden'},
  userName:{fontWeight:700,fontSize:14,color:'#f1f5f9',marginBottom:2},
  userId:{fontSize:11,color:'#475569'},
  contactLine:{fontSize:12,color:'#64748b',lineHeight:1.7},
  rolePill:{padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:700},
  statusPill:{padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:700},
  dateText:{fontSize:12,color:'#475569'},
  actionBtn:{padding:'7px 14px',border:'1px solid',borderRadius:9,fontSize:12,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'Inter,sans-serif',transition:'all 0.2s'},
  adminTag:{fontSize:11,color:'#475569',fontStyle:'italic'},
};
