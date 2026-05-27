import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import popup from '../components/CustomToast';
import { validateImageFile, validateName } from '../utils/validation';

export default function Profile() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(user?.profileImage || null);
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [tab, setTab] = useState('profile');
  const [nameError, setNameError] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    API.get('/customer/addresses').then(res => setAddresses(res.data.data || []));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      setImage(null);
      setImageError(error);
      e.target.value = '';
      popup.warning('Invalid Image', error);
      return;
    }
    setImageError('');
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setNameTouched(true);
    const nextNameError = validateName(name);
    if (nextNameError) {
      setNameError(nextNameError);
      return;
    }
    setNameError('');
    setSaving(true);
    try {
      const formData = new FormData();
      if (name) formData.append('name', name.trim());
      if (image) formData.append('image', image);
      const res = await API.put('/customer/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const token = localStorage.getItem('token');
      login({ ...user, name: res.data.data.name, profileImage: res.data.data.profileImage }, token);
      popup.profileUpdated();
    } catch {
      popup.error('Update Failed', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#F5F5F4', minHeight: '100vh' }}>
      <Navbar />

      {/* Profile Hero */}
      <div style={styles.profileHero}>
        <div style={styles.profileHeroInner}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatarRing}>
              {preview
                ? <img src={preview} alt="Profile" style={styles.avatarImg} />
                : <img src="/profile-default.png" alt="Profile" style={styles.avatarImg} />
              }
            </div>
            <label style={styles.changeAvatarBtn} title="Change photo">
              <span style={{ fontSize: 14 }}>📷</span>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
          </div>
          <div style={styles.heroInfo}>
            <h1 style={styles.heroName}>{user?.name}</h1>
            <div style={styles.heroMeta}>
              <span style={styles.heroBadge}>⭐ Customer</span>
              <span style={styles.heroBadge}>✅ Verified</span>
            </div>
            <p style={styles.heroEmail}>{user?.email || user?.phone}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabRow}>
          {['profile', 'addresses'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...styles.tabBtn, ...(tab === t ? styles.tabActive : {}) }}>
              {t === 'profile' ? '👤 My Profile' : '📍 Addresses'}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.container}>
        {tab === 'profile' && (
          <div style={styles.twoCol}>
            {/* Edit Form */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Edit Profile</h3>
              <form onSubmit={handleSave}>
                <div style={styles.field}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    value={name}
                    maxLength={50}
                    onChange={e => {
                      setName(e.target.value);
                      if (nameTouched) setNameError(validateName(e.target.value));
                    }}
                    onBlur={() => {
                      setNameTouched(true);
                      setNameError(validateName(name));
                    }}
                    style={{ ...styles.input, ...(nameError && nameTouched ? { borderColor: '#EF4444' } : {}) }}
                    placeholder="Your full name"
                  />
                  {nameError && nameTouched && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6, fontWeight: 500 }}>⚠ {nameError}</p>}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Email Address</label>
                  <input value={user?.email || ''} readOnly style={{ ...styles.input, background: '#F9FAFB', color: '#9CA3AF' }} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Phone Number</label>
                  <input value={user?.phone || ''} readOnly style={{ ...styles.input, background: '#F9FAFB', color: '#9CA3AF' }} />
                </div>
                <button type="submit" disabled={saving} style={styles.saveBtn}>
                  {saving ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
              </form>
            </div>

            {/* Quick Stats */}
            <div>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>📦</div>
                  <div style={styles.statNum}>-</div>
                  <div style={styles.statLabel}>Total Orders</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>📍</div>
                  <div style={styles.statNum}>{addresses.length}</div>
                  <div style={styles.statLabel}>Saved Addresses</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>🟢</div>
                  <div style={styles.statNum}>Active</div>
                  <div style={styles.statLabel}>Account Status</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>⭐</div>
                  <div style={styles.statNum}>Customer</div>
                  <div style={styles.statLabel}>Membership</div>
                </div>
              </div>

              {/* Profile Image Card */}
              <div style={{ ...styles.card, marginTop: 20, textAlign: 'center' }}>
                <div style={styles.profileImgCard}>
                  {preview
                    ? <img src={preview} alt="You" style={styles.profileCardImg} />
                    : <img src="/profile-default.png" alt="Default" style={styles.profileCardImg} />
                  }
                  <h4 style={{ fontWeight: 700, color: '#1C1917', marginTop: 12 }}>{user?.name}</h4>
                  <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Member since {new Date().getFullYear()}</p>
                  <label style={styles.uploadBtn}>
                    📷 Update Photo
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                  {imageError && <p style={styles.imageError}>{imageError}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'addresses' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📍 My Addresses</h3>
            {addresses.length === 0 ? (
              <div style={styles.emptyAddr}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
                <h4 style={{ fontWeight: 700, color: '#1C1917', marginBottom: 8 }}>No addresses saved yet</h4>
                <p style={{ color: '#9CA3AF', fontSize: 14 }}>Add an address from the Cart page when you place an order.</p>
              </div>
            ) : (
              <div style={styles.addrList}>
                {addresses.map(addr => (
                  <div key={addr.id} style={styles.addrCard}>
                    <div style={styles.addrLeft}>
                      <div style={styles.addrIconWrap}>
                        {addr.label === 'HOME' ? '🏠' : addr.label === 'WORK' ? '💼' : '📍'}
                      </div>
                      <div>
                        <div style={styles.addrType}>{addr.label || 'HOME'}</div>
                        <div style={styles.addrText}>{addr.addressLine}</div>
                        <div style={styles.addrCity}>{addr.city}, {addr.pincode}</div>
                      </div>
                    </div>
                    {addr.isDefault && <span style={styles.defaultTag}>Default</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  profileHero: {
    background: 'linear-gradient(135deg, #1C1917 0%, #292524 100%)',
    color: '#fff',
  },
  profileHeroInner: {
    display: 'flex', alignItems: 'center', gap: 32,
    maxWidth: 1100, margin: '0 auto', padding: '40px 40px 28px',
  },
  avatarContainer: { position: 'relative', flexShrink: 0 },
  avatarRing: {
    width: 100, height: 100, borderRadius: '50%',
    border: '4px solid #E23744',
    overflow: 'hidden', background: '#292524',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  changeAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    background: '#E23744', color: '#fff',
    border: '3px solid #1C1917', borderRadius: '50%',
    width: 32, height: 32, display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  heroInfo: { flex: 1 },
  heroName: { fontSize: 28, fontWeight: 800, marginBottom: 10, fontFamily: 'Poppins, sans-serif' },
  heroMeta: { display: 'flex', gap: 10, marginBottom: 8 },
  heroBadge: {
    background: 'rgba(226,55,68,0.2)', border: '1px solid rgba(226,55,68,0.4)',
    color: '#FCA5A5', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600,
  },
  heroEmail: { fontSize: 14, color: '#A8A29E' },
  tabRow: {
    display: 'flex', gap: 0, maxWidth: 1100, margin: '0 auto',
    padding: '0 40px', borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  tabBtn: {
    padding: '14px 24px', background: 'none', border: 'none',
    color: '#A8A29E', fontWeight: 600, fontSize: 14, cursor: 'pointer',
    borderBottom: '3px solid transparent', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
  },
  tabActive: { color: '#E23744', borderBottomColor: '#E23744' },

  container: { maxWidth: 1100, margin: '32px auto', padding: '0 40px 60px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 },

  card: {
    background: '#fff', borderRadius: 20, padding: 28,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  cardTitle: { fontSize: 18, fontWeight: 700, color: '#1C1917', marginBottom: 24, fontFamily: 'Poppins, sans-serif' },

  field: { marginBottom: 18 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    width: '100%', padding: '12px 16px',
    border: '1.5px solid #E5E7EB', borderRadius: 10,
    fontSize: 15, boxSizing: 'border-box', outline: 'none', color: '#1C1917',
  },
  saveBtn: {
    width: '100%', padding: 14,
    background: 'linear-gradient(135deg, #E23744, #FF6B35)',
    color: '#fff', border: 'none', borderRadius: 12,
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(226,55,68,0.3)',
    marginTop: 8,
  },

  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  statCard: {
    background: '#fff', borderRadius: 16, padding: '20px 16px',
    textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statNum: { fontSize: 18, fontWeight: 800, color: '#E23744', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: 500 },

  profileImgCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' },
  profileCardImg: { width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid #FECDD3' },
  uploadBtn: {
    display: 'inline-block', marginTop: 16, padding: '10px 20px',
    background: '#FFF1F2', color: '#E23744', border: '1.5px solid #FECDD3',
    borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
  },
  imageError: { fontSize: 12, color: '#EF4444', marginTop: 10, fontWeight: 600 },

  emptyAddr: { textAlign: 'center', padding: '40px 20px' },
  addrList: { display: 'flex', flexDirection: 'column', gap: 12 },
  addrCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', background: '#FAFAF9',
    borderRadius: 14, border: '1.5px solid #F3F4F6',
  },
  addrLeft: { display: 'flex', gap: 16, alignItems: 'flex-start' },
  addrIconWrap: {
    width: 44, height: 44, background: '#FFF1F2', borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
  },
  addrType: { fontSize: 11, fontWeight: 700, color: '#E23744', letterSpacing: 0.5, marginBottom: 4 },
  addrText: { fontSize: 14, fontWeight: 600, color: '#1C1917', marginBottom: 2 },
  addrCity: { fontSize: 13, color: '#9CA3AF' },
  defaultTag: {
    background: '#ECFDF5', color: '#059669', borderRadius: 20,
    padding: '4px 12px', fontSize: 11, fontWeight: 700,
  },
};
