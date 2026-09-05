import { useNavigate } from 'react-router-dom';
import { cx } from '../utils/cx';
import { ArrowLeftIcon } from './icons';

export default function ScreenHeader({ title, onBack, backLabel = 'Go back', right = null }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={cx('screen-header', !title && 'screen-header--bare')}>
      <button type="button" className="icon-btn" onClick={handleBack} aria-label={backLabel}>
        <ArrowLeftIcon size={20} />
      </button>
      {title && <h2 className="screen-header__title">{title}</h2>}
      {right ? <div className="screen-header__right">{right}</div> : <span className="screen-header__spacer" />}
    </header>
  );
}
