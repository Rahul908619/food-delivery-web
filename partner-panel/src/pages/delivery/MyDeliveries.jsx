import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import popup from '../../components/CustomToast';
import './deliveryTheme.css';
import {
  formatCurrency,
  formatDateTime,
  getCompletedDeliveries,
  getDeliveryTimestamp,
  getLastNDaysSeries,
} from './deliveryUtils';

export default function MyDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const loadDeliveries = async (initial = false) => {
    if (initial) setLoading(true);
    if (!initial) setRefreshing(true);
    try {
      const response = await API.get('/delivery/orders/my');
      setDeliveries(response.data?.data || []);
    } catch (error) {
      popup.error('Load Failed', error.response?.data?.message || 'Could not load your deliveries.');
    } finally {
      if (initial) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDeliveries(true);
  }, []);

  const markDelivered = async (orderId) => {
    setUpdatingOrderId(orderId);
    try {
      await API.put(`/delivery/order/${orderId}/delivered`);
      popup.success('Delivered', `Order #${orderId} marked as delivered.`);
      await loadDeliveries(false);
    } catch (error) {
      popup.error('Update Failed', error.response?.data?.message || 'Could not update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const activeDeliveries = useMemo(
    () => deliveries.filter((delivery) => delivery.status === 'OUT_FOR_DELIVERY'),
    [deliveries]
  );
  const completedDeliveries = useMemo(() => {
    return getCompletedDeliveries(deliveries).sort((a, b) => {
      const aTime = getDeliveryTimestamp(a)?.getTime() || 0;
      const bTime = getDeliveryTimestamp(b)?.getTime() || 0;
      return bTime - aTime;
    });
  }, [deliveries]);
  const weeklySeries = useMemo(() => getLastNDaysSeries(deliveries, 7), [deliveries]);
  const weekEarnings = weeklySeries.reduce((sum, day) => sum + day.value, 0);
  const completedToday = useMemo(() => {
    const today = new Date();
    return completedDeliveries.filter((delivery) => {
      const stamp = getDeliveryTimestamp(delivery);
      if (!stamp) return false;
      return (
        stamp.getDate() === today.getDate() &&
        stamp.getMonth() === today.getMonth() &&
        stamp.getFullYear() === today.getFullYear()
      );
    }).length;
  }, [completedDeliveries]);

  return (
    <div className="delivery-shell">
      <Sidebar />
      <div className="delivery-main">
        <Navbar title="My Deliveries" />
        <div className="delivery-content">
          <section className="delivery-panel delivery-panel--tight">
            <div className="delivery-headline">
              <div>
                <h3 className="delivery-title">Delivery Pipeline</h3>
                <p className="delivery-subtitle">Track active rides and completed drops in one place.</p>
              </div>
              <button
                type="button"
                className="delivery-btn delivery-btn--ghost"
                onClick={() => loadDeliveries(false)}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </section>

          <section className="delivery-row delivery-row--kpi">
            <article className="delivery-kpi">
              <p className="delivery-kpi__label">Active Deliveries</p>
              <p className="delivery-kpi__value">{activeDeliveries.length}</p>
              <p className="delivery-kpi__meta">Orders currently out for delivery</p>
            </article>
            <article className="delivery-kpi">
              <p className="delivery-kpi__label">Completed Today</p>
              <p className="delivery-kpi__value">{completedToday}</p>
              <p className="delivery-kpi__meta">Delivered in the current day</p>
            </article>
            <article className="delivery-kpi">
              <p className="delivery-kpi__label">7-Day Earnings</p>
              <p className="delivery-kpi__value">{formatCurrency(weekEarnings)}</p>
              <p className="delivery-kpi__meta">{completedDeliveries.length} lifetime completed deliveries</p>
            </article>
          </section>

          {loading ? (
            <section className="delivery-panel delivery-spinner-wrap">
              <div className="delivery-spinner" />
            </section>
          ) : (
            <>
              <section className="delivery-panel">
                <div className="delivery-headline">
                  <div>
                    <h3 className="delivery-title">Active Runs</h3>
                    <p className="delivery-subtitle">Only active orders can be marked as delivered.</p>
                  </div>
                  <span className="delivery-pill delivery-pill--accent">{activeDeliveries.length} active</span>
                </div>

                {activeDeliveries.length === 0 ? (
                  <div className="delivery-empty" style={{ marginTop: 10 }}>
                    <p className="delivery-empty__title">No active deliveries</p>
                    <p className="delivery-empty__text">Accept an order from the available queue to start your trip.</p>
                  </div>
                ) : (
                  <div className="delivery-list" style={{ marginTop: 10 }}>
                    {activeDeliveries.map((order) => (
                      <article className="delivery-card" key={order.orderId}>
                        <div className="delivery-card__head">
                          <div>
                            <h4 className="delivery-card__title">Order #{order.orderId}</h4>
                            <p className="delivery-card__meta">{order.restaurantName || 'Restaurant'} • In progress</p>
                          </div>
                          <span className="delivery-pill delivery-pill--accent">In Route</span>
                        </div>

                        <div className="delivery-card__grid">
                          <div className="delivery-mini">
                            <p className="delivery-mini__label">Pickup</p>
                            <p className="delivery-mini__value">{order.restaurantName || 'N/A'}</p>
                          </div>
                          <div className="delivery-mini">
                            <p className="delivery-mini__label">Drop Address</p>
                            <p className="delivery-mini__value">{order.deliveryAddressLine || 'N/A'}</p>
                          </div>
                          <div className="delivery-mini">
                            <p className="delivery-mini__label">Distance</p>
                            <p className="delivery-mini__value">{Number(order.distanceKm || 0).toFixed(1)} km</p>
                          </div>
                          <div className="delivery-mini">
                            <p className="delivery-mini__label">Delivery Fee</p>
                            <p className="delivery-mini__value">{formatCurrency(order.deliveryFee || 0)}</p>
                          </div>
                        </div>

                        <div className="delivery-items">
                          {(order.items || []).slice(0, 5).map((item, index) => (
                            <span className="delivery-item-chip" key={`${order.orderId}-${index}`}>
                              {item.itemName} x{item.quantity}
                            </span>
                          ))}
                          {(order.items || []).length > 5 && (
                            <span className="delivery-item-chip">+{order.items.length - 5} more items</span>
                          )}
                        </div>

                        <div className="delivery-btn-row" style={{ marginTop: 12 }}>
                          <button
                            type="button"
                            className="delivery-btn delivery-btn--success"
                            onClick={() => markDelivered(order.orderId)}
                            disabled={updatingOrderId === order.orderId}
                          >
                            {updatingOrderId === order.orderId ? 'Updating...' : 'Mark as Delivered'}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="delivery-panel">
                <div className="delivery-headline">
                  <div>
                    <h3 className="delivery-title">Completed Deliveries</h3>
                    <p className="delivery-subtitle">Recent completed runs and credited delivery fee.</p>
                  </div>
                  <span className="delivery-pill delivery-pill--success">{completedDeliveries.length} completed</span>
                </div>

                {completedDeliveries.length === 0 ? (
                  <div className="delivery-empty" style={{ marginTop: 10 }}>
                    <p className="delivery-empty__title">No completed deliveries yet</p>
                    <p className="delivery-empty__text">Complete active deliveries to build your earnings history.</p>
                  </div>
                ) : (
                  <div className="delivery-list" style={{ marginTop: 10 }}>
                    {completedDeliveries.slice(0, 20).map((order) => (
                      <article className="delivery-card" key={`done-${order.orderId}`}>
                        <div className="delivery-card__head">
                          <div>
                            <h4 className="delivery-card__title">{order.restaurantName || 'Restaurant'}</h4>
                            <p className="delivery-card__meta">Order #{order.orderId} • {formatDateTime(order.deliveredAt || order.placedAt)}</p>
                          </div>
                          <span className="delivery-pill delivery-pill--success">{formatCurrency(order.deliveryFee || 0)}</span>
                        </div>
                        <div className="delivery-card__grid">
                          <div className="delivery-mini">
                            <p className="delivery-mini__label">Drop Address</p>
                            <p className="delivery-mini__value">{order.deliveryAddressLine || 'N/A'}</p>
                          </div>
                          <div className="delivery-mini">
                            <p className="delivery-mini__label">Distance</p>
                            <p className="delivery-mini__value">{Number(order.distanceKm || 0).toFixed(1)} km</p>
                          </div>
                          <div className="delivery-mini">
                            <p className="delivery-mini__label">Order Amount</p>
                            <p className="delivery-mini__value">{formatCurrency(order.totalAmount || 0)}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

