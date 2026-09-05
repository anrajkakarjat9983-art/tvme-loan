import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import DocumentUploadCard from '../../components/DocumentUploadCard';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import StatusBanner from '../../components/StatusBanner';
import StepProgress from '../../components/StepProgress';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { saveKycDraft } from '../../services/kycService';

const STEPS = ['Identity', 'Documents', 'Selfie', 'Review', 'Payment'];

export default function KycSelfieScreen() {
  const navigate = useNavigate();
  const { session, updateUser } = useAuth();
  const kyc = session.user?.kyc ?? {};
  const [saveError, setSaveError] = useState('');

  const persist = async (patch) => {
    setSaveError('');
    try {
      const updated = await saveKycDraft(session.mobile, patch);
      if (updated) updateUser(updated);
    } catch (err) {
      setSaveError(err.message || 'Could not save the selfie. Please log in again.');
    }
  };

  const handleUpload = (doc) => persist({ selfie: doc });
  const handleRemove = () => persist({ selfie: null });

  return (
    <Screen width="wide">
      <ScreenHeader onBack={() => navigate('/bank-details')} backLabel="Back to bank details" />
      <div className="apply">
        <h1 className="screen-title">Verify Your Identity</h1>
        <p className="screen-subtitle">Take a live selfie using your front camera for identity verification.</p>
        <StepProgress steps={STEPS} current={2} />

        {saveError && <StatusBanner type="error">{saveError}</StatusBanner>}

        <div className="kyc-upload-stack">
          <DocumentUploadCard
            title="Selfie"
            hint="Take a live photo using your front camera"
            imageOnly
            large
            cameraOnly
            replaceLabel="Retake"
            value={kyc.selfie}
            onUploaded={handleUpload}
            onRemoved={handleRemove}
          />
        </div>

        <Button block disabled={!kyc.selfie} onClick={() => navigate('/kyc/review')}>
          Continue
        </Button>
      </div>
    </Screen>
  );
}
