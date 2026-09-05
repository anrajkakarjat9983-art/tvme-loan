import { cx } from '../utils/cx';
import { CheckIcon } from './icons';

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function GenderSelector({ value, onChange, error, disabled = false, name = 'gender' }) {
  return (
    <div className={cx('field', error && 'field--error')}>
      <span className="field__label" id={`${name}-label`}>
        Gender<span className="field__required-mark"> *</span>
      </span>
      <div className="chip-group" role="radiogroup" aria-labelledby={`${name}-label`}>
        {GENDER_OPTIONS.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              className={cx('chip', selected && 'chip--selected')}
              onClick={() => onChange(option)}
            >
              {selected && <CheckIcon size={14} />}
              <span>{option}</span>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="field__message field__message--error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
