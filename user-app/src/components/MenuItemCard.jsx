export default function MenuItemCard({ item, onAdd, onRemove, quantity }) {
  return (
    <div style={styles.card}>
      <div style={styles.left}>
        <div style={styles.vegDot}>
          <div style={{ ...styles.dot, background: item.veg ? '#2e7d32' : '#c62828' }} />
        </div>
        <div>
          <h4 style={styles.name}>{item.name}</h4>
          {item.description && <p style={styles.desc}>{item.description}</p>}
          <div style={styles.priceRow}>
            {item.offerPrice ? (
              <>
                <span style={styles.offerPrice}>₹{item.offerPrice.toFixed(0)}</span>
                <span style={styles.originalPrice}>₹{item.price.toFixed(0)}</span>
                <span style={styles.badge}>{item.offerPercent}% OFF</span>
              </>
            ) : (
              <span style={styles.price}>₹{item.price.toFixed(0)}</span>
            )}
          </div>
        </div>
      </div>
      <div style={styles.right}>
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.name} style={styles.img} />
        )}
        {item.available ? (
          <div style={styles.qtyControl}>
            {quantity > 0 ? (
              <div style={styles.qtyRow}>
                <button onClick={onRemove} style={styles.qtyBtn}>-</button>
                <span style={styles.qty}>{quantity}</span>
                <button onClick={onAdd} style={styles.qtyBtn}>+</button>
              </div>
            ) : (
              <button onClick={onAdd} style={styles.addBtn}>ADD</button>
            )}
          </div>
        ) : (
          <span style={styles.unavailable}>Unavailable</span>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #f0f0f0' },
  left: { display: 'flex', gap: 10, flex: 1, paddingRight: 16 },
  vegDot: { paddingTop: 3 },
  dot: { width: 14, height: 14, borderRadius: 2, border: '1.5px solid #ccc' },
  name: { fontSize: 15, fontWeight: 600, color: '#222', marginBottom: 4 },
  desc: { fontSize: 13, color: '#888', marginBottom: 6 },
  priceRow: { display: 'flex', alignItems: 'center', gap: 8 },
  price: { fontSize: 15, fontWeight: 700, color: '#222' },
  offerPrice: { fontSize: 15, fontWeight: 700, color: '#222' },
  originalPrice: { fontSize: 13, color: '#aaa', textDecoration: 'line-through' },
  badge: { background: '#e8f5e9', color: '#2e7d32', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4 },
  right: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 90 },
  img: { width: 80, height: 70, objectFit: 'cover', borderRadius: 10 },
  qtyControl: { marginTop: 4 },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid #fc5c04', borderRadius: 8, padding: '4px 8px' },
  qtyBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#fc5c04', fontWeight: 700, fontSize: 18, padding: '0 4px' },
  qty: { color: '#fc5c04', fontWeight: 700, minWidth: 20, textAlign: 'center' },
  addBtn: { background: '#fff', border: '1.5px solid #fc5c04', color: '#fc5c04', borderRadius: 8, padding: '6px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 13 },
  unavailable: { color: '#aaa', fontSize: 12 },
};
