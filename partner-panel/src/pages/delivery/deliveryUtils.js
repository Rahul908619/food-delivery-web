const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatCurrency(amount) {
  return `INR ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function formatDateTime(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDeliveryTimestamp(delivery) {
  const raw = delivery?.deliveredAt || delivery?.placedAt;
  const parsed = raw ? new Date(raw) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function getCompletedDeliveries(deliveries = []) {
  return deliveries.filter((delivery) => delivery?.status === 'DELIVERED');
}

export function sumDeliveryFees(deliveries = []) {
  return deliveries.reduce((total, delivery) => total + Number(delivery?.deliveryFee || 0), 0);
}

export function getLastNDaysSeries(deliveries = [], days = 7) {
  const completed = getCompletedDeliveries(deliveries);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const list = Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      value: 0,
      count: 0,
    };
  });

  const map = new Map(list.map((item) => [item.key, item]));
  completed.forEach((delivery) => {
    const stamp = getDeliveryTimestamp(delivery);
    if (!stamp) return;
    const key = new Date(stamp.getFullYear(), stamp.getMonth(), stamp.getDate()).toISOString().slice(0, 10);
    const slot = map.get(key);
    if (!slot) return;
    slot.value += Number(delivery.deliveryFee || 0);
    slot.count += 1;
  });

  return list;
}

export function getMonthlySeries(deliveries = [], year = new Date().getFullYear()) {
  const completed = getCompletedDeliveries(deliveries);
  const list = MONTH_LABELS.map((label, monthIndex) => ({
    label,
    monthIndex,
    value: 0,
    count: 0,
  }));

  completed.forEach((delivery) => {
    const stamp = getDeliveryTimestamp(delivery);
    if (!stamp || stamp.getFullYear() !== year) return;
    const month = list[stamp.getMonth()];
    month.value += Number(delivery.deliveryFee || 0);
    month.count += 1;
  });

  return list;
}

export function getYearlySeries(deliveries = [], yearsCount = 5) {
  const completed = getCompletedDeliveries(deliveries);
  const currentYear = new Date().getFullYear();
  const firstYear = currentYear - yearsCount + 1;
  const list = Array.from({ length: yearsCount }, (_, index) => ({
    label: `${firstYear + index}`,
    year: firstYear + index,
    value: 0,
    count: 0,
  }));
  const map = new Map(list.map((item) => [item.year, item]));

  completed.forEach((delivery) => {
    const stamp = getDeliveryTimestamp(delivery);
    if (!stamp) return;
    const slot = map.get(stamp.getFullYear());
    if (!slot) return;
    slot.value += Number(delivery.deliveryFee || 0);
    slot.count += 1;
  });

  return list;
}

export function maskAccountNumber(value) {
  const digits = `${value || ''}`.replace(/\D/g, '');
  if (digits.length <= 4) return digits || 'Not set';
  const visible = digits.slice(-4);
  return `${'*'.repeat(Math.max(0, digits.length - 4))}${visible}`;
}

