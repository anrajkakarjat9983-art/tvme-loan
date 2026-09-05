import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Logo from '../components/Logo';
import ScreenHeader from '../components/ScreenHeader';
import Screen from '../components/Screen';
import StatusBanner from '../components/StatusBanner';
import TextField from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { onlyDigits } from '../utils/format';
import { MOBILE_REGEX, validateMobile } from '../utils/validation';
import * as authService from '../services/authService';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { startLogin } = useAuth();
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [checking, setChecking] = useState(false);

  const digits = onlyDigits(mobile, 10);
  const isValid = MOBILE_REGEX.test(digits);

  const handleMobileChange = (event) => {
    const next = onlyDigits(event.target.value, 10);
    setMobile(next);
    setFormError('');
    if (error) setError(validateMobile(next));
  };

  const handleMobileBlur = () => {
    if (digits) setError(validateMobile(digits));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (checking) return;
    const validationError = validateMobile(digits);
    if (validationError) {
      setError(validationError);
      return;
    }
    setChecking(true);
    setFormError('');
    try {
      const { exists } = await authService.checkUserExists(digits);
      startLogin(digits, !exists);
      navigate('/otp');
    } catch {
      setFormError('Could not verify your number. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader onBack={() => navigate('/')} backLabel="Back to welcome" />
      <div className="auth">
        <div className="auth__brand">
          <Logo size={56} />
        </div>
        <h1 className="screen-title">Welcome Back</h1>
        <p className="screen-subtitle">Enter your mobile number to continue</p>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Mobile Number"
            prefix="+91"
            placeholder="98765 43210"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            value={digits}
            onChange={handleMobileChange}
            onBlur={handleMobileBlur}
            error={error}
            hint="We will send a 6-digit verification code to this number."
            required
          />

          {formError && <StatusBanner type="error">{formError}</StatusBanner>}

          <Button
            type="submit"
            block
            loading={checking}
            loadingText="Checking number…"
            disabled={!isValid}
          >
            Continue
          </Button>
        </form>
      </div>
    </Screen>
  );
}
