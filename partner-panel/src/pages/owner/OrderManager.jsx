import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import popup from '../../components/CustomToast';

const STATUS_CONFIG = {
  PLACED: { color: '#ff9800', bg: '#fff3e0', label: 'New Order' },
  ACCEPTED: { color: '#2196f3', bg: '#e3f2fd', label: 'Accepted' },
  PREPARING: { color: '#9c27b0', bg: '#f3e5f5', label: 'Preparing' },
  READY: { color: '#00bcd4', bg: '#e0f7fa', label: 'Ready' },
  OUT_FOR_DELIVERY: { color: '#E23744', bg: '#FFF1F2', label: 'Out for Delivery' },
  DELIVERED: { color: '#4caf50', bg: '#e8f5e9', label: 'Delivered' },
  CANCELLED: { color: '#f44336', bg: '#fce4ec', label: 'Cancelled' },
  REJECTED: { color: '#f44336', bg: '#fce4ec', label: 'Rejected' },
};

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const load = async () => {
    try { const res = await API.get('/owner/orders'); setOrders(res.data.data || []); }
    catch { popup.error('Load Failed', 'Could not load orders.'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, action) => {
    try {
      await API.put(`/owner/order/${orderId}/${action}`);
      const messages = {
        accept: ['Order Accepted', `Order #${orderId} is now accepted.`],
        reject: ['Order Rejected', `Order #${orderId} has been rejected.`],
        preparing: ['Preparing Started', `Order #${orderId} is now being prepared.`],
        ready: ['Order Ready', `Order #${orderId} is ready for pickup.`],
      };
      const [title, message] = messages[action] || ['Order Updated', `Order #${orderId} status has been updated.`];
      popup.success(title, message);
      load();
    }
    catch (err) { popup.error('Update Failed', err.response?.data?.message || 'Could not update order status.'); }
  };

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);
  const FILTERS = ['ALL', 'PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'REJECTED'];

  return (
    <div style={styles.pageWrap}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title="Order Management" />
        <div style={styles.content}>

          <div style={styles.statsRow}>
            {[
              { label: 'New Orders', count: orders.filter(o => o.status === 'PLACED').length, color: '#ff9800' },
              { label: 'Preparing', count: orders.filter(o => o.status === 'PREPARING').length, color: '#9c27b0' },
              { label: 'Ready', count: orders.filter(o => o.status === 'READY').length, color: '#00bcd4' },
              { label: 'Delivered Today', count: orders.filter(o => o.status === 'DELIVERED').length, color: '#4caf50' },
            ].map((s, i) => (
              <div key={i} style={styles.statCard}>
                <span style={{ ...styles.statNum, color: s.color }}>{s.count}</span>
                <span style={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          <div style={styles.filterRow}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}>
                {f.replace('_', ' ')}
                {f !== 'ALL' && <span style={styles.filterCount}>{orders.filter(o => o.status === f).length}</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={styles.loading}><div style={styles.spinner} /></div>
          ) : filtered.length === 0 ? (
            <div style={styles.empty}><p style={{ fontSize: 48 }}>📦</p><p style={styles.emptyText}>No orders in this category</p></div>
          ) : (
            <div style={styles.ordersList}>
              {filtered.map(order => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PLACED;
                const isExpanded = expanded === order.orderId;
                return (
                  <div key={order.orderId} style={styles.orderCard}>
                    <div style={styles.orderHeader} onClick={() => setExpanded(isExpanded ? null : order.orderId)}>
                      <div style={styles.orderLeft}>
                        <span style={{ ...styles.statusBadge, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        <div>
                          <p style={styles.orderId}>Order #{order.orderId}</p>
                          <p style={styles.orderTime}>{new Date(order.placedAt).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      <div style={styles.orderRight}>
                        <p style={styles.orderAmount}>₹{order.totalAmount?.toFixed(0)}</p>
                        <p style={styles.orderItems}>{order.items?.length} items</p>
                        <span style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={styles.orderDetails}>
                        <div style={styles.itemsList}>
                          {order.items?.map((item, i) => (
                            <div key={i} style={styles.itemRow}>
                              <span>{item.veg ? '🟢' : '🔴'} {item.itemName}</span>
                              <span>×{item.quantity}</span>
                              <span>₹{(item.priceAtOrder * item.quantity).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                        <div style={styles.billSection}>
                          <div style={styles.billRow}><span>Food Amount</span><span>₹{order.foodAmount?.toFixed(0)}</span></div>
                          <div style={styles.billRow}><span>Delivery Fee</span><span>₹{order.deliveryFee?.toFixed(0)}</span></div>
                          <div style={styles.billRow}><span>Admin Commission (10%)</span><span style={{ color: '#f44336' }}>-₹{order.adminCommission?.toFixed(0)}</span></div>
                          <div style={{ ...styles.billRow, fontWeight: 700, color: '#4caf50' }}><span>Your Earning</span><span>₹{order.restaurantEarning?.toFixed(0)}</span></div>
                        </div>
                        <p style={styles.address}>📍 {order.deliveryAddressLine}</p>
                        {order.deliveryPartnerName && <p style={styles.dpInfo}>🛵 Partner: {order.deliveryPartnerName} • {order.deliveryPartnerPhone}</p>}
                        <div style={styles.actionBtns}>
                          {order.status === 'PLACED' && (<><button onClick={() => updateStatus(order.orderId, 'accept')} style={styles.acceptBtn}>✅ Accept</button><button onClick={() => updateStatus(order.orderId, 'reject')} style={styles.rejectBtn}>✕ Reject</button></>)}
                          {order.status === 'ACCEPTED' && <button onClick={() => updateStatus(order.orderId, 'preparing')} style={styles.prepareBtn}>👨‍🍳 Mark Preparing</button>}
                          {order.status === 'PREPARING' && <button onClick={() => updateStatus(order.orderId, 'ready')} style={styles.readyBtn}>📦 Mark Ready</button>}
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

const styles = {
  pageWrap: { display: 'flex', minHeight: '100vh', background: '#f4f6f9' },
  main: { flex: 1, overflow: 'auto' },
  content: { padding: 28, display: 'flex', flexDirection: 'column', gap: 20 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  statCard: { background: '#fff', borderRadius: 16, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 },
  statNum: { fontSize: 28, fontWeight: 800 },
  statLabel: { fontSize: 13, color: '#888' },
  filterRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  filterBtn: { padding: '8px 16px', borderRadius: 20, border: '1.5px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#555', display: 'flex', alignItems: 'center', gap: 6 },
  filterActive: { background: '#1C1917', color: '#fff', borderColor: '#1C1917' },
  filterCount: { background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '1px 7px', fontSize: 11 },
  loading: { display: 'flex', justifyContent: 'center', padding: 60 },
  spinner: { width: 44, height: 44, border: '4px solid #eee', borderTop: '4px solid #E23744', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  empty: { background: '#fff', borderRadius: 20, padding: '60px 20px', textAlign: 'center' },
  emptyText: { color: '#888', marginTop: 12, fontSize: 15 },
  ordersList: { display: 'flex', flexDirection: 'column', gap: 12 },
  orderCard: { background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #f0f0f0' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer' },
  orderLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  statusBadge: { padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  orderId: { fontWeight: 700, fontSize: 15, color: '#1C1917' },
  orderTime: { fontSize: 12, color: '#aaa', marginTop: 2 },
  orderRight: { display: 'flex', alignItems: 'center', gap: 16 },
  orderAmount: { fontSize: 17, fontWeight: 800, color: '#1C1917' },
  orderItems: { fontSize: 13, color: '#888' },
  expandIcon: { color: '#aaa', fontSize: 12 },
  orderDetails: { borderTop: '1px solid #f5f5f5', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 },
  itemsList: { display: 'flex', flexDirection: 'column', gap: 8 },
  itemRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#333', padding: '4px 0' },
  billSection: { background: '#f9f9f9', borderRadius: 10, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 },
  billRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555' },
  address: { fontSize: 13, color: '#555' },
  dpInfo: { fontSize: 13, color: '#2196f3', fontWeight: 500 },
  actionBtns: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  acceptBtn: { padding: '10px 20px', background: '#e8f5e9', color: '#2e7d32', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  rejectBtn: { padding: '10px 20px', background: '#fce4ec', color: '#c62828', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  prepareBtn: { padding: '10px 20px', background: '#f3e5f5', color: '#7b1fa2', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  readyBtn: { padding: '10px 20px', background: '#e0f7fa', color: '#006064', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 },
};
