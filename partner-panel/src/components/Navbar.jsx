export default function Navbar({ title }) {
  return (
    <div style={styles.navbar}>
      <h2 style={styles.title}>{title}</h2>
      <div style={styles.right}>
        <span style={styles.time}>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  );
}

const styles = {
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', background: '#fff', borderBottom: '1px solid #f0f0f0' },
  title: { fontSize: 22, fontWeight: 800, color: '#1C1917' },
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  time: { fontSize: 13, color: '#888', background: '#f5f5f5', padding: '6px 14px', borderRadius: 20 },
};
