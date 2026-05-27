import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { useLocation2 } from '../context/LocationContext';
import popup from '../components/CustomToast';
import {
  normalizePincode,
  validateAddressLine,
  validateCity,
  validatePincode,
} from '../utils/validation';

export default function Cart() {
  const [cart,        setCart]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [address,     setAddress]     = useState({ addressLine: '', city: '', pincode: '', landmark: '' });
  const [savedAddrs,  setSavedAddrs]  = useState([]);
  const [useExisting, setUseExisting] = useState(false);
  const [selectedSaved, setSelectedSaved] = useState(null);
  const [addressErrors, setAddressErrors] = useState({});
  const [addressTouched, setAddressTouched] = useState({});
  const { location } = useLocation2();
  const cityName = location?.city || location?.area || '';
  const navigate  = useNavigate();

  const validateAddressField = (field, value) => {
    switch (field) {
      case 'addressLine':
        return validateAddressLine(value);
      case 'city':
        return validateCity(value);
      case 'pincode':
        return validatePincode(value);
      default:
        return '';
    }
  };

  const handleAddressChange = (field, value) => {
    const nextValue = field === 'pincode' ? normalizePincode(value) : value;
    setAddress(prev => ({ ...prev, [field]: nextValue }));
    if (addressTouched[field]) {
      setAddressErrors(prev => ({ ...prev, [field]: validateAddressField(field, nextValue) }));
    }
  };

  const handleAddressBlur = (field) => {
    setAddressTouched(prev => ({ ...prev, [field]: true }));
    setAddressErrors(prev => ({ ...prev, [field]: validateAddressField(field, address[field]) }));
  };

  const fieldError = (field) => addressTouched[field] && addressErrors[field];

  useEffect(() => {
    const load = async () => {
      try {
        const [cartRes, addrRes] = await Promise.all([
          API.get('/customer/cart'),
          API.get('/customer/addresses'),
        ]);
        setCart(cartRes.data.data);
        const addrs = addrRes.data.data || [];
        setSavedAddrs(addrs);
        if (addrs.length > 0) {
          setUseExisting(true);
          const def = addrs.find(a => a.isDefault) || addrs[0];
          setSelectedSaved(def.id);
        }
        setAddress(a => ({ ...a, city: cityName }));
      } catch {
        popup.error('Cart Error', 'Failed to load your cart. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line

  const handleProceed = () => {
    if (useExisting && savedAddrs.length > 0 && !selectedSaved) {
      popup.warning('Select Address', 'Choose one of your saved addresses to continue.');
      return;
    }
    if (!useExisting || savedAddrs.length === 0) {
      const nextErrors = {
        addressLine: validateAddressField('addressLine', address.addressLine),
        city: validateAddressField('city', address.city),
        pincode: validateAddressField('pincode', address.pincode),
      };
      setAddressTouched({ addressLine: true, city: true, pincode: true });
      setAddressErrors(nextErrors);
      if (Object.values(nextErrors).some(Boolean)) {
        popup.invalidAddress();
        return;
      }
    }
    const payload = (useExisting && savedAddrs.length > 0)
      ? { savedAddressId: selectedSaved }
      : {
          addressLine: address.addressLine.trim(),
          city: address.city.trim(),
          pincode: normalizePincode(address.pincode),
          landmark: address.landmark.trim(),
        };
    sessionStorage.setItem('checkout_address', JSON.stringify(payload));
    navigate('/checkout');
  };

  if (loading) return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh' }}>
      <Navbar />
      <div style={s.loader}><div style={s.spinner} /></div>
    </div>
  );

  if (!cart || !cart.items?.length) return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh' }}>
      <Navbar />
      <div style={s.empty}>
        <div style={{ fontSize: 72 }}>🛒</div>
        <h2 style={s.emptyTitle}>Your cart is empty</h2>
        <p style={s.emptyText}>Add items from a restaurant to get started</p>
        <button onClick={() => navigate('/')} style={s.browseBtn}>Browse Restaurants</button>
      </div>
    </div>
  );

  const subtotal       = cart.subtotal || 0;
  const deliveryFee    = cart.deliveryFee || 0;
  const convenienceFee = 5;
  const total          = subtotal + deliveryFee + convenienceFee;

  return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh' }}>
      <Navbar />
      <div style={s.page}>
        <h2 style={s.pageTitle}>Your Cart 🛒</h2>

        <div style={s.restBanner}>
          🍽️ Order from <strong>{cart.restaurantName}</strong>
        </div>

        {/* Cart Items */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>Order Items</h3>
          {cart.items.map(item => (
            <div key={item.cartItemId} style={s.itemRow}>
              <div style={s.itemLeft}>
                <div style={{ width: 11, height: 11, borderRadius: 2, background: item.veg ? '#4caf50' : '#f44336', flexShrink: 0, marginTop: 3 }} />
                <div>
                  <p style={s.itemName}>{item.itemName}</p>
                  <p style={s.itemQty}>₹{(item.offerPrice || item.price)?.toFixed(0)} × {item.quantity}</p>
                </div>
              </div>
              <p style={s.itemPrice}>₹{item.itemTotal?.toFixed(0)}</p>
            </div>
          ))}
        </div>

        {/* Delivery Address */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>📍 Delivery Address</h3>

          {savedAddrs.length > 0 && (
            <div style={s.addrToggle}>
              <button onClick={() => setUseExisting(true)}
                style={{ ...s.toggleBtn, ...(useExisting ? s.toggleActive : {}) }}>
                Saved Addresses
              </button>
              <button onClick={() => setUseExisting(false)}
                style={{ ...s.toggleBtn, ...(!useExisting ? s.toggleActive : {}) }}>
                New Address
              </button>
            </div>
          )}

          {(useExisting && savedAddrs.length > 0) ? (
            <div style={s.savedList}>
              {savedAddrs.map(a => (
                <label key={a.id} style={{ ...s.savedItem, ...(selectedSaved === a.id ? s.savedActive : {}) }}>
                  <input type="radio" name="addr" value={a.id}
                    checked={selectedSaved === a.id}
                    onChange={() => setSelectedSaved(a.id)} style={{ marginRight: 10 }} />
                  <div>
                    <span style={s.addrLabel}>{a.label || 'HOME'}</span>
                    <p style={s.addrText}>{a.addressLine}, {a.city}</p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div style={s.newAddrForm}>
              <input placeholder="House/Flat no., Street, Area *"
                value={address.addressLine}
                maxLength={120}
                onChange={e => handleAddressChange('addressLine', e.target.value)}
                onBlur={() => handleAddressBlur('addressLine')}
                style={{ ...s.input, ...(fieldError('addressLine') ? s.inputError : {}) }} />
              {fieldError('addressLine') && <p style={s.errorText}>{addressErrors.addressLine}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input placeholder="City"
                  value={address.city}
                  maxLength={50}
                  onChange={e => handleAddressChange('city', e.target.value)}
                  onBlur={() => handleAddressBlur('city')}
                  style={{ ...s.input, ...(fieldError('city') ? s.inputError : {}) }} />
                <input placeholder="Pincode"
                  value={address.pincode}
                  inputMode="numeric"
                  maxLength={6}
                  onChange={e => handleAddressChange('pincode', e.target.value)}
                  onBlur={() => handleAddressBlur('pincode')}
                  style={{ ...s.input, ...(fieldError('pincode') ? s.inputError : {}) }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>{fieldError('city') && <p style={s.errorText}>{addressErrors.city}</p>}</div>
                <div>{fieldError('pincode') && <p style={s.errorText}>{addressErrors.pincode}</p>}</div>
              </div>
              <input placeholder="Landmark (optional)"
                value={address.landmark}
                maxLength={80}
                onChange={e => handleAddressChange('landmark', e.target.value)}
                style={s.input} />
            </div>
          )}
        </div>

        {/* Bill */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>💰 Bill Summary</h3>
          {[
            { label: 'Item Total',      value: `₹${subtotal.toFixed(0)}` },
            { label: 'Delivery Fee',    value: deliveryFee === 0 ? '🎉 FREE' : `₹${deliveryFee.toFixed(0)}` },
            { label: 'Convenience Fee', value: `₹${convenienceFee}` },
          ].map((r, i) => (
            <div key={i} style={s.billRow}>
              <span style={{ color: '#666' }}>{r.label}</span>
              <span style={{ color: r.value.includes('FREE') ? '#4caf50' : '#333' }}>{r.value}</span>
            </div>
          ))}
          <div style={s.totalRow}>
            <span>Total to Pay</span>
            <span>₹{total.toFixed(0)}</span>
          </div>
          {deliveryFee === 0 && <p style={s.freeNote}>🎉 Free delivery on this order!</p>}
        </div>

        <button onClick={handleProceed} style={s.checkoutBtn}>
          Proceed to Checkout — ₹{total.toFixed(0)} →
        </button>
      </div>
    </div>
  );
}

const s = {
  loader:       { display:'flex', justifyContent:'center', alignItems:'center', height:'80vh' },
  spinner:      { width:44, height:44, border:'4px solid #eee', borderTop:'4px solid #f97316', borderRadius:'50%', animation:'spin 1s linear infinite' },
  empty:        { textAlign:'center', padding:'80px 20px' },
  emptyTitle:   { fontSize:22, fontWeight:700, margin:'18px 0 10px' },
  emptyText:    { color:'#888', marginBottom:24, fontSize:14 },
  browseBtn:    { background:'#f97316', color:'#fff', border:'none', borderRadius:10, padding:'13px 32px', fontSize:15, fontWeight:700, cursor:'pointer' },
  page:         { maxWidth:600, margin:'0 auto', padding:'24px 16px 80px' },
  pageTitle:    { fontSize:22, fontWeight:800, color:'#111', marginBottom:12 },
  restBanner:   { background:'#fff7ed', borderRadius:10, padding:'12px 16px', fontSize:14, color:'#666', marginBottom:16, border:'1px solid #fed7aa' },
  card:         { background:'#fff', borderRadius:16, padding:20, marginBottom:16, boxShadow:'0 2px 10px rgba(0,0,0,0.05)' },
  cardTitle:    { fontSize:16, fontWeight:700, color:'#111', marginBottom:16 },
  itemRow:      { display:'flex', justifyContent:'space-between', alignItems:'flex-start', paddingBottom:12, marginBottom:12, borderBottom:'1px solid #f5f5f5' },
  itemLeft:     { display:'flex', alignItems:'flex-start', gap:10 },
  itemName:     { fontWeight:600, color:'#222', fontSize:14, marginBottom:4 },
  itemQty:      { fontSize:12, color:'#888' },
  itemPrice:    { fontWeight:700, color:'#111', flexShrink:0 },
  addrToggle:   { display:'flex', gap:8, marginBottom:16 },
  toggleBtn:    { flex:1, padding:'9px', border:'1.5px solid #e0e0e0', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:13, fontWeight:500, fontFamily:'inherit' },
  toggleActive: { background:'#fff7ed', borderColor:'#f97316', color:'#f97316', fontWeight:700 },
  savedList:    { display:'flex', flexDirection:'column', gap:10 },
  savedItem:    { display:'flex', alignItems:'flex-start', padding:12, border:'1.5px solid #e0e0e0', borderRadius:10, cursor:'pointer' },
  savedActive:  { borderColor:'#f97316', background:'#fff7ed' },
  addrLabel:    { fontSize:11, fontWeight:700, background:'#f0f0f0', padding:'2px 8px', borderRadius:20, color:'#555' },
  addrText:     { fontSize:13, color:'#333', marginTop:5 },
  newAddrForm:  { display:'flex', flexDirection:'column', gap:10 },
  input:        { padding:'12px 14px', border:'1.5px solid #e0e0e0', borderRadius:10, fontSize:14, outline:'none', width:'100%', boxSizing:'border-box', fontFamily:'inherit' },
  inputError:   { borderColor:'#EF4444', boxShadow:'0 0 0 3px rgba(239,68,68,0.08)' },
  errorText:    { fontSize:12, color:'#EF4444', fontWeight:600, marginTop:-4 },
  billRow:      { display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:10 },
  totalRow:     { display:'flex', justifyContent:'space-between', fontSize:17, fontWeight:800, borderTop:'1px dashed #eee', paddingTop:12, marginTop:4 },
  freeNote:     { fontSize:13, color:'#4caf50', fontWeight:600, marginTop:10 },
  checkoutBtn:  { width:'100%', padding:16, background:'linear-gradient(135deg,#f97316,#ea580c)', color:'#fff', border:'none', borderRadius:12, fontSize:17, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(249,115,22,0.35)' },
};
