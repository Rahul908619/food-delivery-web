import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get('/owner/reviews')
      .then(res => setReviews(res.data.data || []))
      .catch(err => {
        if (err.response?.status !== 404) setError('Could not load reviews');
      })
      .finally(() => setLoading(false));
  }, []);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({ star, count: reviews.filter(r => r.rating === star).length }));

  return (
    <div style={styles.pageWrap}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title="Customer Reviews" />
        <div style={styles.content}>

          {error && (
            <div style={styles.errorBanner}>⚠️ {error}. Make sure your backend is running on port 8082.</div>
          )}

          <div style={styles.summaryCard}>
            <div style={styles.ratingBig}>
              <span style={styles.ratingNum}>{avgRating}</span>
              <div>
                <div style={styles.stars}>{'⭐'.repeat(Math.round(Number(avgRating)))}</div>
                <p style={styles.ratingTotal}>{reviews.length} total reviews</p>
              </div>
            </div>
            <div style={styles.ratingBars}>
              {ratingDist.map(({ star, count }) => (
                <div key={star} style={styles.ratingBarRow}>
                  <span style={styles.ratingBarLabel}>{star} ⭐</span>
                  <div style={styles.ratingBarTrack}><div style={{ ...styles.ratingBarFill, width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }} /></div>
                  <span style={styles.ratingBarCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={styles.loading}><div style={styles.spinner} /></div>
          ) : reviews.length === 0 ? (
            <div style={styles.empty}><p style={{ fontSize: 48 }}>⭐</p><p style={styles.emptyText}>No reviews yet. Keep delivering great food!</p></div>
          ) : (
            <div style={styles.reviewsList}>
              {reviews.map(review => (
                <div key={review.id} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <div style={styles.avatar}>
                      {review.userImage ? <img src={review.userImage} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : review.userName?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={styles.reviewName}>{review.userName}</p>
                      <div style={styles.reviewStars}>{'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                    </div>
                    <span style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  {review.comment && <p style={styles.reviewComment}>"{review.comment}"</p>}
                </div>
              ))}
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
  errorBanner: { background: '#FFF1F2', border: '1.5px solid #E23744', borderRadius: 12, padding: '12px 18px', color: '#c62828', fontSize: 14, fontWeight: 500 },
  summaryCard: { background: '#fff', borderRadius: 20, padding: 28, display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' },
  ratingBig: { display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 },
  ratingNum: { fontSize: 64, fontWeight: 800, color: '#1C1917', lineHeight: 1 },
  stars: { fontSize: 20, marginBottom: 6 },
  ratingTotal: { color: '#888', fontSize: 14 },
  ratingBars: { flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 },
  ratingBarRow: { display: 'flex', alignItems: 'center', gap: 12 },
  ratingBarLabel: { width: 40, fontSize: 13, color: '#555', flexShrink: 0 },
  ratingBarTrack: { flex: 1, height: 8, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' },
  ratingBarFill: { height: '100%', background: '#ff9800', borderRadius: 4, transition: 'width 0.6s ease' },
  ratingBarCount: { width: 28, textAlign: 'right', fontSize: 13, color: '#888' },
  loading: { display: 'flex', justifyContent: 'center', padding: 60 },
  spinner: { width: 44, height: 44, border: '4px solid #eee', borderTop: '4px solid #E23744', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  empty: { background: '#fff', borderRadius: 20, padding: '60px 20px', textAlign: 'center' },
  emptyText: { color: '#888', marginTop: 12, fontSize: 15 },
  reviewsList: { display: 'flex', flexDirection: 'column', gap: 14 },
  reviewCard: { background: '#fff', borderRadius: 16, padding: 20 },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 },
  avatar: { width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #E23744, #FF6B35)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, overflow: 'hidden', flexShrink: 0 },
  reviewName: { fontWeight: 700, fontSize: 15, color: '#1C1917', marginBottom: 4 },
  reviewStars: { fontSize: 14 },
  reviewDate: { color: '#aaa', fontSize: 12, flexShrink: 0 },
  reviewComment: { color: '#555', fontSize: 14, lineHeight: 1.7, fontStyle: 'italic', paddingLeft: 60 },
};
