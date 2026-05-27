import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar  from '../components/Navbar';
import API     from '../api/axios';

const STATUS_COLOR = {
  PLACED:'#f59e0b', ACCEPTED:'#6366f1', PREPARING:'#8b5cf6',
  READY:'#06b6d4', OUT_FOR_DELIVERY:'#f97316', DELIVERED:'#22c55e',
  CANCELLED:'#ef4444', REJECTED:'#ef4444',
};

export default function Analytics() {
  const [orders,  setOrders]  = useState([]);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([API.get('/admin/orders'),API.get('/admin/users')])
      .then(([o,u])=>{ setOrders(o.data.data||[]); setUsers(u.data.data||[]); })
      .finally(()=>setLoading(false));
  },[]);

  const delivered    = orders.filter(o=>o.status==='DELIVERED');
  const totalRev     = delivered.reduce((s,o)=>s+(o.totalAmount||0),0);
  const adminEarn    = delivered.reduce((s,o)=>s+(o.adminCommission||0),0);
  const restEarn     = delivered.reduce((s,o)=>s+(o.restaurantEarning||0),0);
  const dpEarn       = delivered.reduce((s,o)=>s+(o.deliveryEarning||0),0);
  const avgOrder     = delivered.length ? totalRev/delivered.length : 0;
  const customers    = users.filter(u=>u.role==='CUSTOMER');
  const owners       = users.filter(u=>u.role==='RESTAURANT_OWNER');
  const partners     = users.filter(u=>u.role==='DELIVERY_PARTNER');
  const ordersByStatus = orders.reduce((acc,o)=>{ acc[o.status]=(acc[o.status]||0)+1; return acc; },{});
  const cancelRate   = orders.length ? (orders.filter(o=>o.status==='CANCELLED'||o.status==='REJECTED').length/orders.length)*100 : 0;
  const successRate  = orders.length ? (delivered.length/orders.length)*100 : 0;

  if(loading) return (
    <div style={{display:'flex',minHeight:'100vh',background:'#060818'}}>
      <Sidebar/>
      <div style={{flex:1,display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column',gap:14}}>
        <div style={{width:48,height:48,border:'3px solid rgba(249,115,22,0.2)',borderTop:'3px solid #f97316',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
        <p style={{color:'#64748b',fontSize:13}}>Loading analytics...</p>
      </div>
    </div>
  );

  return (
    <div style={lay.page}>
      <Sidebar/>
      <div style={lay.main}>
        <Navbar title="Platform Analytics" subtitle="Real-time financial and operational overview"/>
        <div style={lay.content}>

          {/* Revenue Distribution */}
          <Section title="💰 Revenue Distribution">
            <div style={lay.revenueGrid}>
              {[
                {label:'Total Revenue',           value:`₹${totalRev.toFixed(0)}`,  color:'#f1f5f9', bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.07)', note:'All delivered orders'},
                {label:'Admin Earnings (10%)',     value:`₹${adminEarn.toFixed(0)}`, color:'#f97316', bg:'rgba(249,115,22,0.08)',  border:'rgba(249,115,22,0.15)',  note:'Platform commission'},
                {label:'Restaurant Payouts',       value:`₹${restEarn.toFixed(0)}`,  color:'#6366f1', bg:'rgba(99,102,241,0.08)',  border:'rgba(99,102,241,0.15)',  note:'Paid to restaurants'},
                {label:'Delivery Partner Payouts', value:`₹${dpEarn.toFixed(0)}`,   color:'#22c55e', bg:'rgba(34,197,94,0.08)',   border:'rgba(34,197,94,0.15)',   note:'Paid to partners'},
                {label:'Avg Order Value',          value:`₹${avgOrder.toFixed(0)}`,  color:'#8b5cf6', bg:'rgba(139,92,246,0.08)', border:'rgba(139,92,246,0.15)',  note:'Per delivered order'},
                {label:'Delivered Orders',         value:delivered.length,            color:'#06b6d4', bg:'rgba(6,182,212,0.08)',  border:'rgba(6,182,212,0.15)',   note:'Successfully completed'},
              ].map((s,i)=>(
                <div key={i} style={{...lay.revCard,background:s.bg,border:`1px solid ${s.border}`}}>
                  <p style={{...lay.revVal,color:s.color}}>{typeof s.value==='number'?s.value.toLocaleString():s.value}</p>
                  <p style={lay.revLabel}>{s.label}</p>
                  <p style={lay.revNote}>{s.note}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* User Distribution */}
          <Section title="👥 User Distribution">
            <div style={lay.userGrid}>
              {[
                {label:'Customers',         count:customers.length, active:customers.filter(u=>u.active).length, color:'#6366f1', icon:'👤'},
                {label:'Restaurant Owners', count:owners.length,    active:owners.filter(u=>u.active).length,    color:'#f97316', icon:'🍽️'},
                {label:'Delivery Partners', count:partners.length,  active:partners.filter(u=>u.active).length,  color:'#22c55e', icon:'🛵'},
              ].map((u,i)=>(
                <div key={i} style={lay.userCard}>
                  <div style={lay.userTop}>
                    <div style={{...lay.userIconWrap,background:`${u.color}20`,border:`1px solid ${u.color}30`}}>
                      <span style={{fontSize:24}}>{u.icon}</span>
                    </div>
                    <div>
                      <p style={{...lay.userCount,color:u.color}}>{u.count}</p>
                      <p style={lay.userLabel}>{u.label}</p>
                    </div>
                  </div>
                  <div style={lay.barRow}>
                    <div style={lay.barTrack}>
                      <div style={{...lay.barFill,width:u.count?`${(u.active/u.count)*100}%`:'0%',background:`linear-gradient(90deg,${u.color},${u.color}88)`}}/>
                    </div>
                    <span style={{fontSize:11,color:'#64748b',flexShrink:0}}>{u.active} active</span>
                  </div>
                  <div style={lay.userStats}>
                    <div style={lay.userStat}>
                      <span style={{color:'#22c55e',fontWeight:700}}>{u.active}</span>
                      <span style={{color:'#475569',fontSize:10}}>Active</span>
                    </div>
                    <div style={lay.userStat}>
                      <span style={{color:'#ef4444',fontWeight:700}}>{u.count-u.active}</span>
                      <span style={{color:'#475569',fontSize:10}}>Blocked</span>
                    </div>
                    <div style={lay.userStat}>
                      <span style={{color:u.color,fontWeight:700}}>{u.count?((u.active/u.count)*100).toFixed(0):0}%</span>
                      <span style={{color:'#475569',fontSize:10}}>Active Rate</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Order Breakdown */}
          <Section title="📦 Order Status Breakdown">
            <div style={lay.breakCard}>
              {Object.entries(ordersByStatus).sort(([,a],[,b])=>b-a).map(([status,count])=>(
                <div key={status} style={lay.breakRow}>
                  <span style={{...lay.breakLabel,color:STATUS_COLOR[status]||'#64748b'}}>{status.replace(/_/g,' ')}</span>
                  <div style={lay.breakTrack}>
                    <div style={{...lay.breakFill,width:`${orders.length?(count/orders.length)*100:0}%`,background:STATUS_COLOR[status]||'#475569'}}/>
                  </div>
                  <span style={{...lay.breakCount,color:STATUS_COLOR[status]||'#64748b'}}>{count}</span>
                  <span style={lay.breakPct}>{orders.length?((count/orders.length)*100).toFixed(1):0}%</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Platform Health */}
          <Section title="🏥 Platform Health">
            <div style={lay.healthGrid}>
              {[
                {label:'Order Success Rate', value:`${successRate.toFixed(1)}%`, good:successRate>70, icon:'✅', detail:'Orders delivered successfully'},
                {label:'Cancellation Rate',  value:`${cancelRate.toFixed(1)}%`,  good:cancelRate<15,  icon:'❌', detail:'Orders cancelled or rejected'},
                {label:'Active User Rate',   value:users.length?`${((users.filter(u=>u.active).length/users.length)*100).toFixed(1)}%`:'0%', good:true, icon:'👥', detail:'Users with active accounts'},
              ].map((h,i)=>(
                <div key={i} style={{...lay.healthCard,borderLeft:`3px solid ${h.good?'#22c55e':'#f59e0b'}`}}>
                  <span style={{fontSize:28}}>{h.icon}</span>
                  <div style={{flex:1}}>
                    <p style={{...lay.healthVal,color:h.good?'#22c55e':'#f59e0b'}}>{h.value}</p>
                    <p style={lay.healthLabel}>{h.label}</p>
                    <p style={lay.healthDetail}>{h.detail}</p>
                  </div>
                  <span style={{...lay.healthBadge,background:h.good?'rgba(34,197,94,0.12)':'rgba(245,158,11,0.12)',color:h.good?'#22c55e':'#f59e0b',border:`1px solid ${h.good?'rgba(34,197,94,0.25)':'rgba(245,158,11,0.25)'}`}}>
                    {h.good?'● Healthy':'● Review'}
                  </span>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({title,children}) {
  return (
    <div>
      <h3 style={{fontSize:14,fontWeight:800,color:'#64748b',marginBottom:16,letterSpacing:0.5,textTransform:'uppercase'}}>{title}</h3>
      {children}
    </div>
  );
}

const lay={
  page:{display:'flex',minHeight:'100vh',background:'#060818'},
  main:{flex:1,overflow:'auto'},
  content:{padding:28,display:'flex',flexDirection:'column',gap:28},
  revenueGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:14},
  revCard:{borderRadius:16,padding:22},
  revVal:{fontSize:26,fontWeight:900,marginBottom:6,letterSpacing:'-0.5px'},
  revLabel:{fontSize:13,fontWeight:700,color:'#f1f5f9',marginBottom:4},
  revNote:{fontSize:11,color:'#475569'},
  userGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14},
  userCard:{background:'#0d1117',border:'1px solid rgba(255,255,255,0.05)',borderRadius:16,padding:22,display:'flex',flexDirection:'column',gap:16},
  userTop:{display:'flex',alignItems:'center',gap:16},
  userIconWrap:{width:52,height:52,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  userCount:{fontSize:28,fontWeight:900,lineHeight:1,marginBottom:3},
  userLabel:{fontSize:12,color:'#64748b',fontWeight:600},
  barRow:{display:'flex',alignItems:'center',gap:10},
  barTrack:{flex:1,height:8,background:'rgba(255,255,255,0.06)',borderRadius:4,overflow:'hidden'},
  barFill:{height:'100%',borderRadius:4,transition:'width 0.8s ease'},
  userStats:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8},
  userStat:{background:'rgba(255,255,255,0.03)',borderRadius:10,padding:'8px 10px',display:'flex',flexDirection:'column',alignItems:'center',gap:3,fontSize:14},
  breakCard:{background:'#0d1117',border:'1px solid rgba(255,255,255,0.05)',borderRadius:16,padding:24,display:'flex',flexDirection:'column',gap:14},
  breakRow:{display:'flex',alignItems:'center',gap:14},
  breakLabel:{width:160,fontSize:12,fontWeight:700,flexShrink:0},
  breakTrack:{flex:1,height:10,background:'rgba(255,255,255,0.05)',borderRadius:5,overflow:'hidden'},
  breakFill:{height:'100%',borderRadius:5,transition:'width 0.6s ease'},
  breakCount:{width:36,textAlign:'right',fontWeight:900,fontSize:15,flexShrink:0},
  breakPct:{width:50,fontSize:11,color:'#475569',flexShrink:0},
  healthGrid:{display:'flex',flexDirection:'column',gap:12},
  healthCard:{background:'#0d1117',border:'1px solid rgba(255,255,255,0.05)',borderRadius:14,padding:20,display:'flex',alignItems:'center',gap:16},
  healthVal:{fontSize:22,fontWeight:900,marginBottom:2},
  healthLabel:{fontSize:13,color:'#94a3b8',fontWeight:600,marginBottom:2},
  healthDetail:{fontSize:11,color:'#475569'},
  healthBadge:{marginLeft:'auto',padding:'5px 14px',borderRadius:20,fontSize:12,fontWeight:700,flexShrink:0},
};
