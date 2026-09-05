import { env } from '../config/env';
import { mockDb } from '../data/mockDb';
import { addActivity } from './userService';

const SUBMIT_LATENCY_MS = 1400;
const ACTION_LATENCY_MS = 600;

export const DEFAULT_REJECTION_REASON =
  'Address proof document was not clearly readable.';

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
    throw new Error('Something went wrong. Please try again.');
  }
  return response.json();
}

export function createEmptyKyc() {
  return {
    pan: null,
    idType: null,
    identityDocument: null,
    addressDocument: null,
    bankStatement: null,
    bank: null,
    selfie: null,
    payment: null,
    status: 'not_started',
    submittedAt: null,
    verifiedAt: null,
    rejectionReason: null,
    kycSubmitted: false,
  };
}

export function getKyc(user) {
  return { ...createEmptyKyc(), ...(user?.kyc ?? {}) };
}

export function isKycVerified(user) {
  return getKyc(user).status === 'verified';
}

export const KYC_BADGES = {
  not_started: { label: 'Not Verified', chipClass: 'status-chip--neutral' },
  in_progress: { label: 'Not Verified', chipClass: 'status-chip--neutral' },
  under_review: { label: 'Under Review', chipClass: 'status-chip--review' },
  verified: { label: 'Verified', chipClass: 'status-chip--success' },
  rejected: { label: 'Rejected', chipClass: 'status-chip--rejected' },
};

function hasAnyKycData(kyc) {
  return Boolean(
    kyc.pan || kyc.idType || kyc.identityDocument || kyc.addressDocument || kyc.selfie || kyc.bank
  );
}

function persistKyc(mobile, patch) {
  const user = mockDb.findUserByMobile(mobile);
  if (!user) throw new Error('Please log in again.');
  const kyc = { ...getKyc(user), ...patch };
  if (kyc.status === 'not_started' && hasAnyKycData(kyc)) {
    kyc.status = 'in_progress';
  }
  return mockDb.updateUser(mobile, { kyc });
}

export function saveKycDraft(mobile, patch) {
  if (!env.useMockApi) {
    return request('/kyc/draft', patch);
  }
  return Promise.resolve(persistKyc(mobile, patch));
}

export async function submitKyc(mobile) {
  if (!env.useMockApi) {
    return request('/kyc/submit', { mobile });
  }
  await delay(SUBMIT_LATENCY_MS);
  const user = mockDb.findUserByMobile(mobile);
  const kyc = getKyc(user);
  const isComplete =
    kyc.pan && kyc.idType && kyc.identityDocument && kyc.addressDocument && kyc.bankStatement &&
    kyc.bank?.accountHolder && kyc.bank?.accountNumber && kyc.bank?.ifsc && kyc.bank?.bankName &&
    kyc.selfie && kyc.payment;
  if (!isComplete) {
    throw new Error('Please complete all KYC steps before submitting.');
  }
  const updatedUser = mockDb.updateUser(mobile, {
    kyc: {
      ...kyc,
      status: 'under_review',
      submittedAt: new Date().toISOString(),
      verifiedAt: null,
      rejectionReason: null,
      kycSubmitted: true,
    },
  });
  addActivity(mobile, {
    type: 'status',
    title: 'KYC Submitted',
    detail: 'Your KYC documents are under review',
    status: 'pending',
  });
  return updatedUser;
}

export async function verifyKyc(mobile) {
  if (!env.useMockApi) {
    return request('/kyc/verify', { mobile });
  }
  await delay(ACTION_LATENCY_MS);
  const user = mockDb.findUserByMobile(mobile);
  const kyc = getKyc(user);
  if (kyc.status !== 'under_review') {
    throw new Error('Only a submitted KYC can be verified.');
  }
  const updatedUser = mockDb.updateUser(mobile, {
    kyc: { ...kyc, status: 'verified', verifiedAt: new Date().toISOString(), rejectionReason: null },
  });
  addActivity(mobile, {
    type: 'status',
    title: 'KYC Verified',
    detail: 'Your identity has been successfully verified',
    status: 'success',
  });
  return updatedUser;
}

export async function rejectKyc(mobile, reason = DEFAULT_REJECTION_REASON) {
  if (!env.useMockApi) {
    return request('/kyc/reject', { mobile, reason });
  }
  await delay(ACTION_LATENCY_MS);
  const user = mockDb.findUserByMobile(mobile);
  const kyc = getKyc(user);
  if (kyc.status !== 'under_review') {
    throw new Error('Only a submitted KYC can be rejected.');
  }
  const updatedUser = mockDb.updateUser(mobile, {
    kyc: {
      ...kyc,
      status: 'rejected',
      rejectionReason: reason,
    },
  });
  addActivity(mobile, {
    type: 'status',
    title: 'KYC Rejected',
    detail: 'Your KYC could not be verified. Please resubmit',
    status: 'rejected',
  });
  return updatedUser;
}

export function buildKycSteps(kyc) {
  const steps = [
    { key: 'personal', label: 'Personal Information', complete: true },
    {
      key: 'identity',
      label: 'Identity Proof',
      complete: Boolean(kyc.pan && kyc.idType && kyc.identityDocument),
    },
    { key: 'address', label: 'Address Proof', complete: Boolean(kyc.addressDocument) },
    { key: 'selfie', label: 'Selfie', complete: Boolean(kyc.selfie) },
  ];
  let firstPendingIndex = steps.findIndex((step) => !step.complete);
  if (firstPendingIndex === -1) firstPendingIndex = steps.length;
  const withStates = steps.map((step, index) => ({
    ...step,
    state: step.complete ? 'done' : index === firstPendingIndex ? 'current' : 'pending',
  }));
  const verificationState =
    kyc.status === 'verified'
      ? 'done'
      : kyc.status === 'rejected'
        ? 'rejected'
        : kyc.status === 'under_review'
          ? 'current'
          : 'pending';
  withStates.push({ key: 'verification', label: 'Verification', state: verificationState });
  return withStates;
}

export const KYC_ID_TYPES = ['Aadhaar', 'Passport', 'Driving Licence', 'Voter ID'];
