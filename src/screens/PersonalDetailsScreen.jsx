import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import GenderSelector from '../components/GenderSelector';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import SearchSelect from '../components/SearchSelect';
import StatusBanner from '../components/StatusBanner';
import TextField from '../components/TextField';
import { CheckIcon, ShieldCheckIcon } from '../components/icons';
import { INDIAN_STATES } from '../data/indianStates';
import { useAuth } from '../context/AuthContext';
import { createUserProfile } from '../services/userService';
import { onlyDigits } from '../utils/format';
import {
  hasErrors,
  validateAddress,
  validateDateOfBirth,
  validateEmail,
  validateFullName,
  validatePersonalDetails,
  validatePinCode,
  validateRequired,
} from '../utils/validation';

const INITIAL_VALUES = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pinCode: '',
};

const FIELD_VALIDATORS = {
  fullName: (values) => validateFullName(values.fullName),
  dateOfBirth: (values) => validateDateOfBirth(values.dateOfBirth),
  gender: (values) => validateRequired(values.gender, 'Gender'),
  email: (values) => validateEmail(values.email),
  address: (values) => validateAddress(values.address),
  city: (values) => validateRequired(values.city, 'City'),
  state: (values) => validateRequired(values.state, 'State'),
  pinCode: (values) => validatePinCode(values.pinCode),
};

function computeSetupProgress(values) {
  const checks = [
    true,
    !validateFullName(values.fullName),
    !validateDateOfBirth(values.dateOfBirth),
    Boolean(values.gender),
    !validateAddress(values.address),
    !validateRequired(values.city, 'City'),
    Boolean(values.state),
    !validatePinCode(values.pinCode),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export default function PersonalDetailsScreen() {
  const navigate = useNavigate();
  const { session, completeSignup } = useAuth();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentErrors = validatePersonalDetails(values);
  const isValid = !hasErrors(currentErrors);
  const progress = computeSetupProgress(values);

  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 18);
  const maxDobIso = maxDob.toISOString().slice(0, 10);

  const setField = (name, value) => {
    const next = { ...values, [name]: value };
    setValues(next);
    setFormError('');
    if (name in errors) {
      setErrors((prev) => {
        const updated = { ...prev };
        const message = FIELD_VALIDATORS[name](next);
        if (message) {
          updated[name] = message;
        } else {
          delete updated[name];
        }
        return updated;
      });
    }
  };

  const handleBlur = (name) => {
    setErrors((prev) => {
      const updated = { ...prev };
      const message = FIELD_VALIDATORS[name](values);
      if (message) {
        updated[name] = message;
      } else {
        delete updated[name];
      }
      return updated;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validatePersonalDetails(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      setFormError('Please fix the highlighted fields to continue.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const user = await createUserProfile({
        mobile: session.mobile,
        fullName: values.fullName.trim(),
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        email: values.email.trim() || null,
        address: values.address.trim(),
        city: values.city.trim(),
        state: values.state,
        pinCode: values.pinCode,
      });
      completeSignup(user);
      navigate('/profile-created', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Could not create your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen width="wide">
      <ScreenHeader onBack={() => navigate('/otp')} backLabel="Back to verification" />
      <div className="details">
        <h1 className="screen-title">Personal Details</h1>
        <p className="screen-subtitle">Tell us a little about yourself</p>

        <div className="profile-progress">
          <div className="profile-progress__head">
            <span className="profile-progress__label">Profile setup</span>
            <span className="profile-progress__pct">{progress}% complete</span>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile setup progress"
          >
            <div className="progress__bar" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {formError && <StatusBanner type="error">{formError}</StatusBanner>}

        <form className="details__form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Full Name"
            placeholder="Enter first and last name"
            autoComplete="name"
            value={values.fullName}
            onChange={(event) => setField('fullName', event.target.value)}
            onBlur={() => handleBlur('fullName')}
            error={errors.fullName}
            required
          />

          <div className="verified-mobile" aria-label="Verified mobile number">
            <span className="verified-mobile__icon">
              <ShieldCheckIcon size={18} />
            </span>
            <span className="verified-mobile__info">
              <span className="verified-mobile__label">Mobile Number</span>
              <span className="verified-mobile__number">+91 {session.mobile}</span>
            </span>
            <span className="badge badge--verified">
              <CheckIcon size={11} /> Verified
            </span>
          </div>

          <div className="form-grid">
            <TextField
              label="Date of Birth"
              type="date"
              max={maxDobIso}
              value={values.dateOfBirth}
              onChange={(event) => setField('dateOfBirth', event.target.value)}
              onBlur={() => handleBlur('dateOfBirth')}
              error={errors.dateOfBirth}
              required
            />
            <TextField
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={values.email}
              onChange={(event) => setField('email', event.target.value)}
              onBlur={() => handleBlur('email')}
              error={errors.email}
            />
          </div>

          <GenderSelector
            value={values.gender}
            onChange={(gender) => setField('gender', gender)}
            error={errors.gender}
            disabled={submitting}
          />

          <TextField
            label="Address"
            placeholder="House no, street, landmark"
            multiline
            rows={2}
            value={values.address}
            onChange={(event) => setField('address', event.target.value)}
            onBlur={() => handleBlur('address')}
            error={errors.address}
            required
          />

          <div className="form-grid">
            <TextField
              label="City"
              placeholder="Enter your city"
              value={values.city}
              onChange={(event) => setField('city', event.target.value)}
              onBlur={() => handleBlur('city')}
              error={errors.city}
              required
            />
            <SearchSelect
              label="State"
              placeholder="Search state"
              options={INDIAN_STATES}
              value={values.state}
              onChange={(state) => setField('state', state)}
              error={errors.state}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-grid">
            <TextField
              label="PIN Code"
              placeholder="6-digit PIN"
              inputMode="numeric"
              maxLength={6}
              value={values.pinCode}
              onChange={(event) => setField('pinCode', onlyDigits(event.target.value, 6))}
              onBlur={() => handleBlur('pinCode')}
              error={errors.pinCode}
              required
            />
          </div>

          <div className="details__submit">
            <Button
              type="submit"
              block
              loading={submitting}
              loadingText="Creating your profile…"
              disabled={!isValid}
            >
              Create Profile
            </Button>
            <p className="legal-text legal-text--center">
              Your information is encrypted and used only for your loan profile.
            </p>
          </div>
        </form>
      </div>
    </Screen>
  );
}
