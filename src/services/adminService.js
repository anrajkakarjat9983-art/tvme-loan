import { mockDb } from '../data/mockDb';
import { createEmptyKyc, rejectKyc, verifyKyc } from './kycService';
import {
  approveApplication,
  disburseLoan,
  rejectApplication,
} from './loanService';

const ADMIN_KEY = 'tvme_admin_v1';
const ACTION_LATENCY_MS = 400;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isAdminAuthed() {
  try {
    return window.sessionStorage.getItem(ADMIN_KEY) === '1';
  } catch {
    return false;
  }
}

export function loginAdmin(passcode) {
  if (passcode !== 'admin123') return false;
  try {
    window.sessionStorage.setItem(ADMIN_KEY, '1');
  } catch {
    return false;
  }
  return true;
}

export function logoutAdmin() {
  try {
    window.sessionStorage.removeItem(ADMIN_KEY);
  } catch {
    return;
  }
}

export function getAllUsers() {
  return mockDb.getUsers();
}

export function findUser(mobile) {
  return mockDb.findUserByMobile(mobile);
}

export async function verifyUserKyc(mobile) {
  await delay(ACTION_LATENCY_MS);
  return verifyKyc(mobile);
}

export async function rejectUserKyc(mobile, reason) {
  await delay(ACTION_LATENCY_MS);
  return rejectKyc(mobile, reason);
}

export async function resetUserKyc(mobile) {
  await delay(ACTION_LATENCY_MS);
  const updated = mockDb.updateUser(mobile, { kyc: createEmptyKyc() });
  if (!updated) throw new Error('User not found.');
  return updated;
}

export async function approveUserApplication(mobile, applicationId) {
  await delay(ACTION_LATENCY_MS);
  return approveApplication(mobile, applicationId);
}

export async function rejectUserApplication(mobile, applicationId) {
  await delay(ACTION_LATENCY_MS);
  return rejectApplication(mobile, applicationId);
}

export async function disburseUserLoan(mobile, applicationId) {
  await delay(ACTION_LATENCY_MS);
  return disburseLoan(mobile, applicationId);
}

export async function updateUserLoanLimit(mobile, loanLimit) {
  await delay(ACTION_LATENCY_MS);
  const updated = mockDb.updateUser(mobile, { loanLimit: Number(loanLimit) });
  if (!updated) throw new Error('User not found.');
  return updated;
}
