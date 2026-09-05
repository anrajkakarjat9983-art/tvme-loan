import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { loginAdmin } from '../../services/adminService';

export default function AdminLoginScreen() {
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (loginAdmin(passcode)) {
      navigate('/admin', { replace: true });
    } else {
      setError('Incorrect passcode. Please try again.');
    }
  };

  return (
    <Screen>
      <div className="auth">
        <div className="auth__brand">
          <Logo size={56} />
        </div>
        <h1 className="screen-title">Admin Panel</h1>
        <p className="screen-subtitle">Enter the admin passcode to manage users, KYC and loans.</p>
        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Passcode"
            type="password"
            placeholder="Enter admin passcode"
            value={passcode}
            onChange={(event) => {
              setPasscode(event.target.value);
              if (error) setError('');
            }}
            error={error}
            required
          />
          <Button type="submit" block>
            Enter Admin Panel
          </Button>
        </form>
        <button
          type="button"
          className="link-btn link-btn--muted"
          onClick={() => navigate('/')}
          style={{ alignSelf: 'center', marginTop: 14 }}
        >
          Back to App
        </button>
      </div>
    </Screen>
  );
}
