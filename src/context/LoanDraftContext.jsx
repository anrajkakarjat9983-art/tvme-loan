import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DRAFT_KEY = 'tvme_loan_draft_v1';

const EMPTY_EMPLOYMENT = Object.freeze({
  type: '',
  companyName: '',
  monthlyIncome: '',
  experience: '',
  workAddress: '',
});

const EMPTY_DRAFT = Object.freeze({
  amount: null,
  tenureMonths: null,
  purpose: '',
  employment: EMPTY_EMPLOYMENT,
});

const LoanDraftContext = createContext(null);

function createEmptyDraft() {
  return { ...EMPTY_DRAFT, employment: { ...EMPTY_EMPLOYMENT } };
}

function readDraft() {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return createEmptyDraft();
    const parsed = JSON.parse(raw);
    return {
      ...createEmptyDraft(),
      ...parsed,
      employment: { ...EMPTY_EMPLOYMENT, ...(parsed.employment ?? {}) },
    };
  } catch {
    return createEmptyDraft();
  }
}

export function LoanDraftProvider({ children }) {
  const [draft, setDraft] = useState(readDraft);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      return;
    }
  }, [draft]);

  const value = useMemo(
    () => ({
      draft,
      setLoanDetails(patch) {
        setDraft((prev) => ({ ...prev, ...patch }));
      },
      setEmployment(patch) {
        setDraft((prev) => ({ ...prev, employment: { ...prev.employment, ...patch } }));
      },
      resetDraft() {
        setDraft(createEmptyDraft());
      },
    }),
    [draft]
  );

  return <LoanDraftContext.Provider value={value}>{children}</LoanDraftContext.Provider>;
}

export function useLoanDraft() {
  const context = useContext(LoanDraftContext);
  if (!context) {
    throw new Error('useLoanDraft must be used inside a LoanDraftProvider');
  }
  return context;
}
