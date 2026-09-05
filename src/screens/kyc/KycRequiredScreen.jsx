import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import StatusBanner from '../../components/StatusBanner';
import { ShieldCheckIcon } from '../../components/icons';
import { useAuth } from '../../context/AuthContext';
import { getKyc } from '../../services/kycService';

export default function KycRequiredScreen() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const kyc = getKyc(session.user);

  return (
    <Screen width="wide">
      <ScreenHeader onBack={() => navigate(-1)} backLabel="Go back" />
      <div className="placeholder">
        <span className="placeholder__icon">
          <ShieldCheckIcon size={26} />
        </span>
        <h1>KYC Required</h1>
        <p>Please complete your KYC before continuing with your loan application.</p>
        {kyc.status === 'under_review' && (
          <StatusBanner type="info">
            Your KYC is under review. You can continue once it has been verified.
          </StatusBanner>
        )}
        {kyc.status === 'rejected' && (
          <StatusBanner type="error">
            Your KYC was rejected. Please resubmit your KYC to continue.
          </StatusBanner>
        )}
        <Button block onClick={() => navigate('/kyc')}>
          Complete KYC
        </Button>
        <button type="button" className="link-btn" onClick={() => navigate('/apply/employment')}>
          Back
        </button>
      </div>
    </Screen>
  );
}
