export default function Navbar({ title, subtitle }) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={s.bar}>
      {/* Left: Page Title */}
      <div style={s.left}>
        <div style={s.titleRow}>
          <div style={s.titleAccent} />
          <div>
            <h2 style={s.title}>{title}</h2>
            {subtitle && <p style={s.subtitle}>{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Right: Date/Time + Status */}
      <div style={s.right}>
        <div style={s.statusDot}>
          <span style={s.dot} />
          <span style={s.statusText}>Live</span>
        </div>
        <div style={s.dateCard}>
          <span style={s.time}>{timeStr}</span>
          <span style={s.dateSep}>·</span>
          <span style={s.date}>{dateStr}</span>
        </div>
      </div>
    </div>
  );
}

const s = {
  bar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 28px',
    background: '#0d1117',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    flexWrap: 'wrap',
    gap: 12,
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  left: {},
  titleRow: { display: 'flex', alignItems: 'center', gap: 12 },
  titleAccent: {
    width: 4,
    height: 28,
    background: 'linear-gradient(180deg, #f97316, #6366f1)',
    borderRadius: 4,
  },
  title: { fontSize: 20, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: 400 },

  right: { display: 'flex', alignItems: 'center', gap: 12 },
  statusDot: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.2)',
    padding: '5px 12px',
    borderRadius: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 8px rgba(34,197,94,0.8)',
    animation: 'pulse-glow 2s infinite',
    display: 'inline-block',
  },
  statusText: { fontSize: 11, color: '#22c55e', fontWeight: 700 },
  dateCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    padding: '6px 14px',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  time: { fontSize: 13, fontWeight: 700, color: '#f97316' },
  dateSep: { color: '#334155', fontSize: 13 },
  date: { fontSize: 12, color: '#64748b', fontWeight: 400 },
};
