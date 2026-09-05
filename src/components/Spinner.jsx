import { cx } from '../utils/cx';

export default function Spinner({ size = 18, light = false, className }) {
  return (
    <span
      className={cx('spinner', light && 'spinner--light', className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
