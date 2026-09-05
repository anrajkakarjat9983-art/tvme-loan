import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { getKyc } from '../../services/kycService';

export default function KycSubmittedScreen() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const kyc = getKyc(session.user);

  useEffect(() => {
    document.title = 'KYC Submitted — TVME Loan';
    return () => {
      document.title = 'TVME Loan — Simple. Fast. Secure.';
    };
  }, []);

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
        <h1 className="screen-title">KYC Submitted Successfully</h1>
        <p className="screen-subtitle">
          Your documents have been submitted and are currently under review.
        </p>

        <div className="app-meta">
          <div className="app-meta__row">
            <span className="app-meta__label">KYC Status</span>
            <span className="status-chip status-chip--review">Under Review</span>
          </div>
          {kyc.pan && (
            <div className="app-meta__row">
              <span className="app-meta__label">PAN</span>
              <span className="app-meta__value app-meta__value--mono">{kyc.pan}</span>
            </div>
          )}
        </div>

        <Button block onClick={() => navigate('/kyc')}>
          Continue
        </Button>
        <button type="button" className="link-btn" onClick={() => navigate('/profile')}>
          Back to Profile
        </button>
      </div>
    </Screen>
  );
}
