import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import DocumentUploadCard from '../../components/DocumentUploadCard';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import StatusBanner from '../../components/StatusBanner';
import StepProgress from '../../components/StepProgress';
import { useAuth } from '../../context/AuthContext';
import { saveKycDraft } from '../../services/kycService';

const STEPS = ['Identity', 'Documents', 'Selfie', 'Review', 'Payment'];

export default function KycDocumentsScreen() {
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
      setSaveError(err.message || 'Could not save the document. Please log in again.');
    }
  };

  const handleUpload = (field) => (doc) => persist({ [field]: doc });
  const handleRemove = (field) => () => persist({ [field]: null });

  const canContinue = Boolean(kyc.identityDocument && kyc.addressDocument && kyc.bankStatement);

  return (
    <Screen width="wide">
      <ScreenHeader onBack={() => navigate('/kyc/identity')} backLabel="Back to identity details" />
      <div className="apply">
        <h1 className="screen-title">KYC Documents</h1>
        <p className="screen-subtitle">Upload clear copies of your documents</p>
        <StepProgress steps={STEPS} current={1} />

        {saveError && <StatusBanner type="error">{saveError}</StatusBanner>}

        <div className="kyc-upload-stack">
          <DocumentUploadCard
            title="Identity Proof"
            hint="JPG / PNG / PDF &middot; max 5 MB"
            value={kyc.identityDocument}
            onUploaded={handleUpload('identityDocument')}
            onRemoved={handleRemove('identityDocument')}
          />
          <DocumentUploadCard
            title="Address Proof"
            hint="JPG / PNG / PDF &middot; max 5 MB"
            value={kyc.addressDocument}
            onUploaded={handleUpload('addressDocument')}
            onRemoved={handleRemove('addressDocument')}
          />
          <DocumentUploadCard
            title="1 Year Bank Statement"
            hint="JPG / PNG / PDF &middot; max 5 MB"
            value={kyc.bankStatement}
            onUploaded={handleUpload('bankStatement')}
            onRemoved={handleRemove('bankStatement')}
          />
        </div>

        <Button block disabled={!canContinue} onClick={() => navigate('/bank-details')}>
          Continue
        </Button>
      </div>
    </Screen>
  );
}