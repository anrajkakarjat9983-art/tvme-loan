import { cx } from '../utils/cx';

export default function Logo({ size = 88, className, elevated = false }) {
  return (
    <img
      src="/logo.png"
      alt="TVME Loan"
      width={size}
      height={size}
      draggable="false"
      className={cx('logo', elevated && 'logo--elevated', className)}
      style={{ width: size, height: size }}
    />
  );
}

export function BrandWordmark({ compact = false }) {
  return (
    <span className={cx('brand-wordmark', compact && 'brand-wordmark--compact')}>
      <span className="brand-wordmark__name">TVME</span>
      <span className="brand-wordmark__pill">LOAN</span>
    </span>
  );
}
