import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const vegColor = {
    PURE_VEG: { bg: '#ECFDF5', color: '#059669', label: '🟢 Pure Veg' },
    NON_VEG: { bg: '#FFF1F2', color: '#E23744', label: '🔴 Non-Veg' },
    BOTH: { bg: '#FFF7ED', color: '#EA580C', label: '🟡 Veg & Non-Veg' },
  };
  const vegInfo = vegColor[restaurant.vegType] || vegColor.BOTH;

  return (
    <div
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.card,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.15)' : '0 2px 12px rgba(0,0,0,0.07)',
      }}
    >
      {/* Image */}
      <div style={styles.imgWrap}>
        <img
          src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=200&fit=crop'}
          alt={restaurant.name}
          style={styles.img}
        />
        {!restaurant.open && (
          <div style={styles.closedOverlay}>
            <span style={styles.closedText}>CLOSED</span>
          </div>
        )}
        <div style={styles.imgBadges}>
          <span style={{ ...styles.vegBadge, background: vegInfo.bg, color: vegInfo.color }}>
            {vegInfo.label}
          </span>
          {restaurant.deliveryFee === 0 && (
            <span style={styles.freeBadge}>🚀 FREE</span>
          )}
        </div>
        {/* Rating overlay */}
        <div style={styles.ratingChip}>
          ⭐ {restaurant.rating?.toFixed(1) || '4.0'}
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        <div style={styles.nameRow}>
          <h3 style={styles.name}>{restaurant.name}</h3>
          <span style={{ ...styles.openDot, background: restaurant.open ? '#22C55E' : '#EF4444' }} />
        </div>
        <p style={styles.cuisine}>{restaurant.cuisineType || 'Multi Cuisine'}</p>

        <div style={styles.divider} />

        <div style={styles.metaRow}>
          <div style={styles.metaItem}>
            <span style={styles.metaIcon}>🕐</span>
            <span style={styles.metaText}>{restaurant.estimatedMinutes || 30} min</span>
          </div>
          <div style={styles.metaDot} />
          <div style={styles.metaItem}>
            <span style={styles.metaIcon}>📍</span>
            <span style={styles.metaText}>{restaurant.distanceKm?.toFixed(1) || '?'} km</span>
          </div>
          <div style={styles.metaDot} />
          <div style={styles.metaItem}>
            <span style={styles.metaIcon}>🛵</span>
            <span style={styles.metaText}>
              {restaurant.deliveryFee === 0
                ? <span style={{ color: '#059669', fontWeight: 700 }}>Free</span>
                : `₹${restaurant.deliveryFee?.toFixed(0)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff', borderRadius: 20,
    overflow: 'hidden', cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  imgWrap: { position: 'relative', height: 175, overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' },
  closedOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(28,25,23,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  closedText: { color: '#fff', fontSize: 20, fontWeight: 900, letterSpacing: 3 },
  imgBadges: {
    position: 'absolute', top: 10, left: 10,
    display: 'flex', gap: 6,
  },
  vegBadge: {
    padding: '3px 10px', borderRadius: 20,
    fontSize: 11, fontWeight: 700,
  },
  freeBadge: {
    background: '#ECFDF5', color: '#059669',
    padding: '3px 10px', borderRadius: 20,
    fontSize: 11, fontWeight: 700,
  },
  ratingChip: {
    position: 'absolute', bottom: 10, right: 10,
    background: 'rgba(28,25,23,0.85)', color: '#fff',
    padding: '4px 10px', borderRadius: 8,
    fontSize: 12, fontWeight: 700, backdropFilter: 'blur(4px)',
  },
  body: { padding: '14px 18px 18px' },
  nameRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: 700, color: '#1C1917', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  openDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginLeft: 8 },
  cuisine: { fontSize: 13, color: '#78716C', marginBottom: 12, fontWeight: 500 },
  divider: { height: 1, background: '#F5F5F4', marginBottom: 12 },
  metaRow: { display: 'flex', alignItems: 'center', gap: 6 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4 },
  metaIcon: { fontSize: 12 },
  metaText: { fontSize: 12, color: '#78716C', fontWeight: 600 },
  metaDot: { width: 3, height: 3, borderRadius: '50%', background: '#D4D4D0' },
};
