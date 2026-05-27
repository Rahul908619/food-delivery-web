import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar  from '../components/Navbar';
import API     from '../api/axios';
import toast   from 'react-hot-toast';
import popup   from '../components/CustomToast';

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [pending, setPending] = useState([]);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, pendRes, ordRes] = await Promise.all([
          API.get('/admin/dashboard'),
          API.get('/admin/restaurants/pending'),
          API.get('/admin/orders'),
        ]);
        setStats(dashRes.data.data);
        setPending(pendRes.data.data || []);
        setRecent((ordRes.data.data || []).slice(0, 6));
      } catch {
        popup.error('Load Failed', 'Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const approve = async (id) => {
    try {
      await API.put(`/admin/restaurant/${id}/approve`);
      popup.success('Approved! ✅', 'Restaurant has been approved and is now live.');
      setPending(p => p.filter(r => r.id !== id));
    } catch {
      popup.error('Approval Failed', 'Could not approve the restaurant.');
    }
  };

  const STATUS_COLOR = {
    PLACED:'#f59e0b', ACCEPTED:'#3b82f6', PREPARING:'#8b5cf6',
    READY:'#06b6d4', OUT_FOR_DELIVERY:'#f97316', DELIVERED:'#22c55e',
    CANCELLED:'#ef4444', REJECTED:'#ef4444',
  };

  const KPI_CONFIG = [
    { label:'Total Customers',   value: stats?.totalCustomers   || 0, icon:'👥', color:'#6366f1', gradient:'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(99,102,241,0.05))', border:'rgba(99,102,241,0.2)', path:'/users' },
    { label:'Restaurants',       value: stats?.totalRestaurants || 0, icon:'🍽️', color:'#22c55e', gradient:'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(34,197,94,0.05))',   border:'rgba(34,197,94,0.2)',  path:'/restaurants' },
    { label:'Total Orders',      value: stats?.totalOrders      || 0, icon:'📦', color:'#f97316', gradient:'linear-gradient(135deg,rgba(249,115,22,0.2),rgba(249,115,22,0.05))', border:'rgba(249,115,22,0.2)', path:'/orders' },
    { label:'Pending Approvals', value: pending.length,               icon:'⏳', color:'#f59e0b', gradient:'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.05))', border:'rgba(245,158,11,0.2)', path:'/restaurants' },
  ];

  if (loading) return <PageLoader />;

  return (
    <div style={lay.page}>
      <Sidebar />
      <div style={lay.main}>
        <Navbar title="Dashboard" subtitle="Welcome back, Admin — real-time platform overview" />
        <div style={lay.content}>

          {/* KPI Grid */}
          <div style={lay.kpiGrid}>
            {KPI_CONFIG.map((k, i) => (
              <div key={i} onClick={() => navigate(k.path)} style={{ ...lay.kpiCard, background: k.gradient, border: `1px solid ${k.border}` }}>
                <div style={{ ...lay.kpiIconWrap, background: `${k.color}20`, border: `1px solid ${k.color}30` }}>
                  <span style={{ fontSize: 22 }}>{k.icon}</span>
                </div>
                <div style={lay.kpiInfo}>
                  <p style={{ ...lay.kpiValue, color: k.color }}>{k.value.toLocaleString()}</p>
                  <p style={lay.kpiLabel}>{k.label}</p>
                </div>
                <div style={{ ...lay.kpiArrow, color: k.color }}>→</div>
              </div>
            ))}
          </div>

          <div style={lay.row}>
            {/* Pending Approvals */}
            <div style={lay.card}>
              <div style={lay.cardHeader}>
                <div style={lay.cardTitleRow}>
                  <span style={lay.cardIcon}>⏳</span>
                  <h3 style={lay.cardTitle}>Pending Approvals</h3>
                </div>
                <div style={lay.countBadge}>{pending.length}</div>
              </div>

              {pending.length === 0 ? (
                <div style={lay.empty}>
                  <span style={lay.emptyIcon}>✅</span>
                  <p style={lay.emptyTitle}>All clear!</p>
                  <p style={lay.emptyText}>No restaurants awaiting approval.</p>
                </div>
              ) : (
                <div style={lay.pendingList}>
                  {pending.map(r => (
                    <div key={r.id} style={lay.pendingRow}>
                      <div style={lay.pendingLeft}>
                        {r.imageUrl
                          ? <img src={r.imageUrl} alt="" style={lay.pendingImg} />
                          : <div style={lay.pendingImgPH}><span style={{ fontSize: 20 }}>🍽️</span></div>
                        }
                        <div>
                          <p style={lay.pendingName}>{r.name}</p>
                          <p style={lay.pendingMeta}>{r.vegType?.replace('_', ' ')} · {r.city || 'N/A'}</p>
                          <p style={lay.pendingMeta}>GST: {r.gstNumber || 'Not provided'}</p>
                        </div>
                      </div>
                      <button onClick={() => approve(r.id)} style={lay.approveBtn}>
                        ✅ Approve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div style={lay.card}>
              <div style={lay.cardHeader}>
                <div style={lay.cardTitleRow}>
                  <span style={lay.cardIcon}>📦</span>
                  <h3 style={lay.cardTitle}>Recent Orders</h3>
                </div>
                <button onClick={() => navigate('/orders')} style={lay.viewAllBtn}>View All →</button>
              </div>

              <div style={lay.orderList}>
                {recent.length === 0
                  ? <p style={lay.emptyText}>No orders yet.</p>
                  : recent.map(o => {
                    const sc = STATUS_COLOR[o.status] || '#64748b';
                    return (
                      <div key={o.orderId} style={lay.orderRow}>
                        <div style={lay.orderLeft}>
                          <div style={{ ...lay.orderDot, background: sc }} />
                          <div>
                            <p style={lay.orderTitle}>#{o.orderId} · {o.restaurantName}</p>
                            <p style={lay.orderMeta}>{new Date(o.placedAt).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        <div style={lay.orderRight}>
                          <span style={{ ...lay.statusPill, background: sc + '20', color: sc, border: `1px solid ${sc}30` }}>
                            {o.status?.replace(/_/g, ' ')}
                          </span>
                          <p style={lay.orderAmt}>₹{o.totalAmount?.toFixed(0)}</p>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div style={lay.page}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(249,115,22,0.2)', borderTop: '3px solid #f97316', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>Loading dashboard...</p>
      </div>
    </div>
  );
}

const lay = {
  page: { display: 'flex', minHeight: '100vh', background: '#060818' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  content: { padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 24 },

  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 },
  kpiCard: {
    borderRadius: 18,
    padding: '20px 22px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative',
    overflow: 'hidden',
  },
  kpiIconWrap: { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  kpiInfo: { flex: 1 },
  kpiValue: { fontSize: 30, fontWeight: 900, lineHeight: 1, marginBottom: 5, letterSpacing: '-0.5px' },
  kpiLabel: { fontSize: 12, color: '#64748b', fontWeight: 600 },
  kpiArrow: { fontSize: 20, fontWeight: 700, opacity: 0.6 },

  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },

  card: {
    background: '#0d1117',
    borderRadius: 20,
    padding: '22px 24px',
    border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitleRow: { display: 'flex', alignItems: 'center', gap: 8 },
  cardIcon: { fontSize: 18 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#f1f5f9' },
  countBadge: {
    background: 'rgba(245,158,11,0.15)',
    color: '#f59e0b',
    border: '1px solid rgba(245,158,11,0.3)',
    borderRadius: 20,
    padding: '3px 12px',
    fontSize: 12,
    fontWeight: 700,
  },
  viewAllBtn: {
    background: 'rgba(249,115,22,0.1)',
    color: '#f97316',
    border: '1px solid rgba(249,115,22,0.2)',
    borderRadius: 8,
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
  },

  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: 6 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { color: '#f1f5f9', fontWeight: 700, fontSize: 15 },
  emptyText: { color: '#475569', fontSize: 13, textAlign: 'center' },

  pendingList: { display: 'flex', flexDirection: 'column', gap: 0 },
  pendingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  pendingLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  pendingImg: { width: 50, height: 44, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)' },
  pendingImgPH: {
    width: 50,
    height: 44,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  pendingName: { fontWeight: 700, fontSize: 13, color: '#f1f5f9', marginBottom: 3 },
  pendingMeta: { fontSize: 11, color: '#475569', lineHeight: 1.5 },
  approveBtn: {
    background: 'rgba(34,197,94,0.12)',
    color: '#22c55e',
    border: '1px solid rgba(34,197,94,0.25)',
    borderRadius: 10,
    padding: '8px 16px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 12,
    flexShrink: 0,
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s',
  },

  orderList: { display: 'flex', flexDirection: 'column', gap: 0 },
  orderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  orderLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  orderDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  orderTitle: { fontWeight: 600, fontSize: 13, color: '#f1f5f9', marginBottom: 2 },
  orderMeta: { fontSize: 11, color: '#475569' },
  orderRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 },
  statusPill: { padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' },
  orderAmt: { fontWeight: 800, fontSize: 14, color: '#f1f5f9' },
};
