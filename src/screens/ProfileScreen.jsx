import { useNavigate } from 'react-router-dom';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import {
  BankIcon,
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  InfoIcon,
  LogOutIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UserIcon,
} from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { computeProfileCompletion } from '../services/userService';
import { getKyc, KYC_BADGES } from '../services/kycService';
import { formatDate, initialsOf, maskMobile } from '../utils/format';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const user = session.user;
  const completion = computeProfileCompletion(user);
  const kyc = getKyc(user);
  const kycBadge = KYC_BADGES[kyc.status];

  const detailRows = [
    { label: 'Date of Birth', value: formatDate(user.dateOfBirth) },
    { label: 'Gender', value: user.gender },
    { label: 'Email Address', value: user.email ?? 'Not added' },
    { label: 'Address', value: user.address },
    { label: 'City', value: user.city },
    { label: 'State', value: user.state },
    { label: 'PIN Code', value: user.pinCode },
  ];

  const links = [
    { icon: UserIcon, label: 'Personal Details', to: '/account/personal-details' },
    {
      icon: ShieldCheckIcon,
      label: 'KYC & Documents',
      to: '/kyc',
      badge: kycBadge,
    },
    { icon: BankIcon, label: 'Bank Details', to: '/bank-details' },
    { icon: ClipboardListIcon, label: 'Loan History', to: '/loan-history' },
    { icon: CalendarIcon, label: 'Payment History', to: '/payment-history' },
    { icon: InfoIcon, label: 'Help & Support', to: '/support' },
    { icon: SettingsIcon, label: 'Settings', to: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <Screen width="wide" withNav>
      <ScreenHeader onBack={() => navigate('/home')} backLabel="Back to home" />

      <div className="profile-hero">
        <span className="avatar avatar--lg">{initialsOf(user.fullName)}</span>
        <h1>{user.fullName}</h1>
        <p className="profile-hero__mobile">
          +91 {user.mobile}
          <span className="badge badge--verified">
            <CheckIcon size={10} /> Verified
          </span>
        </p>
      </div>

      <div className="home-card home-card--progress">
        <div className="home-card__head">
          <h2>Profile completion</h2>
          <span className="home-card__pct">{completion}%</span>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-valuenow={completion}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Profile completion"
        >
          <div className="progress__bar" style={{ width: `${completion}%` }} />
        </div>
      </div>

      <div className="home-card details-list">
        {detailRows.map((row) => (
          <div key={row.label} className="details-list__row">
            <span className="details-list__label">{row.label}</span>
            <span className="details-list__value">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="profile-links">
        {links.map(({ icon: LinkIcon, label, to, badge }) => (
          <button key={to} type="button" className="profile-link" onClick={() => navigate(to)}>
            <span className="profile-link__icon">
              <LinkIcon size={18} />
            </span>
            <span>{label}</span>
            {badge && <span className={`status-chip ${badge.chipClass}`}>{badge.label}</span>}
            <ChevronRightIcon size={17} className="profile-link__chevron" />
          </button>
        ))}
        <button type="button" className="profile-link profile-link--danger" onClick={handleLogout}>
          <span className="profile-link__icon profile-link__icon--danger">
            <LogOutIcon size={18} />
          </span>
          <span>Log out</span>
        </button>
      </div>

    </Screen>
  );
}
