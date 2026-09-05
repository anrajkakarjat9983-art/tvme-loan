import { useNavigate } from 'react-router-dom';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';

export default function PlaceholderScreen({ icon: Icon, title, description }) {
  const navigate = useNavigate();

  return (
    <Screen width="wide" withNav>
      <ScreenHeader onBack={() => navigate('/home')} backLabel="Back to home" />
      <div className="placeholder">
        <span className="placeholder__icon">
          <Icon size={26} />
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
        <span className="badge badge--soon">Coming in the next phase</span>
      </div>
    </Screen>
  );
}
