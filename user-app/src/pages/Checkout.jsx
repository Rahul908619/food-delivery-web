import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  siAfterpay,
  siAxisbank,
  siGooglepay,
  siHdfcbank,
  siIcicibank,
  siMastercard,
  siPaytm,
  siPaypal,
  siPhonepe,
  siRazorpay,
  siVisa,
} from 'simple-icons';
import toast from 'react-hot-toast';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import popup from '../components/CustomToast';
import {
  normalizeCardCvv,
  normalizeCardExpiry,
  normalizeCardNumber,
  validateCardCvv,
  validateCardExpiry,
  validateCardNumber,
  validateCheckoutAddress,
  validateName,
  validateUpiId,
} from '../utils/validation';
import './Checkout.css';

const MONEY = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const CURRENCY = (value) => MONEY.format(Math.max(0, Number(value || 0)));

const simple = (icon) => ({ type: 'simple', icon });
const text = (label, bg, color = '#ffffff') => ({ type: 'text', label, bg, color });

const PAYMENT_GROUPS = [
  {
    id: 'upi',
    label: 'UPI Apps',
    hint: 'Pay instantly via your preferred UPI app',
    apps: [
      { id: 'phonepe', label: 'PhonePe', logo: simple(siPhonepe) },
      { id: 'googlepay', label: 'Google Pay', logo: simple(siGooglepay) },
      { id: 'paytm', label: 'Paytm', logo: simple(siPaytm) },
      { id: 'bhim', label: 'BHIM UPI', logo: text('BHIM', '#0f4c81') },
      { id: 'razorpay', label: 'Razorpay UPI', logo: simple(siRazorpay) },
      { id: 'cred', label: 'CRED', logo: text('CRED', '#111827') },
    ],
  },
  {
    id: 'card',
    label: 'Cards',
    hint: 'Credit, debit and secure card payments',
    apps: [
      { id: 'credit', label: 'Visa Credit Card', logo: simple(siVisa) },
      { id: 'debit', label: 'Mastercard Debit Card', logo: simple(siMastercard) },
      { id: 'rupay', label: 'RuPay Card', logo: text('RuPay', '#1d4ed8') },
    ],
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    hint: 'Redirect to your bank and authorize payment',
    apps: [
      { id: 'hdfc', label: 'HDFC Bank', logo: simple(siHdfcbank) },
      { id: 'icici', label: 'ICICI Bank', logo: simple(siIcicibank) },
      { id: 'axis', label: 'Axis Bank', logo: simple(siAxisbank) },
      { id: 'sbi', label: 'SBI', logo: text('SBI', '#1d4ed8') },
      { id: 'kotak', label: 'Kotak Bank', logo: text('Kotak', '#be123c') },
    ],
  },
  {
    id: 'bnpl',
    label: 'Pay Later',
    hint: 'Split now, settle later with supported partners',
    apps: [
      { id: 'slice', label: 'Slice', logo: text('slice', '#f97316') },
      { id: 'lazypay', label: 'LazyPay', logo: text('LazyPay', '#ef4444') },
      { id: 'simpl', label: 'Simpl', logo: text('Simpl', '#6d28d9') },
      { id: 'afterpay', label: 'Afterpay', logo: simple(siAfterpay) },
      { id: 'paypal', label: 'PayPal Pay Later', logo: simple(siPaypal) },
    ],
  },
  {
    id: 'cod',
    label: 'Cash On Delivery',
    hint: 'Pay in cash at your doorstep',
    apps: [{ id: 'cod', label: 'Pay On Delivery', logo: text('COD', '#047857') }],
  },
];

const AVAILABLE_COUPONS = [
  { code: 'NEW100', label: 'Rs 100 OFF', desc: 'New user offer on first order', type: 'flat', value: 100, minOrder: 199, color: '#f97316' },
  { code: 'SWAD50', label: '50% OFF', desc: 'Flat 50% off up to Rs 120', type: 'percent', value: 50, cap: 120, minOrder: 149, color: '#ef4444' },
  { code: 'FREEDEL', label: 'Free Delivery', desc: 'Delivery charge waived off', type: 'delivery', value: 0, minOrder: 99, color: '#059669' },
  { code: 'PHONEPE20', label: '20% OFF', desc: 'Applicable only on PhonePe', type: 'percent', value: 20, cap: 80, minOrder: 149, color: '#5f259f' },
  { code: 'CARD15', label: '15% OFF', desc: 'Applicable on card payments', type: 'percent', value: 15, cap: 60, minOrder: 249, color: '#1d4ed8' },
  { code: 'SLICE30', label: '30% OFF', desc: 'Slice Pay offer up to Rs 90', type: 'percent', value: 30, cap: 90, minOrder: 149, color: '#f97316' },
];

function calcDiscount(coupon, subtotal, deliveryFee) {
  if (!coupon) return 0;
  if (subtotal < coupon.minOrder) return 0;
  if (coupon.type === 'flat') return coupon.value;
  if (coupon.type === 'delivery') return deliveryFee;
  if (coupon.type === 'percent') return Math.min((subtotal * coupon.value) / 100, coupon.cap || 9999);
  return 0;
}

function GroupIcon({ groupId }) {
  if (groupId === 'upi') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="6" width="18" height="12" rx="2.5" />
        <path d="M9 12h6m-3-3v6" />
      </svg>
    );
  }
  if (groupId === 'card') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2.5" />
        <path d="M2 10h20" />
      </svg>
    );
  }
  if (groupId === 'netbanking') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 9L12 4l9 5v2H3V9zm2 4h2v5H5v-5zm6 0h2v5h-2v-5zm6 0h2v5h-2v-5zM3 20h18" />
      </svg>
    );
  }
  if (groupId === 'bnpl') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 7h12v7M17 11l2-2-2-2M17 17H5v-7M7 13l-2 2 2 2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PaymentLogo({ logo }) {
  if (logo.type === 'simple' && logo.icon) {
    const iconColor = `#${logo.icon.hex}`;
    return (
      <span className="checkout-logo-chip" style={{ backgroundColor: `${iconColor}18` }}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={logo.icon.path} fill={iconColor} />
        </svg>
      </span>
    );
  }
  return (
    <span className="checkout-logo-chip" style={{ backgroundColor: logo.bg, color: logo.color }}>
      <span className="checkout-logo-text">{logo.label}</span>
    </span>
  );
}

export default function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('upi');
  const [selectedApp, setSelectedApp] = useState('phonepe');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [showCoupons, setShowCoupons] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [cardErrors, setCardErrors] = useState({});
  const [upiError, setUpiError] = useState('');
  const navigate = useNavigate();

  const addressPayload = JSON.parse(sessionStorage.getItem('checkout_address') || '{}');
  const subtotal = cart?.subtotal || 0;
  const deliveryFee = cart?.deliveryFee || 0;
  const convenienceFee = 5;
  const discount = calcDiscount(appliedCoupon, subtotal, deliveryFee);
  const total = Math.max(0, subtotal + deliveryFee + convenienceFee - discount);
  const eligibleCoupons = useMemo(
    () => AVAILABLE_COUPONS.filter((coupon) => subtotal >= coupon.minOrder),
    [subtotal],
  );

  const selectedGroupObj = useMemo(
    () => PAYMENT_GROUPS.find((group) => group.id === selectedGroup) || PAYMENT_GROUPS[0],
    [selectedGroup],
  );
  const selectedAppObj = useMemo(
    () => selectedGroupObj.apps.find((app) => app.id === selectedApp) || selectedGroupObj.apps[0],
    [selectedApp, selectedGroupObj],
  );

  useEffect(() => {
    if (!selectedGroupObj.apps.some((app) => app.id === selectedApp)) {
      setSelectedApp(selectedGroupObj.apps[0].id);
    }
  }, [selectedApp, selectedGroupObj]);

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.head.appendChild(script);
    }

    API.get('/customer/cart')
      .then((response) => setCart(response.data.data))
      .catch(() => popup.error('Cart Error', 'Failed to load your cart. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const getCouponPaymentError = useCallback(
    (coupon, groupId = selectedGroup, appId = selectedApp) => {
      if (!coupon) return '';
      if (coupon.code === 'PHONEPE20' && appId !== 'phonepe') return 'PHONEPE20 only works with PhonePe payments.';
      if (coupon.code === 'CARD15' && groupId !== 'card') return 'CARD15 only works with card payments.';
      if (coupon.code === 'SLICE30' && appId !== 'slice') return 'SLICE30 only works with Slice Pay.';
      return '';
    },
    [selectedApp, selectedGroup],
  );

  useEffect(() => {
    if (!appliedCoupon) return;
    setCouponError(getCouponPaymentError(appliedCoupon));
  }, [appliedCoupon, getCouponPaymentError]);

  const applyCoupon = (code) => {
    const normalizedCode = (code || couponInput).trim().toUpperCase();
    if (!normalizedCode) {
      setCouponError('Enter a coupon code');
      return;
    }

    const foundCoupon = AVAILABLE_COUPONS.find((coupon) => coupon.code === normalizedCode);
    if (!foundCoupon) {
      setCouponError('Invalid coupon code');
      return;
    }

    if (subtotal < foundCoupon.minOrder) {
      setCouponError(`Minimum order ${CURRENCY(foundCoupon.minOrder)} is required`);
      return;
    }

    const paymentError = getCouponPaymentError(foundCoupon);
    if (paymentError) {
      setCouponError(paymentError);
      return;
    }

    setAppliedCoupon(foundCoupon);
    setCouponError('');
    setCouponInput(foundCoupon.code);
    setShowCoupons(false);
    toast.success(`Coupon ${foundCoupon.code} applied`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handlePay = async () => {
    const addressError = validateCheckoutAddress(addressPayload);
    if (!Object.keys(addressPayload).length || addressError) {
      popup.warning('Missing Address', addressError || 'Please go back and enter your delivery address.');
      return;
    }

    const couponPaymentError = getCouponPaymentError(appliedCoupon);
    if (couponPaymentError) {
      setCouponError(couponPaymentError);
      popup.warning('Coupon Not Valid', couponPaymentError);
      return;
    }

    if (selectedGroup === 'upi') {
      const nextUpiError = validateUpiId(upiId);
      if (nextUpiError) {
        setUpiError(nextUpiError);
        return;
      }
    } else if (upiError) {
      setUpiError('');
    }

    if (selectedGroup === 'card') {
      const nextCardErrors = {
        cardNum: validateCardNumber(cardNum),
        cardExpiry: validateCardExpiry(cardExpiry),
        cardCvv: validateCardCvv(cardCvv),
        cardName: validateName(cardName, { label: 'Cardholder name' }),
      };
      setCardErrors(nextCardErrors);
      if (Object.values(nextCardErrors).some(Boolean)) return;
    }

    const isCOD = selectedApp === 'cod';
    setPlacing(true);

    try {
      const orderBody = { ...addressPayload, paymentMethod: isCOD ? 'COD' : 'RAZORPAY' };
      const orderResponse = await API.post('/customer/order/place', orderBody);
      const orderId = orderResponse.data.data?.id || orderResponse.data.data?.orderId;
      if (!orderId) throw new Error('Order ID not received from server');

      if (isCOD) {
        try {
          await API.post(`/customer/order/${orderId}/payment/cod-confirm`);
        } catch (codError) {
          if (codError.response?.status !== 404) {
            popup.error('COD Confirmation Failed', 'Please contact support for assistance.');
            setPlacing(false);
            return;
          }
        }

        sessionStorage.removeItem('checkout_address');
        popup.codOrderPlaced(orderId);
        navigate(`/payment-success/${orderId}?method=COD`);
        return;
      }

      const paymentResponse = await API.post(`/customer/order/${orderId}/payment/initiate`);
      const { razorpayOrderId, keyId, amount } = paymentResponse.data.data;
      if (!razorpayOrderId || !keyId || typeof amount !== 'number') {
        throw new Error('Payment session could not be created');
      }

      if (!window.Razorpay) {
        popup.error('Payment Unavailable', 'Payment gateway is still loading. Please try again in a few seconds.');
        setPlacing(false);
        return;
      }

      const options = {
        key: keyId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'QuickBiteX',
        description: `Order from ${cart.restaurantName}`,
        order_id: razorpayOrderId,
        prefill: { name: 'Customer' },
        theme: { color: '#fc8019' },
        handler: async (response) => {
          try {
            await API.post(`/customer/order/${orderId}/payment/verify`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            sessionStorage.removeItem('checkout_address');
            popup.paymentSuccess(Math.round(amount), selectedAppObj?.label || selectedApp.toUpperCase());
            navigate(`/payment-success/${orderId}?method=${selectedApp.toUpperCase()}`);
          } catch {
            popup.paymentFailed('Payment verification failed. Contact support if amount was deducted.');
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => {
            popup.warning('Payment Cancelled', 'You cancelled the payment. Your order is still saved.');
            setPlacing(false);
          },
        },
      };

      new window.Razorpay(options).open();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      popup.orderFailed(message);
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page-root">
        <Navbar />
        <div className="checkout-status">
          <span className="checkout-loader" />
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items?.length) {
    return (
      <div className="checkout-page-root">
        <Navbar />
        <div className="checkout-status checkout-status--empty">
          <h2>Your cart is empty</h2>
          <p>Add items to continue with checkout.</p>
          <button type="button" className="checkout-primary-btn" onClick={() => navigate('/')}>
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  const isCOD = selectedApp === 'cod';
  const payLabel = placing
    ? 'Processing...'
    : isCOD
      ? `Place COD Order - ${CURRENCY(total)}`
      : `Pay ${CURRENCY(total)} via ${selectedAppObj?.label || 'Online'}`;

  return (
    <div className="checkout-page-root">
      <Navbar />
      <main className="checkout-shell">
        <header className="checkout-hero">
          <div>
            <p className="checkout-step">Checkout</p>
            <h1>Secure Payment</h1>
            <p className="checkout-subtitle">
              Fast ordering flow designed for multi-brand marketplace checkout.
            </p>
          </div>
          <button type="button" className="checkout-ghost-btn" onClick={() => navigate('/cart')}>
            Back To Cart
          </button>
        </header>

        <div className="checkout-grid checkout-layout">
          <section className="checkout-main">
            <article className="checkout-card">
              <div className="checkout-card-head">
                <h2>Offers & Coupons</h2>
                <button
                  type="button"
                  className="checkout-link-btn"
                  onClick={() => setShowCoupons((prev) => !prev)}
                >
                  {showCoupons ? 'Hide offers' : 'View offers'}
                </button>
              </div>

              {appliedCoupon ? (
                <div className="checkout-coupon-applied">
                  <div className="checkout-coupon-applied__meta">
                    <strong>{appliedCoupon.code}</strong>
                    <span>{appliedCoupon.desc}</span>
                  </div>
                  <div className="checkout-coupon-applied__right">
                    <span>-{CURRENCY(discount)}</span>
                    <button type="button" onClick={removeCoupon}>
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="checkout-coupon-entry">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(event) => {
                      setCouponInput(event.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    placeholder="Enter coupon code"
                  />
                  <button type="button" className="checkout-primary-btn" onClick={() => applyCoupon()}>
                    Apply
                  </button>
                </div>
              )}

              {couponError && <p className="checkout-error">{couponError}</p>}

              {showCoupons && !appliedCoupon && (
                <div className="checkout-coupon-list">
                  {eligibleCoupons.length ? (
                    eligibleCoupons.map((coupon) => (
                      <button
                        key={coupon.code}
                        type="button"
                        className="checkout-coupon-item"
                        onClick={() => applyCoupon(coupon.code)}
                      >
                        <div>
                          <p style={{ color: coupon.color }}>{coupon.code}</p>
                          <span>
                            {coupon.label} · {coupon.desc}
                          </span>
                        </div>
                        <span>Use</span>
                      </button>
                    ))
                  ) : (
                    <p className="checkout-muted">Add more items to unlock available offers.</p>
                  )}
                </div>
              )}
            </article>

            <article className="checkout-card">
              <div className="checkout-card-head">
                <h2>Select Payment Method</h2>
                <p>{selectedGroupObj.hint}</p>
              </div>

              <div className="checkout-payment-panel">
                <aside className="checkout-group-tabs">
                  {PAYMENT_GROUPS.map((group) => {
                    const active = group.id === selectedGroup;
                    return (
                      <button
                        key={group.id}
                        type="button"
                        className={`checkout-group-tab${active ? ' active' : ''}`}
                        onClick={() => {
                          setSelectedGroup(group.id);
                          setSelectedApp(group.apps[0].id);
                          setUpiError('');
                          setCardErrors({});
                        }}
                      >
                        <GroupIcon groupId={group.id} />
                        <div>
                          <strong>{group.label}</strong>
                          <span>{group.apps.length} options</span>
                        </div>
                      </button>
                    );
                  })}
                </aside>

                <div className="checkout-group-body">
                  <div className="checkout-app-list">
                    {selectedGroupObj.apps.map((app) => {
                      const selected = selectedApp === app.id;
                      return (
                        <button
                          key={app.id}
                          type="button"
                          className={`checkout-app-item${selected ? ' active' : ''}`}
                          onClick={() => setSelectedApp(app.id)}
                        >
                          <PaymentLogo logo={app.logo} />
                          <span>{app.label}</span>
                          {selected && <i />}
                        </button>
                      );
                    })}
                  </div>

                  {selectedGroup === 'upi' && (
                    <div className="checkout-extra-form">
                      <label htmlFor="upi-id">UPI ID</label>
                      <input
                        id="upi-id"
                        type="text"
                        value={upiId}
                        placeholder={`name@${selectedApp}`}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setUpiId(nextValue);
                          if (upiError) setUpiError(validateUpiId(nextValue));
                        }}
                        autoCapitalize="none"
                        className={upiError ? 'invalid' : ''}
                      />
                      {upiError && <p className="checkout-error">{upiError}</p>}
                      <p className="checkout-muted">Razorpay popup opens for secure UPI authorization.</p>
                    </div>
                  )}

                  {selectedGroup === 'card' && (
                    <div className="checkout-extra-form checkout-extra-form--card">
                      <label htmlFor="card-number">Card number</label>
                      <input
                        id="card-number"
                        type="text"
                        inputMode="numeric"
                        maxLength={19}
                        value={cardNum}
                        placeholder="4111 1111 1111 1111"
                        onChange={(event) => {
                          const nextValue = normalizeCardNumber(event.target.value);
                          setCardNum(nextValue);
                          if (cardErrors.cardNum) {
                            setCardErrors((prev) => ({ ...prev, cardNum: validateCardNumber(nextValue) }));
                          }
                        }}
                        className={cardErrors.cardNum ? 'invalid' : ''}
                      />
                      {cardErrors.cardNum && <p className="checkout-error">{cardErrors.cardNum}</p>}

                      <div className="checkout-card-inline">
                        <div>
                          <label htmlFor="card-expiry">Expiry</label>
                          <input
                            id="card-expiry"
                            type="text"
                            inputMode="numeric"
                            maxLength={5}
                            value={cardExpiry}
                            placeholder="MM/YY"
                            onChange={(event) => {
                              const nextValue = normalizeCardExpiry(event.target.value);
                              setCardExpiry(nextValue);
                              if (cardErrors.cardExpiry) {
                                setCardErrors((prev) => ({
                                  ...prev,
                                  cardExpiry: validateCardExpiry(nextValue),
                                }));
                              }
                            }}
                            className={cardErrors.cardExpiry ? 'invalid' : ''}
                          />
                          {cardErrors.cardExpiry && <p className="checkout-error">{cardErrors.cardExpiry}</p>}
                        </div>
                        <div>
                          <label htmlFor="card-cvv">CVV</label>
                          <input
                            id="card-cvv"
                            type="password"
                            inputMode="numeric"
                            maxLength={3}
                            value={cardCvv}
                            placeholder="123"
                            onChange={(event) => {
                              const nextValue = normalizeCardCvv(event.target.value);
                              setCardCvv(nextValue);
                              if (cardErrors.cardCvv) {
                                setCardErrors((prev) => ({ ...prev, cardCvv: validateCardCvv(nextValue) }));
                              }
                            }}
                            className={cardErrors.cardCvv ? 'invalid' : ''}
                          />
                          {cardErrors.cardCvv && <p className="checkout-error">{cardErrors.cardCvv}</p>}
                        </div>
                      </div>

                      <label htmlFor="card-name">Name on card</label>
                      <input
                        id="card-name"
                        type="text"
                        value={cardName}
                        placeholder="Cardholder name"
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setCardName(nextValue);
                          if (cardErrors.cardName) {
                            setCardErrors((prev) => ({
                              ...prev,
                              cardName: validateName(nextValue, { label: 'Cardholder name' }),
                            }));
                          }
                        }}
                        className={cardErrors.cardName ? 'invalid' : ''}
                      />
                      {cardErrors.cardName && <p className="checkout-error">{cardErrors.cardName}</p>}
                    </div>
                  )}

                  {selectedGroup === 'netbanking' && (
                    <p className="checkout-muted">
                      You will be redirected to your bank portal to approve this transaction securely.
                    </p>
                  )}

                  {selectedGroup === 'bnpl' && (
                    <p className="checkout-muted">
                      Pay later options are subject to provider eligibility checks.
                    </p>
                  )}

                  {selectedGroup === 'cod' && (
                    <div className="checkout-cod-note">
                      <strong>Cash on Delivery selected</strong>
                      <p>Keep exact change ready to make doorstep handover quicker.</p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          </section>

          <aside className="checkout-summary">
            <article className="checkout-card checkout-card--summary">
              <div className="checkout-card-head">
                <h2>Order Summary</h2>
                <p>{cart.restaurantName}</p>
              </div>

              <div className="checkout-items">
                {cart.items.map((item) => (
                  <div className="checkout-item-row" key={item.cartItemId}>
                    <span>
                      {item.itemName} x {item.quantity}
                    </span>
                    <strong>{CURRENCY(item.itemTotal || 0)}</strong>
                  </div>
                ))}
              </div>

              <div className="checkout-bill">
                <div>
                  <span>Item total</span>
                  <span>{CURRENCY(subtotal)}</span>
                </div>
                <div>
                  <span>Delivery fee</span>
                  <span>{deliveryFee ? CURRENCY(deliveryFee) : 'FREE'}</span>
                </div>
                <div>
                  <span>Platform fee</span>
                  <span>{CURRENCY(convenienceFee)}</span>
                </div>
                {appliedCoupon && (
                  <div className="checkout-bill--green">
                    <span>{appliedCoupon.code} discount</span>
                    <span>-{CURRENCY(discount)}</span>
                  </div>
                )}
              </div>

              <div className="checkout-total">
                <span>To Pay</span>
                <strong>{CURRENCY(total)}</strong>
              </div>

              <div className="checkout-address-box">
                <p>Deliver to</p>
                <span>
                  {addressPayload.addressLine || 'Saved address selected'}
                  {addressPayload.city ? `, ${addressPayload.city}` : ''}
                </span>
                <button type="button" onClick={() => navigate('/cart')}>
                  Change address
                </button>
              </div>

              <button
                type="button"
                onClick={handlePay}
                className="checkout-pay-btn"
                disabled={placing}
              >
                {payLabel}
              </button>

              <p className="checkout-secure-note">100% secure payment via Razorpay</p>
            </article>
          </aside>
        </div>
      </main>
    </div>
  );
}
