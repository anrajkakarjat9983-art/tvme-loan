import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cx } from '../utils/cx';
import { CheckIcon, ChevronDownIcon } from './icons';

export default function SearchSelect({
  label,
  hint,
  error,
  options = [],
  value,
  onChange,
  placeholder = 'Search…',
  searchPlaceholder = 'Type to search…',
  emptyText = 'No matches found',
  disabled = false,
  required = false,
  id,
}) {
  const generatedId = useId();
  const triggerId = id || generatedId;
  const errorId = `${triggerId}-error`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(Math.max(0, options.indexOf(value)));
      searchRef.current?.focus();
    }
  }, [open, options, value]);

  useEffect(() => {
    const active = listRef.current?.querySelector('.is-active');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const select = (option) => {
    onChange(option);
    setOpen(false);
  };

  const handleTriggerKeyDown = (event) => {
    if (disabled) return;
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) select(option);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div
      className={cx('field', 'search-select', error && 'field--error')}
      ref={rootRef}
    >
      {label && (
        <span className="field__label" id={`${triggerId}-label`}>
          {label}
          {!required && <span className="field__optional"> (optional)</span>}
        </span>
      )}
      <button
        type="button"
        id={triggerId}
        className={cx(
          'search-select__trigger',
          !value && 'is-placeholder',
          open && 'is-open'
        )}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${triggerId}-label ${triggerId}`}
      >
        <span>{value || placeholder}</span>
        <ChevronDownIcon size={18} className="field__chevron" />
      </button>

      {open && (
        <div className="search-select__panel">
          <div className="search-select__search">
            <input
              ref={searchRef}
              type="text"
              value={query}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <ul
            className="search-select__list"
            role="listbox"
            aria-labelledby={`${triggerId}-label`}
            ref={listRef}
          >
            {filtered.length === 0 && (
              <li className="search-select__empty">{emptyText}</li>
            )}
            {filtered.map((option, index) => (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option === value}
                  className={cx(
                    'search-select__option',
                    index === activeIndex && 'is-active',
                    option === value && 'is-selected'
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => select(option)}
                >
                  <span>{option}</span>
                  {option === value && <CheckIcon size={15} />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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
