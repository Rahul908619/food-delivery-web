import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import popup from '../../components/CustomToast';
import './deliveryTheme.css';
import {
  formatCurrency,
  getCompletedDeliveries,
  getDeliveryTimestamp,
  getLastNDaysSeries,
  sumDeliveryFees,
} from './deliveryUtils';

function getMonthEarnings(deliveries) {
  const now = new Date();
  return getCompletedDeliveries(deliveries).reduce((total, delivery) => {
    const stamp = getDeliveryTimestamp(delivery);
    if (!stamp) return total;
    if (stamp.getMonth() !== now.getMonth() || stamp.getFullYear() !== now.getFullYear()) return total;
    return total + Number(delivery.deliveryFee || 0);
  }, 0);
}

export default function DeliveryDashboard() {
  const [profile, setProfile] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(false);

  const loadSnapshot = async (initial = false) => {
    if (initial) setLoading(true);
    if (!initial) setRefreshing(true);

    try {
      const [profileRes, earningsRes, deliveriesRes] = await Promise.all([
        API.get('/delivery/profile'),
        API.get('/delivery/earnings'),
        API.get('/delivery/orders/my'),
      ]);
      setProfile(profileRes.data?.data || null);
      setEarnings(earningsRes.data?.data || null);
      setDeliveries(deliveriesRes.data?.data || []);
    } catch (error) {
      popup.error('Load Failed', error.response?.data?.message || 'Could not load delivery dashboard.');
    } finally {
      if (initial) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSnapshot(true);
  }, []);

  const toggleAvailability = async () => {
    if (!profile?.approved) {
      popup.error('Action Blocked', 'Your profile is pending approval.');
      return;
    }

    setToggling(true);
    try {
      await API.put('/delivery/availability');
      popup.success('Status Updated', 'Availability updated.');
      await loadSnapshot(false);
    } catch (error) {
      popup.error('Update Failed', error.response?.data?.message || 'Could not update availability status.');
    } finally {
      setToggling(false);
    }
  };

  const activeDeliveries = useMemo(
    () => deliveries.filter((delivery) => delivery.status === 'OUT_FOR_DELIVERY').length,
    [deliveries]
  );
  const completedDeliveries = useMemo(() => getCompletedDeliveries(deliveries), [deliveries]);
  const weekSeries = useMemo(() => getLastNDaysSeries(deliveries, 7), [deliveries]);
  const weekEarnings = useMemo(() => weekSeries.reduce((sum, day) => sum + day.value, 0), [weekSeries]);
  const monthEarnings = useMemo(() => getMonthEarnings(deliveries), [deliveries]);
  const weekMax = Math.max(1, ...weekSeries.map((point) => point.value));
  const lastDeliveredAt = useMemo(() => {
    const sorted = [...completedDeliveries].sort((a, b) => {
      const aTime = getDeliveryTimestamp(a)?.getTime() || 0;
      const bTime = getDeliveryTimestamp(b)?.getTime() || 0;
      return bTime - aTime;
    });
    return sorted[0] ? getDeliveryTimestamp(sorted[0]) : null;
  }, [completedDeliveries]);

  if (loading) {
    return (
      <div className="delivery-shell">
        <Sidebar />
        <div className="delivery-main">
          <Navbar title="Delivery Dashboard" />
          <div className="delivery-content">
            <div className="delivery-panel delivery-spinner-wrap">
              <div className="delivery-spinner" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-shell">
      <Sidebar />
      <div className="delivery-main">
        <Navbar title="Delivery Dashboard" />
        <div className="delivery-content">
          {!profile?.approved && (
            <div className="delivery-alert">
              Account approval is pending. You can browse data, but accepting new orders is disabled.
            </div>
          )}

          <section className="delivery-panel delivery-panel--accent">
            <div className="delivery-headline">
              <div>
                <h3 className="delivery-title">Shift Control</h3>
                <p className="delivery-subtitle" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  Keep your status online to receive nearby orders automatically.
                </p>
              </div>
              <span className={`delivery-status ${profile?.available ? 'delivery-status--online' : 'delivery-status--offline'}`}>
                {profile?.available ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="delivery-row delivery-row--two" style={{ marginTop: 14 }}>
              <div>
                <div className="delivery-btn-row">
                  <button
                    type="button"
                    className="delivery-btn delivery-btn--primary"
                    onClick={toggleAvailability}
                    disabled={toggling || !profile?.approved}
                  >
                    {toggling ? 'Updating...' : profile?.available ? 'Go Offline' : 'Go Online'}
                  </button>
                  <button
                    type="button"
                    className="delivery-btn delivery-btn--ghost"
                    onClick={() => loadSnapshot(false)}
                    disabled={refreshing}
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh Snapshot'}
                  </button>
                </div>
                <p className="delivery-subtitle" style={{ marginTop: 10, color: 'rgba(255,255,255,0.72)' }}>
                  Last completed delivery:{' '}
                  {lastDeliveredAt
                    ? lastDeliveredAt.toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'No delivery completed yet'}
                </p>
              </div>

              <div className="delivery-chart-box" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}>
                <p className="delivery-chart-title" style={{ color: '#fff' }}>
                  Last 7 Days Earnings
                </p>
                <div className="delivery-bars delivery-bars--small">
                  {weekSeries.map((point) => (
                    <div className="delivery-bar" key={point.key}>
                      <div
                        className="delivery-bar__fill"
                        style={{
                          height: `${Math.max((point.value / weekMax) * 100, 8)}%`,
                          background: 'linear-gradient(180deg, #fda833, #f76b1b)',
                        }}
                        title={`${point.label}: ${formatCurrency(point.value)}`}
                      />
                      <span className="delivery-bar__label" style={{ color: 'rgba(255,255,255,0.72)' }}>
                        {point.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="delivery-row delivery-row--kpi">
            <article className="delivery-kpi">
              <p className="delivery-kpi__label">Today Earnings</p>
              <p className="delivery-kpi__value">{formatCurrency(earnings?.todayEarnings || 0)}</p>
              <p className="delivery-kpi__meta">Live from completed deliveries today</p>
            </article>
            <article className="delivery-kpi">
              <p className="delivery-kpi__label">Week Earnings</p>
              <p className="delivery-kpi__value">{formatCurrency(weekEarnings)}</p>
              <p className="delivery-kpi__meta">{weekSeries.reduce((sum, day) => sum + day.count, 0)} completed orders in 7 days</p>
            </article>
            <article className="delivery-kpi">
              <p className="delivery-kpi__label">Month Earnings</p>
              <p className="delivery-kpi__value">{formatCurrency(monthEarnings)}</p>
              <p className="delivery-kpi__meta">Current month payout potential</p>
            </article>
            <article className="delivery-kpi">
              <p className="delivery-kpi__label">Active Deliveries</p>
              <p className="delivery-kpi__value">{activeDeliveries}</p>
              <p className="delivery-kpi__meta">{completedDeliveries.length} delivered so far</p>
            </article>
          </section>

          <section className="delivery-row delivery-row--equal">
            <article className="delivery-panel">
              <div className="delivery-headline">
                <div>
                  <h3 className="delivery-title">Quick Actions</h3>
                  <p className="delivery-subtitle">Jump directly to active partner workflows.</p>
                </div>
              </div>
              <div className="delivery-btn-row" style={{ marginTop: 12 }}>
                <Link className="delivery-btn delivery-btn--primary" to="/delivery/available">
                  Find Orders
                </Link>
                <Link className="delivery-btn delivery-btn--ghost" to="/delivery/my-deliveries">
                  Track Deliveries
                </Link>
                <Link className="delivery-btn delivery-btn--ghost" to="/delivery/earnings">
                  Open Earnings
                </Link>
              </div>
            </article>

            <article className="delivery-panel delivery-panel--warm">
              <div className="delivery-headline">
                <div>
                  <h3 className="delivery-title">Partner Profile</h3>
                  <p className="delivery-subtitle">Vehicle and compliance details.</p>
                </div>
                <span className={`delivery-status ${profile?.approved ? 'delivery-status--online' : 'delivery-status--pending'}`}>
                  {profile?.approved ? 'Approved' : 'Pending'}
                </span>
              </div>

              <div className="delivery-stat-grid" style={{ marginTop: 12 }}>
                <div className="delivery-stat">
                  <p className="delivery-stat__label">Vehicle Type</p>
                  <p className="delivery-stat__value">{profile?.vehicleType || 'Not set'}</p>
                </div>
                <div className="delivery-stat">
                  <p className="delivery-stat__label">Vehicle Number</p>
                  <p className="delivery-stat__value">{profile?.vehicleNumber || 'Not set'}</p>
                </div>
                <div className="delivery-stat">
                  <p className="delivery-stat__label">License Number</p>
                  <p className="delivery-stat__value">{profile?.licenseNumber || 'Not set'}</p>
                </div>
                <div className="delivery-stat">
                  <p className="delivery-stat__label">Lifetime Earnings</p>
                  <p className="delivery-stat__value">{formatCurrency(sumDeliveryFees(completedDeliveries))}</p>
                </div>
              </div>
            </article>
          </section>
        </div>
      </div>
    </div>
  );
}

