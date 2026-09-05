import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import { CheckCircleIcon, CheckIcon, CloseIcon } from '../../components/icons';
import { useAuth } from '../../context/AuthContext';
import {
  buildKycSteps,
  getKyc,
} from '../../services/kycService';

const STATUS_CARDS = {
  not_started: {
    chip: ['status-chip--neutral', 'Not Completed'],
    message: 'Complete your KYC to continue with your loan application.',
    cta: 'Complete KYC',
  },
  in_progress: {
    chip: ['status-chip--review', 'In Progress'],
    message: 'Your KYC process is incomplete.',
    cta: 'Continue KYC',
  },
  under_review: {
    chip: ['status-chip--review', 'Under Review'],
    message: 'Our team is reviewing your submitted documents.',
  },
  verified: {
    chip: ['status-chip--success', 'Verified'],
    message: 'Your identity has been successfully verified.',
  },
  rejected: {
    chip: ['status-chip--rejected', 'Rejected'],
    message: 'Your KYC could not be verified.',
    cta: 'Resubmit KYC',
  },
};

export default function KycDashboardScreen() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const kyc = getKyc(session.user);

  useEffect(() => {
    document.title = 'KYC Verification — TVME Loan';
    return () => {
      document.title = 'TVME Loan — Simple. Fast. Secure.';
    };
  }, []);

  const card = STATUS_CARDS[kyc.status] ?? STATUS_CARDS.not_started;
  const steps = buildKycSteps(kyc);

  return (
    <Screen width="wide" withNav>
      <ScreenHeader onBack={() => navigate('/profile')} backLabel="Back to profile" />
      <div className="apply">
        <h1 className="screen-title">KYC Verification</h1>
        <p className="screen-subtitle">Verify your identity securely.</p>

        <div className={`home-card kyc-status-card kyc-status-card--${kyc.status}`}>
          <div className="home-card__head">
            <h2>KYC Verification</h2>
            <span className={`status-chip ${card.chip[0]}`}>{card.chip[1]}</span>
          </div>
          {kyc.status === 'verified' && (
            <p className="kyc-status-card__verified">
              <CheckCircleIcon size={15} /> KYC Verified
            </p>
          )}
          <p className="kyc-status-card__message">{card.message}</p>
          {kyc.status === 'rejected' && kyc.rejectionReason && (
            <div className="kyc-reason">
              <strong>Reason:</strong> {kyc.rejectionReason}
            </div>
          )}
          {card.cta && (
            <Button block onClick={() => navigate('/kyc/identity')}>
              {card.cta}
            </Button>
          )}
        </div>

        <div className="home-card">
          <h2 className="timeline-title">Verification Progress</h2>
          <div className="timeline">
            {steps.map((step) => (
              <div key={step.key} className={`timeline__step timeline__step--${step.state}`}>
                <span className="timeline__dot">
                  {step.state === 'done' && <CheckIcon size={13} />}
                  {step.state === 'current' && <span className="timeline__dot-inner" />}
                  {step.state === 'rejected' && <CloseIcon size={13} />}
                </span>
                <div className="timeline__copy">
                  <p className="timeline__label">{step.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Screen>
  );
}
