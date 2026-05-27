import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([API.get('/owner/analytics'), API.get('/owner/orders')])
      .then(([a, o]) => { setData(a.data.data); setOrders(o.data.data || []); })
      .catch(err => {
        if (err.response?.status !== 404) setError('Could not load analytics. Check backend.');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex' }}><Sidebar />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, border: '4px solid #eee', borderTop: '4px solid #E23744', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    </div>
  );

  const totalRevenue = orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + (o.foodAmount || 0), 0);
  const adminCut = orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + (o.adminCommission || 0), 0);
  const totalDeliveryFee = orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + (o.deliveryFee || 0), 0);
  const cancelled = orders.filter(o => o.status === 'CANCELLED' || o.status === 'REJECTED').length;

  return (
    <div style={styles.pageWrap}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title="Analytics & Reports" />
        <div style={styles.content}>

          {error && (
            <div style={styles.errorBanner}>⚠️ {error}</div>
          )}

          {!data && !error && (
            <div style={styles.noRestaurantBanner}>🍽️ Register your restaurant first to see analytics.</div>
          )}

          <div style={styles.statsGrid}>
            {[
              { label: 'Total Earnings (Net)', value: `₹${(data?.totalEarnings || 0).toFixed(0)}`, icon: '💰', color: '#4caf50', bg: '#e8f5e9', note: 'After admin commission' },
              { label: 'Gross Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: '📈', color: '#2196f3', bg: '#e3f2fd', note: 'Total food sales' },
              { label: 'Admin Commission', value: `₹${adminCut.toFixed(0)}`, icon: '🏢', color: '#f44336', bg: '#fce4ec', note: '10% platform fee' },
              { label: 'Delivery Fees', value: `₹${totalDeliveryFee.toFixed(0)}`, icon: '🛵', color: '#ff9800', bg: '#fff3e0', note: 'Paid to delivery partners' },
              { label: 'Completed Orders', value: data?.totalCompletedOrders || 0, icon: '✅', color: '#4caf50', bg: '#e8f5e9', note: 'Successfully delivered' },
              { label: 'Cancelled / Rejected', value: cancelled, icon: '❌', color: '#f44336', bg: '#fce4ec', note: 'Lost orders' },
              { label: 'Restaurant Rating', value: `${data?.restaurantRating || 0} / 5`, icon: '⭐', color: '#ff9800', bg: '#fff3e0', note: `${data?.totalReviews || 0} total reviews` },
              { label: 'Avg Order Value', value: `₹${data?.totalCompletedOrders ? (totalRevenue / data.totalCompletedOrders).toFixed(0) : 0}`, icon: '🧮', color: '#9c27b0', bg: '#f3e5f5', note: 'Per delivered order' },
            ].map((stat, i) => (
              <div key={i} style={{ ...styles.statCard, background: stat.bg }}>
                <div style={styles.statTop}>
                  <span style={styles.statIcon}>{stat.icon}</span>
                  <span style={{ ...styles.statValue, color: stat.color }}>{stat.value}</span>
                </div>
                <p style={styles.statLabel}>{stat.label}</p>
                <p style={styles.statNote}>{stat.note}</p>
              </div>
            ))}
          </div>

          {orders.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Order Status Breakdown</h3>
              <div style={styles.breakdownGrid}>
                {Object.entries(orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {})).map(([status, count]) => (
                  <div key={status} style={styles.breakdownItem}>
                    <span style={styles.breakdownStatus}>{status.replace(/_/g, ' ')}</span>
                    <div style={styles.barWrap}>
                      <div style={{ ...styles.bar, width: `${Math.min((count / orders.length) * 100, 100)}%`, background: status === 'DELIVERED' ? '#4caf50' : status.includes('CANCEL') || status.includes('REJECT') ? '#f44336' : '#E23744' }} />
                    </div>
                    <span style={styles.breakdownCount}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.gstCard}>
            <h3 style={styles.cardTitle}>GST & Tax Information</h3>
            <div style={styles.gstGrid}>
              <div style={styles.gstItem}><p style={styles.gstLabel}>Taxable Revenue (Net)</p><p style={styles.gstValue}>₹{(data?.totalEarnings || 0).toFixed(2)}</p></div>
              <div style={styles.gstItem}><p style={styles.gstLabel}>Estimated GST (5%)</p><p style={{ ...styles.gstValue, color: '#f44336' }}>₹{((data?.totalEarnings || 0) * 0.05).toFixed(2)}</p></div>
              <div style={styles.gstItem}><p style={styles.gstLabel}>Net After GST</p><p style={{ ...styles.gstValue, color: '#4caf50' }}>₹{((data?.totalEarnings || 0) * 0.95).toFixed(2)}</p></div>
            </div>
            <p style={styles.gstNote}>* GST rates may vary. Consult a CA for accurate tax filing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrap: { display: 'flex', minHeight: '100vh', background: '#f4f6f9' },
  main: { flex: 1, overflow: 'auto' },
  content: { padding: 28, display: 'flex', flexDirection: 'column', gap: 20 },
  errorBanner: { background: '#FFF1F2', border: '1.5px solid #E23744', borderRadius: 12, padding: '12px 18px', color: '#c62828', fontSize: 14, fontWeight: 500 },
  noRestaurantBanner: { background: '#fff3e0', border: '1px solid #ff9800', borderRadius: 12, padding: '12px 18px', color: '#e65100', fontSize: 14, fontWeight: 500 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  statCard: { borderRadius: 16, padding: 20 },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statIcon: { fontSize: 24 },
  statValue: { fontSize: 22, fontWeight: 800 },
  statLabel: { fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 4 },
  statNote: { fontSize: 12, color: '#888' },
  card: { background: '#fff', borderRadius: 20, padding: 24 },
  gstCard: { background: '#fff', borderRadius: 20, padding: 24 },
  cardTitle: { fontSize: 17, fontWeight: 700, color: '#1C1917', marginBottom: 20 },
  breakdownGrid: { display: 'flex', flexDirection: 'column', gap: 12 },
  breakdownItem: { display: 'flex', alignItems: 'center', gap: 16 },
  breakdownStatus: { width: 160, fontSize: 13, fontWeight: 500, color: '#555', flexShrink: 0 },
  barWrap: { flex: 1, background: '#f5f5f5', borderRadius: 4, height: 10, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 4 },
  breakdownCount: { width: 40, textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#333' },
  gstGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 12 },
  gstItem: { background: '#f9f9f9', borderRadius: 12, padding: 16 },
  gstLabel: { fontSize: 12, color: '#888', marginBottom: 8 },
  gstValue: { fontSize: 20, fontWeight: 800, color: '#1C1917' },
  gstNote: { fontSize: 12, color: '#aaa', fontStyle: 'italic' },
};
