import { useId } from 'react';
import { cx } from '../utils/cx';
import { ChevronDownIcon } from './icons';

export default function SelectField({
  label,
  hint,
  error,
  options = [],
  placeholder = 'Select',
  className,
  id,
  children,
  ...rest
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = `${selectId}-error`;
  const describedBy = error ? errorId : undefined;

  return (
    <div className={cx('field', error && 'field--error', className)}>
      {label && (
        <label className="field__label" htmlFor={selectId}>
          {label}
          {!rest.required && <span className="field__optional"> (optional)</span>}
        </label>
      )}
      <div className="field__control field__control--select">
        <select
          id={selectId}
          className={cx('field__input field__input--select', !rest.value && 'is-placeholder')}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon size={18} className="field__chevron" />
      </div>
      {error ? (
        <p className="field__message field__message--error" id={errorId} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field__message field__message--hint">{hint}</p>
      ) : null}
    </div>
  );
}
