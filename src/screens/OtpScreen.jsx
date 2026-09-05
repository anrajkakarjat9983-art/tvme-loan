import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import OtpInput from '../components/OtpInput';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import StatusBanner from '../components/StatusBanner';
import { useAuth } from '../context/AuthContext';
import { env } from '../config/env';
import * as authService from '../services/authService';
import { fetchUserByMobile } from '../services/userService';
import { formatCountdown, maskMobile } from '../utils/format';
import { OTP_LENGTH, validateOtp } from '../utils/validation';

export default function OtpScreen() {
  const navigate = useNavigate();
  const { session, markOtpVerified, loginExistingUser } = useAuth();
  const mobile = session.mobile;

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(env.otpResendSeconds);
  const [banner, setBanner] = useState(null);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    let active = true;
    authService.sendOtp(mobile).catch(() => {
      if (active) {
        setBanner({ type: 'error', message: 'Could not send the OTP. Tap Resend to try again.' });
      }
    });
    return () => {
      active = false;
    };
  }, [mobile]);

  useEffect(() => {
    if (secondsLeft === 0) return undefined;
    const timerId = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timerId);
  }, [secondsLeft]);

  const otpDigits = otp.replace(/\s/g, '');
  const isComplete = otpDigits.length === OTP_LENGTH;

  const handleVerify = async (event) => {
    event.preventDefault();
    if (verifying) return;
    const validationError = validateOtp(otpDigits, OTP_LENGTH);
    if (validationError) {
      setOtpError(validationError);
      setShakeKey((key) => key + 1);
      return;
    }
    setVerifying(true);
    setOtpError('');
    try {
      await authService.verifyOtp(mobile, otpDigits);
      markOtpVerified();
      if (session.isNewUser) {
        navigate('/personal-details', { replace: true });
        return;
      }
      const user = await fetchUserByMobile(mobile);
      if (user) {
        loginExistingUser(user);
        navigate('/home', { replace: true });
      } else {
        navigate('/personal-details', { replace: true });
      }
    } catch (err) {
      setOtpError(err.message || 'Verification failed. Please try again.');
      setShakeKey((key) => key + 1);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return;
    setResending(true);
    try {
      await authService.sendOtp(mobile);
      setOtp('');
      setOtpError('');
      setSecondsLeft(env.otpResendSeconds);
      setBanner({ type: 'success', message: 'A new OTP has been sent to your mobile number.' });
    } catch {
      setBanner({ type: 'error', message: 'Could not resend the OTP. Please try again.' });
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        setOtp(env.otp);
        setOtpError('');
      }
    }, 3000);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const handleAutofill = () => {
    setOtp(env.otp);
    setOtpError('');
  };

  const handleChangeNumber = () => {
    navigate('/login', { replace: true });
  };

  return (
    <Screen>
      <ScreenHeader onBack={handleChangeNumber} backLabel="Change mobile number" />
      <div className="otp-screen">
        <h1 className="screen-title">Verify your mobile number</h1>
        <p className="screen-subtitle">
          Enter the 6-digit code sent to <strong>{maskMobile(mobile)}</strong>
        </p>

        {banner && <StatusBanner type={banner.type}>{banner.message}</StatusBanner>}

        <form className="otp-screen__form" onSubmit={handleVerify} noValidate>
          <div key={shakeKey} className={otpError ? 'shake' : undefined}>
            <OtpInput
              value={otp}
              onChange={(next) => {
                setOtp(next);
                if (otpError) setOtpError('');
              }}
              length={OTP_LENGTH}
              error={Boolean(otpError)}
              disabled={verifying}
            />
          </div>

          {otpError && (
            <p className="field__message field__message--error otp-screen__error" role="alert">
              {otpError}
            </p>
          )}

          <Button
            type="submit"
            block
            loading={verifying}
            loadingText="Verifying…"
            disabled={!isComplete}
          >
            Verify OTP
          </Button>
        </form>

        <div className="otp-screen__resend">
          {secondsLeft > 0 ? (
            <p className="otp-screen__timer">
              Resend OTP in <strong>{formatCountdown(secondsLeft)}</strong>
            </p>
          ) : (
            <button
              type="button"
              className="link-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? 'Resending…' : 'Resend OTP'}
            </button>
          )}
          <button type="button" className="link-btn link-btn--muted" onClick={handleChangeNumber}>
            Change mobile number
          </button>
        </div>

        <div className="otp-screen__autofill">
          <button type="button" className="link-btn" onClick={handleAutofill} disabled={verifying}>
            Auto-fill OTP
          </button>
        </div>
      </div>
    </Screen>
  );
}
