import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import StepProgress from '../../components/StepProgress';
import StatusBanner from '../../components/StatusBanner';
import { useAuth } from '../../context/AuthContext';
import { useLoanDraft } from '../../context/LoanDraftContext';
import { LOAN_CONFIG } from '../../data/loanConfig';
import { submitLoanApplication } from '../../services/loanService';
import { formatCurrency } from '../../utils/format';
import { calculateTotals } from '../../utils/loanMath';

const STEPS = ['Loan Details', 'Employment', 'Review'];

export default function ReviewScreen() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { draft, resetDraft } = useLoanDraft();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const user = session.user;
  const totals = calculateTotals(draft.amount, LOAN_CONFIG.interestRate, draft.tenureMonths);

  const personalRows = [
    { label: 'Full Name', value: user.fullName },
    { label: 'Mobile Number', value: `+91 ${user.mobile}` },
    { label: 'Email', value: user.email ?? 'Not added' },
    { label: 'City', value: `${user.city}, ${user.state}` },
  ];

  const loanRows = [
    { label: 'Loan Amount', value: formatCurrency(draft.amount) },
    { label: 'Tenure', value: `${draft.tenureMonths} months` },
    { label: 'Interest Rate', value: `${LOAN_CONFIG.interestRate}% p.a.` },
    { label: 'Monthly EMI', value: formatCurrency(totals.emi) },
    { label: 'Total Interest', value: formatCurrency(totals.totalInterest) },
    { label: 'Total Repayment', value: formatCurrency(totals.totalRepayable) },
    { label: 'Purpose', value: draft.purpose },
  ];

  const employmentRows = [
    { label: 'Employment Type', value: draft.employment.type },
    { label: 'Company / Business', value: draft.employment.companyName },
    { label: 'Monthly Income', value: formatCurrency(draft.employment.monthlyIncome) },
    { label: 'Experience', value: draft.employment.experience },
    { label: 'Work Address', value: draft.employment.workAddress },
  ];

  const handleSubmit = async () => {
    if (submitting || !agreed) return;
    setSubmitting(true);
    setFormError('');
    try {
      await submitLoanApplication(session.mobile, draft, totals);
      resetDraft();
      navigate('/application-submitted', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Could not submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSection = (title, rows, editTo) => (
    <div className="review-section">
      <div className="review-section__head">
        <h2>{title}</h2>
        {editTo && (
          <button type="button" className="link-btn" onClick={() => navigate(editTo)}>
            Edit
          </button>
        )}
      </div>
      {rows.map((row) => (
        <div key={row.label} className="review-section__row">
          <span className="review-section__label">{row.label}</span>
          <span className="review-section__value">{row.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Screen width="wide">
      <ScreenHeader onBack={() => navigate('/apply/employment')} backLabel="Back to employment" />
      <div className="apply">
        <h1 className="screen-title">Review Application</h1>
        <p className="screen-subtitle">Please verify your details before submitting</p>
        <StepProgress steps={STEPS} current={2} />

        {formError && <StatusBanner type="error">{formError}</StatusBanner>}

        <div className="review-stack">
          {renderSection('Personal Details', personalRows)}
          {renderSection('Loan Details', loanRows, '/apply')}
          {renderSection('Employment & Income', employmentRows, '/apply/employment')}
        </div>

        <label className="declaration">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span>
            I confirm that the information provided is accurate and I agree to the loan terms,
            interest rate and repayment schedule.
          </span>
        </label>

        <Button block loading={submitting} loadingText="Submitting application…" disabled={!agreed} onClick={handleSubmit}>
          Submit Application
        </Button>
      </div>
    </Screen>
  );
}
