import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Logo from '../components/Logo';
import Screen from '../components/Screen';
import {
  BellIcon,
  BoltIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  FileTextIcon,
  InfoIcon,
  ShieldCheckIcon,
  UserIcon,
  WalletIcon,
} from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { hasUnreadNotifications } from '../services/notificationService';
import { getLatestApplication } from '../services/loanService';
import { getKyc } from '../services/kycService';
import { getLoanSummary } from '../services/userService';
import { formatCurrency, formatDate, firstNameOf, initialsOf } from '../utils/format';

const BASE_QUICK_ACTIONS = [
  { icon: ClipboardListIcon, label: 'My Loans', to: '/loans' },
  { icon: CalendarIcon, label: 'Repayment', to: '/repayment' },
  { icon: FileTextIcon, label: 'Documents', to: '/documents' },
];

const ACTIVITY_ICONS = {
  profile: UserIcon,
  loan: WalletIcon,
  payment: CheckCircleIcon,
  status: InfoIcon,
};

export default function HomeScreen() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const user = session.user;
  const [unread] = useState(hasUnreadNotifications);
  const { loanLimit, activeLoan, activity } = getLoanSummary(user);
  const latestApplication = getLatestApplication(user);
  const hasPendingApplication = Boolean(
    latestApplication && latestApplication.status !== 'rejected',
  );
  const kyc = getKyc(user);
  const applicationBanner =
    latestApplication?.status === 'under_review'
      ? {
          title: 'Loan application under review',
          subtitle: `${formatCurrency(latestApplication.amount)} \u00B7 Tap to view status`,
          to: '/application-status',
        }
      : latestApplication?.status === 'approved'
        ? {
            title: 'Loan approved \u2014 amount on the way',
            subtitle: `${formatCurrency(latestApplication.amount)} \u00B7 Tap to view details`,
            to: '/application-status',
          }
        : null;

  const repaidPercent = (() => {
    if (!activeLoan) return 0;
    if (activeLoan.totalRepayable != null && activeLoan.totalRepayable > 0) {
      return Math.round((activeLoan.totalPaid / activeLoan.totalRepayable) * 100);
    }
    return Math.round((activeLoan.installmentsPaid / activeLoan.totalInstallments) * 100);
  })();
  const paidEmis = activeLoan?.schedule
    ? activeLoan.schedule.filter((item) => item.status === 'paid').length
    : (activeLoan?.installmentsPaid ?? 0);
  const totalEmis = activeLoan?.schedule ? activeLoan.schedule.length : (activeLoan?.totalInstallments ?? 0);
  const nextDueDate =
    activeLoan?.schedule?.find((item) => item.status === 'pending')?.dueDate ??
    activeLoan?.nextDueDate;

  return (
    <Screen width="wide" withNav>
      <header className="dash-topbar">
        <Logo size={36} />
        <span className="dash-topbar__brand">TVME Loan</span>
        <span className="dash-topbar__spacer" />
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
        >
          <BellIcon size={19} />
          {unread && <span className="icon-btn__dot" />}
        </button>
        <button
          type="button"
          className="dash-topbar__avatar"
          onClick={() => navigate('/profile')}
          aria-label="Open profile"
        >
          {initialsOf(user.fullName)}
        </button>
      </header>

      <section className="dash-greeting">
        <h1>Hello, {firstNameOf(user.fullName)}</h1>
        <p>Your loan journey starts here.</p>
      </section>

      {kyc.status !== 'verified' ? (
        <button type="button" className="review-banner kyc-banner" onClick={() => navigate('/kyc')}>
          <span className="review-banner__icon kyc-banner__icon">
            <ShieldCheckIcon size={20} />
          </span>
          <span className="review-banner__copy">
            <strong>Complete your KYC</strong>
            <small>Verify your identity to continue your loan journey.</small>
          </span>
          <ChevronRightIcon size={18} className="review-banner__chevron" />
        </button>
      ) : (
        <div className="kyc-verified-strip">
          <CheckCircleIcon size={16} /> KYC Verified
        </div>
      )}

      <section className="loan-hero" aria-label="Available loan limit">
        <p className="loan-hero__label">Available Loan Limit</p>
        <p className="loan-hero__amount">{formatCurrency(loanLimit)}</p>
        <p className="loan-hero__note">Pre-approved for you</p>
        <Button
          block
          onClick={() => navigate(hasPendingApplication ? '/application-status' : '/apply')}
        >
          {hasPendingApplication ? 'View Application' : 'Apply Now'}
        </Button>
      </section>

      {applicationBanner && (
        <button
          type="button"
          className="review-banner"
          onClick={() => navigate(applicationBanner.to)}
        >
          <span className="review-banner__icon">
            <ClipboardListIcon size={20} />
          </span>
          <span className="review-banner__copy">
            <strong>{applicationBanner.title}</strong>
            <small>{applicationBanner.subtitle}</small>
          </span>
          <ChevronRightIcon size={18} className="review-banner__chevron" />
        </button>
      )}

      <section className="home-card">
        {activeLoan ? (
          <>
            <div className="home-card__head">
              <h2>Current Loan</h2>
              <span className="badge badge--active">Active</span>
            </div>
            <div className="loan-summary">
              <div>
                <small>Loan Amount</small>
                <strong>{formatCurrency(activeLoan.approvedAmount ?? activeLoan.amount)}</strong>
              </div>
              <div>
                <small>Monthly EMI</small>
                <strong>{formatCurrency(activeLoan.emiAmount)}</strong>
              </div>
              <div>
                <small>Next Due</small>
                <strong>{formatDate(nextDueDate)}</strong>
              </div>
            </div>
            <div className="loan-progress-label">
              <span>
                Repaid {paidEmis} of {totalEmis} EMIs
              </span>
              <span>{repaidPercent}%</span>
            </div>
            <div
              className="progress"
              role="progressbar"
              aria-valuenow={repaidPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Loan repayment progress"
            >
              <div className="progress__bar" style={{ width: `${repaidPercent}%` }} />
            </div>
            <button
              type="button"
              className="link-btn loan-details-btn"
              onClick={() => navigate('/loan-details')}
            >
              View Details
              <ChevronRightIcon size={14} />
            </button>
          </>
        ) : (
          <div className="empty-state">
            <span className="empty-state__icon">
              <WalletIcon size={24} />
            </span>
            <h3>No active loan</h3>
            <p>When you take a loan, its amount, EMI and due dates will appear here.</p>
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate(hasPendingApplication ? '/application-status' : '/apply')}
            >
              {hasPendingApplication ? 'View Application' : 'Apply Now'}
            </button>
          </div>
        )}
      </section>

      <h2 className="section-title">Quick Actions</h2>
      <div className="quick-grid">
        {[
          ...(hasPendingApplication ? [] : [{ icon: BoltIcon, label: 'Apply Loan', to: '/apply' }]),
          ...BASE_QUICK_ACTIONS,
        ].map(({ icon: ActionIcon, label, to }) => (
          <button key={to} type="button" className="quick-tile" onClick={() => navigate(to)}>
            <span className="quick-tile__icon">
              <ActionIcon size={20} />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <h2 className="section-title">Recent Activity</h2>
      <div className="home-card">
        {activity.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">
              <BellIcon size={22} />
            </span>
            <h3>No activity yet</h3>
            <p>Your loan updates and payments will show up here.</p>
          </div>
        ) : (
          <div className="activity-list">
            {activity.map((item) => {
              const ActivityIcon = ACTIVITY_ICONS[item.type] ?? InfoIcon;
              return (
                <div key={item.id} className="activity-item">
                  <span className={`activity-item__icon activity-item__icon--${item.type}`}>
                    <ActivityIcon size={18} />
                  </span>
                  <div className="activity-item__body">
                    <p className="activity-item__title">{item.title}</p>
                    <p className="activity-item__detail">{item.detail}</p>
                  </div>
                  <div className="activity-item__meta">
                    <span>{formatDate(item.at)}</span>
                    {item.status && (
                      <span className={`status-chip status-chip--${item.status}`}>
                        {item.status === 'success'
                          ? 'Success'
                          : item.status === 'rejected'
                            ? 'Rejected'
                            : 'Pending'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </Screen>
  );
}
