import { NavLink } from 'react-router-dom';
import { cx } from '../utils/cx';
import { CalendarIcon, ClipboardListIcon, HomeIcon, UserIcon } from './icons';

const TABS = [
  { to: '/home', label: 'Home', icon: HomeIcon },
  { to: '/loans', label: 'My Loans', icon: ClipboardListIcon },
  { to: '/repayment', label: 'Repayment', icon: CalendarIcon },
  { to: '/profile', label: 'Profile', icon: UserIcon },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map(({ to, label, icon: TabIcon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cx('bottom-nav__item', isActive && 'bottom-nav__item--active')
          }
        >
          <TabIcon size={21} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
