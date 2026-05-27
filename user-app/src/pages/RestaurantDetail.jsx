import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import MenuItemCard from '../components/MenuItemCard';
import popup from '../components/CustomToast';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('menu');

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, mRes, revRes] = await Promise.all([
          API.get(`/customer/restaurant/${id}`),
          API.get(`/customer/restaurant/${id}/menu`),
          API.get(`/customer/restaurant/${id}/reviews`),
        ]);
        setRestaurant(rRes.data.data);
        setMenu(mRes.data.data || []);
        setReviews(revRes.data.data || []);
      } catch {
        popup.error('Load Failed', 'Could not load restaurant details.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleAdd = async (itemId) => {
    const newQty = (cart[itemId] || 0) + 1;
    setCart(prev => ({ ...prev, [itemId]: newQty }));
    try {
      await API.post('/customer/cart/add', { menuItemId: itemId, quantity: newQty });
    } catch (err) {
      popup.error('Cart Error', err.response?.data?.message || 'Could not add item to cart.');
      setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 1) - 1 }));
    }
  };

  const handleRemove = async (itemId) => {
    const newQty = Math.max((cart[itemId] || 0) - 1, 0);
    setCart(prev => ({ ...prev, [itemId]: newQty }));
    try {
      await API.post('/customer/cart/add', { menuItemId: itemId, quantity: newQty });
    } catch {
      popup.error('Cart Error', 'Could not update cart.');
    }
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  // Group menu by category
  const categories = [...new Set(menu.map(i => i.category || 'Other'))];

  if (loading) return (
    <div style={styles.loading}>
      <div style={styles.spinner} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!restaurant) return null;

  const vegInfo = {
    PURE_VEG: { label: '🟢 Pure Veg', color: '#2e7d32', bg: '#e8f5e9' },
    NON_VEG: { label: '🔴 Non-Veg', color: '#c62828', bg: '#fce4ec' },
    BOTH: { label: '🟡 Veg & Non-Veg', color: '#e65100', bg: '#fff3e0' },
  }[restaurant.vegType] || {};

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <Navbar />

      {/* Restaurant Header */}
      <div style={styles.header}>
        <img
          src={restaurant.imageUrl || 'https://via.placeholder.com/1200x300?text=Restaurant'}
          alt={restaurant.name}
          style={styles.headerImg}
        />
        <div style={styles.headerOverlay} />
        <div style={styles.headerContent}>
          <span style={{ ...styles.vegTag, background: vegInfo.bg, color: vegInfo.color }}>{vegInfo.label}</span>
          <h1 style={styles.restaurantName}>{restaurant.name}</h1>
          <p style={styles.cuisine}>{restaurant.cuisineType}</p>
          <div style={styles.metaRow}>
            <span>⭐ {restaurant.rating?.toFixed(1)} ({restaurant.totalReviews} reviews)</span>
            <span>🕐 {restaurant.estimatedMinutes} min</span>
            <span>📍 {restaurant.distanceKm?.toFixed(1)} km</span>
            <span>{restaurant.deliveryFee === 0 ? '🚀 Free Delivery' : `🛵 ₹${restaurant.deliveryFee} delivery`}</span>
            <span style={{ color: restaurant.open ? '#4caf50' : '#f44336', fontWeight: 700 }}>
              {restaurant.open ? '🟢 Open' : '🔴 Closed'}
            </span>
          </div>
          {restaurant.description && <p style={styles.desc}>{restaurant.description}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['menu', 'reviews'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
            {t === 'menu' ? '🍽️ Menu' : `⭐ Reviews (${reviews.length})`}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {tab === 'menu' && (
          <div style={styles.menuWrap}>
            {!restaurant.open && (
              <div style={styles.closedBanner}>⚠️ This restaurant is currently closed. Orders are not being accepted.</div>
            )}
            {categories.map(cat => {
              const items = menu.filter(i => (i.category || 'Other') === cat);
              return (
                <div key={cat} style={styles.catSection}>
                  <h3 style={styles.catTitle}>{cat} ({items.length})</h3>
                  {items.map(item => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      quantity={cart[item.id] || 0}
                      onAdd={() => handleAdd(item.id)}
                      onRemove={() => handleRemove(item.id)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'reviews' && (
          <div style={styles.reviewsWrap}>
            {reviews.length === 0 ? (
              <p style={styles.noReviews}>No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map(r => (
                <div key={r.id} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <div style={styles.reviewAvatar}>{r.userName?.[0]?.toUpperCase()}</div>
                    <div>
                      <p style={styles.reviewName}>{r.userName}</p>
                      <div style={styles.stars}>
                        {'⭐'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </div>
                    </div>
                    <span style={styles.reviewDate}>
                      {new Date(r.createdAt).toLocaleDateString('hi-IN')}
                    </span>
                  </div>
                  {r.comment && <p style={styles.reviewComment}>{r.comment}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Sticky Cart Button */}
      {totalItems > 0 && (
        <div style={styles.cartBar} onClick={() => navigate('/cart')}>
          <div style={styles.cartLeft}>
            <span style={styles.cartCount}>{totalItems}</span>
            <span>items added</span>
          </div>
          <span>View Cart →</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  spinner: { width: 44, height: 44, border: '4px solid #eee', borderTop: '4px solid #fc5c04', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  header: { position: 'relative', height: 220 },
  headerImg: { width: '100%', height: '100%', objectFit: 'cover' },
  headerOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1))' },
  headerContent: { position: 'absolute', bottom: 16, left: 20, right: 20, color: '#fff' },
  vegTag: { fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginBottom: 8, display: 'inline-block' },
  restaurantName: { fontSize: 24, fontWeight: 800, marginBottom: 4 },
  cuisine: { fontSize: 14, opacity: 0.85, marginBottom: 8 },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13 },
  desc: { fontSize: 13, opacity: 0.8, marginTop: 8 },
  tabs: { display: 'flex', background: '#fff', borderBottom: '1px solid #eee' },
  tab: { flex: 1, padding: '14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 500, color: '#888' },
  tabActive: { color: '#fc5c04', borderBottom: '3px solid #fc5c04' },
  content: { maxWidth: 800, margin: '0 auto', padding: '0 0 100px' },
  menuWrap: { background: '#fff' },
  closedBanner: { background: '#fff3cd', padding: 16, textAlign: 'center', fontWeight: 600, color: '#856404' },
  catSection: { padding: '0 20px' },
  catTitle: { fontSize: 16, fontWeight: 700, color: '#333', padding: '16px 0 8px', borderBottom: '2px solid #fc5c04', display: 'inline-block' },
  reviewsWrap: { padding: 20 },
  noReviews: { textAlign: 'center', color: '#888', padding: 40 },
  reviewCard: { background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  reviewAvatar: { width: 40, height: 40, borderRadius: '50%', background: '#fc5c04', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 },
  reviewName: { fontWeight: 600, marginBottom: 2 },
  stars: { fontSize: 14 },
  reviewDate: { marginLeft: 'auto', fontSize: 12, color: '#aaa' },
  reviewComment: { fontSize: 14, color: '#555', lineHeight: 1.6 },
  cartBar: { position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#fc5c04', color: '#fff', padding: '14px 28px', borderRadius: 30, display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer', boxShadow: '0 4px 20px rgba(252,92,4,0.4)', zIndex: 100, fontWeight: 700, fontSize: 15 },
  cartLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  cartCount: { background: 'rgba(255,255,255,0.3)', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 },
};
