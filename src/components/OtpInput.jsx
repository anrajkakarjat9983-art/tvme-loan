import { useEffect, useRef } from 'react';
import { cx } from '../utils/cx';

export default function OtpInput({
  value,
  onChange,
  length = 6,
  error = false,
  disabled = false,
  autoFocus = true,
}) {
  const inputsRef = useRef([]);
  const chars = Array.from({ length }, (_, index) => value[index] ?? '');

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const focusAt = (index) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    const element = inputsRef.current[clamped];
    if (element) {
      element.focus();
      element.select();
    }
  };

  const commit = (nextChars, focusIndex) => {
    onChange(nextChars.join(''));
    focusAt(focusIndex);
  };

  const handleChange = (index, rawValue) => {
    const digits = rawValue.replace(/\D/g, '');
    if (!digits) {
      const next = [...chars];
      next[index] = '';
      onChange(next.join(''));
      return;
    }
    const next = [...chars];
    for (let offset = 0; offset < digits.length && index + offset < length; offset += 1) {
      next[index + offset] = digits[offset];
    }
    commit(next, index + digits.length);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = [...chars];
      if (next[index]) {
        next[index] = '';
        onChange(next.join(''));
      } else if (index > 0) {
        next[index - 1] = '';
        onChange(next.join(''));
        focusAt(index - 1);
      }
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusAt(index - 1);
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text');
    const digits = text.replace(/\D/g, '').slice(0, length);
    if (!digits) return;
    const next = Array.from({ length }, (_, index) => digits[index] ?? '');
    onChange(next.join(''));
    focusAt(Math.min(digits.length, length - 1));
  };

  return (
    <div className={cx('otp', error && 'otp--error')} onPaste={handlePaste}>
      {chars.map((char, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          className="otp__box"
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={char}
          disabled={disabled}
          aria-label={`OTP digit ${index + 1}`}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
}
