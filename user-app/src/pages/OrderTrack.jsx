import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';

const STATUS_STEPS = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const STATUS_META = {
  PLACED:           { label: 'Order Placed',           icon: '📋', color: '#6366f1', desc: 'We received your order!' },
  ACCEPTED:         { label: 'Restaurant Accepted',     icon: '✅', color: '#0ea5e9', desc: 'Restaurant confirmed your order' },
  PREPARING:        { label: 'Preparing Your Food',     icon: '👨‍🍳', color: '#f97316', desc: 'Chef is cooking your meal' },
  READY:            { label: 'Ready for Pickup',        icon: '📦', color: '#8b5cf6', desc: 'Food is packed and ready' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',        icon: '🛵', color: '#06b6d4', desc: 'Rider is on the way to you!' },
  DELIVERED:        { label: 'Delivered! Enjoy 😋',     icon: '🎉', color: '#22c55e', desc: 'Your order has arrived' },
  CANCELLED:        { label: 'Order Cancelled',         icon: '❌', color: '#ef4444', desc: 'This order was cancelled' },
};

/* Simulated delivery positions: 0% = restaurant, 100% = customer */
function useDeliveryAnimation(isOutForDelivery, isDelivered) {
  const [progress, setProgress] = useState(0);            // 0-100
  const [bikePos,  setBikePos]  = useState({ x: 10, y: 50 }); // % on map
  const timerRef = useRef(null);

  useEffect(() => {
    if (isDelivered) { setProgress(100); return; }
    if (!isOutForDelivery) { setProgress(0); return; }

    // Simulate smooth movement
    timerRef.current = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + 0.6, 98);               // stops just before 100
        // Curved path: x goes 10→88, y oscillates slightly
        const x = 10 + (next / 100) * 78;
        const y = 50 + Math.sin((next / 100) * Math.PI * 2) * 12;
        setBikePos({ x, y });
        return next;
      });
    }, 600);

    return () => clearInterval(timerRef.current);
  }, [isOutForDelivery, isDelivered]);

  return { progress, bikePos };
}

export default function OrderTrack() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchOrder = async () => {
    try {
      const res = await API.get(`/customer/order/${id}/track`);
      setOrder(res.data.data);
      const s = res.data.data?.status;
      if (s === 'DELIVERED' || s === 'CANCELLED') clearInterval(intervalRef.current);
    } catch {
      clearInterval(intervalRef.current);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    intervalRef.current = setInterval(fetchOrder, 8000); // poll every 8s
    return () => clearInterval(intervalRef.current);
  }, [id]); // eslint-disable-line

  const isOFD      = order?.status === 'OUT_FOR_DELIVERY';
  const isDelivered = order?.status === 'DELIVERED';
  const { progress, bikePos } = useDeliveryAnimation(isOFD, isDelivered);

  if (loading) return (
    <div style={{ background:'#f8f8f8', minHeight:'100vh' }}>
      <Navbar />
      <div style={s.loadWrap}><div style={s.spinner} /><p style={s.loadText}>Loading your order...</p></div>
    </div>
  );

  if (!order) return (
    <div style={{ background:'#f8f8f8', minHeight:'100vh' }}>
      <Navbar />
      <div style={s.loadWrap}><p style={{ color:'#888' }}>Order not found</p></div>
    </div>
  );

  const meta        = STATUS_META[order.status] || STATUS_META.PLACED;
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div style={{ background:'#f8f8f8', minHeight:'100vh' }}>
      <Navbar />
      <div style={s.page}>

        {/* ── STATUS HERO ── */}
        <div style={{ ...s.heroCard, background: isDelivered ? 'linear-gradient(135deg,#dcfce7,#bbf7d0)' : order.status === 'CANCELLED' ? 'linear-gradient(135deg,#fee2e2,#fca5a5)' : 'linear-gradient(135deg,#fff7ed,#fed7aa)' }}>
          <div style={{ ...s.bigIcon, animation: isOFD ? 'bounce 0.8s infinite alternate' : 'none' }}>
            {meta.icon}
          </div>
          <h2 style={{ ...s.statusTitle, color: meta.color }}>{meta.label}</h2>
          <p style={s.statusDesc}>{meta.desc}</p>
          {order.estimatedMinutes && !isDelivered && order.status !== 'CANCELLED' && (
            <div style={s.etaBadge}>
              ⏱️ Estimated delivery: <strong>{order.estimatedMinutes} min</strong>
            </div>
          )}
          <p style={s.refreshNote}>🔄 Auto-updating every 8 seconds</p>
        </div>

        {/* ── LIVE DELIVERY MAP (only when OUT_FOR_DELIVERY or DELIVERED) ── */}
        {(isOFD || isDelivered) && (
          <div style={s.card}>
            <div style={s.mapHeader}>
              <h3 style={s.cardTitle}>📍 Live Delivery Tracking</h3>
              {isOFD && <span style={s.liveDot}><span style={s.liveRipple} />LIVE</span>}
            </div>
            <p style={s.mapSubtitle}>
              {isDelivered ? '✅ Delivered to your address!' : `🛵 ${order.deliveryPartnerName || 'Your rider'} is on the way`}
            </p>

            {/* Map Container */}
            <div style={s.mapBox}>
              {/* Road line SVG */}
              <svg style={s.mapSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Dashed road */}
                <path d="M 10,50 Q 30,30 50,50 Q 70,70 90,50"
                  fill="none" stroke="#e0e0e0" strokeWidth="3" strokeDasharray="4,3" />
                {/* Progress road (colored) */}
                <path d="M 10,50 Q 30,30 50,50 Q 70,70 90,50"
                  fill="none" stroke="#06b6d4" strokeWidth="3"
                  strokeDasharray="120"
                  strokeDashoffset={120 - (progress / 100) * 120}
                  style={{ transition:'stroke-dashoffset 0.6s ease' }}
                />
              </svg>

              {/* Restaurant pin */}
              <div style={{ ...s.mapPin, left:'7%', top:'42%' }}>
                <div style={{ ...s.pinCircle, background:'#f97316' }}>🍽️</div>
                <div style={s.pinLabel}>Restaurant</div>
              </div>

              {/* Customer pin */}
              <div style={{ ...s.mapPin, right:'5%', top:'42%' }}>
                <div style={{ ...s.pinCircle, background:'#6366f1' }}>🏠</div>
                <div style={s.pinLabel}>You</div>
              </div>

              {/* Animated Delivery Bike */}
              {!isDelivered && (
                <div style={{
                  ...s.bikeIcon,
                  left: `${bikePos.x}%`,
                  top:  `${bikePos.y}%`,
                  animation: 'bikeBob 0.6s ease-in-out infinite alternate',
                }}>
                  🛵
                </div>
              )}
              {isDelivered && (
                <div style={{ ...s.bikeIcon, left:'85%', top:'42%', fontSize:26, animation:'none' }}>✅</div>
              )}

              {/* Progress bar at bottom */}
              <div style={s.progressBarWrap}>
                <div style={{ ...s.progressBar, width:`${isDelivered ? 100 : progress}%` }} />
              </div>
              <p style={s.progressText}>
                {isDelivered ? '100%' : `${Math.round(progress)}%`} of route covered
              </p>
            </div>

            {/* Rider Info */}
            {order.deliveryPartnerName && (
              <div style={s.riderCard}>
                <div style={s.riderAvatar}>{order.deliveryPartnerName[0]}</div>
                <div style={{ flex:1 }}>
                  <p style={s.riderName}>{order.deliveryPartnerName}</p>
                  <p style={s.riderRole}>Delivery Partner</p>
                </div>
                {order.deliveryPartnerPhone && (
                  <a href={`tel:${order.deliveryPartnerPhone}`} style={s.callBtn}>📞 Call</a>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ORDER PROGRESS STEPS ── */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>Order Progress</h3>
          <div style={s.stepsWrap}>
            {STATUS_STEPS.map((step, idx) => {
              const isDone    = currentStep >= idx;
              const isCurrent = currentStep === idx;
              const sm        = STATUS_META[step];
              return (
                <div key={step} style={s.stepRow}>
                  {/* Connector line */}
                  {idx < STATUS_STEPS.length - 1 && (
                    <div style={{ ...s.connector, background: isDone && currentStep > idx ? sm.color : '#e0e0e0' }} />
                  )}
                  {/* Dot */}
                  <div style={{
                    ...s.stepDot,
                    background: isDone ? sm.color : '#e0e0e0',
                    boxShadow: isCurrent ? `0 0 0 4px ${sm.color}30` : 'none',
                    transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                  }}>
                    {isDone ? (isCurrent ? sm.icon : '✓') : ''}
                  </div>
                  {/* Label */}
                  <div style={s.stepInfo}>
                    <p style={{ ...s.stepName, color: isDone ? '#111' : '#aaa', fontWeight: isCurrent ? 700 : 500 }}>
                      {sm.icon} {sm.label}
                    </p>
                    {isCurrent && <p style={{ ...s.stepDesc, color: sm.color }}>{sm.desc}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ORDER DETAILS ── */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>📋 Order Details</h3>
          <p style={s.orderId}>Order #{order.orderId || id}</p>
          <p style={s.restName}>🍽️ {order.restaurantName}</p>
          {order.items?.map((item, i) => (
            <div key={i} style={s.itemRow}>
              <span style={{ color: item.veg ? '#4caf50' : '#f44336', marginRight:6 }}>●</span>
              <span style={s.itemName}>{item.itemName} × {item.quantity}</span>
              <span style={s.itemAmt}>₹{(item.priceAtOrder * item.quantity).toFixed(0)}</span>
            </div>
          ))}
          <div style={s.billDivider} />
          {[
            { label:'Food Amount', val:`₹${order.foodAmount?.toFixed(0)}` },
            { label:'Delivery Fee', val: order.deliveryFee === 0 ? 'FREE 🎉' : `₹${order.deliveryFee?.toFixed(0)}` },
            { label:'Total Paid',  val:`₹${order.totalAmount?.toFixed(0)}`, bold:true },
          ].map((r, i) => (
            <div key={i} style={{ ...s.billRow, fontWeight: r.bold ? 700 : 400, fontSize: r.bold ? 16 : 14 }}>
              <span style={{ color: r.bold ? '#111' : '#666' }}>{r.label}</span>
              <span style={{ color: r.bold ? '#f97316' : '#333' }}>{r.val}</span>
            </div>
          ))}
        </div>

        {/* ── DELIVERY ADDRESS ── */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>📍 Delivery Address</h3>
          <p style={{ color:'#555', lineHeight:1.7, fontSize:14 }}>{order.deliveryAddressLine}</p>
        </div>

        {/* ── CANCELLED ── */}
        {order.status === 'CANCELLED' && (
          <div style={s.cancelBox}>
            <p style={s.cancelTitle}>❌ Order Cancelled</p>
            <p style={s.cancelText}>Your order was cancelled. Refund (if any) will be processed within 5-7 business days.</p>
            <button onClick={() => navigate('/')} style={s.reorderBtn}>Order Again 🍽️</button>
          </div>
        )}

        {/* ── DELIVERED ── */}
        {isDelivered && (
          <div style={s.deliveredBox}>
            <p style={{ fontSize:14, color:'#166534', marginBottom:16, fontWeight:500 }}>
              🎉 Thank you for ordering! Hope you enjoyed your meal.
            </p>
            <button onClick={() => navigate('/')} style={s.reorderBtn}>Order Again 🍽️</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0) rotate(-5deg); }
          to   { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes bikeBob {
          from { transform: translate(-50%,-50%) rotate(-8deg) scale(1); }
          to   { transform: translate(-50%,-50%) rotate(8deg) scale(1.1); }
        }
        @keyframes rippleAnim {
          0%   { transform: scale(1); opacity:1; }
          100% { transform: scale(2.5); opacity:0; }
        }
      `}</style>
    </div>
  );
}

const s = {
  loadWrap:     { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'70vh', gap:16 },
  spinner:      { width:44, height:44, border:'4px solid #eee', borderTop:'4px solid #f97316', borderRadius:'50%', animation:'spin 1s linear infinite' },
  loadText:     { color:'#888', fontSize:15 },
  page:         { maxWidth:640, margin:'0 auto', padding:'24px 16px 60px' },

  /* Hero */
  heroCard:     { borderRadius:20, padding:'32px 24px', textAlign:'center', marginBottom:16 },
  bigIcon:      { fontSize:58, marginBottom:12, display:'block' },
  statusTitle:  { fontSize:22, fontWeight:800, marginBottom:6 },
  statusDesc:   { fontSize:14, color:'#555', marginBottom:12 },
  etaBadge:     { display:'inline-block', background:'rgba(0,0,0,0.07)', borderRadius:30, padding:'7px 18px', fontSize:14, color:'#444', marginBottom:8 },
  refreshNote:  { fontSize:11, color:'#aaa', marginTop:8 },

  /* Card */
  card:         { background:'#fff', borderRadius:18, padding:22, marginBottom:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' },
  cardTitle:    { fontSize:16, fontWeight:700, color:'#111', marginBottom:6 },

  /* Map */
  mapHeader:    { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 },
  mapSubtitle:  { fontSize:13, color:'#888', marginBottom:14 },
  liveDot:      { display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, color:'#ef4444', position:'relative' },
  liveRipple:   { width:8, height:8, borderRadius:'50%', background:'#ef4444', display:'inline-block', animation:'rippleAnim 1.2s ease-out infinite' },
  mapBox:       { background:'linear-gradient(135deg,#e0f2fe,#e0e7ff)', borderRadius:16, height:200, position:'relative', overflow:'hidden', marginBottom:16 },
  mapSvg:       { position:'absolute', inset:0, width:'100%', height:'100%' },
  mapPin:       { position:'absolute', transform:'translateY(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:4, zIndex:2 },
  pinCircle:    { width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, boxShadow:'0 4px 12px rgba(0,0,0,0.25)', color:'#fff' },
  pinLabel:     { fontSize:10, fontWeight:700, color:'#444', background:'#fff', borderRadius:10, padding:'2px 8px', boxShadow:'0 1px 4px rgba(0,0,0,0.1)' },
  bikeIcon:     { position:'absolute', fontSize:30, transform:'translate(-50%,-50%)', zIndex:3, transition:'left 0.6s ease, top 0.6s ease', filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' },
  progressBarWrap:{ position:'absolute', bottom:10, left:16, right:16, height:5, background:'rgba(255,255,255,0.5)', borderRadius:10, overflow:'hidden' },
  progressBar:  { height:'100%', background:'linear-gradient(90deg,#06b6d4,#6366f1)', borderRadius:10, transition:'width 0.6s ease' },
  progressText: { position:'absolute', bottom:18, right:16, fontSize:10, fontWeight:700, color:'#555' },

  /* Rider */
  riderCard:    { display:'flex', alignItems:'center', gap:14, background:'#f8fafc', borderRadius:12, padding:'12px 16px' },
  riderAvatar:  { width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#f97316,#6366f1)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, flexShrink:0 },
  riderName:    { fontWeight:700, fontSize:15, color:'#111', marginBottom:2 },
  riderRole:    { fontSize:12, color:'#888' },
  callBtn:      { padding:'8px 16px', background:'#f0fdf4', border:'1.5px solid #86efac', borderRadius:10, color:'#166534', fontWeight:700, fontSize:13, textDecoration:'none', flexShrink:0 },

  /* Steps */
  stepsWrap:    { display:'flex', flexDirection:'column', gap:0 },
  stepRow:      { display:'flex', alignItems:'flex-start', gap:16, position:'relative' },
  connector:    { position:'absolute', left:11, top:24, width:2, height:36, borderRadius:2, zIndex:0 },
  stepDot:      { width:24, height:24, borderRadius:'50%', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0, zIndex:1, transition:'all 0.3s' },
  stepInfo:     { paddingBottom:28, flex:1 },
  stepName:     { fontSize:14, marginBottom:2 },
  stepDesc:     { fontSize:12, fontWeight:600 },

  /* Order details */
  orderId:      { fontSize:12, color:'#bbb', marginBottom:4 },
  restName:     { fontSize:14, fontWeight:600, color:'#555', marginBottom:14 },
  itemRow:      { display:'flex', alignItems:'center', padding:'6px 0', fontSize:14, color:'#333', borderBottom:'1px solid #f5f5f5' },
  itemName:     { flex:1 },
  itemAmt:      { fontWeight:600 },
  billDivider:  { height:1, background:'#f0f0f0', margin:'12px 0' },
  billRow:      { display:'flex', justifyContent:'space-between', marginBottom:8 },

  /* Bottom cards */
  cancelBox:    { background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:16, padding:22, textAlign:'center' },
  cancelTitle:  { fontSize:18, fontWeight:700, color:'#b91c1c', marginBottom:8 },
  cancelText:   { fontSize:13, color:'#7f1d1d', lineHeight:1.7, marginBottom:16 },
  deliveredBox: { background:'#f0fdf4', border:'1px solid #86efac', borderRadius:16, padding:22, textAlign:'center' },
  reorderBtn:   { padding:'13px 32px', background:'linear-gradient(135deg,#f97316,#ea580c)', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(249,115,22,0.35)' },
};
