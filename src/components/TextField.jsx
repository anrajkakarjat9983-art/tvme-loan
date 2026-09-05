import { useId } from 'react';
import { cx } from '../utils/cx';

export default function TextField({
  label,
  hint,
  error,
  prefix,
  suffix,
  multiline = false,
  className,
  id,
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  const InputTag = multiline ? 'textarea' : 'input';

  return (
    <div className={cx('field', error && 'field--error', className)}>
      {label && (
        <label className="field__label" htmlFor={inputId}>
          {label}
          {!rest.required && <span className="field__optional"> (optional)</span>}
        </label>
      )}
      <div className="field__control">
        {prefix && <span className="field__prefix">{prefix}</span>}
        <InputTag
          id={inputId}
          className={cx('field__input', multiline && 'field__input--area')}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {suffix}
      </div>
      {error ? (
        <p className="field__message field__message--error" id={errorId} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field__message field__message--hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
