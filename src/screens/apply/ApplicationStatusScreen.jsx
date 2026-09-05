import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import StatusBanner from '../../components/StatusBanner';
import { CheckIcon, CloseIcon } from '../../components/icons';
import { useAuth } from '../../context/AuthContext';
import {
  APPLICATION_STATUS_META,
  approveApplication,
  buildApplicationTimeline,
  disburseLoan,
  getLatestApplication,
  rejectApplication,
} from '../../services/loanService';
import { formatCurrency, formatDate } from '../../utils/format';

export default function ApplicationStatusScreen() {
  const navigate = useNavigate();
  const { session, updateUser } = useAuth();
  const application = getLatestApplication(session.user);
  const [acting, setActing] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    document.title = 'Application Status — TVME Loan';
    return () => {
      document.title = 'TVME Loan — Simple. Fast. Secure.';
    };
  }, []);

  if (!application) return null;

  const meta = APPLICATION_STATUS_META[application.status] ?? APPLICATION_STATUS_META.under_review;
  const timeline = buildApplicationTimeline(application);
  const loan = application.loan;
  const showApprovedPanel =
    loan && (application.status === 'approved' || application.status === 'disbursed');

  const runStatusAction = async (action) => {
    if (acting) return;
    setActing(action);
    setActionError('');
    try {
      let updated = null;
      if (action === 'approve') updated = await approveApplication(session.mobile, application.id);
      else if (action === 'reject') updated = await rejectApplication(session.mobile, application.id);
      else if (action === 'disburse') updated = await disburseLoan(session.mobile, application.id);
      if (updated) updateUser(updated);
    } catch (err) {
      setActionError(err.message || 'Action failed. Please try again.');
    } finally {
      setActing('');
    }
  };

  return (
    <Screen width="wide" withNav>
      <ScreenHeader onBack={() => navigate('/home')} backLabel="Back to home" />
      <div className="apply">
        <h1 className="screen-title">Application Status</h1>
        <p className="screen-subtitle">Track your loan application in real time</p>

        <div className="home-card app-status-card">
          <div className="app-status-card__head">
            <div>
              <strong className="app-meta__value--mono">{application.id}</strong>
              <small>Applied on {formatDate(application.createdAt)}</small>
            </div>
            <span className={`status-chip ${meta.chipClass}`}>{meta.label}</span>
          </div>
          <div className="loan-summary">
            <div>
              <small>Applied Amount</small>
              <strong>{formatCurrency(application.amount)}</strong>
            </div>
            <div>
              <small>Tenure</small>
              <strong>{application.tenureMonths} months</strong>
            </div>
            <div>
              <small>Estimated EMI</small>
              <strong>{formatCurrency(application.emiAmount)}</strong>
            </div>
          </div>
        </div>

        <StatusBanner type={meta.bannerType}>{meta.banner}</StatusBanner>

        {showApprovedPanel && (
          <div className="home-card approved-panel">
            <div className="home-card__head">
              <h2>Approved Loan</h2>
              <span className="badge badge--active">Approved</span>
            </div>
            <div className="approved-panel__rows">
              <div className="review-section__row">
                <span className="review-section__label">Loan ID</span>
                <span className="review-section__value app-meta__value--mono">{loan.loanId}</span>
              </div>
              <div className="review-section__row">
                <span className="review-section__label">Approved Amount</span>
                <span className="review-section__value">{formatCurrency(loan.approvedAmount)}</span>
              </div>
              <div className="review-section__row">
                <span className="review-section__label">Interest Rate</span>
                <span className="review-section__value">{loan.interestRate}% p.a.</span>
              </div>
              <div className="review-section__row">
                <span className="review-section__label">Tenure</span>
                <span className="review-section__value">{loan.tenureMonths} months</span>
              </div>
              <div className="review-section__row">
                <span className="review-section__label">EMI Amount</span>
                <span className="review-section__value">{formatCurrency(loan.emiAmount)}</span>
              </div>
              <div className="review-section__row">
                <span className="review-section__label">Total Repayment</span>
                <span className="review-section__value">{formatCurrency(loan.totalRepayable)}</span>
              </div>
              <div className="review-section__row">
                <span className="review-section__label">First EMI Date</span>
                <span className="review-section__value">{formatDate(loan.firstEmiDate)}</span>
              </div>
              <div className="review-section__row">
                <span className="review-section__label">Loan Start Date</span>
                <span className="review-section__value">{formatDate(loan.startDate)}</span>
              </div>
            </div>
            <Button block onClick={() => navigate('/loan-details')}>
              View Loan Details
            </Button>
          </div>
        )}

        <div className="home-card">
          <h2 className="timeline-title">Application Timeline</h2>
          <div className="timeline">
            {timeline.map((step) => (
              <div key={step.key} className={`timeline__step timeline__step--${step.state}`}>
                <span className="timeline__dot">
                  {step.state === 'done' && <CheckIcon size={13} />}
                  {step.state === 'current' && <span className="timeline__dot-inner" />}
                  {step.state === 'rejected' && <CloseIcon size={13} />}
                </span>
                <div className="timeline__copy">
                  <p className="timeline__label">{step.label}</p>
                  <p className="timeline__date">
                    {step.state === 'done'
                      ? formatDate(step.date)
                      : step.state === 'current'
                        ? 'In progress'
                        : step.state === 'rejected'
                          ? 'Not approved'
                          : 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {actionError && <StatusBanner type="error">{actionError}</StatusBanner>}

        {(application.status === 'under_review' || application.status === 'approved') && (
          <div className="status-actions">
            <span className="status-actions__label">Application Actions &middot; Update status</span>
            <div className="status-actions__actions">
              {application.status === 'under_review' && (
                <>
                  <Button
                    size="md"
                    variant="secondary"
                    loading={acting === 'approve'}
                    onClick={() => runStatusAction('approve')}
                  >
                    Approve
                  </Button>
                  <Button
                    size="md"
                    variant="outline"
                    loading={acting === 'reject'}
                    onClick={() => runStatusAction('reject')}
                  >
                    Reject
                  </Button>
                </>
              )}
              {application.status === 'approved' && (
                <Button
                  size="md"
                  variant="secondary"
                  loading={acting === 'disburse'}
                  onClick={() => runStatusAction('disburse')}
                >
                  Disburse Amount
                </Button>
              )}
            </div>
          </div>
        )}

        <Button block variant="outline" onClick={() => navigate('/home')}>
          Back to Home
        </Button>
      </div>
    </Screen>
  );
}
