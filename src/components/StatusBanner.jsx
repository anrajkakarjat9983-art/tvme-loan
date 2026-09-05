import { cx } from '../utils/cx';
import { AlertIcon, CheckCircleIcon, InfoIcon } from './icons';

const ICONS = {
  info: InfoIcon,
  success: CheckCircleIcon,
  error: AlertIcon,
};

export default function StatusBanner({ type = 'info', children, className }) {
  const IconComponent = ICONS[type] || InfoIcon;
  return (
    <div className={cx('banner', `banner--${type}`, className)} role={type === 'error' ? 'alert' : 'status'}>
      <IconComponent size={17} className="banner__icon" />
      <span>{children}</span>
    </div>
  );
}
