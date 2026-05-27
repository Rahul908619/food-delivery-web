const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\d{10}$/;
const PHONE_INPUT_RE = /^[\d\s()+-]+$/;
const NAME_RE = /^[A-Za-z][A-Za-z\s'.-]*$/;
const CITY_RE = /^[A-Za-z][A-Za-z\s'.-]*$/;
const PINCODE_RE = /^\d{6}$/;
const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function trimValue(value = '') {
  return typeof value === 'string' ? value.trim() : '';
}

function hasSavedAddressId(payload = {}) {
  return payload.savedAddressId !== undefined && payload.savedAddressId !== null && `${payload.savedAddressId}`.trim() !== '';
}

function passesLuhn(value) {
  let sum = 0;
  let shouldDouble = false;

  for (let i = value.length - 1; i >= 0; i -= 1) {
    let digit = Number(value[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function normalizeEmail(value = '') {
  return trimValue(value).toLowerCase();
}

export function normalizePhone(value = '') {
  return value.replace(/\D/g, '').slice(0, 10);
}

export function normalizePincode(value = '') {
  return value.replace(/\D/g, '').slice(0, 6);
}

export function normalizeCardNumber(value = '') {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function normalizeCardExpiry(value = '') {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function normalizeCardCvv(value = '') {
  return value.replace(/\D/g, '').slice(0, 3);
}

export function validateName(value, { label = 'Name', required = true } = {}) {
  const trimmed = trimValue(value);

  if (!trimmed) return required ? `${label} is required` : '';
  if (trimmed.length < 2) return `${label} must be at least 2 characters`;
  if (trimmed.length > 50) return `${label} must be 50 characters or fewer`;
  if (!NAME_RE.test(trimmed)) return `${label} should only contain letters, spaces, apostrophes, periods or hyphens`;

  return '';
}

export function validateEmail(value, { required = false } = {}) {
  const trimmed = trimValue(value);

  if (!trimmed) return required ? 'Email address is required' : '';
  if (!EMAIL_RE.test(trimmed)) return 'Please enter a valid email address';

  return '';
}

export function validatePhone(value, { required = false } = {}) {
  const digits = normalizePhone(value);

  if (!digits) return required ? 'Phone number is required' : '';
  if (!PHONE_RE.test(digits)) return 'Phone number must be exactly 10 digits';

  return '';
}

export function validateLoginIdentifier(value) {
  const trimmed = trimValue(value);

  if (!trimmed) return 'Email or phone is required';
  if (EMAIL_RE.test(trimmed)) return '';
  if (PHONE_INPUT_RE.test(trimmed) && PHONE_RE.test(normalizePhone(trimmed))) return '';

  return 'Enter a valid email address or 10-digit phone number';
}

export function normalizeLoginIdentifier(value = '') {
  const trimmed = trimValue(value);
  return EMAIL_RE.test(trimmed) ? normalizeEmail(trimmed) : normalizePhone(trimmed);
}

export function validatePassword(value, { required = true } = {}) {
  if (!value) return required ? 'Password is required' : '';
  if (value.length < 6) return 'Password must be at least 6 characters';
  if (value.length > 64) return 'Password must be 64 characters or fewer';

  return '';
}

export function validateAddressLine(value, { required = true } = {}) {
  const trimmed = trimValue(value);

  if (!trimmed) return required ? 'Address line is required' : '';
  if (trimmed.length < 5) return 'Address line must be at least 5 characters';
  if (trimmed.length > 120) return 'Address line must be 120 characters or fewer';

  return '';
}

export function validateCity(value, { required = true } = {}) {
  const trimmed = trimValue(value);

  if (!trimmed) return required ? 'City is required' : '';
  if (trimmed.length < 2) return 'City must be at least 2 characters';
  if (trimmed.length > 50) return 'City must be 50 characters or fewer';
  if (!CITY_RE.test(trimmed)) return 'City should only contain letters, spaces, apostrophes, periods or hyphens';

  return '';
}

export function validatePincode(value, { required = true } = {}) {
  const digits = normalizePincode(value);

  if (!digits) return required ? 'Pincode is required' : '';
  if (!PINCODE_RE.test(digits)) return 'Pincode must be 6 digits';

  return '';
}

export function validateCheckoutAddress(payload = {}) {
  if (hasSavedAddressId(payload)) return '';

  return (
    validateAddressLine(payload.addressLine) ||
    validateCity(payload.city) ||
    validatePincode(payload.pincode)
  );
}

export function validateUpiId(value, { required = true } = {}) {
  const trimmed = trimValue(value);

  if (!trimmed) return required ? 'Enter a UPI ID to continue.' : '';
  if (!UPI_RE.test(trimmed)) return 'Enter a valid UPI ID.';

  return '';
}

export function validateCardNumber(value, { required = true } = {}) {
  const digits = value.replace(/\D/g, '');

  if (!digits) return required ? 'Card number is required' : '';
  if (digits.length !== 16) return 'Enter a valid 16-digit card number';
  if (!passesLuhn(digits)) return 'Enter a valid card number';

  return '';
}

export function validateCardExpiry(value, { required = true } = {}) {
  const trimmed = trimValue(value);

  if (!trimmed) return required ? 'Expiry is required' : '';
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(trimmed)) return 'Enter valid expiry (MM/YY)';

  const [month, year] = trimmed.split('/');
  const expiryMonth = Number(month);
  const expiryYear = 2000 + Number(year);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
    return 'Card expiry cannot be in the past';
  }

  return '';
}

export function validateCardCvv(value, { required = true } = {}) {
  const digits = normalizeCardCvv(value);

  if (!digits) return required ? 'CVV is required' : '';
  if (!/^\d{3}$/.test(digits)) return 'Enter a valid 3-digit CVV';

  return '';
}

export function validateImageFile(file) {
  if (!file) return '';
  if (!file.type.startsWith('image/')) return 'Please choose a valid image file';
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be 2 MB or smaller';

  return '';
}
