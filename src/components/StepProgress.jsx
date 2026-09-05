import { cx } from '../utils/cx';

export default function StepProgress({ steps, current }) {
  const percent = Math.round(((current + 1) / steps.length) * 100);

  return (
    <div className="step-progress" aria-label={`Step ${current + 1} of ${steps.length}`}>
      <div className="step-progress__top">
        <span className="step-progress__count">
          Step {current + 1} of {steps.length}
        </span>
        <span className="step-progress__pct">{percent}%</span>
      </div>
      <div className="progress">
        <div className="progress__bar" style={{ width: `${percent}%` }} />
      </div>
      <div className="step-progress__labels">
        {steps.map((label, index) => (
          <span
            key={label}
            className={cx(
              'step-progress__label',
              index === current && 'is-current',
              index < current && 'is-done'
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
