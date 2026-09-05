import { env } from '../config/env';
import { LOAN_CONFIG } from '../data/loanConfig';
import { mockDb } from '../data/mockDb';
import { formatCurrency } from '../utils/format';
import { addActivity } from './userService';

const MOCK_LATENCY_MS = 1400;
const ACTION_LATENCY_MS = 600;

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

function generateApplicationId() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `APP-${new Date().getFullYear()}-${random}`;
}

function generateLoanId() {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `LN-${new Date().getFullYear()}-${random}`;
}

function addMonths(isoDate, months) {
  const result = new Date(isoDate);
  const day = result.getDate();
  result.setMonth(result.getMonth() + months);
  if (result.getDate() < day) result.setDate(0);
  return result.toISOString();
}

export async function submitLoanApplication(mobile, draft, totals) {
  const payload = {
    mobile,
    amount: draft.amount,
    tenureMonths: draft.tenureMonths,
    purpose: draft.purpose,
    employment: draft.employment,
  };
  if (!env.useMockApi) {
    return request('/loans/applications', payload);
  }
  await delay(MOCK_LATENCY_MS);
  const user = mockDb.findUserByMobile(mobile);
  if (!user) {
    throw new Error('Could not submit your application. Please log in again.');
  }
  const application = {
    id: generateApplicationId(),
    amount: draft.amount,
    tenureMonths: draft.tenureMonths,
    purpose: draft.purpose,
    interestRate: LOAN_CONFIG.interestRate,
    emiAmount: totals.emi,
    totalRepayable: totals.totalRepayable,
    totalInterest: totals.totalInterest,
    employment: { ...draft.employment },
    status: 'under_review',
    loan: null,
    createdAt: new Date().toISOString(),
    decidedAt: null,
    disbursedAt: null,
  };
  const applications = [...(user.applications ?? []), application];
  mockDb.updateUser(mobile, { applications });
  addActivity(mobile, {
    type: 'loan',
    title: 'Loan Application',
    detail: `${formatCurrency(draft.amount)} application submitted`,
    status: 'pending',
  });
  return application;
}

export function getLatestApplication(user) {
  const applications = user?.applications ?? [];
  return applications.length ? applications[applications.length - 1] : null;
}

export async function approveApplication(mobile, applicationId) {
  if (!env.useMockApi) {
    return request(`/loans/applications/${applicationId}/approve`, { mobile });
  }
  await delay(ACTION_LATENCY_MS);
  const user = mockDb.findUserByMobile(mobile);
  const application = (user?.applications ?? []).find((item) => item.id === applicationId);
  if (!application) throw new Error('Application not found.');
  if (application.status !== 'under_review') {
    throw new Error('This application has already been processed.');
  }
  const now = new Date().toISOString();
  const firstEmiDate = addMonths(now, 1);
  const schedule = Array.from({ length: application.tenureMonths }, (_, index) => ({
    installment: index + 1,
    dueDate: addMonths(firstEmiDate, index),
    amount: application.emiAmount,
    status: 'pending',
  }));
  const loan = {
    loanId: generateLoanId(),
    applicationId: application.id,
    approvedAmount: application.amount,
    interestRate: application.interestRate,
    tenureMonths: application.tenureMonths,
    emiAmount: application.emiAmount,
    totalRepayable: application.totalRepayable,
    startDate: now,
    firstEmiDate,
    outstanding: application.totalRepayable,
    totalPaid: 0,
    schedule,
    payments: [],
  };
  const applications = user.applications.map((item) =>
    item.id === applicationId
      ? { ...item, status: 'approved', decidedAt: now, loan }
      : item
  );
  const updatedUser = mockDb.updateUser(mobile, { applications });
  addActivity(mobile, {
    type: 'loan',
    title: 'Loan Approved',
    detail: `${formatCurrency(application.amount)} loan approved`,
    status: 'success',
  });
  return updatedUser;
}

export async function rejectApplication(mobile, applicationId) {
  if (!env.useMockApi) {
    return request(`/loans/applications/${applicationId}/reject`, { mobile });
  }
  await delay(ACTION_LATENCY_MS);
  const user = mockDb.findUserByMobile(mobile);
  const application = (user?.applications ?? []).find((item) => item.id === applicationId);
  if (!application) throw new Error('Application not found.');
  if (application.status !== 'under_review') {
    throw new Error('This application has already been processed.');
  }
  const now = new Date().toISOString();
  const applications = user.applications.map((item) =>
    item.id === applicationId ? { ...item, status: 'rejected', decidedAt: now } : item
  );
  const updatedUser = mockDb.updateUser(mobile, { applications });
  addActivity(mobile, {
    type: 'status',
    title: 'Application Rejected',
    detail: `${formatCurrency(application.amount)} application was not approved`,
    status: 'rejected',
  });
  return updatedUser;
}

export async function disburseLoan(mobile, applicationId) {
  if (!env.useMockApi) {
    return request(`/loans/applications/${applicationId}/disburse`, { mobile });
  }
  await delay(ACTION_LATENCY_MS);
  const user = mockDb.findUserByMobile(mobile);
  const application = (user?.applications ?? []).find((item) => item.id === applicationId);
  if (!application) throw new Error('Application not found.');
  if (application.status !== 'approved') {
    throw new Error('Only approved applications can be disbursed.');
  }
  const now = new Date().toISOString();
  const applications = user.applications.map((item) =>
    item.id === applicationId ? { ...item, status: 'disbursed', disbursedAt: now } : item
  );
  const updatedUser = mockDb.updateUser(mobile, {
    applications,
    activeLoan: application.loan,
  });
  addActivity(mobile, {
    type: 'payment',
    title: 'Amount Disbursed',
    detail: `${formatCurrency(application.amount)} credited to your account`,
    status: 'success',
  });
  return updatedUser;
}

export function getCurrentLoan(user) {
  if (user?.activeLoan) return user.activeLoan;
  const latest = getLatestApplication(user);
  if (latest && (latest.status === 'approved' || latest.status === 'disbursed')) {
    return latest.loan ?? null;
  }
  return null;
}

export function buildApplicationTimeline(application) {
  const status = application.status;
  return [
    {
      key: 'submitted',
      label: 'Application Submitted',
      date: application.createdAt,
      state: 'done',
    },
    {
      key: 'review',
      label: 'Documents/Details Under Review',
      state: status === 'under_review' ? 'current' : 'done',
    },
    {
      key: 'decision',
      label: 'Loan Approved',
      state:
        status === 'under_review'
          ? 'pending'
          : status === 'rejected'
            ? 'rejected'
            : status === 'approved'
              ? 'current'
              : 'done',
    },
    {
      key: 'disbursed',
      label: 'Amount Disbursed',
      state: status === 'disbursed' ? 'done' : 'pending',
    },
  ];
}

export const APPLICATION_STATUS_META = {
  under_review: {
    label: 'Under Review',
    chipClass: 'status-chip--review',
    bannerType: 'info',
    banner:
      'Your application is being reviewed by our team. Decisions usually take 24–48 hours.',
  },
  approved: {
    label: 'Approved',
    chipClass: 'status-chip--success',
    bannerType: 'success',
    banner: 'Congratulations! Your loan has been approved and is awaiting disbursement.',
  },
  rejected: {
    label: 'Rejected',
    chipClass: 'status-chip--rejected',
    bannerType: 'error',
    banner:
      'Unfortunately, this application was not approved. You can submit a new application anytime.',
  },
  disbursed: {
    label: 'Disbursed',
    chipClass: 'status-chip--success',
    bannerType: 'success',
    banner: 'Funds disbursed! Your loan is now active — view Loan Details for the schedule.',
  },
};
