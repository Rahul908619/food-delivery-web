import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import popup from '../components/CustomToast';

const STATUS_COLORS = {
  PLACED: '#ff9800', ACCEPTED: '#2196f3', PREPARING: '#9c27b0',
  READY: '#00bcd4', OUT_FOR_DELIVERY: '#fc5c04', DELIVERED: '#4caf50',
  CANCELLED: '#f44336', REJECTED: '#f44336',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewedOrderIds, setReviewedOrderIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/customer/orders')
      .then(res => setOrders(res.data.data || []))
      .catch(() => popup.error('Load Failed', 'Could not load your orders. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const openReview = (order) => {
    setReviewForm(order);
    setRating(5);
    setComment('');
    setReviewError('');
  };

  const closeReview = () => {
    setReviewForm(null);
    setRating(5);
    setComment('');
    setReviewError('');
    setReviewSubmitting(false);
  };

  const submitReview = async (restaurantId, orderId) => {
    const trimmedComment = comment.trim();

    if (rating < 1 || rating > 5) {
      setReviewError('Please select a valid rating.');
      return;
    }

    if (trimmedComment.length > 300) {
      setReviewError('Review must be 300 characters or fewer.');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');

    try {
      await API.post('/customer/review', { restaurantId, orderId, rating, comment: trimmedComment });
      setReviewedOrderIds(prev => (prev.includes(orderId) ? prev : [...prev, orderId]));
      popup.success('Review Submitted', 'Thanks for sharing your feedback.');
      closeReview();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit review. Please try again.';
      setReviewError(message);
      popup.error('Review Failed', message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}>Loading orders...</div>;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.title}>My Orders</h2>
        {orders.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: 48 }}>📦</p>
            <p style={{ color: '#888', fontSize: 16 }}>No orders yet</p>
            <button onClick={() => navigate('/')} style={styles.browseBtn}>Order Now</button>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.orderId} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <h3 style={styles.restaurantName}>{order.restaurantName}</h3>
                  <p style={styles.orderId}>Order #{order.orderId}</p>
                  <p style={styles.orderDate}>{new Date(order.placedAt).toLocaleString('en-IN')}</p>
                </div>
                <span style={{ ...styles.statusBadge, background: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status] }}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div style={styles.itemsList}>
                {order.items?.slice(0, 3).map((item, i) => (
                  <span key={i} style={styles.itemChip}>
                    {item.veg ? '🟢' : '🔴'} {item.itemName} ×{item.quantity}
                  </span>
                ))}
                {order.items?.length > 3 && <span style={styles.moreItems}>+{order.items.length - 3} more</span>}
              </div>

              <div style={styles.orderFooter}>
                <span style={styles.totalAmt}>₹{order.totalAmount?.toFixed(0)}</span>
                <div style={styles.actions}>
                  {['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(order.status) && (
                    <button onClick={() => navigate(`/order/${order.orderId}/track`)} style={styles.trackBtn}>
                      Track Order
                    </button>
                  )}
                  {order.status === 'DELIVERED' && !reviewedOrderIds.includes(order.orderId) && (
                    <button onClick={() => openReview(order)} style={styles.reviewBtn}>
                      Rate Restaurant
                    </button>
                  )}
                </div>
              </div>

              {/* Review Form */}
              {reviewForm?.orderId === order.orderId && (
                <div style={styles.reviewForm}>
                  <h4 style={{ marginBottom: 12 }}>Rate {order.restaurantName}</h4>
                  <div style={styles.starsRow}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setRating(s)} style={{ ...styles.starBtn, color: s <= rating ? '#fc5c04' : '#ddd' }}>
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={e => {
                      setComment(e.target.value);
                      if (reviewError) setReviewError('');
                    }}
                    style={styles.commentBox}
                    rows={3}
                  />
                  <div style={styles.reviewMetaRow}>
                    <span style={styles.reviewHint}>Comment optional. Max 300 characters.</span>
                    <span style={styles.reviewCount}>{comment.length}/300</span>
                  </div>
                  {reviewError && <p style={styles.reviewError}>{reviewError}</p>}
                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button
                      onClick={() => submitReview(order.restaurantId, order.orderId)}
                      disabled={reviewSubmitting}
                      style={{ ...styles.submitReviewBtn, opacity: reviewSubmitting ? 0.7 : 1, cursor: reviewSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button onClick={closeReview} disabled={reviewSubmitting} style={styles.cancelBtn}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 700, margin: '0 auto', padding: '24px 16px 40px' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 20 },
  empty: { textAlign: 'center', padding: 60 },
  browseBtn: { background: '#fc5c04', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 16 },
  orderCard: { background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  restaurantName: { fontSize: 17, fontWeight: 700, marginBottom: 4 },
  orderId: { fontSize: 13, color: '#aaa', marginBottom: 2 },
  orderDate: { fontSize: 13, color: '#aaa' },
  statusBadge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  itemsList: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  itemChip: { background: '#f5f5f5', borderRadius: 20, padding: '4px 12px', fontSize: 13, color: '#555' },
  moreItems: { color: '#aaa', fontSize: 13, alignSelf: 'center' },
  orderFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalAmt: { fontSize: 18, fontWeight: 800, color: '#222' },
  actions: { display: 'flex', gap: 10 },
  trackBtn: { background: '#fff', border: '1.5px solid #fc5c04', color: '#fc5c04', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 },
  reviewBtn: { background: '#fc5c04', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 },
  reviewForm: { marginTop: 16, padding: 16, background: '#fafafa', borderRadius: 12 },
  starsRow: { display: 'flex', gap: 8, marginBottom: 12 },
  starBtn: { background: 'none', border: 'none', fontSize: 32, cursor: 'pointer', padding: 0 },
  commentBox: { width: '100%', padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' },
  reviewMetaRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  reviewHint: { fontSize: 12, color: '#888' },
  reviewCount: { fontSize: 12, color: '#888', fontWeight: 600 },
  reviewError: { fontSize: 12, color: '#EF4444', marginTop: 8, fontWeight: 600 },
  submitReviewBtn: { background: '#fc5c04', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' },
  cancelBtn: { background: '#fff', border: '1.5px solid #ddd', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', color: '#666' },
};
