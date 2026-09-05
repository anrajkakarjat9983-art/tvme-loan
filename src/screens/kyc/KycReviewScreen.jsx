import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import StepProgress from '../../components/StepProgress';
import { useAuth } from '../../context/AuthContext';
import { getKyc, saveKycDraft } from '../../services/kycService';
import { formatDate } from '../../utils/format';

const STEPS = ['Identity', 'Documents', 'Selfie', 'Review', 'Payment'];

export default function KycReviewScreen() {
  const navigate = useNavigate();
  const { session, updateUser } = useAuth();
  const kyc = getKyc(session.user);

  useEffect(() => {
    const isComplete =
      kyc.pan && kyc.idType && kyc.identityDocument && kyc.addressDocument && kyc.selfie &&
      kyc.bankStatement && kyc.bank?.accountHolder && kyc.bank?.accountNumber &&
      kyc.bank?.ifsc && kyc.bank?.bankName;
    if (!isComplete) navigate('/kyc', { replace: true });
  }, [kyc, navigate]);

  const identityRows = [
    { label: 'Full Name', value: session.user?.fullName },
    { label: 'Date of Birth', value: formatDate(session.user?.dateOfBirth) },
    { label: 'PAN', value: kyc.pan, mono: true },
    { label: 'Selected ID Type', value: kyc.idType },
  ];

  const documentRows = [
    { label: 'Identity Proof', value: kyc.identityDocument?.name },
    { label: 'Address Proof', value: kyc.addressDocument?.name },
    { label: 'Bank Statement', value: kyc.bankStatement?.name },
    { label: 'Selfie', value: kyc.selfie?.name },
  ];

  const bankRows = [
    { label: 'Account Holder', value: kyc.bank?.accountHolder },
    { label: 'Account Number', value: kyc.bank?.accountNumber, mono: true },
    { label: 'IFSC', value: kyc.bank?.ifsc, mono: true },
    { label: 'Bank Name', value: kyc.bank?.bankName },
  ];

  const handleSubmit = async () => {
    try {
      const updated = await saveKycDraft(session.mobile, {
        status: 'in_progress',
        reviewCompletedAt: new Date().toISOString(),
      });
      if (updated) updateUser(updated);
    } catch {
      // proceed even if save fails
    }
    navigate('/kyc/payment');
  };

  return (
    <Screen width="wide">
      <ScreenHeader onBack={() => navigate('/kyc/selfie')} backLabel="Back to selfie" />
      <div className="apply">
        <h1 className="screen-title">Review Your KYC</h1>
        <p className="screen-subtitle">Confirm your details before submitting</p>
        <StepProgress steps={STEPS} current={3} />

        <div className="review-stack">
          <div className="review-section">
            <div className="review-section__head">
              <h2>Identity Information</h2>
              <button type="button" className="link-btn" onClick={() => navigate('/kyc/identity')}>
                Edit
              </button>
            </div>
            {identityRows.map((row) => (
              <div key={row.label} className="review-section__row">
                <span className="review-section__label">{row.label}</span>
                <span className={`review-section__value${row.mono ? ' app-meta__value--mono' : ''}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="review-section">
            <div className="review-section__head">
              <h2>Bank Account Details</h2>
              <button type="button" className="link-btn" onClick={() => navigate('/bank-details')}>
                Edit
              </button>
            </div>
            {bankRows.map((row) => (
              <div key={row.label} className="review-section__row">
                <span className="review-section__label">{row.label}</span>
                <span className={`review-section__value${row.mono ? ' app-meta__value--mono' : ''}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="review-section">
            <div className="review-section__head">
              <h2>Documents</h2>
              <button type="button" className="link-btn" onClick={() => navigate('/kyc/documents')}>
                Edit
              </button>
            </div>
            {documentRows.map((row) => (
              <div key={row.label} className="review-section__row">
                <span className="review-section__label">{row.label} ✓</span>
                <span className="review-section__value">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          block
          onClick={handleSubmit}
        >
          Continue to Payment
        </Button>
      </div>
    </Screen>
  );
}
