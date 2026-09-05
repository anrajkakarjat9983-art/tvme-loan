import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import StatusBanner from '../components/StatusBanner';
import TextField from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { saveKycDraft } from '../services/kycService';
import {
  hasErrors,
  validateAccountHolder,
  validateAccountNumber,
  validateBankName,
  validateIfsc,
} from '../utils/validation';

export default function BankDetailsScreen() {
  const navigate = useNavigate();
  const { session, updateUser } = useAuth();
  const kyc = session.user?.kyc ?? {};
  const bank = kyc.bank ?? {};

  const [bankForm, setBankForm] = useState({
    accountHolder: bank.accountHolder ?? '',
    accountNumber: bank.accountNumber ?? '',
    confirmAccountNumber: bank.accountNumber ?? '',
    ifsc: bank.ifsc ?? '',
    bankName: bank.bankName ?? '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const setField = (field) => (e) => {
    setBankForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleSubmit = async () => {
    const nextErrors = {
      accountHolder: validateAccountHolder(bankForm.accountHolder),
      accountNumber: validateAccountNumber(bankForm.accountNumber),
      confirmAccountNumber:
        bankForm.confirmAccountNumber !== bankForm.accountNumber
          ? 'Account numbers do not match.'
          : '',
      ifsc: validateIfsc(bankForm.ifsc),
      bankName: validateBankName(bankForm.bankName),
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    setSaving(true);
    setFormError('');
    try {
      const updated = await saveKycDraft(session.mobile, {
        bank: {
          accountHolder: bankForm.accountHolder.trim(),
          accountNumber: bankForm.accountNumber.trim(),
          ifsc: bankForm.ifsc.trim().toUpperCase(),
          bankName: bankForm.bankName.trim(),
        },
        bankCompleted: true,
      });
      if (updated) updateUser(updated);
      navigate('/kyc/selfie');
    } catch (err) {
      setFormError(err.message || 'Could not save your bank details. Please log in again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen width="wide">
      <ScreenHeader onBack={() => navigate('/kyc/documents')} backLabel="Back to documents" />
      <div className="apply">
        <h1 className="screen-title">Bank Details</h1>
        <p className="screen-subtitle">Enter your bank account details</p>

        {formError && <StatusBanner type="error">{formError}</StatusBanner>}

        <div className="apply-fields">
          <TextField
            label="Account Holder Name"
            placeholder="Name on bank account"
            value={bankForm.accountHolder}
            onChange={setField('accountHolder')}
            error={errors.accountHolder}
            autoComplete="name"
            required
          />
          <TextField
            label="Account Number"
            placeholder="Your bank account number"
            inputMode="numeric"
            value={bankForm.accountNumber}
            onChange={setField('accountNumber')}
            error={errors.accountNumber}
            maxLength={18}
            required
          />
          <TextField
            label="Confirm Account Number"
            placeholder="Re-enter account number"
            inputMode="numeric"
            value={bankForm.confirmAccountNumber}
            onChange={setField('confirmAccountNumber')}
            error={errors.confirmAccountNumber}
            maxLength={18}
            required
          />
          <TextField
            label="IFSC Code"
            placeholder="e.g. HDFC0001234"
            value={bankForm.ifsc}
            onChange={setField('ifsc')}
            error={errors.ifsc}
            hint="11-character IFSC code of your bank branch."
            required
          />
          <TextField
            label="Bank Name"
            placeholder="e.g. HDFC Bank"
            value={bankForm.bankName}
            onChange={setField('bankName')}
            error={errors.bankName}
            required
          />
        </div>

        <Button block loading={saving} onClick={handleSubmit}>
          Save & Continue
        </Button>
      </div>
    </Screen>
  );
}