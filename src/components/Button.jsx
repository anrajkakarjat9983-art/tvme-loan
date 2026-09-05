import { cx } from '../utils/cx';
import Spinner from './Spinner';

export default function Button({
  variant = 'primary',
  size = 'lg',
  block = false,
  loading = false,
  loadingText,
  disabled = false,
  type = 'button',
  className,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={cx(
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        block && 'btn--block',
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size={16} light={variant === 'primary'} />}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
}
