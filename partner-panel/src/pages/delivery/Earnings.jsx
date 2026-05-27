import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

export default function Earnings() {
  const [earnings, setEarnings] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([API.get('/delivery/earnings'), API.get('/delivery/orders/my')])
      .then(([e, d]) => { setEarnings(e.data.data); setDeliveries(d.data.data || []); })
      .catch(err => {
        if (err.response?.status !== 404) setError('Could not load earnings data.');
      })
      .finally(() => setLoading(false));
  }, []);

  const completed = deliveries.filter(d => d.status === 'DELIVERED');
  const avgEarning = completed.length > 0 ? ((earnings?.totalEarnings || 0) / completed.length) : 0;

  if (loading) return (
    <div style={{ display: 'flex' }}><Sidebar />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, border: '4px solid #eee', borderTop: '4px solid #E23744', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    </div>
  );

  return (
    <div style={styles.pageWrap}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title="Earnings" />
        <div style={styles.content}>

          {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

          <div style={styles.earningGrid}>
            <div style={styles.mainCard}>
              <p style={styles.mainLabel}>Total Earnings</p>
              <p style={styles.mainValue}>₹{(earnings?.totalEarnings || 0).toFixed(0)}</p>
              <p style={styles.mainSub}>Lifetime earnings</p>
            </div>
            <div style={{ ...styles.mainCard, background: '#e3f2fd' }}>
              <p style={styles.mainLabel}>Today's Earnings</p>
              <p style={{ ...styles.mainValue, color: '#1565c0' }}>₹{(earnings?.todayEarnings || 0).toFixed(0)}</p>
              <p style={styles.mainSub}>Earned today</p>
            </div>
          </div>

          <div style={styles.statsRow}>
            {[
              { label: 'Total Deliveries', value: earnings?.totalDeliveries || 0, icon: '🛵' },
              { label: 'Avg Per Delivery', value: `₹${avgEarning.toFixed(0)}`, icon: '📊' },
              { label: 'My Rating', value: `${earnings?.rating || 0} ⭐`, icon: '⭐' },
            ].map((s, i) => (
              <div key={i} style={styles.statCard}>
                <span style={styles.statIcon}>{s.icon}</span>
                <p style={styles.statValue}>{s.value}</p>
                <p style={styles.statLabel}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>💳 How Payments Work</h3>
            <div style={styles.stepsGrid}>
              {[
                { step: '1', text: 'Customer pays total order amount online', icon: '💳' },
                { step: '2', text: 'Restaurant gets food amount minus platform commission', icon: '🍽️' },
                { step: '3', text: 'You earn the delivery fee for each completed delivery', icon: '🛵' },
                { step: '4', text: 'Your earnings are tracked and updated after each delivery', icon: '📈' },
              ].map(s => (
                <div key={s.step} style={styles.stepCard}>
                  <div style={styles.stepNum}>{s.step}</div>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  <p style={styles.stepText}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.recentCard}>
            <h3 style={styles.recentTitle}>Recent Earnings History</h3>
            {completed.length === 0 ? (
              <p style={styles.noData}>No deliveries completed yet.</p>
            ) : (
              completed.slice(0, 10).map(d => (
                <div key={d.orderId} style={styles.earningRow}>
                  <div style={styles.earningLeft}>
                    <span style={styles.earningIcon}>🛵</span>
                    <div>
                      <p style={styles.earningRestaurant}>{d.restaurantName}</p>
                      <p style={styles.earningDate}>{new Date(d.deliveredAt || d.placedAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <span style={styles.earningAmount}>+₹{d.deliveryFee?.toFixed(0)}</span>
                </div>
              ))
            )}
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
  earningGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  mainCard: { background: '#e8f5e9', borderRadius: 20, padding: 28 },
  mainLabel: { fontSize: 13, color: '#555', fontWeight: 600, marginBottom: 10 },
  mainValue: { fontSize: 44, fontWeight: 800, color: '#2e7d32', marginBottom: 6 },
  mainSub: { fontSize: 13, color: '#888' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  statCard: { background: '#fff', borderRadius: 16, padding: 20, textAlign: 'center' },
  statIcon: { fontSize: 28, display: 'block', marginBottom: 10 },
  statValue: { fontSize: 22, fontWeight: 800, color: '#1C1917', marginBottom: 6 },
  statLabel: { fontSize: 13, color: '#888' },
  infoCard: { background: '#fff', borderRadius: 20, padding: 24 },
  infoTitle: { fontSize: 17, fontWeight: 700, color: '#1C1917', marginBottom: 20 },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 },
  stepCard: { background: '#f9f9f9', borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 8 },
  stepNum: { width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #E23744, #FF6B35)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 },
  stepText: { fontSize: 13, color: '#555', lineHeight: 1.5 },
  recentCard: { background: '#fff', borderRadius: 20, padding: 24 },
  recentTitle: { fontSize: 17, fontWeight: 700, color: '#1C1917', marginBottom: 16 },
  noData: { color: '#888', fontSize: 14 },
  earningRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' },
  earningLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  earningIcon: { fontSize: 24 },
  earningRestaurant: { fontWeight: 600, fontSize: 14, color: '#1C1917', marginBottom: 3 },
  earningDate: { fontSize: 12, color: '#aaa' },
  earningAmount: { fontSize: 18, fontWeight: 800, color: '#4caf50' },
};
