import { env } from '../config/env';
import { mockDb } from '../data/mockDb';

const OTP_TTL_MS = 5 * 60 * 1000;
const MOCK_LATENCY_MS = 700;

const otpStore = new Map();

export class AuthServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toVerificationHash(value) {
  let hash = 5381;
  const text = String(value);
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0;
  }
  return `v1:${hash.toString(16)}`;
}

async function request(path, payload) {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new AuthServiceError('Something went wrong. Please try again.');
  }
  return response.json();
}

export async function checkUserExists(mobile) {
  if (!env.useMockApi) {
    return request('/auth/check-user', { mobile });
  }
  await delay(MOCK_LATENCY_MS);
  return { exists: Boolean(mockDb.findUserByMobile(mobile)) };
}

export async function sendOtp(mobile) {
  if (!env.useMockApi) {
    return request('/auth/send-otp', { mobile });
  }
  await delay(MOCK_LATENCY_MS);
  otpStore.set(mobile, {
    hash: toVerificationHash(env.otp),
    expiresAt: Date.now() + OTP_TTL_MS,
  });
  return { sent: true, expiresInSeconds: OTP_TTL_MS / 1000 };
}

export async function verifyOtp(mobile, otp) {
  if (!env.useMockApi) {
    return request('/auth/verify-otp', { mobile, otp });
  }
  await delay(MOCK_LATENCY_MS + 200);
  const record = otpStore.get(mobile);
  if (!record) {
    throw new AuthServiceError('OTP expired. Please resend the code.');
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(mobile);
    throw new AuthServiceError('OTP expired. Please resend the code.');
  }
  if (record.hash !== toVerificationHash(otp)) {
    throw new AuthServiceError('Incorrect OTP. Please try again.');
  }
  otpStore.delete(mobile);
  return { verified: true };
}
