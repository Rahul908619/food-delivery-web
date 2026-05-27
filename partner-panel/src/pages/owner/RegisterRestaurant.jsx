import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import popup from '../../components/CustomToast';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const INITIAL_FORM = {
  name: '',
  description: '',
  vegType: 'BOTH',
  cuisineType: '',
  addressLine: '',
  city: '',
  pincode: '',
  latitude: '',
  longitude: '',
  phone: '',
  gstNumber: '',
  openTime: '09:00',
  closeTime: '23:00',
};

export default function RegisterRestaurant() {
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [updatingImage, setUpdatingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    try {
      const res = await API.get('/owner/restaurant');
      setRestaurant(res.data.data || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setRestaurant(null);
      } else {
        popup.error('Load Failed', err.response?.data?.message || 'Could not load your restaurant profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Restaurant name is required';
    if (!form.vegType) nextErrors.vegType = 'Veg type is required';
    if (!form.addressLine.trim()) nextErrors.addressLine = 'Address is required';

    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if (Number.isNaN(lat)) nextErrors.latitude = 'Latitude is required';
    else if (lat < -90 || lat > 90) nextErrors.latitude = 'Latitude must be between -90 and 90';
    if (Number.isNaN(lng)) nextErrors.longitude = 'Longitude is required';
    else if (lng < -180 || lng > 180) nextErrors.longitude = 'Longitude must be between -180 and 180';

    if (form.phone && !/^\d{10}$/.test(form.phone.trim())) {
      nextErrors.phone = 'Phone must be 10 digits';
    }
    if (form.pincode && !/^\d{6}$/.test(form.pincode.trim())) {
      nextErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImagePick = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description.trim());
      fd.append('vegType', form.vegType);
      fd.append('cuisineType', form.cuisineType.trim());
      fd.append('addressLine', form.addressLine.trim());
      if (form.city.trim()) fd.append('city', form.city.trim());
      if (form.pincode.trim()) fd.append('pincode', form.pincode.trim());
      fd.append('latitude', String(form.latitude).trim());
      fd.append('longitude', String(form.longitude).trim());
      if (form.phone.trim()) fd.append('phone', form.phone.trim());
      if (form.gstNumber.trim()) fd.append('gstNumber', form.gstNumber.trim());
      if (form.openTime) fd.append('openTime', form.openTime);
      if (form.closeTime) fd.append('closeTime', form.closeTime);
      if (imageFile) fd.append('image', imageFile);

      const res = await API.post('/owner/restaurant/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setRestaurant(res.data.data);
      popup.restaurantRegistered();
    } catch (err) {
      popup.error('Registration Failed', err.response?.data?.message || 'Could not register restaurant.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOpen = async () => {
    setTogglingStatus(true);
    try {
      const res = await API.put('/owner/restaurant/toggle-open');
      setRestaurant(res.data.data);
      popup.success('Status Updated', res.data?.message || 'Restaurant status updated.');
    } catch (err) {
      popup.error('Update Failed', err.response?.data?.message || 'Could not update restaurant status.');
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleImageUpdate = async () => {
    if (!imageFile) {
      popup.warning('No Image', 'Please choose an image first.');
      return;
    }

    setUpdatingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      const res = await API.put('/owner/restaurant/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRestaurant(res.data.data);
      setImageFile(null);
      setImagePreview('');
      popup.success('Image Updated', 'Restaurant image has been updated.');
    } catch (err) {
      popup.error('Image Update Failed', err.response?.data?.message || 'Could not update restaurant image.');
    } finally {
      setUpdatingImage(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.pageWrap}>
        <Sidebar />
        <div style={styles.main}>
          <div style={styles.loaderWrap}>
            <div style={styles.spinner} />
          </div>
        </div>
      </div>
    );
  }

  const isOpen = restaurant ? (restaurant.open ?? restaurant.isOpen) : false;
  const isApproved = restaurant ? (restaurant.approved ?? restaurant.isApproved) : false;

  return (
    <div style={styles.pageWrap}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title="My Restaurant" />
        <div style={styles.content}>
          {restaurant ? (
            <>
              {!isApproved && (
                <div style={styles.pendingBanner}>
                  Your restaurant is pending admin approval. You can still manage profile and menu.
                </div>
              )}

              <div style={styles.card}>
                <div style={styles.cardHead}>
                  <div>
                    <h2 style={styles.restaurantName}>{restaurant.name}</h2>
                    <p style={styles.metaLine}>
                      {restaurant.cuisineType || 'Cuisine not set'} | {restaurant.vegType || 'Veg type not set'} |{' '}
                      {restaurant.city || 'City not set'}
                    </p>
                  </div>
                  <span style={{ ...styles.statusPill, ...(isOpen ? styles.statusOpen : styles.statusClosed) }}>
                    {isOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>

                <div style={styles.profileGrid}>
                  <div style={styles.imagePanel}>
                    {restaurant.imageUrl ? (
                      <img src={restaurant.imageUrl} alt={restaurant.name} style={styles.restaurantImage} />
                    ) : (
                      <div style={styles.imagePlaceholder}>No image uploaded</div>
                    )}

                    <div style={styles.imageUploadBlock}>
                      <input type="file" accept="image/*" onChange={handleImagePick} />
                      {imagePreview && (
                        <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                      )}
                      <button
                        type="button"
                        onClick={handleImageUpdate}
                        disabled={updatingImage || !imageFile}
                        style={{ ...styles.secondaryBtn, opacity: updatingImage || !imageFile ? 0.65 : 1 }}
                      >
                        {updatingImage ? 'Updating Image...' : 'Update Image'}
                      </button>
                    </div>
                  </div>

                  <div style={styles.detailsPanel}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Description</span>
                      <span style={styles.detailValue}>{restaurant.description || 'Not provided'}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Address</span>
                      <span style={styles.detailValue}>{restaurant.addressLine || 'Not provided'}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Phone</span>
                      <span style={styles.detailValue}>{restaurant.phone || 'Not provided'}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Timing</span>
                      <span style={styles.detailValue}>
                        {(restaurant.openTime || '--:--') + ' to ' + (restaurant.closeTime || '--:--')}
                      </span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Location</span>
                      <span style={styles.detailValue}>
                        {(restaurant.latitude ?? '--') + ', ' + (restaurant.longitude ?? '--')}
                      </span>
                    </div>

                    <div style={styles.actionsRow}>
                      <button
                        type="button"
                        onClick={handleToggleOpen}
                        disabled={togglingStatus}
                        style={styles.primaryBtn}
                      >
                        {togglingStatus ? 'Updating...' : isOpen ? 'Mark Closed' : 'Mark Open'}
                      </button>
                      <button type="button" onClick={() => navigate('/owner/menu')} style={styles.secondaryBtn}>
                        Go to Menu Manager
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.card}>
              <h2 style={styles.formTitle}>Register Your Restaurant</h2>
              <p style={styles.formSubTitle}>Fill the details below to activate your owner panel.</p>

              <form onSubmit={handleRegister}>
                <div style={styles.gridTwo}>
                  <div>
                    <label style={styles.label}>Restaurant Name *</label>
                    <input
                      style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
                      value={form.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="Restaurant name"
                    />
                    {errors.name && <p style={styles.errorText}>{errors.name}</p>}
                  </div>

                  <div>
                    <label style={styles.label}>Veg Type *</label>
                    <select
                      style={{ ...styles.input, ...(errors.vegType ? styles.inputError : {}) }}
                      value={form.vegType}
                      onChange={(e) => handleFieldChange('vegType', e.target.value)}
                    >
                      <option value="PURE_VEG">Pure Veg</option>
                      <option value="NON_VEG">Non Veg</option>
                      <option value="BOTH">Both</option>
                    </select>
                    {errors.vegType && <p style={styles.errorText}>{errors.vegType}</p>}
                  </div>

                  <div>
                    <label style={styles.label}>Cuisine Type</label>
                    <input
                      style={styles.input}
                      value={form.cuisineType}
                      onChange={(e) => handleFieldChange('cuisineType', e.target.value)}
                      placeholder="e.g. North Indian"
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Phone</label>
                    <input
                      style={{ ...styles.input, ...(errors.phone ? styles.inputError : {}) }}
                      value={form.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      placeholder="10 digit phone"
                    />
                    {errors.phone && <p style={styles.errorText}>{errors.phone}</p>}
                  </div>

                  <div style={styles.fullWidth}>
                    <label style={styles.label}>Description</label>
                    <input
                      style={styles.input}
                      value={form.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      placeholder="Short description"
                    />
                  </div>

                  <div style={styles.fullWidth}>
                    <label style={styles.label}>Address Line *</label>
                    <input
                      style={{ ...styles.input, ...(errors.addressLine ? styles.inputError : {}) }}
                      value={form.addressLine}
                      onChange={(e) => handleFieldChange('addressLine', e.target.value)}
                      placeholder="Street, area"
                    />
                    {errors.addressLine && <p style={styles.errorText}>{errors.addressLine}</p>}
                  </div>

                  <div>
                    <label style={styles.label}>City</label>
                    <input
                      style={styles.input}
                      value={form.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Pincode</label>
                    <input
                      style={{ ...styles.input, ...(errors.pincode ? styles.inputError : {}) }}
                      value={form.pincode}
                      onChange={(e) => handleFieldChange('pincode', e.target.value)}
                      placeholder="6 digit pincode"
                    />
                    {errors.pincode && <p style={styles.errorText}>{errors.pincode}</p>}
                  </div>

                  <div>
                    <label style={styles.label}>Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      style={{ ...styles.input, ...(errors.latitude ? styles.inputError : {}) }}
                      value={form.latitude}
                      onChange={(e) => handleFieldChange('latitude', e.target.value)}
                      placeholder="e.g. 28.6139"
                    />
                    {errors.latitude && <p style={styles.errorText}>{errors.latitude}</p>}
                  </div>

                  <div>
                    <label style={styles.label}>Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      style={{ ...styles.input, ...(errors.longitude ? styles.inputError : {}) }}
                      value={form.longitude}
                      onChange={(e) => handleFieldChange('longitude', e.target.value)}
                      placeholder="e.g. 77.2090"
                    />
                    {errors.longitude && <p style={styles.errorText}>{errors.longitude}</p>}
                  </div>

                  <div>
                    <label style={styles.label}>Open Time</label>
                    <input
                      type="time"
                      style={styles.input}
                      value={form.openTime}
                      onChange={(e) => handleFieldChange('openTime', e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Close Time</label>
                    <input
                      type="time"
                      style={styles.input}
                      value={form.closeTime}
                      onChange={(e) => handleFieldChange('closeTime', e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>GST Number</label>
                    <input
                      style={styles.input}
                      value={form.gstNumber}
                      onChange={(e) => handleFieldChange('gstNumber', e.target.value)}
                      placeholder="GST number"
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Restaurant Image</label>
                    <input type="file" accept="image/*" onChange={handleImagePick} />
                  </div>
                </div>

                <button type="submit" disabled={saving} style={styles.primaryBtn}>
                  {saving ? 'Registering...' : 'Register Restaurant'}
                </button>
              </form>
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
  loaderWrap: { display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' },
  spinner: {
    width: 44,
    height: 44,
    border: '4px solid #eee',
    borderTop: '4px solid #E23744',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  pendingBanner: {
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#8a6d3b',
    fontWeight: 500,
    fontSize: 14,
  },
  card: { background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 },
  restaurantName: { fontSize: 28, fontWeight: 800, color: '#1C1917', marginBottom: 6 },
  metaLine: { color: '#666', fontSize: 14 },
  statusPill: { padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: 0.3 },
  statusOpen: { background: '#e8f5e9', color: '#2e7d32' },
  statusClosed: { background: '#fdecea', color: '#b71c1c' },
  profileGrid: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' },
  imagePanel: { display: 'flex', flexDirection: 'column', gap: 12 },
  restaurantImage: { width: '100%', height: 220, objectFit: 'cover', borderRadius: 12, border: '1px solid #eee' },
  imagePlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    border: '1px dashed #cfd8dc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#90a4ae',
    fontSize: 14,
  },
  imageUploadBlock: { display: 'flex', flexDirection: 'column', gap: 10 },
  imagePreview: { width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, border: '1px solid #eee' },
  detailsPanel: { display: 'flex', flexDirection: 'column', gap: 12 },
  detailRow: { display: 'grid', gridTemplateColumns: '150px 1fr', gap: 8, paddingBottom: 8, borderBottom: '1px solid #f1f1f1' },
  detailLabel: { fontSize: 13, color: '#666', fontWeight: 600 },
  detailValue: { fontSize: 14, color: '#222' },
  actionsRow: { display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  formTitle: { fontSize: 24, color: '#1C1917', fontWeight: 800, marginBottom: 6 },
  formSubTitle: { color: '#666', marginBottom: 18, fontSize: 14 },
  gridTwo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  fullWidth: { gridColumn: '1 / -1' },
  label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#444' },
  input: {
    width: '100%',
    height: 44,
    padding: '0 12px',
    borderRadius: 10,
    border: '1.5px solid #e3e3e3',
    fontSize: 14,
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box',
  },
  inputError: { borderColor: '#ef4444' },
  errorText: { marginTop: 4, fontSize: 12, color: '#ef4444', fontWeight: 500 },
  primaryBtn: {
    marginTop: 14,
    border: 'none',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #E23744, #FF6B35)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    padding: '12px 18px',
    cursor: 'pointer',
  },
  secondaryBtn: {
    border: '1px solid #e3e3e3',
    borderRadius: 10,
    background: '#fff',
    color: '#333',
    fontWeight: 600,
    fontSize: 14,
    padding: '10px 14px',
    cursor: 'pointer',
  },
};
