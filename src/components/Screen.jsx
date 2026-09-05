import BottomNav from './BottomNav';
import { cx } from '../utils/cx';

export default function Screen({ width = 'narrow', withNav = false, className, children }) {
  return (
    <main className={cx('app-viewport', withNav && 'app-viewport--nav')}>
      <div className={cx('app-shell', `app-shell--${width}`, withNav && 'app-shell--nav', 'screen-enter', className)}>
        {children}
      </div>
      <p className="app-footer-note">
        TVME Loan &middot; Secure &amp; trusted
      </p>
      {withNav && <BottomNav />}
    </main>
  );
}
