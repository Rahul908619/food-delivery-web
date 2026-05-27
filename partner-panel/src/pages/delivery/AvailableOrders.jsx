import { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import popup from '../../components/CustomToast';
import './deliveryTheme.css';
import { formatCurrency } from './deliveryUtils';

const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.209 };

function getAddressPreview(address) {
  if (!address) return 'Address not available';
  if (address.length <= 70) return address;
  return `${address.slice(0, 70)}...`;
}

export default function AvailableOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingOrderId, setAcceptingOrderId] = useState(null);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [sortBy, setSortBy] = useState('distance');
  const locationLoaded = useRef(false);

  const loadOrders = async (initial = false) => {
    if (initial) setLoading(true);
    if (!initial) setRefreshing(true);

    try {
      const response = await API.get('/delivery/orders/available', {
        params: {
          lat: location.lat,
          lng: location.lng,
          radius: 10,
        },
      });
      setOrders(response.data?.data || []);
    } catch (error) {
      popup.error('Load Failed', error.response?.data?.message || 'Could not load available orders.');
    } finally {
      if (initial) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (locationLoaded.current) return;
    locationLoaded.current = true;
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {}
    );
  }, []);

  useEffect(() => {
    loadOrders(true);
    const poll = setInterval(() => loadOrders(false), 20000);
    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.lat, location.lng]);

  const sortedOrders = useMemo(() => {
    const list = [...orders];
    if (sortBy === 'fee') {
      return list.sort((a, b) => Number(b.deliveryFee || 0) - Number(a.deliveryFee || 0));
    }
    if (sortBy === 'eta') {
      return list.sort((a, b) => Number(a.estimatedMinutes || 0) - Number(b.estimatedMinutes || 0));
    }
    return list.sort((a, b) => Number(a.distanceKm || 0) - Number(b.distanceKm || 0));
  }, [orders, sortBy]);

  const handleAccept = async (orderId) => {
    setAcceptingOrderId(orderId);
    try {
      await API.put(`/delivery/order/${orderId}/accept`);
      popup.success('Order Accepted', `Order #${orderId} is assigned to you.`);
      await loadOrders(false);
    } catch (error) {
      popup.error('Accept Failed', error.response?.data?.message || 'Could not accept this order.');
    } finally {
      setAcceptingOrderId(null);
    }
  };

  return (
    <div className="delivery-shell">
      <Sidebar />
      <div className="delivery-main">
        <Navbar title="Available Orders" />
        <div className="delivery-content">
          <section className="delivery-panel delivery-panel--tight">
            <div className="delivery-headline">
              <div>
                <h3 className="delivery-title">Nearby Dispatch Queue</h3>
                <p className="delivery-subtitle">Auto-refresh runs every 20 seconds within a 10 km radius.</p>
              </div>
              <div className="delivery-btn-row">
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="delivery-btn delivery-btn--ghost">
                  <option value="distance">Sort: Nearest</option>
                  <option value="fee">Sort: Highest Fee</option>
                  <option value="eta">Sort: Fastest ETA</option>
                </select>
                <button
                  type="button"
                  className="delivery-btn delivery-btn--primary"
                  onClick={() => loadOrders(false)}
                  disabled={refreshing}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </section>

          {loading ? (
            <section className="delivery-panel delivery-spinner-wrap">
              <div className="delivery-spinner" />
            </section>
          ) : sortedOrders.length === 0 ? (
            <section className="delivery-empty">
              <p className="delivery-empty__title">No orders currently available</p>
              <p className="delivery-empty__text">Keep your status online. New orders will appear automatically.</p>
            </section>
          ) : (
            <section className="delivery-list">
              {sortedOrders.map((order) => (
                <article className="delivery-card" key={order.orderId}>
                  <div className="delivery-card__head">
                    <div>
                      <h4 className="delivery-card__title">{order.restaurantName || 'Restaurant'}</h4>
                      <p className="delivery-card__meta">
                        Order #{order.orderId} • Placed{' '}
                        {order.placedAt
                          ? new Date(order.placedAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'recently'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="delivery-pill delivery-pill--success">Fee {formatCurrency(order.deliveryFee || 0)}</span>
                    </div>
                  </div>

                  <div className="delivery-card__grid">
                    <div className="delivery-mini">
                      <p className="delivery-mini__label">Distance</p>
                      <p className="delivery-mini__value">{Number(order.distanceKm || 0).toFixed(1)} km</p>
                    </div>
                    <div className="delivery-mini">
                      <p className="delivery-mini__label">Estimated Time</p>
                      <p className="delivery-mini__value">{Math.max(10, Number(order.estimatedMinutes || 0))} min</p>
                    </div>
                    <div className="delivery-mini">
                      <p className="delivery-mini__label">Order Amount</p>
                      <p className="delivery-mini__value">{formatCurrency(order.totalAmount || 0)}</p>
                    </div>
                    <div className="delivery-mini">
                      <p className="delivery-mini__label">Drop Address</p>
                      <p className="delivery-mini__value">{getAddressPreview(order.deliveryAddressLine)}</p>
                    </div>
                  </div>

                  <div className="delivery-items">
                    {(order.items || []).slice(0, 4).map((item, index) => (
                      <span className="delivery-item-chip" key={`${order.orderId}-${index}`}>
                        {item.itemName} x{item.quantity}
                      </span>
                    ))}
                    {(order.items || []).length > 4 && (
                      <span className="delivery-item-chip">+{order.items.length - 4} more items</span>
                    )}
                  </div>

                  <div className="delivery-btn-row" style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className="delivery-btn delivery-btn--primary"
                      onClick={() => handleAccept(order.orderId)}
                      disabled={acceptingOrderId === order.orderId}
                    >
                      {acceptingOrderId === order.orderId ? 'Accepting...' : 'Accept Delivery'}
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

