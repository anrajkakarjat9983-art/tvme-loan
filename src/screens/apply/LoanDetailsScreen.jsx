import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import StepProgress from '../../components/StepProgress';
import { cx } from '../../utils/cx';
import { useAuth } from '../../context/AuthContext';
import { useLoanDraft } from '../../context/LoanDraftContext';
import { LOAN_CONFIG } from '../../data/loanConfig';
import { formatCurrency } from '../../utils/format';
import { calculateTotals } from '../../utils/loanMath';

const STEPS = ['Loan Details', 'Employment', 'Review'];

export default function LoanDetailsScreen() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { draft, setLoanDetails } = useLoanDraft();

  const maxAmount = Math.max(LOAN_CONFIG.minAmount, session.user?.loanLimit ?? LOAN_CONFIG.maxAmountCap);
  const [amount, setAmount] = useState(draft.amount ?? Math.min(LOAN_CONFIG.defaultAmount, maxAmount));
  const [tenure, setTenure] = useState(draft.tenureMonths);
  const [purpose, setPurpose] = useState(draft.purpose);

  const totals = tenure ? calculateTotals(amount, LOAN_CONFIG.interestRate, tenure) : null;
  const fillPercent = ((amount - LOAN_CONFIG.minAmount) / (maxAmount - LOAN_CONFIG.minAmount)) * 100;
  const canContinue = Boolean(tenure && purpose);

  const handleContinue = () => {
    if (!canContinue) return;
    setLoanDetails({ amount, tenureMonths: tenure, purpose });
    navigate('/apply/employment');
  };

  return (
    <Screen width="wide">
      <ScreenHeader onBack={() => navigate('/home')} backLabel="Back to home" />
      <div className="apply">
        <h1 className="screen-title">Apply for Loan</h1>
        <p className="screen-subtitle">Choose your loan amount and tenure</p>
        <StepProgress steps={STEPS} current={0} />

        <div className="apply-limit">
          <span>Available Loan Limit</span>
          <strong>{formatCurrency(maxAmount)}</strong>
        </div>

        <div className="apply-section">
          <div className="apply-section__head">
            <h2>Loan Amount</h2>
            <span className="apply-amount">{formatCurrency(amount)}</span>
          </div>
          <input
            type="range"
            className="amount-slider"
            min={LOAN_CONFIG.minAmount}
            max={maxAmount}
            step={LOAN_CONFIG.amountStep}
            value={amount}
            style={{ '--fill': `${fillPercent}%` }}
            onChange={(event) => setAmount(Number(event.target.value))}
            aria-label="Select loan amount"
          />
          <div className="range-bounds">
            <span>{formatCurrency(LOAN_CONFIG.minAmount)}</span>
            <span>{formatCurrency(maxAmount)}</span>
          </div>
          <div className="chip-row">
            {[5000, 10000, 25000]
              .filter((value) => value <= maxAmount)
              .map((value) => (
                <button
                  key={value}
                  type="button"
                  className={cx('chip', 'chip--sm', amount === value && 'chip--selected')}
                  onClick={() => setAmount(value)}
                >
                  {formatCurrency(value)}
                </button>
              ))}
            <button
              type="button"
              className={cx('chip', 'chip--sm', amount === maxAmount && 'chip--selected')}
              onClick={() => setAmount(maxAmount)}
            >
              Max
            </button>
          </div>
        </div>

        <div className="apply-section">
          <h2>Tenure</h2>
          <div className="tenure-grid">
            {LOAN_CONFIG.tenures.map((months) => (
              <button
                key={months}
                type="button"
                className={cx('tenure-card', tenure === months && 'tenure-card--selected')}
                onClick={() => setTenure(months)}
                aria-pressed={tenure === months}
              >
                {months}
                <small>months</small>
              </button>
            ))}
          </div>
        </div>

        <div className="apply-section">
          <h2>Loan Purpose</h2>
          <div className="chip-group chip-group--3">
            {LOAN_CONFIG.purposes.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={purpose === option}
                className={cx('chip', 'chip--sm', 'chip--center', purpose === option && 'chip--selected')}
                onClick={() => setPurpose(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="summary-box">
          <div>
            <small>Interest Rate</small>
            <strong>{LOAN_CONFIG.interestRate}% p.a.</strong>
          </div>
          <div>
            <small>Est. Monthly EMI</small>
            <strong>{totals ? formatCurrency(totals.emi) : '—'}</strong>
          </div>
          <div>
            <small>Total Repayment</small>
            <strong>{totals ? formatCurrency(totals.totalRepayable) : '—'}</strong>
          </div>
        </div>

        <Button block disabled={!canContinue} onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </Screen>
  );
}
