import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar  from '../components/Navbar';
import API     from '../api/axios';
import toast   from 'react-hot-toast';
import popup   from '../components/CustomToast';

const SC = {
  PLACED:           {color:'#f59e0b',bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.25)'},
  ACCEPTED:         {color:'#6366f1',bg:'rgba(99,102,241,0.12)', border:'rgba(99,102,241,0.25)'},
  PREPARING:        {color:'#8b5cf6',bg:'rgba(139,92,246,0.12)', border:'rgba(139,92,246,0.25)'},
  READY:            {color:'#06b6d4',bg:'rgba(6,182,212,0.12)',  border:'rgba(6,182,212,0.25)' },
  OUT_FOR_DELIVERY: {color:'#f97316',bg:'rgba(249,115,22,0.12)', border:'rgba(249,115,22,0.25)'},
  DELIVERED:        {color:'#22c55e',bg:'rgba(34,197,94,0.12)',  border:'rgba(34,197,94,0.25)' },
  CANCELLED:        {color:'#ef4444',bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.25)' },
  REJECTED:         {color:'#ef4444',bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.25)' },
};

const STATUSES = ['ALL','PLACED','ACCEPTED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'];

export default function Orders() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('ALL');
  const [expanded, setExpanded] = useState(null);

  useEffect(()=>{ load(); },[]);

  const load = async () => {
    try {
      const res = await API.get('/admin/orders');
      setOrders(res.data.data||[]);
    } catch { popup.error('Load Failed', 'Could not load orders.'); }
    finally  { setLoading(false); }
  };

  const filtered = orders.filter(o=>{
    const ms = String(o.orderId).includes(search)||(o.restaurantName||'').toLowerCase().includes(search.toLowerCase());
    const mf = filter==='ALL'||o.status===filter;
    return ms&&mf;
  });

  const delivered    = orders.filter(o=>o.status==='DELIVERED');
  const totalRevenue = delivered.reduce((s,o)=>s+(o.totalAmount||0),0);
  const adminEarning = delivered.reduce((s,o)=>s+(o.adminCommission||0),0);

  return (
    <div style={lay.page}>
      <Sidebar/>
      <div style={lay.main}>
        <Navbar title="All Orders" subtitle={`${orders.length} total orders on the platform`}/>
        <div style={lay.content}>

          {/* KPI Row */}
          <div style={lay.kpiRow}>
            {[
              {label:'Total Revenue',    value:`₹${totalRevenue.toFixed(0)}`,  icon:'💰', color:'#22c55e', bg:'rgba(34,197,94,0.1)',   border:'rgba(34,197,94,0.2)'  },
              {label:'Admin Earnings',   value:`₹${adminEarning.toFixed(0)}`,  icon:'🏢', color:'#6366f1', bg:'rgba(99,102,241,0.1)',  border:'rgba(99,102,241,0.2)' },
              {label:'Delivered',        value:delivered.length,                icon:'✅', color:'#f97316', bg:'rgba(249,115,22,0.1)',  border:'rgba(249,115,22,0.2)' },
              {label:'Total Orders',     value:orders.length,                   icon:'📦', color:'#8b5cf6', bg:'rgba(139,92,246,0.1)', border:'rgba(139,92,246,0.2)' },
            ].map((k,i)=>(
              <div key={i} style={{...lay.kpi,background:k.bg,border:`1px solid ${k.border}`}}>
                <div style={{...lay.kpiIcon,background:`${k.color}20`}}><span style={{fontSize:20}}>{k.icon}</span></div>
                <div>
                  <p style={{...lay.kpiVal,color:k.color}}>{typeof k.value==='number'?k.value.toLocaleString():k.value}</p>
                  <p style={lay.kpiLabel}>{k.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={lay.searchWrap}>
            <span style={lay.searchIcon}>🔍</span>
            <input placeholder="Search by order ID or restaurant name..." value={search} onChange={e=>setSearch(e.target.value)} style={lay.search}/>
          </div>

          {/* Status Pills */}
          <div style={lay.filterRow}>
            {STATUSES.map(st=>{
              const cnt = st==='ALL' ? orders.length : orders.filter(o=>o.status===st).length;
              const cfg = SC[st]||{};
              const active = filter===st;
              return (
                <button key={st} onClick={()=>setFilter(st)} style={{
                  ...lay.filterBtn,
                  background: active ? (cfg.bg||'rgba(249,115,22,0.12)') : 'rgba(255,255,255,0.03)',
                  borderColor: active ? (cfg.color||'#f97316') : 'rgba(255,255,255,0.08)',
                  color: active ? (cfg.color||'#f97316') : '#475569',
                }}>
                  {st.replace(/_/g,' ')}
                  <span style={{...lay.filterCnt,background:active?(cfg.color||'#f97316'):'rgba(255,255,255,0.08)',color:active?'#fff':'#64748b'}}>{cnt}</span>
                </button>
              );
            })}
          </div>

          {/* Orders List */}
          {loading ? <Loader/> : (
            <div style={lay.orderList}>
              {filtered.length===0 ? (
                <div style={lay.empty}>
                  <span style={{fontSize:56}}>📦</span>
                  <p style={lay.emptyTitle}>No orders found</p>
                  <p style={lay.emptyText}>Try adjusting your search or filter</p>
                </div>
              ) : filtered.map(o=>{
                const cfg = SC[o.status]||{};
                const open = expanded===o.orderId;
                return (
                  <div key={o.orderId} style={lay.orderCard}>
                    {/* Row */}
                    <div style={lay.orderRow} onClick={()=>setExpanded(open?null:o.orderId)}>
                      <div style={{...lay.orderIdBadge,borderColor:cfg.border||'rgba(255,255,255,0.1)',color:cfg.color||'#64748b'}}>
                        #{o.orderId}
                      </div>
                      <div style={lay.orderMid}>
                        <p style={lay.orderRest}>{o.restaurantName}</p>
                        <p style={lay.orderTime}>{new Date(o.placedAt).toLocaleString('en-IN')}</p>
                      </div>
                      <span style={{...lay.statusPill,background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`}}>
                        {o.status?.replace(/_/g,' ')}
                      </span>
                      <div style={lay.orderAmt}>
                        <p style={lay.amtMain}>₹{o.totalAmount?.toFixed(0)}</p>
                        <p style={{...lay.amtSub,color:'#22c55e'}}>+₹{o.adminCommission?.toFixed(0)} admin</p>
                      </div>
                      <span style={{...lay.chevron,color:cfg.color||'#475569'}}>{open?'▲':'▼'}</span>
                    </div>

                    {/* Expanded */}
                    {open && (
                      <div style={lay.expanded}>
                        <div style={lay.expandGrid}>
                          {/* Items */}
                          <div style={lay.expandSection}>
                            <p style={lay.expandTitle}>🛒 Order Items</p>
                            {o.items?.map((item,i)=>(
                              <div key={i} style={lay.itemRow}>
                                <span style={{color:'#94a3b8'}}>{item.veg?'🟢':'🔴'} {item.itemName} <span style={{color:'#64748b'}}>×{item.quantity}</span></span>
                                <span style={{color:'#f1f5f9',fontWeight:700}}>₹{(item.priceAtOrder*item.quantity).toFixed(0)}</span>
                              </div>
                            ))}
                          </div>
                          {/* Financials */}
                          <div style={lay.expandSection}>
                            <p style={lay.expandTitle}>💰 Financial Breakdown</p>
                            {[
                              {l:'Food Amount',       v:`₹${o.foodAmount?.toFixed(0)}`,       c:'#94a3b8'},
                              {l:'Delivery Fee',      v:`₹${o.deliveryFee?.toFixed(0)}`,      c:'#94a3b8'},
                              {l:'Total Paid',        v:`₹${o.totalAmount?.toFixed(0)}`,      c:'#f1f5f9', bold:true},
                              {l:'Admin Commission',  v:`₹${o.adminCommission?.toFixed(0)}`,  c:'#22c55e'},
                              {l:'Restaurant Share',  v:`₹${o.restaurantEarning?.toFixed(0)}`,c:'#6366f1'},
                              {l:'Delivery Share',    v:`₹${o.deliveryEarning?.toFixed(0)}`,  c:'#f97316'},
                            ].map((r,i)=>(
                              <div key={i} style={{...lay.billRow,fontWeight:r.bold?700:400}}>
                                <span style={{color:'#64748b',fontSize:12}}>{r.l}</span>
                                <span style={{color:r.c,fontSize:13,fontWeight:r.bold?800:600}}>{r.v}</span>
                              </div>
                            ))}
                          </div>
                          {/* Delivery */}
                          <div style={lay.expandSection}>
                            <p style={lay.expandTitle}>🛵 Delivery Info</p>
                            {[
                              {icon:'📍', val:o.deliveryAddressLine},
                              {icon:'📏', val:`${o.distanceKm?.toFixed(1)} km distance`},
                              {icon:'⏱️', val:`${o.estimatedMinutes} min estimated`},
                              o.deliveryPartnerName && {icon:'🛵', val:`${o.deliveryPartnerName} (${o.deliveryPartnerPhone})`},
                              {icon:'💳', val:`Payment: ${o.paymentStatus}`},
                            ].filter(Boolean).map((row,i)=>(
                              <p key={i} style={lay.infoLine}><span style={{marginRight:6}}>{row.icon}</span>{row.val}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
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
      <p style={{color:'#475569',fontSize:13}}>Loading orders...</p>
    </div>
  );
}

const lay={
  page:{display:'flex',minHeight:'100vh',background:'#060818'},
  main:{flex:1,overflow:'auto'},
  content:{padding:28,display:'flex',flexDirection:'column',gap:20},
  kpiRow:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14},
  kpi:{borderRadius:16,padding:'18px 20px',display:'flex',alignItems:'center',gap:14},
  kpiIcon:{width:46,height:46,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  kpiVal:{fontSize:22,fontWeight:900,lineHeight:1,marginBottom:4},
  kpiLabel:{fontSize:11,color:'#64748b',fontWeight:600},
  searchWrap:{position:'relative',display:'flex',alignItems:'center'},
  searchIcon:{position:'absolute',left:14,fontSize:14,pointerEvents:'none'},
  search:{width:'100%',padding:'13px 14px 13px 40px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,fontSize:14,color:'#f1f5f9',outline:'none',fontFamily:'Inter,sans-serif'},
  filterRow:{display:'flex',gap:8,flexWrap:'wrap'},
  filterBtn:{padding:'7px 14px',borderRadius:20,border:'1px solid',cursor:'pointer',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',gap:6,transition:'all 0.2s',whiteSpace:'nowrap',fontFamily:'Inter,sans-serif'},
  filterCnt:{padding:'2px 7px',borderRadius:10,fontSize:10,fontWeight:700},
  orderList:{display:'flex',flexDirection:'column',gap:8},
  orderCard:{background:'#0d1117',borderRadius:14,overflow:'hidden',border:'1px solid rgba(255,255,255,0.05)'},
  orderRow:{display:'flex',alignItems:'center',gap:14,padding:'16px 20px',cursor:'pointer',flexWrap:'wrap'},
  orderIdBadge:{background:'rgba(255,255,255,0.04)',border:'1px solid',borderRadius:8,padding:'4px 10px',fontSize:12,fontWeight:700,flexShrink:0},
  orderMid:{flex:1,minWidth:140},
  orderRest:{fontWeight:700,fontSize:14,color:'#f1f5f9',marginBottom:3},
  orderTime:{fontSize:11,color:'#475569'},
  statusPill:{padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:700,flexShrink:0},
  orderAmt:{textAlign:'right',flexShrink:0},
  amtMain:{fontWeight:900,fontSize:16,color:'#f1f5f9'},
  amtSub:{fontSize:11,fontWeight:600},
  chevron:{fontSize:12,flexShrink:0},
  expanded:{padding:'0 20px 20px',borderTop:'1px solid rgba(255,255,255,0.05)'},
  expandGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:14,paddingTop:16},
  expandSection:{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:12,padding:16,display:'flex',flexDirection:'column',gap:10},
  expandTitle:{fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:1},
  itemRow:{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:13,padding:'3px 0'},
  billRow:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'4px 0',borderBottom:'1px solid rgba(255,255,255,0.03)'},
  infoLine:{fontSize:12,color:'#94a3b8',lineHeight:1.8},
  empty:{textAlign:'center',padding:60,display:'flex',flexDirection:'column',alignItems:'center',gap:10},
  emptyTitle:{color:'#f1f5f9',fontWeight:700,fontSize:18},
  emptyText:{color:'#475569',fontSize:14},
};
