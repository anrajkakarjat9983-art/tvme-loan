export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const PIN_CODE_REGEX = /^[1-9]\d{5}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]{1,49}$/;
export const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;
export const OTP_LENGTH = 6;

export function validatePan(value) {
  const pan = String(value ?? '')
    .trim()
    .toUpperCase();
  if (!pan) return 'PAN number is required';
  if (!PAN_REGEX.test(pan)) return 'Enter a valid PAN (e.g. ABCDE1234F)';
  return '';
}

export function validateMobile(value) {
  const digits = String(value ?? '').trim();
  if (!digits) return 'Mobile number is required';
  if (!/^\d+$/.test(digits)) return 'Only digits are allowed';
  if (digits.length !== 10) return 'Mobile number must be exactly 10 digits';
  if (!MOBILE_REGEX.test(digits)) return 'Enter a valid Indian mobile number';
  return '';
}

export function validateOtp(value, length = OTP_LENGTH) {
  const digits = String(value ?? '');
  if (!digits) return 'Enter the 6-digit OTP';
  if (!/^\d+$/.test(digits)) return 'OTP must contain only digits';
  if (digits.length < length) return `Enter all ${length} digits to continue`;
  return '';
}

export function validateFullName(value) {
  const name = String(value ?? '').trim();
  if (!name) return 'Full name is required';
  if (name.length < 3) return 'Name must be at least 3 characters';
  if (!NAME_REGEX.test(name)) return 'Enter a valid name (letters only)';
  return '';
}

export function validateDateOfBirth(value) {
  if (!value) return 'Date of birth is required';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Enter a valid date';
  const today = new Date();
  if (date > today) return 'Date of birth cannot be in the future';
  const age = today.getFullYear() - date.getFullYear();
  const beforeBirthday =
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
  const exactAge = beforeBirthday ? age - 1 : age;
  if (exactAge < 18) return 'You must be at least 18 years old';
  if (exactAge > 100) return 'Enter a valid date of birth';
  return '';
}

export function validateRequired(value, label) {
  if (!String(value ?? '').trim()) return `${label} is required`;
  return '';
}

export function validateAccountHolder(value) {
  const name = String(value ?? '').trim();
  if (!name) return 'Account holder name is required';
  if (name.length < 3) return 'Enter the name on your bank account';
  return '';
}

export function validateAccountNumber(value) {
  const digits = String(value ?? '').trim();
  if (!digits) return 'Account number is required';
  if (!/^\d+$/.test(digits)) return 'Account number must contain only digits';
  if (digits.length < 9 || digits.length > 18) return 'Enter a valid account number (9-18 digits)';
  return '';
}

export function validateIfsc(value) {
  const ifsc = String(value ?? '').trim().toUpperCase();
  if (!ifsc) return 'IFSC code is required';
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return 'Enter a valid IFSC (e.g. HDFC0001234)';
  return '';
}

export function validateBankName(value) {
  const name = String(value ?? '').trim();
  if (!name) return 'Bank name is required';
  if (name.length < 3) return 'Enter your bank name';
  return '';
}

export function validateAddress(value) {
  const address = String(value ?? '').trim();
  if (!address) return 'Address is required';
  if (address.length < 5) return 'Enter your complete address';
  return '';
}

export function validatePinCode(value) {
  const digits = String(value ?? '').trim();
  if (!digits) return 'PIN code is required';
  if (!/^\d+$/.test(digits)) return 'PIN code must contain only digits';
  if (digits.length !== 6) return 'PIN code must be exactly 6 digits';
  if (!PIN_CODE_REGEX.test(digits)) return 'Enter a valid PIN code';
  return '';
}

export function validateEmail(value) {
  const email = String(value ?? '').trim();
  if (!email) return '';
  if (!EMAIL_REGEX.test(email)) return 'Enter a valid email address';
  return '';
}

export function validatePersonalDetails(values) {
  return {
    fullName: validateFullName(values.fullName),
    dateOfBirth: validateDateOfBirth(values.dateOfBirth),
    gender: validateRequired(values.gender, 'Gender'),
    address: validateAddress(values.address),
    city: validateRequired(values.city, 'City'),
    state: validateRequired(values.state, 'State'),
    pinCode: validatePinCode(values.pinCode),
    email: validateEmail(values.email),
  };
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
