import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import StatusBanner from '../../components/StatusBanner';
import StepProgress from '../../components/StepProgress';
import TextField from '../../components/TextField';
import { cx } from '../../utils/cx';
import { useAuth } from '../../context/AuthContext';
import { KYC_ID_TYPES, saveKycDraft } from '../../services/kycService';
import { hasErrors, validatePan, validateRequired } from '../../utils/validation';

const STEPS = ['Identity', 'Documents', 'Selfie', 'Review', 'Payment'];

export default function KycIdentityScreen() {
  const navigate = useNavigate();
  const { session, updateUser } = useAuth();
  const kyc = session.user?.kyc ?? {};

  const [pan, setPan] = useState(kyc.pan ?? '');
  const [idType, setIdType] = useState(kyc.idType ?? '');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const handlePanChange = (event) => {
    const next = event.target.value.toUpperCase().slice(0, 10);
    setPan(next);
    if (errors.pan) {
      setErrors((prev) => {
        const updated = { ...prev };
        const message = validatePan(next);
        if (message) updated.pan = message;
        else delete updated.pan;
        return updated;
      });
    }
  };

  const handleContinue = async () => {
    const nextErrors = {
      pan: validatePan(pan),
      idType: validateRequired(idType, 'Government ID type'),
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    setSaving(true);
    setFormError('');
    try {
      const updated = await saveKycDraft(session.mobile, {
        pan: pan.trim().toUpperCase(),
        idType,
      });
      if (updated) updateUser(updated);
      navigate('/kyc/documents');
    } catch (err) {
      setFormError(err.message || 'Could not save your details. Please log in again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen width="wide">
      <ScreenHeader onBack={() => navigate('/kyc')} backLabel="Back to KYC" />
      <div className="apply">
        <h1 className="screen-title">Identity Details</h1>
        <p className="screen-subtitle">Enter your PAN and choose a government ID</p>
        <StepProgress steps={STEPS} current={0} />

        {formError && <StatusBanner type="error">{formError}</StatusBanner>}

        <div className="apply-fields">
          <TextField
            label="PAN Number"
            placeholder="ABCDE1234F"
            maxLength={10}
            value={pan}
            onChange={handlePanChange}
            error={errors.pan}
            hint="Your PAN is used only for identity verification."
            required
          />

          <div className={cx('field', errors.idType && 'field--error')}>
            <span className="field__label" id="kyc-id-type-label">
              Government ID<span className="field__required-mark"> *</span>
            </span>
            <div className="chip-group" role="radiogroup" aria-labelledby="kyc-id-type-label">
              {KYC_ID_TYPES.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={idType === option}
                  className={cx('chip', idType === option && 'chip--selected')}
                  onClick={() => {
                    setIdType(option);
                    setErrors((prev) => {
                      const updated = { ...prev };
                      delete updated.idType;
                      return updated;
                    });
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.idType && (
              <p className="field__message field__message--error" role="alert">
                {errors.idType}
              </p>
            )}
          </div>
        </div>

        <Button block loading={saving} onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </Screen>
  );
}
