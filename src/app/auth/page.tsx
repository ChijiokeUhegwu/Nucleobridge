'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authHref, isAuthView, type AuthView } from '@/lib/auth-routes';
import styles from '@/styles/auth-forms.module.css';

type LoginMode = 'password' | 'otp';
type OtpStep = 'request' | 'verify';
type SignupField = 'firstName' | 'lastName' | 'email' | 'password';
type SignupErrors = Partial<Record<SignupField | 'terms', string>>;
type LoginField = 'email' | 'password' | 'otpCode';
type LoginErrors = Partial<Record<LoginField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_EMAIL_MESSAGE = 'This detail is missing. Please add your email address.';
const EMPTY_PASSWORD_MESSAGE = 'This detail is missing. Please enter your password.';
const EMAIL_FORMAT_MESSAGE = 'Enter an email address like name@domain.com.';
const PASSWORD_MIN_MESSAGE = 'Your password needs at least 8 characters.';
const PASSWORD_NUMBER_MESSAGE = 'Your password needs at least one number.';
const PASSWORD_SPECIAL_MESSAGE =
  'Your password needs at least one special character (for example, @ or #).';
const OTP_CODE_MESSAGE = 'Enter the security code from your email.';
const TERMS_MESSAGE = 'Please accept the Terms and Privacy Policy to continue.';
const TERMS_CLICK_MESSAGE = 'Please accept the Terms and Conditions to continue.';

function isBlank(value: string) {
  return value.trim().length === 0;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function trimPassword(value: string) {
  return value.trim();
}

function validateName(value: string, label: string) {
  if (isBlank(value)) {
    return `This detail is missing. Please add your ${label.toLowerCase()}.`;
  }
  if (value.trim().length < 2) {
    return `${label} needs at least 2 characters.`;
  }
  return undefined;
}

function validateEmail(value: string) {
  const normalizedEmail = normalizeEmail(value);
  if (!normalizedEmail) {
    return EMPTY_EMAIL_MESSAGE;
  }
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return EMAIL_FORMAT_MESSAGE;
  }
  return undefined;
}

function validateLoginPassword(value: string) {
  const trimmedPassword = trimPassword(value);
  if (!trimmedPassword) {
    return EMPTY_PASSWORD_MESSAGE;
  }
  if (trimmedPassword.length < 8) {
    return PASSWORD_MIN_MESSAGE;
  }
  return undefined;
}

function validateSignupPassword(value: string) {
  const trimmedPassword = trimPassword(value);
  if (!trimmedPassword) {
    return EMPTY_PASSWORD_MESSAGE;
  }
  if (trimmedPassword.length < 8) {
    return PASSWORD_MIN_MESSAGE;
  }
  if (!/\d/.test(trimmedPassword)) {
    return PASSWORD_NUMBER_MESSAGE;
  }
  if (!/[^A-Za-z0-9\s]/.test(trimmedPassword)) {
    return PASSWORD_SPECIAL_MESSAGE;
  }
  return undefined;
}

function validateSignupField(field: SignupField, value: string) {
  switch (field) {
    case 'firstName':
      return validateName(value, 'First name');
    case 'lastName':
      return validateName(value, 'Last name');
    case 'email':
      return validateEmail(value);
    case 'password':
      return validateSignupPassword(value);
  }
}

function getSignupEmailChangeError(value: string, touched: boolean) {
  const normalizedEmail = normalizeEmail(value);
  if (!normalizedEmail) {
    return touched ? EMPTY_EMAIL_MESSAGE : undefined;
  }
  return EMAIL_PATTERN.test(normalizedEmail) ? undefined : EMAIL_FORMAT_MESSAGE;
}

function CautionIcon({ className = styles.fieldErrorIcon }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function InlineError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className={`text-body-small ${styles.fieldError}`} role="alert">
      <CautionIcon />
      <span>{message}</span>
    </p>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className={styles.errorAlert} role="alert">
      <CautionIcon className={styles.alertErrorIcon} />
      <span>{message}</span>
    </div>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.pageContainer}>
      <Link href="/" className={styles.brandHeader}>
        <div className={styles.brandIcon} aria-hidden="true">
          NB
        </div>
        <span className={`text-title-large ${styles.brandTitle}`}>NucleoBridge</span>
      </Link>

      <div className={styles.card}>{children}</div>
    </div>
  );
}

function AuthLoading() {
  return (
    <AuthShell>
      <h1 className={`text-headline-small ${styles.cardTitle}`}>Loading...</h1>
      <p className={`text-body-medium ${styles.cardSubtitle}`}>
        Preparing your sign-in options.
      </p>
    </AuthShell>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {hidden ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          <path d="M1 1l22 22" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function RequirementIcon({ met }: { met: boolean }) {
  if (met) {
    return (
      <svg
        className={styles.requirementIconMet}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    );
  }

  return (
    <svg
      className={styles.requirementIconUnmet}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function LoginView() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpStep, setOtpStep] = useState<OtpStep>('request');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>({});

  function handleModeChange(mode: LoginMode) {
    setAuthMode(mode);
    setError(null);
    setSuccess(null);
    setShowPassword(false);
    setOtpStep('request');
    setOtpCode('');
    setFieldErrors({});
    setTouched({});
  }

  function handleLoginEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
    setError(null);
    setFieldErrors((prev) => ({ ...prev, email: undefined }));
  }

  function handleLoginEmailBlur(event: React.FocusEvent<HTMLInputElement>) {
    const normalizedEmail = normalizeEmail(event.target.value);
    setEmail(normalizedEmail);
    setTouched((prev) => ({ ...prev, email: true }));
    setFieldErrors((prev) => {
      if (!normalizedEmail) {
        return { ...prev, email: EMPTY_EMAIL_MESSAGE };
      }
      if (prev.email === EMPTY_EMAIL_MESSAGE) {
        return { ...prev, email: undefined };
      }
      return prev;
    });
  }

  function handleLoginPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setPassword(value);
    setError(null);
    setFieldErrors((prev) => ({
      ...prev,
      password: touched.password ? validateLoginPassword(value) : undefined,
    }));
  }

  function handleLoginPasswordBlur(event: React.FocusEvent<HTMLInputElement>) {
    const trimmedPassword = trimPassword(event.target.value);
    setPassword(trimmedPassword);
    setTouched((prev) => ({ ...prev, password: true }));
    setFieldErrors((prev) => ({
      ...prev,
      password: validateLoginPassword(trimmedPassword),
    }));
  }

  function handleOtpCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = event.target.value.replace(/\D/g, '');
    setOtpCode(digitsOnly);
    setError(null);
    setFieldErrors((prev) => ({ ...prev, otpCode: undefined }));
  }

  function handleOtpCodeBlur(event: React.FocusEvent<HTMLInputElement>) {
    setTouched((prev) => ({ ...prev, otpCode: true }));
    setFieldErrors((prev) => ({
      ...prev,
      otpCode: isBlank(event.target.value) ? OTP_CODE_MESSAGE : undefined,
    }));
  }

  async function handlePasswordLogin(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const normalizedEmail = normalizeEmail(email);
    const trimmedPassword = trimPassword(password);
    const nextErrors: LoginErrors = {
      email: validateEmail(normalizedEmail),
      password: validateLoginPassword(trimmedPassword),
    };
    setEmail(normalizedEmail);
    setPassword(trimmedPassword);
    setFieldErrors(nextErrors);
    setTouched({ email: true, password: true });

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: trimmedPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in.');
      }

      setSuccess('Signed in successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpRequest(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const normalizedEmail = normalizeEmail(email);
    const emailError = validateEmail(normalizedEmail);
    setEmail(normalizedEmail);
    setFieldErrors((prev) => ({ ...prev, email: emailError }));
    setTouched((prev) => ({ ...prev, email: true }));

    if (emailError) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send one-time code.');
      }

      setSuccess(data.message || 'Verification code sent to your email.');
      setFieldErrors({});
      setOtpStep('verify');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpVerify(event: React.FormEvent) {
    event.preventDefault();
    if (loading) {
      return;
    }
    setError(null);
    setSuccess(null);

    const codeError = otpCode.length !== 6 ? OTP_CODE_MESSAGE : undefined;
    setFieldErrors((prev) => ({ ...prev, otpCode: codeError }));
    setTouched((prev) => ({ ...prev, otpCode: true }));

    if (codeError) {
      return;
    }

    setLoading(true);

    try {
      const code = Number(otpCode);
      const normalizedEmail = normalizeEmail(email);

      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Incorrect or expired code.');
      }

      setSuccess('Code verified! Signed in successfully.');
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className={`text-headline-small ${styles.cardTitle}`}>Welcome Back</h1>
      <p className={`text-body-medium ${styles.cardSubtitle}`}>
        Sign in to access your saved progress and interactive bioinformatics steps.
      </p>

      <div className={styles.tabGroup} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={authMode === 'password'}
          onClick={() => handleModeChange('password')}
          className={`${styles.tabButton} ${authMode === 'password' ? styles.tabButtonActive : ''}`}
        >
          Password Sign In
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={authMode === 'otp'}
          onClick={() => handleModeChange('otp')}
          className={`${styles.tabButton} ${authMode === 'otp' ? styles.tabButtonActive : ''}`}
        >
          Email Code
        </button>
      </div>

      {error && <ErrorAlert message={error} />}
      {success && <div className={styles.successAlert}>{success}</div>}

      {authMode === 'password' && (
        <form onSubmit={handlePasswordLogin} className={styles.form} noValidate>
          <div className={styles.fieldGroup}>
            <label htmlFor="loginEmail" className={`text-label-medium ${styles.label}`}>
              Email Address
            </label>
            <input
              id="loginEmail"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={handleLoginEmailChange}
              onBlur={handleLoginEmailBlur}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              placeholder="learner@example.com"
              className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
            />
            <InlineError id="login-email-error" message={fieldErrors.email} />
          </div>

          <div className={styles.fieldGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="loginPassword" className={`text-label-medium ${styles.label}`}>
                Password
              </label>
              <Link href={authHref('forgot-password')} className={`text-label-small ${styles.textLink}`}>
                Forgot password?
              </Link>
            </div>
            <div className={styles.passwordField}>
              <input
                id="loginPassword"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={handleLoginPasswordChange}
                onBlur={handleLoginPasswordBlur}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                placeholder="Your password"
                className={`${styles.input} ${styles.passwordInput} ${
                  fieldErrors.password ? styles.inputError : ''
                }`}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                <EyeIcon hidden={showPassword} />
              </button>
            </div>
            <InlineError id="login-password-error" message={fieldErrors.password} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`text-label-large ${styles.submitButton}`}
          >
            {loading ? 'Signing In...' : 'Sign In with Password'}
          </button>
        </form>
      )}

      {authMode === 'otp' && (
        <div>
          {otpStep === 'request' ? (
            <form onSubmit={handleOtpRequest} className={styles.form} noValidate>
              <div className={styles.fieldGroup}>
                <label htmlFor="otpEmail" className={`text-label-medium ${styles.label}`}>
                  Email Address
                </label>
                <input
                  id="otpEmail"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={handleLoginEmailChange}
                  onBlur={handleLoginEmailBlur}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'otp-email-error' : undefined}
                  placeholder="learner@example.com"
                  className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                />
                <InlineError id="otp-email-error" message={fieldErrors.email} />
              </div>

              <p className={`text-body-small ${styles.subtleText}`}>
                A security code will be sent to your email. No password needed.
              </p>

              <button
                type="submit"
                disabled={loading}
                className={`text-label-large ${styles.submitButton}`}
              >
                {loading ? 'Dispatching Code...' : 'Send Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpVerify} className={styles.form} noValidate>
              <div className={styles.fieldGroup}>
                <label htmlFor="otpCode" className={`text-label-medium ${styles.label}`}>
                  Enter Code
                </label>
                <input
                  id="otpCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  value={otpCode}
                  onChange={handleOtpCodeChange}
                  onBlur={handleOtpCodeBlur}
                  aria-invalid={Boolean(fieldErrors.otpCode)}
                  aria-describedby={fieldErrors.otpCode ? 'otp-code-error' : undefined}
                  className={`${styles.input} ${styles.inputOtp} ${
                    fieldErrors.otpCode ? styles.inputError : ''
                  }`}
                />
                <InlineError id="otp-code-error" message={fieldErrors.otpCode} />
              </div>

              <p className={`text-body-small ${styles.subtleText}`}>
                A security code has been sent to your email. Enter it below.
              </p>

              <button
                type="submit"
                aria-disabled={loading || otpCode.length !== 6}
                className={`text-label-large ${styles.submitButton}`}
              >
                {loading ? 'Verifying Code...' : 'Verify & Sign In'}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setOtpStep('request');
                  setOtpCode('');
                  setError(null);
                  setFieldErrors((prev) => ({ ...prev, otpCode: undefined }));
                }}
                className={`text-label-medium ${styles.secondaryButton}`}
              >
                Request a Different Code
              </button>
            </form>
          )}
        </div>
      )}

      <div className={styles.footerLinks}>
        <p className={`text-body-small ${styles.subtleText}`}>
          Don&apos;t have an account?{' '}
          <Link href={authHref('signup')} className={styles.textLink}>
            Create an Account
          </Link>
        </p>
      </div>
    </>
  );
}

function SignUpView() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsClickError, setTermsClickError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<SignupErrors>({});
  const [touched, setTouched] = useState<Partial<Record<SignupField, boolean>>>({});

  const trimmedPassword = trimPassword(formData.password);
  const passwordHintVisible = trimmedPassword.length > 0;
  const lengthValid = trimmedPassword.length >= 8;
  const specialValid = /[^A-Za-z0-9\s]/.test(trimmedPassword);
  const numberValid = /\d/.test(trimmedPassword);
  const passwordChecks = [
    { key: 'length', label: 'At least 8 characters', met: lengthValid },
    {
      key: 'special',
      label: 'Includes one special character e.g @',
      met: specialValid,
    },
    { key: 'number', label: 'Includes a number', met: numberValid },
  ];
  const metPasswordConditions = [lengthValid, specialValid, numberValid].filter(
    Boolean
  ).length;
  const passwordStrength =
    metPasswordConditions === 3
      ? { percent: 100, label: 'Strong password', toneClass: styles.strengthStrong }
      : metPasswordConditions === 2
        ? { percent: 66, label: 'Almost there', toneClass: styles.strengthAlmost }
        : { percent: 33, label: 'Weak password', toneClass: styles.strengthWeak };
  const formIsComplete =
    formData.firstName.trim().length >= 2 &&
    formData.lastName.trim().length >= 2 &&
    EMAIL_PATTERN.test(normalizeEmail(formData.email)) &&
    validateSignupPassword(trimmedPassword) === undefined &&
    acceptedTerms;
  const submitIsDisabled = loading || !formIsComplete;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);

    if (name === 'email') {
      setFieldErrors((prev) => ({
        ...prev,
        email: getSignupEmailChangeError(value, Boolean(touched.email)),
      }));
      return;
    }

    const field = name as SignupField;
    setFieldErrors((prev) => ({
      ...prev,
      [field]: touched[field] ? validateSignupField(field, value) : undefined,
    }));
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const field = event.target.name as SignupField;
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === 'email') {
      const normalizedEmail = normalizeEmail(event.target.value);
      setFormData((prev) => ({ ...prev, email: normalizedEmail }));
      setFieldErrors((prev) => ({
        ...prev,
        email: validateEmail(normalizedEmail),
      }));
      return;
    }

    if (field === 'password') {
      const nextPassword = trimPassword(event.target.value);
      setFormData((prev) => ({ ...prev, password: nextPassword }));
      setFieldErrors((prev) => ({
        ...prev,
        password: validateSignupPassword(nextPassword),
      }));
      return;
    }

    setFieldErrors((prev) => ({
      ...prev,
      [field]: validateSignupField(field, event.target.value),
    }));
  }

  function handleTermsChange(event: React.ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked;
    setAcceptedTerms(checked);
    setError(null);
    setTermsClickError(null);
    setFieldErrors((prev) => ({ ...prev, terms: checked ? undefined : prev.terms }));
  }

  function handleTermsBlur(event: React.FocusEvent<HTMLInputElement>) {
    if (!event.target.checked) {
      setFieldErrors((prev) => ({ ...prev, terms: TERMS_MESSAGE }));
    }
  }

  function handleSignupClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (!acceptedTerms) {
      event.preventDefault();
      setFieldErrors((prev) => ({ ...prev, terms: undefined }));
      setTermsClickError(TERMS_CLICK_MESSAGE);
      return;
    }
    setTermsClickError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) {
      return;
    }
    setError(null);
    setSuccess(null);

    const normalizedEmail = normalizeEmail(formData.email);
    const trimmedSignupPassword = trimPassword(formData.password);
    const nextErrors: SignupErrors = {
      firstName: validateName(formData.firstName, 'First name'),
      lastName: validateName(formData.lastName, 'Last name'),
      email: validateEmail(normalizedEmail),
      password: validateSignupPassword(trimmedSignupPassword),
      terms: acceptedTerms ? undefined : TERMS_MESSAGE,
    };
    setFormData((prev) => ({
      ...prev,
      email: normalizedEmail,
      password: trimmedSignupPassword,
    }));
    setFieldErrors(nextErrors);
    setTouched({ firstName: true, lastName: true, email: true, password: true });

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email: normalizedEmail,
          password: trimmedSignupPassword,
          acceptedTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      setSuccess('Account created successfully! Taking you to your dashboard...');
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1200);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className={`text-headline-small ${styles.cardTitle}`}>Create an Account</h1>
      <p className={`text-body-medium ${styles.cardSubtitle}`}>
        Join NucleoBridge to run bioinformatics workflows directly in your browser.
      </p>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.rowTwoCol}>
          <div className={styles.fieldGroup}>
            <label htmlFor="firstName" className={`text-label-medium ${styles.label}`}>
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(fieldErrors.firstName)}
              aria-describedby={
                fieldErrors.firstName ? 'signup-first-name-error' : undefined
              }
              placeholder="First name"
              className={`${styles.input} ${fieldErrors.firstName ? styles.inputError : ''}`}
            />
            <InlineError id="signup-first-name-error" message={fieldErrors.firstName} />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="lastName" className={`text-label-medium ${styles.label}`}>
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(fieldErrors.lastName)}
              aria-describedby={
                fieldErrors.lastName ? 'signup-last-name-error' : undefined
              }
              placeholder="Last name"
              className={`${styles.input} ${fieldErrors.lastName ? styles.inputError : ''}`}
            />
            <InlineError id="signup-last-name-error" message={fieldErrors.lastName} />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={`text-label-medium ${styles.label}`}>
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
            placeholder="learner@example.com"
            className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
          />
          <InlineError id="signup-email-error" message={fieldErrors.email} />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="password" className={`text-label-medium ${styles.label}`}>
            Password
          </label>
          <div className={styles.passwordField}>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                `${passwordHintVisible ? 'signup-password-requirement' : ''}${
                  fieldErrors.password ? ' signup-password-error' : ''
                }`.trim() || undefined
              }
              placeholder="Your password"
              className={`${styles.input} ${styles.passwordInput} ${
                fieldErrors.password ? styles.inputError : ''
              }`}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              <EyeIcon hidden={showPassword} />
            </button>
          </div>
          {passwordHintVisible && (
            <div
              id="signup-password-requirement"
              className={`${styles.strengthMeter} ${passwordStrength.toneClass}`}
            >
              <div className={styles.strengthHeader}>
                <span className={`text-label-small ${styles.strengthLabel}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div
                className={styles.strengthTrack}
                role="progressbar"
                aria-label="Password strength"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={passwordStrength.percent}
                aria-valuetext={`${passwordStrength.label}. ${metPasswordConditions} of 3 requirements met.`}
              >
                <div
                  className={styles.strengthFill}
                  style={{ width: `${passwordStrength.percent}%` }}
                />
              </div>
              <ul className={styles.requirementList}>
                {passwordChecks.map((check) => (
                  <li key={check.key} className={styles.requirementRow}>
                    <RequirementIcon met={check.met} />
                    <span className="text-body-small">{check.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <InlineError id="signup-password-error" message={fieldErrors.password} />
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.termsRow}>
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              required
              aria-required="true"
              checked={acceptedTerms}
              onChange={handleTermsChange}
              onBlur={handleTermsBlur}
              aria-invalid={Boolean(fieldErrors.terms)}
              aria-describedby={fieldErrors.terms ? 'signup-terms-error' : undefined}
              className={`${styles.checkbox} ${fieldErrors.terms ? styles.checkboxError : ''}`}
            />
            <label htmlFor="acceptTerms" className={`text-body-small ${styles.termsLabel}`}>
              I accept the{' '}
              <Link href="/terms" className={styles.textLink}>
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className={styles.textLink}>
                Privacy Policy
              </Link>
            </label>
          </div>
          <InlineError id="signup-terms-error" message={fieldErrors.terms} />
        </div>

        {termsClickError && (
          <InlineError id="signup-terms-click-error" message={termsClickError} />
        )}

        <button
          type="submit"
          aria-disabled={submitIsDisabled}
          onClick={handleSignupClick}
          className={`text-label-large ${styles.submitButton}`}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className={styles.footerLinks}>
        <p className={`text-body-small ${styles.subtleText}`}>
          Already have an account?{' '}
          <Link href={authHref('login')} className={styles.textLink}>
            Sign In
          </Link>
        </p>
      </div>
    </>
  );
}

function ForgotPasswordView() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const normalizedEmail = normalizeEmail(email);
    setEmail(normalizedEmail);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to dispatch password reset request.');
      }

      setSuccess(
        data.message ||
          'If an account exists with this email, password reset instructions have been sent.'
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className={`text-headline-small ${styles.cardTitle}`}>Reset Password</h1>
      <p className={`text-body-medium ${styles.cardSubtitle}`}>
        Enter your registered email address and we will dispatch password recovery instructions.
      </p>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label htmlFor="forgotEmail" className={`text-label-medium ${styles.label}`}>
            Email Address
          </label>
          <input
            id="forgotEmail"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={(event) => setEmail(normalizeEmail(event.target.value))}
            placeholder="learner@example.com"
            className={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`text-label-large ${styles.submitButton}`}
        >
          {loading ? 'Dispatching Reset Link...' : 'Send Reset Link'}
        </button>
      </form>

      <div className={styles.footerLinks}>
        <p className={`text-body-small ${styles.subtleText}`}>
          Remembered your password?{' '}
          <Link href={authHref('login')} className={styles.textLink}>
            Back to Sign In
          </Link>
        </p>
      </div>
    </>
  );
}

function ResetPasswordView({ initialToken }: { initialToken: string }) {
  const router = useRouter();
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setToken(initialToken);
  }, [initialToken]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedPassword = trimPassword(password);
    const trimmedConfirmPassword = trimPassword(confirmPassword);
    setPassword(trimmedPassword);
    setConfirmPassword(trimmedConfirmPassword);

    if (!token) {
      setError('Password reset token is missing. Please check your reset link.');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (trimmedPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: trimmedPassword,
          confirmPassword: trimmedConfirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setSuccess('Your password has been successfully updated! Redirecting to sign in...');
      setTimeout(() => {
        router.push(authHref('login'));
      }, 2000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className={`text-headline-small ${styles.cardTitle}`}>Choose New Password</h1>
      <p className={`text-body-medium ${styles.cardSubtitle}`}>
        Enter your secure replacement password below.
      </p>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label htmlFor="resetToken" className={`text-label-medium ${styles.label}`}>
            Reset Token
          </label>
          <input
            id="resetToken"
            type="text"
            required
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste your 32-character reset token"
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="newPassword" className={`text-label-medium ${styles.label}`}>
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={(event) => setPassword(trimPassword(event.target.value))}
            placeholder="Minimum 8 characters"
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="confirmNewPassword" className={`text-label-medium ${styles.label}`}>
            Confirm New Password
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onBlur={(event) => setConfirmPassword(trimPassword(event.target.value))}
            placeholder="Repeat new password"
            className={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`text-label-large ${styles.submitButton}`}
        >
          {loading ? 'Updating Password...' : 'Save New Password'}
        </button>
      </form>

      <div className={styles.footerLinks}>
        <p className={`text-body-small ${styles.subtleText}`}>
          <Link href={authHref('login')} className={styles.textLink}>
            Return to Sign In
          </Link>
        </p>
      </div>
    </>
  );
}

function AuthViews() {
  const searchParams = useSearchParams();
  const requestedView = searchParams.get('view');
  const view: AuthView = isAuthView(requestedView) ? requestedView : 'login';
  const token = searchParams.get('token') ?? '';

  return (
    <AuthShell>
      {view === 'login' && <LoginView />}
      {view === 'signup' && <SignUpView />}
      {view === 'forgot-password' && <ForgotPasswordView />}
      {view === 'reset-password' && <ResetPasswordView initialToken={token} />}
    </AuthShell>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthViews />
    </Suspense>
  );
}
