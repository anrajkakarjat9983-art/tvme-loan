import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { getLatestApplication } from '../../services/loanService';
import { formatCurrency } from '../../utils/format';

export default function ApplicationSubmittedScreen() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const application = getLatestApplication(session.user);

  useEffect(() => {
    document.title = 'Application Submitted — TVME Loan';
    return () => {
      document.title = 'TVME Loan — Simple. Fast. Secure.';
    };
  }, []);

  if (!application) return null;

  return (
    <Screen width="wide">
      <div className="success">
        <div className="success__art">
          <svg viewBox="0 0 96 96" width="120" height="120" aria-hidden="true">
            <circle className="success__halo" cx="48" cy="48" r="44" fill="#ECFDF3" />
            <circle
              className="success__ring"
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="#22C55E"
              strokeWidth="3.5"
            />
            <path
              className="success__check"
              d="M30 49l12 12 24-26"
              fill="none"
              stroke="#16A34A"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="screen-title">Application Submitted Successfully</h1>
        <p className="screen-subtitle">Your loan application is now with our team.</p>

        <div className="app-meta">
          <div className="app-meta__row">
            <span className="app-meta__label">Application ID</span>
            <span className="app-meta__value app-meta__value--mono">{application.id}</span>
          </div>
          <div className="app-meta__row">
            <span className="app-meta__label">Requested Amount</span>
            <span className="app-meta__value">{formatCurrency(application.amount)}</span>
          </div>
          <div className="app-meta__row">
            <span className="app-meta__label">Status</span>
            <span className="status-chip status-chip--review">Under Review</span>
          </div>
        </div>

        <p className="legal-text legal-text--center">
          Expected update within 24–48 hours. We will notify you on your registered mobile number.
        </p>

        <Button block onClick={() => navigate('/application-status')}>
          View Application
        </Button>
        <button type="button" className="link-btn" onClick={() => navigate('/home', { replace: true })}>
          Back to Home
        </button>
      </div>
    </Screen>
  );
}
