export function maskMobile(mobile) {
  if (!mobile || mobile.length < 4) return '+91 XXXXX XXXX';
  return `+91 XXXXX ${mobile.slice(-4)}`;
}

export function initialsOf(fullName) {
  if (!fullName) return '';
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export function firstNameOf(fullName) {
  if (!fullName) return '';
  return fullName.trim().split(/\s+/)[0];
}

export function formatDate(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function onlyDigits(value, maxLength = Infinity) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, maxLength);
}

export function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function formatCurrency(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`;
}

export function formatFileSize(bytes) {
  const size = Number(bytes ?? 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
