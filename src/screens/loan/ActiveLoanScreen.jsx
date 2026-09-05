import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import { CalendarIcon, CheckCircleIcon, WalletIcon } from '../../components/icons';
import { useAuth } from '../../context/AuthContext';
import { getCurrentLoan } from '../../services/loanService';
import { formatCurrency, formatDate } from '../../utils/format';

export default function ActiveLoanScreen() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const loan = getCurrentLoan(session.user);

  useEffect(() => {
    document.title = 'Loan Details — TVME Loan';
    return () => {
      document.title = 'TVME Loan — Simple. Fast. Secure.';
    };
  }, []);

  if (!loan) return null;

  const paidPercent = Math.round((loan.totalPaid / loan.totalRepayable) * 100);
  const nextEmi = loan.schedule.find((item) => item.status === 'pending');

  const summaryRows = [
    { label: 'Loan Amount', value: formatCurrency(loan.approvedAmount) },
    { label: 'Interest Rate', value: `${loan.interestRate}% p.a.` },
    { label: 'Tenure', value: `${loan.tenureMonths} months` },
    { label: 'Monthly EMI', value: formatCurrency(loan.emiAmount) },
    { label: 'Total Repayment', value: formatCurrency(loan.totalRepayable) },
    { label: 'Outstanding', value: formatCurrency(loan.outstanding) },
  ];

  return (
    <Screen width="wide" withNav>
      <ScreenHeader onBack={() => navigate('/home')} backLabel="Back to home" />
      <div className="apply">
        <h1 className="screen-title">Loan Details</h1>
        <p className="screen-subtitle">Your active loan at a glance</p>

        <div className="home-card app-status-card">
          <div className="app-status-card__head">
            <div>
              <strong className="app-meta__value--mono">{loan.loanId}</strong>
              <small>Loan started on {formatDate(loan.startDate)}</small>
            </div>
            <span className="badge badge--active">Active</span>
          </div>
        </div>

        <div className="review-stack">
          <div className="review-section">
            <div className="review-section__head">
              <h2>Loan Summary</h2>
            </div>
            {summaryRows.map((row) => (
              <div key={row.label} className="review-section__row">
                <span className="review-section__label">{row.label}</span>
                <span className="review-section__value">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="home-card">
          <div className="loan-progress-label">
            <span>{formatCurrency(loan.totalPaid)} Paid</span>
            <span>{formatCurrency(loan.totalRepayable)}</span>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuenow={paidPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Loan repayment progress"
          >
            <div className="progress__bar" style={{ width: `${paidPercent}%` }} />
          </div>
          <p className="progress-caption">{paidPercent}% repaid &middot; {formatCurrency(loan.outstanding)} outstanding</p>
        </div>

        {nextEmi && (
          <div className="next-emi-card">
            <span className="next-emi-card__icon">
              <CalendarIcon size={22} />
            </span>
            <div className="next-emi-card__copy">
              <small>Next EMI &middot; {nextEmi.installment} of {loan.tenureMonths}</small>
              <strong>{formatCurrency(nextEmi.amount)}</strong>
              <span className="next-emi-card__due">Due on {formatDate(nextEmi.dueDate)}</span>
            </div>
          </div>
        )}

        <h2 className="section-title">EMI Schedule</h2>
        <div className="home-card">
          <div className="schedule-list">
            {loan.schedule.map((item) => (
              <div key={item.installment} className="schedule-row">
                <span className="schedule-row__no">{item.installment}</span>
                <div className="schedule-row__body">
                  <p className="schedule-row__title">EMI {item.installment}</p>
                  <p className="schedule-row__date">Due {formatDate(item.dueDate)}</p>
                </div>
                <strong>{formatCurrency(item.amount)}</strong>
                <span
                  className={`status-chip ${item.status === 'paid' ? 'status-chip--success' : 'status-chip--pending'}`}
                >
                  {item.status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <h2 className="section-title">Payment History</h2>
        <div className="home-card">
          {loan.payments.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state__icon">
                <WalletIcon size={22} />
              </span>
              <h3>No payments yet</h3>
              <p>Your EMI payment receipts will appear here once you start repaying.</p>
            </div>
          ) : (
            <div className="activity-list">
              {loan.payments.map((payment) => (
                <div key={payment.id} className="activity-item">
                  <span className="activity-item__icon activity-item__icon--payment">
                    <CheckCircleIcon size={18} />
                  </span>
                  <div className="activity-item__body">
                    <p className="activity-item__title">EMI {payment.installment} Paid</p>
                    <p className="activity-item__detail">{formatDate(payment.paidAt)}</p>
                  </div>
                  <div className="activity-item__meta">
                    <span>{formatCurrency(payment.amount)}</span>
                    <span className="status-chip status-chip--success">Success</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button block variant="outline" onClick={() => navigate('/home')}>
          Back to Home
        </Button>
      </div>
    </Screen>
  );
}
