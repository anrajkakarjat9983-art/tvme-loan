import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoanDraft } from '../context/LoanDraftContext';
import { isAdminAuthed } from '../services/adminService';
import { getCurrentLoan, getLatestApplication } from '../services/loanService';
import { getKyc, isKycVerified } from '../services/kycService';
import KycRequiredScreen from '../screens/kyc/KycRequiredScreen';

export function RedirectIfAuthenticated({ children }) {
  const { session } = useAuth();
  if (session.user) return <Navigate to="/home" replace />;
  return children;
}

export function RequireMobileSession({ children }) {
  const { session } = useAuth();
  if (!session.mobile) return <Navigate to="/login" replace />;
  return children;
}

export function RequireVerifiedNewUser({ children }) {
  const { session } = useAuth();
  if (!session.mobile) return <Navigate to="/login" replace />;
  if (!session.otpVerified) return <Navigate to="/otp" replace />;
  if (!session.isNewUser) return <Navigate to="/home" replace />;
  return children;
}

export function RequireProfileCreated({ children }) {
  const { session } = useAuth();
  if (!session.user) return <Navigate to="/login" replace />;
  if (!session.accountJustCreated) return <Navigate to="/home" replace />;
  return children;
}

export function RequireAuth({ children }) {
  const { session } = useAuth();
  if (!session.user) return <Navigate to="/login" replace />;
  return children;
}

export function RequireLoanDetailsStep({ children }) {
  const { draft } = useLoanDraft();
  if (!draft.amount || !draft.tenureMonths || !draft.purpose) {
    return <Navigate to="/apply" replace />;
  }
  return children;
}

export function RequireEmploymentStep({ children }) {
  const { draft } = useLoanDraft();
  const employment = draft.employment;
  const isComplete =
    employment.type &&
    employment.companyName &&
    employment.monthlyIncome &&
    employment.experience &&
    employment.workAddress;
  if (!isComplete) return <Navigate to="/apply/employment" replace />;
  return children;
}

export function RequireApplication({ children }) {
  const { session } = useAuth();
  if (!session.user || !getLatestApplication(session.user)) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

export function RequireNoPendingApplication({ children }) {
  const { session } = useAuth();
  const latest = getLatestApplication(session.user);
  const hasPending = Boolean(latest && latest.status !== 'rejected');
  if (hasPending) {
    return <Navigate to="/application-status" replace />;
  }
  return children;
}

export function RequireLoan({ children }) {
  const { session } = useAuth();
  if (!session.user || !getCurrentLoan(session.user)) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

export function RequireKycIdentity({ children }) {
  const { session } = useAuth();
  const kyc = getKyc(session.user);
  if (!kyc.pan || !kyc.idType) return <Navigate to="/kyc/identity" replace />;
  return children;
}

export function RequireKycDocuments({ children }) {
  const { session } = useAuth();
  const kyc = getKyc(session.user);
  const docsOk = kyc.identityDocument && kyc.addressDocument && kyc.bankStatement;
  const bankOk = kyc.bank?.accountHolder && kyc.bank?.accountNumber && kyc.bank?.ifsc && kyc.bank?.bankName;
  if (docsOk && !bankOk) return <Navigate to="/bank-details" replace />;
  if (!docsOk) return <Navigate to="/kyc/documents" replace />;
  return children;
}

export function RequireKycDocsOnly({ children }) {
  const { session } = useAuth();
  const kyc = getKyc(session.user);
  if (!kyc.identityDocument || !kyc.addressDocument || !kyc.bankStatement) {
    return <Navigate to="/kyc/documents" replace />;
  }
  return children;
}

export function RequireKycSelfie({ children }) {
  const { session } = useAuth();
  const kyc = getKyc(session.user);
  if (!kyc.selfie) return <Navigate to="/kyc/selfie" replace />;
  return children;
}

export function RequireKycSubmitted({ children }) {
  const { session } = useAuth();
  const kyc = getKyc(session.user);
  if (!['under_review', 'verified', 'rejected'].includes(kyc.status)) {
    return <Navigate to="/kyc" replace />;
  }
  return children;
}

export function RequireKycNotSubmitted({ children }) {
  const { session } = useAuth();
  const kyc = getKyc(session.user);
  if (['under_review', 'verified', 'rejected'].includes(kyc.status)) {
    return <Navigate to="/kyc/submitted" replace />;
  }
  return children;
}

export function RequireKycVerified({ children }) {
  const { session } = useAuth();
  if (!session.user || !isKycVerified(session.user)) {
    return <KycRequiredScreen />;
  }
  return children;
}

export function RequireAdmin({ children }) {
  if (!isAdminAuthed()) return <Navigate to="/admin/login" replace />;
  return children;
}
