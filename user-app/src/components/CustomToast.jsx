import toast from 'react-hot-toast';

/* ══════════════════════════════════════════════════════════════
   CUSTOM TOAST POPUPS — Premium animated notifications
   Used for: Payment Success, Order Confirmed, Location Error,
   Login/Register Success, Warnings, etc.
   ══════════════════════════════════════════════════════════════ */

/* ── SVG Icons ── */
const icons = {
  success: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#22C55E"/>
      <path d="M7 12.5l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#EF4444"/>
      <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L1 21h22L12 2z" fill="#F59E0B"/>
      <path d="M12 9v5M12 16.5v.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#3B82F6"/>
      <path d="M12 8v.5M12 11v5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  payment: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#22C55E"/>
      <path d="M12 6v1.5M12 16.5V18M8.5 9.5c0-1.1 1.6-2 3.5-2s3.5.9 3.5 2c0 1.5-2.5 1.8-3.5 3M12 15h.01" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12h6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  order: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="18" rx="3" fill="#6366F1"/>
      <path d="M7 10l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  location: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#EF4444"/>
      <path d="M12 7c-1.66 0-3 1.34-3 3 0 2.25 3 5.5 3 5.5s3-3.25 3-5.5c0-1.66-1.34-3-3-3zm0 4.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" fill="#fff"/>
    </svg>
  ),
  welcome: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="url(#wg)"/>
      <defs><linearGradient id="wg" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#F97316"/><stop offset="1" stopColor="#E23744"/></linearGradient></defs>
      <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="9" cy="10" r="1.2" fill="#fff"/>
      <circle cx="15" cy="10" r="1.2" fill="#fff"/>
    </svg>
  ),
  cart: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#F59E0B"/>
      <path d="M8 8h1l1.5 7h5l1.5-5H10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10.5" cy="17.5" r="1" fill="#fff"/>
      <circle cx="15.5" cy="17.5" r="1" fill="#fff"/>
    </svg>
  ),
};

/* ── Base styles ── */
const base = {
  popup: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    padding: '18px 22px',
    borderRadius: 16,
    minWidth: 340,
    maxWidth: 440,
    boxShadow: '0 16px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.06)',
    fontFamily: 'Inter, system-ui, sans-serif',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1, minWidth: 0 },
  title: { fontSize: 15, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 },
  message: { fontSize: 13, lineHeight: 1.5, opacity: 0.8 },
  closeBtn: {
    position: 'absolute', top: 10, right: 12,
    background: 'none', border: 'none', fontSize: 16,
    cursor: 'pointer', opacity: 0.4, padding: 4,
    lineHeight: 1,
  },
  progressBar: {
    position: 'absolute', bottom: 0, left: 0, height: 3,
    borderRadius: '0 0 16px 16px',
  },
};

/* ── Theme configs ── */
const themes = {
  success: {
    bg: 'linear-gradient(135deg, #052E16 0%, #064E3B 100%)',
    border: '1px solid rgba(34,197,94,0.25)',
    titleColor: '#86EFAC',
    msgColor: '#6EE7B7',
    iconBg: 'rgba(34,197,94,0.15)',
    closeColor: '#6EE7B7',
    barColor: '#22C55E',
  },
  error: {
    bg: 'linear-gradient(135deg, #450A0A 0%, #7F1D1D 100%)',
    border: '1px solid rgba(239,68,68,0.25)',
    titleColor: '#FCA5A5',
    msgColor: '#FCA5A5',
    iconBg: 'rgba(239,68,68,0.15)',
    closeColor: '#FCA5A5',
    barColor: '#EF4444',
  },
  warning: {
    bg: 'linear-gradient(135deg, #451A03 0%, #78350F 100%)',
    border: '1px solid rgba(245,158,11,0.25)',
    titleColor: '#FDE68A',
    msgColor: '#FCD34D',
    iconBg: 'rgba(245,158,11,0.15)',
    closeColor: '#FCD34D',
    barColor: '#F59E0B',
  },
  info: {
    bg: 'linear-gradient(135deg, #1E1B4B 0%, #1E3A5F 100%)',
    border: '1px solid rgba(59,130,246,0.25)',
    titleColor: '#93C5FD',
    msgColor: '#93C5FD',
    iconBg: 'rgba(59,130,246,0.15)',
    closeColor: '#93C5FD',
    barColor: '#3B82F6',
  },
  payment: {
    bg: 'linear-gradient(135deg, #052E16 0%, #064E3B 100%)',
    border: '1px solid rgba(34,197,94,0.3)',
    titleColor: '#86EFAC',
    msgColor: '#6EE7B7',
    iconBg: 'rgba(34,197,94,0.2)',
    closeColor: '#6EE7B7',
    barColor: '#22C55E',
  },
  order: {
    bg: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
    border: '1px solid rgba(99,102,241,0.3)',
    titleColor: '#C7D2FE',
    msgColor: '#A5B4FC',
    iconBg: 'rgba(99,102,241,0.2)',
    closeColor: '#A5B4FC',
    barColor: '#6366F1',
  },
};

/* ── Render function ── */
const renderPopup = (t, type, icon, title, message, duration = 4000) => {
  const theme = themes[type] || themes.success;
  return (
    <div
      style={{
        ...base.popup,
        background: theme.bg,
        border: theme.border,
        opacity: t.visible ? 1 : 0,
        transform: t.visible ? 'translateY(0) scale(1)' : 'translateY(-16px) scale(0.96)',
        transition: 'all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1)',
      }}
      onClick={() => toast.dismiss(t.id)}
    >
      <div style={{ ...base.iconWrap, background: theme.iconBg }}>
        {icon}
      </div>
      <div style={base.content}>
        <div style={{ ...base.title, color: theme.titleColor }}>{title}</div>
        {message && <div style={{ ...base.message, color: theme.msgColor }}>{message}</div>}
      </div>
      <button style={{ ...base.closeBtn, color: theme.closeColor }} onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}>✕</button>
      <div
        style={{
          ...base.progressBar,
          background: theme.barColor,
          animation: `popupProgress ${duration}ms linear forwards`,
        }}
      />
    </div>
  );
};

/* ══════════════════════════════════════════════
   EXPORTED POPUP FUNCTIONS
   ══════════════════════════════════════════════ */

export const popup = {
  /* ── Generic types ── */
  success: (title, message, duration = 4000) =>
    toast.custom((t) => renderPopup(t, 'success', icons.success, title, message, duration), { duration }),

  error: (title, message, duration = 5000) =>
    toast.custom((t) => renderPopup(t, 'error', icons.error, title, message, duration), { duration }),

  warning: (title, message, duration = 4500) =>
    toast.custom((t) => renderPopup(t, 'warning', icons.warning, title, message, duration), { duration }),

  info: (title, message, duration = 4000) =>
    toast.custom((t) => renderPopup(t, 'info', icons.info, title, message, duration), { duration }),

  /* ── Payment Success ── */
  paymentSuccess: (amount, method = 'Online') =>
    toast.custom((t) => renderPopup(t, 'payment', icons.payment,
      `Payment of ₹${amount} Successful! 🎉`,
      `Paid via ${method}. Your order is being prepared.`,
      5000
    ), { duration: 5000 }),

  /* ── Payment Failed ── */
  paymentFailed: (reason = '') =>
    toast.custom((t) => renderPopup(t, 'error', icons.error,
      'Payment Failed ❌',
      reason || 'Transaction could not be completed. Please try again or use a different method.',
      5000
    ), { duration: 5000 }),

  /* ── Order Confirmed ── */
  orderConfirmed: (orderId) =>
    toast.custom((t) => renderPopup(t, 'order', icons.order,
      'Order Confirmed! 🛵',
      `Order #${orderId || '—'} has been placed. Track your delivery in real-time.`,
      5000
    ), { duration: 5000 }),

  /* ── Order Failed ── */
  orderFailed: (reason = '') =>
    toast.custom((t) => renderPopup(t, 'error', icons.error,
      'Order Failed',
      reason || 'We couldn\'t place your order. Please try again.',
      5000
    ), { duration: 5000 }),

  /* ── Location Not Available ── */
  locationNotAvailable: (city = '') =>
    toast.custom((t) => renderPopup(t, 'warning', icons.location,
      `Delivery Not Available ${city ? 'in ' + city : ''} 📍`,
      'We don\'t serve this area yet. Try a different delivery address.',
      5000
    ), { duration: 5000 }),

  /* ── Invalid Address ── */
  invalidAddress: () =>
    toast.custom((t) => renderPopup(t, 'error', icons.location,
      'Invalid Delivery Address',
      'Please check your address details — street, city, and pincode are required.',
      4500
    ), { duration: 4500 }),

  /* ── Login Success ── */
  loginSuccess: (name = 'User') =>
    toast.custom((t) => renderPopup(t, 'success', icons.welcome,
      `Welcome back, ${name}! 👋`,
      'You\'re all set. Start exploring restaurants near you.',
      4000
    ), { duration: 4000 }),

  /* ── Register Success ── */
  registerSuccess: (name = 'User') =>
    toast.custom((t) => renderPopup(t, 'success', icons.welcome,
      `Welcome to QuickBitX, ${name}! 🎉`,
      'Your account is ready. Let\'s order something delicious!',
      4500
    ), { duration: 4500 }),

  /* ── Admin Login Success ── */
  adminLogin: () =>
    toast.custom((t) => renderPopup(t, 'success', icons.welcome,
      'Welcome back, Admin! 🔐',
      'Dashboard loaded. You have full access to all controls.',
      4000
    ), { duration: 4000 }),

  /* ── Partner Login Success ── */
  partnerLogin: (name = 'Partner', role = '') =>
    toast.custom((t) => renderPopup(t, 'success', icons.welcome,
      `Welcome back, ${name}! 🤝`,
      role === 'RESTAURANT_OWNER'
        ? 'Your restaurant dashboard is ready. Check new orders!'
        : 'Ready to deliver? Check available orders nearby.',
      4000
    ), { duration: 4000 }),

  /* ── Cart Empty ── */
  cartEmpty: () =>
    toast.custom((t) => renderPopup(t, 'warning', icons.cart,
      'Your Cart is Empty 🛒',
      'Add items from your favorite restaurant to get started.',
      4000
    ), { duration: 4000 }),

  /* ── Item Added to Cart ── */
  itemAdded: (itemName = 'Item') =>
    toast.custom((t) => renderPopup(t, 'success', icons.cart,
      `${itemName} Added! 🍔`,
      'Item has been added to your cart.',
      2500
    ), { duration: 2500 }),

  /* ── Restaurant Closed ── */
  restaurantClosed: (name = 'Restaurant') =>
    toast.custom((t) => renderPopup(t, 'warning', icons.warning,
      `${name} is Currently Closed`,
      'This restaurant is not accepting orders right now. Try again during business hours.',
      4500
    ), { duration: 4500 }),

  /* ── Session Expired ── */
  sessionExpired: () =>
    toast.custom((t) => renderPopup(t, 'warning', icons.warning,
      'Session Expired ⏰',
      'Please sign in again to continue using QuickBitX.',
      5000
    ), { duration: 5000 }),

  /* ── Network Error ── */
  networkError: () =>
    toast.custom((t) => renderPopup(t, 'error', icons.error,
      'Connection Lost 📡',
      'Please check your internet connection and try again.',
      5000
    ), { duration: 5000 }),

  /* ── Restaurant Registered ── */
  restaurantRegistered: () =>
    toast.custom((t) => renderPopup(t, 'order', icons.order,
      'Restaurant Registered! 🍽️',
      'Your restaurant is pending admin approval. You\'ll be notified once approved.',
      5000
    ), { duration: 5000 }),

  /* ── Menu Item Added ── */
  menuItemAdded: (name = 'Item') =>
    toast.custom((t) => renderPopup(t, 'success', icons.success,
      `${name} Added to Menu! ✨`,
      'The item is now visible to customers.',
      3000
    ), { duration: 3000 }),

  /* ── COD Order Placed ── */
  codOrderPlaced: (orderId) =>
    toast.custom((t) => renderPopup(t, 'order', icons.order,
      'COD Order Placed! 💵',
      `Order #${orderId || '—'} confirmed. Keep exact change ready for delivery.`,
      5000
    ), { duration: 5000 }),

  /* ── Profile Updated ── */
  profileUpdated: () =>
    toast.custom((t) => renderPopup(t, 'success', icons.success,
      'Profile Updated! ✅',
      'Your profile changes have been saved successfully.',
      3000
    ), { duration: 3000 }),

  /* ── Access Denied ── */
  accessDenied: (reason = '') =>
    toast.custom((t) => renderPopup(t, 'error', icons.error,
      'Access Denied 🚫',
      reason || 'You don\'t have permission to access this resource.',
      4500
    ), { duration: 4500 }),
};

export default popup;
