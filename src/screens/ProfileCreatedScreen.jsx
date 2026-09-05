import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { firstNameOf, maskMobile } from '../utils/format';

export default function ProfileCreatedScreen() {
  const navigate = useNavigate();
  const { session, finishAccountCreation } = useAuth();

  useEffect(() => {
    document.title = 'Profile Created — TVME Loan';
    return () => {
      document.title = 'TVME Loan — Simple. Fast. Secure.';
    };
  }, []);

  const handleContinue = () => {
    finishAccountCreation();
    navigate('/home', { replace: true });
  };

  return (
    <Screen>
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
        <h1 className="screen-title">Profile Created Successfully</h1>
        <p className="screen-subtitle">Your profile has been created successfully.</p>
        {session.user?.fullName && (
          <p className="success__meta">
            Welcome aboard, <strong>{firstNameOf(session.user.fullName)}</strong> — registered on{' '}
            <strong>{maskMobile(session.mobile)}</strong>
          </p>
        )}
        <Button block onClick={handleContinue}>
          Continue to Home
        </Button>
      </div>
    </Screen>
  );
}
