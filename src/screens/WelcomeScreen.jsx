import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Logo, { BrandWordmark } from '../components/Logo';
import Screen from '../components/Screen';
import { BoltIcon, ShieldCheckIcon, SparkleIcon } from '../components/icons';

const FEATURES = [
  { icon: BoltIcon, title: 'Quick approvals', text: 'Decisions in minutes, not days.' },
  { icon: SparkleIcon, title: 'Transparent terms', text: 'No hidden charges. Ever.' },
  { icon: ShieldCheckIcon, title: 'Secure by design', text: 'Bank-grade data protection.' },
];

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <Screen width="wide">
      <div className="welcome">
        <div className="welcome__hero">
          <Logo size={108} elevated />
          <h1 className="welcome__brand">
            <BrandWordmark />
          </h1>
          <p className="welcome__tagline">Simple. Fast. Secure.</p>
          <p className="welcome__sub">
            Your trusted partner for quick personal loans — right from your phone.
          </p>
        </div>

        <ul className="feature-list">
          {FEATURES.map(({ icon: FeatureIcon, title, text }) => (
            <li key={title} className="feature-list__item">
              <span className="feature-list__icon">
                <FeatureIcon size={19} />
              </span>
              <span className="feature-list__copy">
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
            </li>
          ))}
        </ul>

        <div className="welcome__actions">
          <Button block onClick={() => navigate('/login')}>
            Get Started
          </Button>
          <p className="legal-text">
            By continuing, you agree to our <a href="#terms">Terms of Use</a> and{' '}
            <a href="#privacy">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </Screen>
  );
}
