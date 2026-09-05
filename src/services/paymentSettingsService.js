const SETTINGS_KEY = 'tvme_payment_settings';

const defaults = {
  qrImageUrl: '',
  upiId: 'tvme@upi',
  amount: '499',
};

function load() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
  return { ...defaults };
}

function persist(settings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    return;
  }
}

export function getPaymentSettings() {
  return load();
}

export function savePaymentSettings(patch) {
  const next = { ...load(), ...patch };
  persist(next);
  return next;
}
