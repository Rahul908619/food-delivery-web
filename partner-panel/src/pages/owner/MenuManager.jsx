import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import popup from '../../components/CustomToast';

export default function MenuManager() {
  const [menu, setMenu] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', offerPercent: '', category: '', veg: true });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const rRes = await API.get('/owner/restaurant');
      setRestaurant(rRes.data.data);
      const mRes = await API.get(`/owner/menu/${rRes.data.data.id}`);
      setMenu(mRes.data.data || []);
      setDeleteConfirmId(null);
    } catch { popup.warning('Restaurant Required', 'Register your restaurant first to manage the menu.'); }
    finally { setLoading(false); }
  };

  const handleImageChange = (e) => { const file = e.target.files[0]; if (!file) return; setImage(file); setPreview(URL.createObjectURL(file)); };

  const handleAdd = async (e) => {
    e.preventDefault();
    // Validate
    const errs = {};
    if (!form.name.trim()) errs.name = 'Item name is required';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Price must be greater than 0';
    if (form.offerPercent && (Number(form.offerPercent) < 0 || Number(form.offerPercent) > 90)) errs.offerPercent = 'Offer must be between 0 and 90%';
    setFormErrors(errs);
    setFormTouched({ name: true, price: true, offerPercent: true });
    if (Object.keys(errs).length > 0) return;
    if (!restaurant) { popup.warning('No Restaurant', 'Please register your restaurant first.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('restaurantId', restaurant.id);
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('isVeg', form.veg);
      if (form.offerPercent) fd.append('offerPercent', form.offerPercent);
      if (form.category) fd.append('category', form.category);
      if (image) fd.append('image', image);
      await API.post('/owner/menu/add', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      popup.menuItemAdded(form.name);
      setShowForm(false);
      setForm({ name: '', description: '', price: '', offerPercent: '', category: '', veg: true });
      setImage(null); setPreview(null);
      setFormErrors({}); setFormTouched({});
      load();
    } catch (err) { popup.error('Failed to Add', err.response?.data?.message || 'Could not add menu item.'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (itemId) => {
    setDeleteConfirmId(null);
    try { await API.put(`/owner/menu/${itemId}/toggle`); popup.success('Updated', 'Item availability changed.'); load(); }
    catch { popup.error('Update Failed', 'Could not update item availability.'); }
  };

  const handleDelete = async (itemId) => {
    if (deleteConfirmId !== itemId) {
      setDeleteConfirmId(itemId);
      popup.warning('Confirm Delete', 'Click Delete again to permanently remove this menu item.');
      return;
    }
    try { await API.delete(`/owner/menu/${itemId}`); popup.success('Deleted', 'Menu item has been removed.'); setDeleteConfirmId(null); load(); }
    catch { popup.error('Delete Failed', 'Could not delete menu item.'); }
  };

  const categories = [...new Set(menu.map(i => i.category || 'Other'))];

  if (loading) return (
    <div style={{ display: 'flex' }}><Sidebar />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, border: '4px solid #eee', borderTop: '4px solid #E23744', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    </div>
  );

  return (
    <div style={styles.pageWrap}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title="Menu Manager" />
        <div style={styles.content}>
          <div style={styles.headerRow}>
            <p style={styles.subtitle}>{restaurant?.name} • {menu.length} items</p>
            <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>{showForm ? '✕ Cancel' : '+ Add Menu Item'}</button>
          </div>

          {showForm && (
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>Add New Menu Item</h3>
              <form onSubmit={handleAdd}>
                <div style={styles.imageRow}>
                  <label style={styles.imageLabel}>
                    {preview ? <img src={preview} alt="" style={styles.imagePreview} /> : <div style={styles.imagePH}><span>📷</span><p>Add Photo</p></div>}
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={styles.grid2}>
                      <div>
                        <label style={styles.label}>Item Name *</label>
                        <input required value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); if(formTouched.name) setFormErrors(p=>({...p, name: e.target.value.trim() ? '' : 'Item name is required'})); }} onBlur={() => { setFormTouched(p=>({...p,name:true})); if(!form.name.trim()) setFormErrors(p=>({...p,name:'Item name is required'})); }} placeholder="e.g. Paneer Butter Masala" style={{ ...styles.input, ...(formErrors.name && formTouched.name ? {borderColor:'#EF4444'} : {}) }} />
                        {formErrors.name && formTouched.name && <p style={{fontSize:12,color:'#EF4444',marginTop:4,fontWeight:500}}>⚠ {formErrors.name}</p>}
                      </div>
                      <div><label style={styles.label}>Category</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Main Course" style={styles.input} /></div>
                      <div>
                        <label style={styles.label}>Price (₹) *</label>
                        <input required type="number" min="1" value={form.price} onChange={e => { setForm({ ...form, price: e.target.value }); if(formTouched.price) setFormErrors(p=>({...p, price: Number(e.target.value) > 0 ? '' : 'Price must be > 0'})); }} onBlur={() => { setFormTouched(p=>({...p,price:true})); if(!form.price || Number(form.price) <= 0) setFormErrors(p=>({...p,price:'Price must be greater than 0'})); }} placeholder="250" style={{ ...styles.input, ...(formErrors.price && formTouched.price ? {borderColor:'#EF4444'} : {}) }} />
                        {formErrors.price && formTouched.price && <p style={{fontSize:12,color:'#EF4444',marginTop:4,fontWeight:500}}>⚠ {formErrors.price}</p>}
                      </div>
                      <div>
                        <label style={styles.label}>Offer % (optional)</label>
                        <input type="number" min="0" max="90" value={form.offerPercent} onChange={e => { setForm({ ...form, offerPercent: e.target.value }); if(formTouched.offerPercent && e.target.value) setFormErrors(p=>({...p, offerPercent: (Number(e.target.value) >= 0 && Number(e.target.value) <= 90) ? '' : 'Must be 0-90'})); }} onBlur={() => { setFormTouched(p=>({...p,offerPercent:true})); if(form.offerPercent && (Number(form.offerPercent) < 0 || Number(form.offerPercent) > 90)) setFormErrors(p=>({...p,offerPercent:'Offer must be between 0 and 90%'})); }} placeholder="20" style={{ ...styles.input, ...(formErrors.offerPercent && formTouched.offerPercent ? {borderColor:'#EF4444'} : {}) }} />
                        {formErrors.offerPercent && formTouched.offerPercent && <p style={{fontSize:12,color:'#EF4444',marginTop:4,fontWeight:500}}>⚠ {formErrors.offerPercent}</p>}
                      </div>
                    </div>
                    <div><label style={styles.label}>Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description..." style={styles.input} /></div>
                    <div style={styles.vegToggleRow}>
                      <span style={styles.label}>Type:</span>
                      <button type="button" onClick={() => setForm({ ...form, veg: true })} style={{ ...styles.vegToggleBtn, ...(form.veg ? styles.vegActive : {}) }}>🟢 Veg</button>
                      <button type="button" onClick={() => setForm({ ...form, veg: false })} style={{ ...styles.vegToggleBtn, ...(!form.veg ? styles.nonVegActive : {}) }}>🔴 Non-Veg</button>
                    </div>
                  </div>
                </div>
                {form.offerPercent && form.price && (
                  <div style={styles.offerPreview}>🎉 After {form.offerPercent}% off: ₹{(form.price - form.price * form.offerPercent / 100).toFixed(0)} (Original: ₹{form.price})</div>
                )}
                <button type="submit" disabled={saving} style={styles.submitBtn}>{saving ? 'Adding...' : '+ Add to Menu'}</button>
              </form>
            </div>
          )}

          {menu.length === 0 ? (
            <div style={styles.empty}><p style={{ fontSize: 48 }}>🍽️</p><p style={styles.emptyTitle}>No menu items yet</p><p style={styles.emptyText}>Click "Add Menu Item" to get started</p></div>
          ) : (
            categories.map(cat => (
              <div key={cat} style={styles.categoryCard}>
                <h3 style={styles.catTitle}>{cat} <span style={styles.catCount}>({menu.filter(i => (i.category || 'Other') === cat).length})</span></h3>
                <div style={styles.menuGrid}>
                  {menu.filter(i => (i.category || 'Other') === cat).map(item => (
                    <div key={item.id} style={{ ...styles.menuCard, opacity: item.available ? 1 : 0.6 }}>
                      <div style={styles.menuImgWrap}>
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={styles.menuImg} /> : <div style={styles.menuImgPH}>🍽️</div>}
                        <div style={{ ...styles.vegDot, background: item.veg ? '#4caf50' : '#f44336' }} />
                      </div>
                      <div style={styles.menuInfo}>
                        <h4 style={styles.menuName}>{item.name}</h4>
                        {item.description && <p style={styles.menuDesc}>{item.description}</p>}
                        <div style={styles.priceRow}>
                          {item.offerPrice ? (<><span style={styles.offerPrice}>₹{item.offerPrice.toFixed(0)}</span><span style={styles.originalPrice}>₹{item.price.toFixed(0)}</span><span style={styles.discountBadge}>{item.offerPercent}% OFF</span></>) : <span style={styles.price}>₹{item.price.toFixed(0)}</span>}
                        </div>
                      </div>
                      <div style={styles.menuActions}>
                        <button onClick={() => handleToggle(item.id)} style={{ ...styles.actionBtn, background: item.available ? '#fff3e0' : '#e8f5e9', color: item.available ? '#e65100' : '#2e7d32' }}>{item.available ? 'Mark Unavailable' : 'Mark Available'}</button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={deleteConfirmId === item.id ? styles.deleteConfirmBtn : styles.deleteBtn}
                        >
                          {deleteConfirmId === item.id ? 'Confirm Delete' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
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
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  subtitle: { color: '#888', fontSize: 14 },
  addBtn: { background: 'linear-gradient(135deg, #E23744, #FF6B35)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  formCard: { background: '#fff', borderRadius: 20, padding: 28 },
  formTitle: { fontSize: 17, fontWeight: 700, marginBottom: 20, color: '#1C1917' },
  imageRow: { display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' },
  imageLabel: { cursor: 'pointer', flexShrink: 0 },
  imagePreview: { width: 120, height: 120, objectFit: 'cover', borderRadius: 12 },
  imagePH: { width: 120, height: 120, border: '2px dashed #ddd', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 24, gap: 6 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  vegToggleRow: { display: 'flex', alignItems: 'center', gap: 12 },
  vegToggleBtn: { padding: '8px 18px', border: '1.5px solid #e0e0e0', borderRadius: 8, background: '#f9f9f9', cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  vegActive: { background: '#e8f5e9', borderColor: '#4caf50', color: '#2e7d32' },
  nonVegActive: { background: '#fce4ec', borderColor: '#f44336', color: '#c62828' },
  offerPreview: { background: '#e8f5e9', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#2e7d32', fontWeight: 600, marginBottom: 12 },
  submitBtn: { width: '100%', padding: 12, background: 'linear-gradient(135deg, #E23744, #FF6B35)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  empty: { background: '#fff', borderRadius: 20, padding: '60px 20px', textAlign: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: '#333', marginBottom: 8, marginTop: 12 },
  emptyText: { color: '#888', fontSize: 14 },
  categoryCard: { background: '#fff', borderRadius: 20, padding: 24 },
  catTitle: { fontSize: 16, fontWeight: 700, color: '#1C1917', marginBottom: 16 },
  catCount: { color: '#888', fontWeight: 400, fontSize: 14 },
  menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  menuCard: { border: '1.5px solid #f0f0f0', borderRadius: 14, overflow: 'hidden' },
  menuImgWrap: { position: 'relative', height: 120 },
  menuImg: { width: '100%', height: '100%', objectFit: 'cover' },
  menuImgPH: { height: '100%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 },
  vegDot: { position: 'absolute', top: 8, right: 8, width: 14, height: 14, borderRadius: 2, border: '2px solid #fff' },
  menuInfo: { padding: '12px 14px 8px' },
  menuName: { fontSize: 14, fontWeight: 700, color: '#222', marginBottom: 4 },
  menuDesc: { fontSize: 12, color: '#888', marginBottom: 8 },
  priceRow: { display: 'flex', alignItems: 'center', gap: 8 },
  offerPrice: { fontSize: 15, fontWeight: 800, color: '#222' },
  originalPrice: { fontSize: 12, color: '#aaa', textDecoration: 'line-through' },
  discountBadge: { fontSize: 11, background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: 4, fontWeight: 700 },
  price: { fontSize: 15, fontWeight: 800, color: '#222' },
  menuActions: { display: 'flex', gap: 8, padding: '8px 14px 14px' },
  actionBtn: { flex: 1, padding: '7px 0', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  deleteBtn: { padding: '7px 14px', background: '#fce4ec', color: '#c62828', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  deleteConfirmBtn: { padding: '7px 14px', background: '#c62828', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
};
