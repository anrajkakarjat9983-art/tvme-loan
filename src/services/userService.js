import { env } from '../config/env';
import { mockDb } from '../data/mockDb';

const MOCK_LATENCY_MS = 1200;
const DEFAULT_LOAN_LIMIT = 50000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(path, payload) {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Could not create your profile. Please try again.');
  }
  return response.json();
}

export async function fetchUserByMobile(mobile) {
  if (!env.useMockApi) {
    const response = await fetch(`${env.apiBaseUrl}/users/${mobile}`);
    if (!response.ok) return null;
    return response.json();
  }
  await delay(350);
  return mockDb.findUserByMobile(mobile);
}

export async function createUserProfile(profile) {
  if (!env.useMockApi) {
    return request('/users', profile);
  }
  await delay(MOCK_LATENCY_MS);
  if (mockDb.findUserByMobile(profile.mobile)) {
    throw new Error('An account with this mobile number already exists.');
  }
  const now = new Date().toISOString();
  const user = {
    id: `usr_${Date.now().toString(36)}`,
    ...profile,
    mobileVerified: true,
    profileComplete: true,
    loanLimit: DEFAULT_LOAN_LIMIT,
    applications: [],
    kyc: {
      pan: null,
      idType: null,
      identityDocument: null,
      addressDocument: null,
      bankStatement: null,
      selfie: null,
      payment: null,
      status: 'not_started',
      submittedAt: null,
      verifiedAt: null,
      rejectionReason: null,
      kycSubmitted: false,
    },
    activeLoan: null,
    activity: [
      {
        id: `act_${Date.now().toString(36)}`,
        type: 'profile',
        title: 'Profile Created',
        detail: 'Your TVME profile is ready',
        at: now,
        status: 'success',
      },
    ],
    createdAt: now,
  };
  return mockDb.insertUser(user);
}

export function getLoanSummary(user) {
  return {
    loanLimit: user?.loanLimit ?? DEFAULT_LOAN_LIMIT,
    activeLoan: user?.activeLoan ?? null,
    activity: user?.activity ?? [],
  };
}

export function addActivity(mobile, event) {
  const user = mockDb.findUserByMobile(mobile);
  if (!user) return null;
  const activity = [
    ...(user.activity ?? []),
    {
      id: `act_${Date.now().toString(36)}`,
      at: new Date().toISOString(),
      ...event,
    },
  ];
  return mockDb.updateUser(mobile, { activity });
}

export function computeProfileCompletion(user) {
  if (!user) return 0;
  const checks = [
    Boolean(user.mobileVerified),
    Boolean(user.fullName),
    Boolean(user.dateOfBirth),
    Boolean(user.gender),
    Boolean(user.email),
    Boolean(user.address),
    Boolean(user.city),
    Boolean(user.state),
    Boolean(user.pinCode),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}
