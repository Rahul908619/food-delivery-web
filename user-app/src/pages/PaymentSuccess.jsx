import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api/axios';

const METHOD_INFO = {
  PHONEPE:   { label: 'PhonePe',       icon: '💜', color: '#5f259f' },
  GOOGLEPAY: { label: 'Google Pay',    icon: '🔵', color: '#1a73e8' },
  PAYTM:     { label: 'Paytm',         icon: '💎', color: '#00b9f1' },
  BHIM:      { label: 'BHIM UPI',      icon: '🇮🇳', color: '#f97316' },
  CRED:      { label: 'CRED',          icon: '⚫', color: '#111'    },
  CREDIT:    { label: 'Credit Card',   icon: '💳', color: '#1e40af' },
  DEBIT:     { label: 'Debit Card',    icon: '🏧', color: '#059669' },
  SBI:       { label: 'SBI Net Banking',icon:'🏦', color: '#1e3a8a' },
  HDFC:      { label: 'HDFC Net Banking',icon:'🏦',color: '#b91c1c' },
  SLICE:     { label: 'Slice',         icon: '🟠', color: '#f97316' },
  LAZYPAY:   { label: 'LazyPay',       icon: '🔴', color: '#ef4444' },
  SIMPL:     { label: 'Simpl',         icon: '🟣', color: '#7c3aed' },
  COD:       { label: 'Cash on Delivery', icon: '💵', color: '#059669' },
  RAZORPAY:  { label: 'Online Payment', icon: '💳', color: '#2563eb' },
};

export default function PaymentSuccess() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const method   = (params.get('method') || 'RAZORPAY').toUpperCase();

  const [order,   setOrder]   = useState(null);
  const [step,    setStep]    = useState(0);
  const [barWidths, setBarWidths] = useState([0, 0, 0]);

  useEffect(() => {
    API.get(`/customer/order/${id}/track`)
      .then(res => { setOrder(res.data.data); })
      .catch(() => {});

    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 1400);
    const t3 = setTimeout(() => setBarWidths([85, 100, 60]), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [id]);

  const mi = METHOD_INFO[method] || METHOD_INFO.RAZORPAY;

  const total          = order?.totalAmount || 0;
  const foodAmount     = order?.foodAmount || total * 0.8;
  const dFee           = order?.deliveryFee ?? 40;
  const convFee        = order?.convenienceFee ?? 5;
  const restaurantEarn = order?.restaurantEarning ?? (foodAmount * 0.85);
  const deliveryEarn   = order?.deliveryEarning ?? dFee;
  const adminEarn      = order?.adminCommission ?? (foodAmount * 0.15 + convFee);

  const splits = [
    { label:'🍽️ Restaurant',       note:'Food amount (after 15% commission)', val: restaurantEarn, color:'#2196f3', barIdx: 0 },
    { label:'🛵 Delivery Partner', note:'Delivery charges',                    val: deliveryEarn,   color:'#ff9800', barIdx: 1 },
    { label:'🏢 QuickBiteX',        note:'15% commission + convenience fee',    val: adminEarn,      color:'#f97316', barIdx: 2 },
  ];

  return (
    <div style={s.page}>
      {/* ── Animated Checkmark ── */}
      <div style={{ ...s.circleWrap, animation: step >= 1 ? 'successPop 0.55s cubic-bezier(.34,1.56,.64,1) both' : 'none', opacity: step >= 1 ? 1 : 0 }}>
        <div style={s.circle}>✓</div>
        <div style={s.ripple} />
      </div>

      {step >= 1 && (
        <div style={{ animation:'fadeUp 0.5s ease both', textAlign:'center' }}>
          <h1 style={s.title}>Payment Successful! 🎉</h1>
          <p style={s.subtitle}>Your order has been placed and is being prepared</p>
          <div style={{ ...s.methodBadge, borderColor: mi.color, color: mi.color, background: mi.color + '12' }}>
            {mi.icon} Paid via {mi.label}
          </div>
        </div>
      )}

      {step >= 2 && (
        <div style={{ width:'100%', animation:'fadeUp 0.45s ease both' }}>

          {/* Order Info */}
          {order && (
            <div style={s.card}>
              <p style={s.orderNum}>Order #{order.orderId || id}</p>
              <div style={s.infoGrid}>
                <div style={s.infoBox}>
                  <span style={s.infoLabel}>From</span>
                  <span style={s.infoVal}>{order.restaurantName || '—'}</span>
                </div>
                <div style={s.infoBox}>
                  <span style={s.infoLabel}>Total Paid</span>
                  <span style={{ ...s.infoVal, color:'#f97316', fontSize:22 }}>₹{total.toFixed(0)}</span>
                </div>
                <div style={s.infoBox}>
                  <span style={s.infoLabel}>Deliver to</span>
                  <span style={s.infoVal}>{(order.deliveryAddressLine || '—').substring(0, 28)}…</span>
                </div>
                <div style={s.infoBox}>
                  <span style={s.infoLabel}>Estimated Time</span>
                  <span style={{ ...s.infoVal, color:'#4caf50' }}>~{order.estimatedMinutes || 30} min</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Distribution */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>Your ₹{total.toFixed(0)} went to...</h3>
            <p style={{ fontSize:12, color:'#aaa', marginBottom:18 }}>Here's exactly how your payment was distributed</p>

            {splits.map((row, i) => {
              const pct = total ? Math.round((row.val / total) * 100) : 0;
              return (
                <div key={i} style={s.splitRow}>
                  <div style={s.splitLeft}>
                    <p style={s.splitLabel}>{row.label}</p>
                    <p style={s.splitNote}>{row.note}</p>
                  </div>
                  <div style={s.splitRight}>
                    <span style={{ ...s.splitAmt, color: row.color }}>₹{row.val.toFixed(0)}</span>
                    <div style={s.barWrap}>
                      <div style={{ ...s.bar, width:`${barWidths[row.barIdx]}%`, background: row.color }} />
                    </div>
                    <span style={s.pct}>{pct}%</span>
                  </div>
                </div>
              );
            })}

            {/* Visual bar */}
            <div style={s.visualBar}>
              {splits.map((row, i) => {
                const pct = total ? (row.val / total) * 100 : 0;
                return (
                  <div key={i} style={{ flex: pct, background: row.color, display:'flex', alignItems:'center', justifyContent:'center', minWidth:30, transition:'flex 1.2s ease' }}>
                    <span style={{ color:'#fff', fontSize:10, fontWeight:700 }}>{Math.round(pct)}%</span>
                  </div>
                );
              })}
            </div>

            <div style={s.legendRow}>
              {splits.map((r, i) => (
                <div key={i} style={s.legendItem}>
                  <div style={{ ...s.legendDot, background: r.color }} />
                  <span style={{ fontSize:11, color:'#666' }}>{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Breakdown */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>Bill Breakdown</h3>
            {[
              { label:'Food Amount',     val:`₹${foodAmount.toFixed(0)}` },
              { label:'Delivery Fee',    val: dFee === 0 ? '🎉 FREE' : `₹${dFee.toFixed(0)}` },
              { label:'Convenience Fee', val:`₹${convFee}` },
              { label:'Total Paid',      val:`₹${total.toFixed(0)}`, bold:true },
            ].map((r, i) => (
              <div key={i} style={{ ...s.billRow, fontWeight: r.bold ? 800 : 400, fontSize: r.bold ? 17 : 14, color: r.bold ? '#111' : '#555' }}>
                <span>{r.label}</span>
                <span style={{ color: r.bold ? '#f97316' : '#333' }}>{r.val}</span>
              </div>
            ))}
          </div>

          {/* COD note */}
          {method === 'COD' && (
            <div style={s.codNote}>
              💵 Cash on Delivery — Keep <strong>₹{total.toFixed(0)}</strong> ready when your order arrives.
            </div>
          )}

          {/* Action Buttons */}
          <div style={s.btnGroup}>
            <button onClick={() => navigate(`/order/${id}/track`)} style={s.trackBtn}>📍 Track My Order</button>
            <button onClick={() => navigate('/')} style={s.homeBtn}>🏠 Order More Food</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes successPop {
          0%   { transform: scale(0) rotate(-10deg); opacity:0; }
          60%  { transform: scale(1.2) rotate(3deg); }
          100% { transform: scale(1) rotate(0); opacity:1; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ripple {
          to { transform:scale(2.5); opacity:0; }
        }
      `}</style>
    </div>
  );
}

const s = {
  page:       { maxWidth:520, margin:'0 auto', padding:'44px 16px 60px', display:'flex', flexDirection:'column', alignItems:'center', gap:22, fontFamily:'Inter,sans-serif' },
  circleWrap: { position:'relative', marginBottom:4 },
  circle:     { width:92, height:92, borderRadius:'50%', background:'linear-gradient(135deg,#4caf50,#66bb6a)', color:'#fff', fontSize:46, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, boxShadow:'0 10px 36px rgba(76,175,80,0.38)' },
  ripple:     { position:'absolute', inset:-8, borderRadius:'50%', border:'3px solid #4caf5060', animation:'ripple 1.2s ease-out 0.5s both' },
  title:      { fontSize:26, fontWeight:800, color:'#111', marginBottom:6 },
  subtitle:   { fontSize:14, color:'#888', marginBottom:16 },
  methodBadge:{ display:'inline-block', padding:'8px 22px', border:'2px solid', borderRadius:30, fontSize:14, fontWeight:700 },
  card:       { width:'100%', background:'#fff', borderRadius:18, padding:22, boxShadow:'0 2px 14px rgba(0,0,0,0.07)' },
  cardTitle:  { fontSize:16, fontWeight:700, color:'#111', marginBottom:10 },
  orderNum:   { fontSize:12, color:'#bbb', marginBottom:14 },
  infoGrid:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  infoBox:    { background:'#f8f8f8', borderRadius:10, padding:'12px 14px' },
  infoLabel:  { display:'block', fontSize:10, color:'#aaa', fontWeight:700, textTransform:'uppercase', marginBottom:5, letterSpacing:0.4 },
  infoVal:    { fontSize:14, fontWeight:700, color:'#111' },
  splitRow:   { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  splitLeft:  { flex:1 },
  splitLabel: { fontSize:14, fontWeight:600, color:'#333', marginBottom:2 },
  splitNote:  { fontSize:11, color:'#aaa' },
  splitRight: { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, minWidth:110 },
  splitAmt:   { fontSize:17, fontWeight:800 },
  barWrap:    { width:90, height:7, background:'#f0f0f0', borderRadius:10, overflow:'hidden' },
  bar:        { height:'100%', borderRadius:10, transition:'width 1.2s ease' },
  pct:        { fontSize:11, color:'#aaa' },
  visualBar:  { display:'flex', height:32, borderRadius:10, overflow:'hidden', marginTop:18, marginBottom:12, gap:2 },
  legendRow:  { display:'flex', justifyContent:'center', gap:20, marginTop:6 },
  legendItem: { display:'flex', alignItems:'center', gap:6 },
  legendDot:  { width:10, height:10, borderRadius:3 },
  billRow:    { display:'flex', justifyContent:'space-between', marginBottom:10 },
  codNote:    { width:'100%', background:'#f0fdf4', borderRadius:14, padding:18, fontSize:14, color:'#166534', textAlign:'center', border:'1px solid #bbf7d0' },
  btnGroup:   { width:'100%', display:'flex', flexDirection:'column', gap:12 },
  trackBtn:   { width:'100%', padding:16, background:'linear-gradient(135deg,#f97316,#ea580c)', color:'#fff', border:'none', borderRadius:13, fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(249,115,22,0.35)' },
  homeBtn:    { width:'100%', padding:14, background:'#fff', color:'#f97316', border:'2px solid #f97316', borderRadius:13, fontSize:15, fontWeight:700, cursor:'pointer' },
};
