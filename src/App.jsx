import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import {
  CalendarIcon,
  ClipboardListIcon,
  FileTextIcon,
  InfoIcon,
  UserIcon,
} from './components/icons';
import { AuthProvider } from './context/AuthContext';
import { LoanDraftProvider } from './context/LoanDraftContext';
import {
  RedirectIfAuthenticated,
  RequireAdmin,
  RequireApplication,
  RequireAuth,
  RequireEmploymentStep,
  RequireNoPendingApplication,
  RequireKycDocuments,
  RequireKycDocsOnly,
  RequireKycIdentity,
  RequireKycNotSubmitted,
  RequireKycSelfie,
  RequireKycSubmitted,
  RequireKycVerified,
  RequireLoan,
  RequireLoanDetailsStep,
  RequireMobileSession,
  RequireProfileCreated,
  RequireVerifiedNewUser,
} from './routes/guards';
import KycDashboardScreen from './screens/kyc/KycDashboardScreen';
import KycDocumentsScreen from './screens/kyc/KycDocumentsScreen';
import KycIdentityScreen from './screens/kyc/KycIdentityScreen';
import KycReviewScreen from './screens/kyc/KycReviewScreen';
import KycPaymentScreen from './screens/kyc/KycPaymentScreen';
import KycSelfieScreen from './screens/kyc/KycSelfieScreen';
import BankDetailsScreen from './screens/BankDetailsScreen';
import KycSubmittedScreen from './screens/kyc/KycSubmittedScreen';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminLoginScreen from './screens/admin/AdminLoginScreen';
import AdminUserDetailScreen from './screens/admin/AdminUserDetailScreen';
import AdminSettingsScreen from './screens/admin/AdminSettingsScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import OtpScreen from './screens/OtpScreen';
import PersonalDetailsScreen from './screens/PersonalDetailsScreen';
import PlaceholderScreen from './screens/PlaceholderScreen';
import ProfileCreatedScreen from './screens/ProfileCreatedScreen';
import ProfileScreen from './screens/ProfileScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import ActiveLoanScreen from './screens/loan/ActiveLoanScreen';
import ApplicationStatusScreen from './screens/apply/ApplicationStatusScreen';
import ApplicationSubmittedScreen from './screens/apply/ApplicationSubmittedScreen';
import EmploymentScreen from './screens/apply/EmploymentScreen';
import LoanDetailsScreen from './screens/apply/LoanDetailsScreen';
import ReviewScreen from './screens/apply/ReviewScreen';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LoanDraftProvider>
          <Routes>
            <Route
              path="/"
              element={
                <RedirectIfAuthenticated>
                  <WelcomeScreen />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/login"
              element={
                <RedirectIfAuthenticated>
                  <LoginScreen />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/otp"
              element={
                <RequireMobileSession>
                  <OtpScreen />
                </RequireMobileSession>
              }
            />
            <Route
              path="/personal-details"
              element={
                <RequireVerifiedNewUser>
                  <PersonalDetailsScreen />
                </RequireVerifiedNewUser>
              }
            />
            <Route
              path="/profile-created"
              element={
                <RequireProfileCreated>
                  <ProfileCreatedScreen />
                </RequireProfileCreated>
              }
            />
            <Route
              path="/home"
              element={
                <RequireAuth>
                  <HomeScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfileScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/notifications"
              element={
                <RequireAuth>
                  <NotificationsScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/apply"
              element={
                <RequireAuth>
                  <RequireNoPendingApplication>
                    <LoanDetailsScreen />
                  </RequireNoPendingApplication>
                </RequireAuth>
              }
            />
            <Route
              path="/apply/employment"
              element={
                <RequireAuth>
                  <RequireNoPendingApplication>
                    <RequireLoanDetailsStep>
                      <EmploymentScreen />
                    </RequireLoanDetailsStep>
                  </RequireNoPendingApplication>
                </RequireAuth>
              }
            />
            <Route
              path="/apply/review"
              element={
                <RequireAuth>
                  <RequireNoPendingApplication>
                    <RequireEmploymentStep>
                      <RequireKycVerified>
                        <ReviewScreen />
                      </RequireKycVerified>
                    </RequireEmploymentStep>
                  </RequireNoPendingApplication>
                </RequireAuth>
              }
            />
            <Route
              path="/kyc"
              element={
                <RequireAuth>
                  <KycDashboardScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/kyc/identity"
              element={
                <RequireAuth>
                  <KycIdentityScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/kyc/documents"
              element={
                <RequireAuth>
                  <RequireKycIdentity>
                    <KycDocumentsScreen />
                  </RequireKycIdentity>
                </RequireAuth>
              }
            />
            <Route
              path="/bank-details"
              element={
                <RequireAuth>
                  <RequireKycDocsOnly>
                    <BankDetailsScreen />
                  </RequireKycDocsOnly>
                </RequireAuth>
              }
            />
            <Route
              path="/kyc/selfie"
              element={
                <RequireAuth>
                  <RequireKycDocuments>
                    <KycSelfieScreen />
                  </RequireKycDocuments>
                </RequireAuth>
              }
            />
            <Route
              path="/kyc/review"
              element={
                <RequireAuth>
                  <RequireKycSelfie>
                    <KycReviewScreen />
                  </RequireKycSelfie>
                </RequireAuth>
              }
            />
            <Route
              path="/kyc/payment"
              element={
                <RequireAuth>
                  <RequireKycNotSubmitted>
                    <KycPaymentScreen />
                  </RequireKycNotSubmitted>
                </RequireAuth>
              }
            />
            <Route
              path="/kyc/submitted"
              element={
                <RequireAuth>
                  <RequireKycSubmitted>
                    <KycSubmittedScreen />
                  </RequireKycSubmitted>
                </RequireAuth>
              }
            />
            <Route
              path="/account/personal-details"
              element={
                <RequireAuth>
                  <PlaceholderScreen
                    icon={UserIcon}
                    title="Personal Details"
                    description="View and edit your personal details — management tools are on the way."
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/bank-details"
              element={
                <RequireAuth>
                  <PlaceholderScreen
                    icon={CalendarIcon}
                    title="Bank Details"
                    description="Add and manage your bank account for disbursals — coming in a later phase."
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/loan-history"
              element={
                <RequireAuth>
                  <PlaceholderScreen
                    icon={ClipboardListIcon}
                    title="Loan History"
                    description="Your past and current loans will be listed here."
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/payment-history"
              element={
                <RequireAuth>
                  <PlaceholderScreen
                    icon={CalendarIcon}
                    title="Payment History"
                    description="All your EMI payments and receipts will appear here."
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <PlaceholderScreen
                    icon={InfoIcon}
                    title="Settings"
                    description="Notification preferences and account settings are on the way."
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/application-submitted"
              element={
                <RequireAuth>
                  <RequireApplication>
                    <ApplicationSubmittedScreen />
                  </RequireApplication>
                </RequireAuth>
              }
            />
            <Route
              path="/application-status"
              element={
                <RequireAuth>
                  <RequireApplication>
                    <ApplicationStatusScreen />
                  </RequireApplication>
                </RequireAuth>
              }
            />
            <Route
              path="/loan-details"
              element={
                <RequireAuth>
                  <RequireLoan>
                    <ActiveLoanScreen />
                  </RequireLoan>
                </RequireAuth>
              }
            />
            <Route
              path="/loans"
              element={
                <RequireAuth>
                  <PlaceholderScreen
                    icon={ClipboardListIcon}
                    title="My Loans"
                    description="All your loans, EMIs and statements will live here."
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/repayment"
              element={
                <RequireAuth>
                  <PlaceholderScreen
                    icon={CalendarIcon}
                    title="Repayment"
                    description="View your repayment schedule and pay EMIs seamlessly."
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/documents"
              element={
                <RequireAuth>
                  <PlaceholderScreen
                    icon={FileTextIcon}
                    title="Documents"
                    description="Upload and manage your documents securely."
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/support"
              element={
                <RequireAuth>
                  <PlaceholderScreen
                    icon={InfoIcon}
                    title="Help & Support"
                    description="Chat and call support are on the way."
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/login"
              element={<AdminLoginScreen />}
            />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminDashboardScreen />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/user/:mobile"
              element={
                <RequireAdmin>
                  <AdminUserDetailScreen />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <RequireAdmin>
                  <AdminSettingsScreen />
                </RequireAdmin>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LoanDraftProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
