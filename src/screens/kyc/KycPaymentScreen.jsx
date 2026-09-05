import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import DocumentUploadCard from '../../components/DocumentUploadCard';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import StatusBanner from '../../components/StatusBanner';
import StepProgress from '../../components/StepProgress';
import { useAuth } from '../../context/AuthContext';
import { saveKycDraft, submitKyc } from '../../services/kycService';
import { getPaymentSettings } from '../../services/paymentSettingsService';

const STEPS = ['Identity', 'Documents', 'Selfie', 'Review', 'Payment'];

export default function KycPaymentScreen() {
  const navigate = useNavigate();
  const { session, updateUser } = useAuth();
  const kyc = session.user?.kyc ?? {};
  const payment = kyc.payment ?? {};
  const paySettings = getPaymentSettings();

  const [form, setForm] = useState({
    name: payment.name ?? '',
    utr: payment.utr ?? '',
    phone: payment.phone ?? '',
  });
  const [receipt, setReceipt] = useState(payment.receipt ?? null);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!form.utr.trim()) next.utr = 'Please enter the UTR number.';
    else if (form.utr.trim().length < 6) next.utr = 'UTR must be at least 6 characters.';
    if (!form.phone.trim()) next.phone = 'Please enter your mobile number.';
    else if (!/^\d{10}$/.test(form.phone.trim())) next.phone = 'Enter a valid 10-digit mobile number.';
    if (!receipt) next.receipt = 'Please upload your payment screenshot.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleReceiptUpload = (doc) => {
    setReceipt(doc);
    if (errors.receipt) setErrors((prev) => ({ ...prev, receipt: '' }));
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setSaveError('');
    try {
      const draftUpdated = await saveKycDraft(session.mobile, {
        payment: {
          name: form.name.trim(),
          utr: form.utr.trim(),
          phone: form.phone.trim(),
          receipt,
          paidAt: new Date().toISOString(),
        },
      });
      if (draftUpdated) updateUser(draftUpdated);
      const submitted = await submitKyc(session.mobile);
      if (submitted) updateUser(submitted);
      navigate('/kyc/submitted', { replace: true });
    } catch (err) {
      setSaveError(err.message || 'Could not save payment details. Please try again.');
    }
  };

  return (
    <Screen width="wide">
      <ScreenHeader onBack={() => navigate('/kyc/review')} backLabel="Back to review" />
      <div className="apply">
        <h1 className="screen-title">File Submission Charge</h1>
        <p className="screen-subtitle">Scan the QR code to pay the processing fee</p>
        <StepProgress steps={STEPS} current={4} />

        {saveError && <StatusBanner type="error">{saveError}</StatusBanner>}

        <div className="payment-card">
          <div className="payment-card__qr">
            {paySettings.qrImageUrl ? (
              <img
                src={paySettings.qrImageUrl}
                alt="UPI QR Code"
                style={{ width: 180, height: 180, objectFit: 'contain', borderRadius: 8 }}
              />
            ) : (
              <svg viewBox="0 0 200 200" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" rx="12" fill="#fff" />
                <rect x="10" y="10" width="50" height="50" rx="4" fill="#1a1a2e" />
                <rect x="140" y="10" width="50" height="50" rx="4" fill="#1a1a2e" />
                <rect x="10" y="140" width="50" height="50" rx="4" fill="#1a1a2e" />
                <rect x="16" y="16" width="38" height="38" rx="2" fill="#fff" />
                <rect x="22" y="22" width="26" height="26" rx="1" fill="#1a1a2e" />
                <rect x="146" y="16" width="38" height="38" rx="2" fill="#fff" />
                <rect x="152" y="22" width="26" height="26" rx="1" fill="#1a1a2e" />
                <rect x="16" y="146" width="38" height="38" rx="2" fill="#fff" />
                <rect x="22" y="152" width="26" height="26" rx="1" fill="#1a1a2e" />
                <rect x="70" y="10" width="10" height="10" fill="#1a1a2e" />
                <rect x="90" y="10" width="10" height="10" fill="#1a1a2e" />
                <rect x="110" y="10" width="10" height="10" fill="#1a1a2e" />
                <rect x="70" y="30" width="10" height="10" fill="#1a1a2e" />
                <rect x="100" y="30" width="10" height="10" fill="#1a1a2e" />
                <rect x="120" y="30" width="10" height="10" fill="#1a1a2e" />
                <rect x="80" y="50" width="10" height="10" fill="#1a1a2e" />
                <rect x="110" y="50" width="10" height="10" fill="#1a1a2e" />
                <rect x="70" y="70" width="10" height="10" fill="#1a1a2e" />
                <rect x="80" y="70" width="10" height="10" fill="#1a1a2e" />
                <rect x="100" y="70" width="10" height="10" fill="#1a1a2e" />
                <rect x="130" y="70" width="10" height="10" fill="#1a1a2e" />
                <rect x="10" y="70" width="10" height="10" fill="#1a1a2e" />
                <rect x="30" y="70" width="10" height="10" fill="#1a1a2e" />
                <rect x="50" y="70" width="10" height="10" fill="#1a1a2e" />
                <rect x="10" y="90" width="10" height="10" fill="#1a1a2e" />
                <rect x="40" y="90" width="10" height="10" fill="#1a1a2e" />
                <rect x="70" y="90" width="10" height="10" fill="#1a1a2e" />
                <rect x="100" y="90" width="10" height="10" fill="#1a1a2e" />
                <rect x="130" y="90" width="10" height="10" fill="#1a1a2e" />
                <rect x="10" y="110" width="10" height="10" fill="#1a1a2e" />
                <rect x="30" y="110" width="10" height="10" fill="#1a1a2e" />
                <rect x="50" y="110" width="10" height="10" fill="#1a1a2e" />
                <rect x="80" y="110" width="10" height="10" fill="#1a1a2e" />
                <rect x="110" y="110" width="10" height="10" fill="#1a1a2e" />
                <rect x="140" y="110" width="10" height="10" fill="#1a1a2e" />
                <rect x="10" y="130" width="10" height="10" fill="#1a1a2e" />
                <rect x="40" y="130" width="10" height="10" fill="#1a1a2e" />
                <rect x="70" y="130" width="10" height="10" fill="#1a1a2e" />
                <rect x="100" y="130" width="10" height="10" fill="#1a1a2e" />
                <rect x="130" y="130" width="10" height="10" fill="#1a1a2e" />
                <rect x="160" y="130" width="10" height="10" fill="#1a1a2e" />
                <rect x="70" y="150" width="10" height="10" fill="#1a1a2e" />
                <rect x="100" y="150" width="10" height="10" fill="#1a1a2e" />
                <rect x="130" y="150" width="10" height="10" fill="#1a1a2e" />
                <rect x="80" y="170" width="10" height="10" fill="#1a1a2e" />
                <rect x="110" y="170" width="10" height="10" fill="#1a1a2e" />
                <rect x="140" y="170" width="10" height="10" fill="#1a1a2e" />
                <rect x="160" y="170" width="10" height="10" fill="#1a1a2e" />
                <rect x="70" y="180" width="10" height="10" fill="#1a1a2e" />
                <rect x="100" y="180" width="10" height="10" fill="#1a1a2e" />
                <rect x="140" y="180" width="10" height="10" fill="#1a1a2e" />
              </svg>
            )}
          </div>
          <p className="payment-card__amount">Processing Fee: ₹{paySettings.amount || '499'}</p>
          <p className="payment-card__upi">UPI: {paySettings.upiId || 'tvme@upi'}</p>
          <p className="payment-card__hint">Scan with any UPI app to pay</p>
        </div>

        <div className="review-stack">
          <div className="review-section">
            <div className="review-section__head">
              <h2>Payment Details</h2>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pay-name">
                Full Name <span className="field__required-mark">*</span>
              </label>
              <div className="field__control">
                <input
                  id="pay-name"
                  className="field__input"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={set('name')}
                  autoComplete="name"
                />
              </div>
              {errors.name && (
                <p className="field__message field__message--error">{errors.name}</p>
              )}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pay-phone">
                Mobile Number <span className="field__required-mark">*</span>
              </label>
              <div className="field__control">
                <input
                  id="pay-phone"
                  className="field__input"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                  maxLength={10}
                />
              </div>
              {errors.phone && (
                <p className="field__message field__message--error">{errors.phone}</p>
              )}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pay-utr">
                UTR / Transaction Ref No. <span className="field__required-mark">*</span>
              </label>
              <div className="field__control">
                <input
                  id="pay-utr"
                  className="field__input"
                  type="text"
                  placeholder="e.g. 405512345678"
                  value={form.utr}
                  onChange={set('utr')}
                />
              </div>
              {errors.utr && (
                <p className="field__message field__message--error">{errors.utr}</p>
              )}
            </div>
          </div>
        </div>

        <div className="kyc-upload-stack">
          <DocumentUploadCard
            title="Payment Screenshot / Receipt"
            hint="JPG / PNG / PDF &middot; max 5 MB"
            imageOnly
            value={receipt}
            onUploaded={handleReceiptUpload}
            onRemoved={() => setReceipt(null)}
          />
          {errors.receipt && (
            <p className="field__message field__message--error">{errors.receipt}</p>
          )}
        </div>

        <Button block onClick={handleContinue}>
          Submit & Continue
        </Button>
      </div>
    </Screen>
  );
}
