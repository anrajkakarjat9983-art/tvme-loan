import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import SelectField from '../../components/SelectField';
import StepProgress from '../../components/StepProgress';
import TextField from '../../components/TextField';
import { cx } from '../../utils/cx';
import { useLoanDraft } from '../../context/LoanDraftContext';
import { LOAN_CONFIG } from '../../data/loanConfig';
import { onlyDigits } from '../../utils/format';
import { hasErrors, validateAddress, validateRequired } from '../../utils/validation';

const STEPS = ['Loan Details', 'Employment', 'Review'];

function buildValidators(values) {
  return {
    type: validateRequired(values.type, 'Employment type'),
    companyName: validateRequired(values.companyName, 'Company / business name'),
    monthlyIncome: (() => {
      if (!values.monthlyIncome) return 'Monthly income is required';
      if (!/^\d+$/.test(values.monthlyIncome)) return 'Enter a valid amount';
      if (Number(values.monthlyIncome) < 1000) return 'Monthly income must be at least ₹1,000';
      return '';
    })(),
    experience: validateRequired(values.experience, 'Work experience'),
    workAddress: validateAddress(values.workAddress),
  };
}

export default function EmploymentScreen() {
  const navigate = useNavigate();
  const { draft, setEmployment } = useLoanDraft();
  const [errors, setErrors] = useState({});

  const values = draft.employment;

  const setField = (name, value) => {
    setEmployment({ [name]: value });
    if (name in errors) {
      setErrors((prev) => {
        const updated = { ...prev };
        const next = { ...values, [name]: value };
        const message = buildValidators(next)[name];
        if (message) {
          updated[name] = message;
        } else {
          delete updated[name];
        }
        return updated;
      });
    }
  };

  const handleBlur = (name) => {
    setErrors((prev) => {
      const updated = { ...prev };
      const message = buildValidators(values)[name];
      if (message) {
        updated[name] = message;
      } else {
        delete updated[name];
      }
      return updated;
    });
  };

  const handleContinue = () => {
    const nextErrors = buildValidators(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    navigate('/apply/review');
  };

  return (
    <Screen width="wide">
      <ScreenHeader onBack={() => navigate('/apply')} backLabel="Back to loan details" />
      <div className="apply">
        <h1 className="screen-title">Employment & Income</h1>
        <p className="screen-subtitle">This helps us assess your application faster</p>
        <StepProgress steps={STEPS} current={1} />

        <div className="apply-section">
          <h2>Employment Type</h2>
          <div className="chip-group">
            {LOAN_CONFIG.employmentTypes.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={values.type === option}
                className={cx('chip', values.type === option && 'chip--selected')}
                onClick={() => setField('type', option)}
              >
                {option}
              </button>
            ))}
          </div>
          {errors.type && (
            <p className="field__message field__message--error" role="alert">
              {errors.type}
            </p>
          )}
        </div>

        <div className="apply-fields">
          <TextField
            label="Company / Business Name"
            placeholder="Company or institution name"
            value={values.companyName}
            onChange={(event) => setField('companyName', event.target.value)}
            onBlur={() => handleBlur('companyName')}
            error={errors.companyName}
            required
          />
          <TextField
            label="Monthly Income"
            prefix="₹"
            placeholder="e.g. 35000"
            inputMode="numeric"
            maxLength={8}
            value={values.monthlyIncome}
            onChange={(event) => setField('monthlyIncome', onlyDigits(event.target.value, 8))}
            onBlur={() => handleBlur('monthlyIncome')}
            error={errors.monthlyIncome}
            hint="Take-home salary or average monthly earnings."
            required
          />
          <SelectField
            label="Work Experience"
            placeholder="Select experience"
            options={LOAN_CONFIG.experienceOptions}
            value={values.experience}
            onChange={(event) => setField('experience', event.target.value)}
            onBlur={() => handleBlur('experience')}
            error={errors.experience}
            required
          />
          <TextField
            label="Work Address"
            placeholder="Office / business address"
            multiline
            rows={2}
            value={values.workAddress}
            onChange={(event) => setField('workAddress', event.target.value)}
            onBlur={() => handleBlur('workAddress')}
            error={errors.workAddress}
            required
          />
        </div>

        <Button block onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </Screen>
  );
}
