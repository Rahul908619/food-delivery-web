import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import popup from '../../components/CustomToast';
import { useNavigate } from 'react-router-dom';

export default function OwnerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, ordersRes] = await Promise.all([
          API.get('/owner/analytics'),
          API.get('/owner/orders'),
        ]);
        setAnalytics(analyticsRes.data.data);
        setRecentOrders((ordersRes.data.data || []).slice(0, 5));
      } catch (err) {
        if (err.response?.status === 404) navigate('/owner/restaurant');
        else popup.error('Load Failed', 'Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const STATUS_COLOR = {
    PLACED: '#ff9800', ACCEPTED: '#2196f3', PREPARING: '#9c27b0',
    READY: '#00bcd4', OUT_FOR_DELIVERY: '#E23744', DELIVERED: '#4caf50',
    CANCELLED: '#f44336', REJECTED: '#f44336',
  };

  if (loading) return (
    <div style={styles.pageWrap}>
      <Sidebar />
      <div style={styles.main}><div style={styles.loader}><div style={styles.spinner} /></div></div>
    </div>
  );

  return (
    <div style={styles.pageWrap}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title="Dashboard" />
        <div style={styles.content}>

          {analytics && !analytics.isApproved && (
            <div style={styles.warningBanner}>⏳ Your restaurant is pending admin approval. You can set up your menu while you wait.</div>
          )}

          <div style={styles.statsGrid}>
            {[
              { label: 'Total Earnings', value: `₹${(analytics?.totalEarnings || 0).toFixed(0)}`, icon: '💰', color: '#4caf50', bg: '#e8f5e9' },
              { label: 'Completed Orders', value: analytics?.totalCompletedOrders || 0, icon: '✅', color: '#2196f3', bg: '#e3f2fd' },
              { label: 'Restaurant Rating', value: `${analytics?.restaurantRating || 0} ⭐`, icon: '⭐', color: '#ff9800', bg: '#fff3e0' },
              { label: 'Total Reviews', value: analytics?.totalReviews || 0, icon: '💬', color: '#9c27b0', bg: '#f3e5f5' },
            ].map((stat, i) => (
              <div key={i} style={{ ...styles.statCard, background: stat.bg }}>
                <div style={styles.statIcon}>{stat.icon}</div>
                <div>
                  <p style={{ ...styles.statValue, color: stat.color }}>{stat.value}</p>
                  <p style={styles.statLabel}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {analytics && (
            <div style={styles.statusRow}>
              <div style={styles.statusCard}>
                <p style={styles.statusLabel}>Restaurant Status</p>
                <span style={{ ...styles.statusBadge, background: analytics.isOpen ? '#e8f5e9' : '#fce4ec', color: analytics.isOpen ? '#2e7d32' : '#c62828' }}>
                  {analytics.isOpen ? '🟢 Open' : '🔴 Closed'}
                </span>
              </div>
              <div style={styles.statusCard}>
                <p style={styles.statusLabel}>Approval Status</p>
                <span style={{ ...styles.statusBadge, background: analytics.isApproved ? '#e8f5e9' : '#fff3e0', color: analytics.isApproved ? '#2e7d32' : '#e65100' }}>
                  {analytics.isApproved ? '✅ Approved' : '⏳ Pending'}
                </span>
              </div>
            </div>
          )}

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Recent Orders</h3>
              <button onClick={() => navigate('/owner/orders')} style={styles.viewAllBtn}>View All →</button>
            </div>
            {recentOrders.length === 0 ? (
              <div style={styles.empty}>
                <p style={styles.emptyIcon}>📦</p>
                <p style={styles.emptyText}>No orders yet. Share your restaurant with customers!</p>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>{['Order ID', 'Items', 'Amount', 'Status', 'Time'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.orderId} style={styles.tr}>
                      <td style={styles.td}>#{order.orderId}</td>
                      <td style={styles.td}>{order.items?.length || 0} items</td>
                      <td style={styles.td}>₹{order.totalAmount?.toFixed(0)}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusPill, background: STATUS_COLOR[order.status] + '20', color: STATUS_COLOR[order.status] }}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={styles.td}>{new Date(order.placedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrap: { display: 'flex', minHeight: '100vh', background: '#f4f6f9' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  content: { padding: 28, display: 'flex', flexDirection: 'column', gap: 24 },
  loader: { display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 },
  spinner: { width: 44, height: 44, border: '4px solid #eee', borderTop: '4px solid #E23744', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  warningBanner: { background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 12, padding: '14px 20px', color: '#856404', fontWeight: 500, fontSize: 14 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  statCard: { borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16 },
  statIcon: { fontSize: 32 },
  statValue: { fontSize: 24, fontWeight: 800, marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#666' },
  statusRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  statusCard: { background: '#fff', borderRadius: 16, padding: 20 },
  statusLabel: { fontSize: 13, color: '#888', marginBottom: 10 },
  statusBadge: { padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700 },
  card: { background: '#fff', borderRadius: 20, padding: 24 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 17, fontWeight: 700, color: '#1C1917' },
  viewAllBtn: { background: '#FFF1F2', color: '#E23744', border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#888', borderBottom: '2px solid #f5f5f5', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f9f9f9' },
  td: { padding: '12px 12px', fontSize: 14, color: '#333' },
  statusPill: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  empty: { textAlign: 'center', padding: '40px 20px' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#888', fontSize: 14 },
};
