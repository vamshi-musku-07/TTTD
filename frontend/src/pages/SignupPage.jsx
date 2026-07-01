import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  KreativeAuthShell,
  AuthField,
  AuthPasswordField,
  AuthGoogleButton,
  AuthAlert,
  AuthPrimaryButton,
  AuthSpinner,
} from '../components/auth/KreativeAuth';
import { useAuth } from '../context/AuthContext';
import { signupSchema, getPasswordStrength } from '../lib/validation';
import { ApiError } from '../lib/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, googleAuth } = useAuth();
  const [serverError, setServerError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onBlur',
  });

  const password = watch('password');
  const acceptTerms = watch('acceptTerms');
  const strength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const result = await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        acceptTerms: data.acceptTerms,
      });

      if (!result.user.isEmailVerified) {
        navigate('/verify-email-pending', { state: { email: data.email } });
      } else {
        navigate('/app/events');
      }
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Signup failed. Please try again.');
    }
  };

  const handleGoogleSuccess = async (response) => {
    if (!acceptTerms) {
      setServerError('Please accept the terms before continuing with Google.');
      return;
    }

    setServerError('');
    setGoogleLoading(true);
    try {
      await googleAuth(response.credential, acceptTerms);
      navigate('/app/events');
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : 'Google sign-in failed. Please try again.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KreativeAuthShell
      heading="Create Account"
      subheading="Enter Your Details Below"
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerTo="/login"
    >
      {serverError && <AuthAlert>{serverError}</AuthAlert>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-[22px] grid grid-cols-2 gap-4">
          <AuthField
            label="First name"
            autoComplete="given-name"
            placeholder="Jane"
            error={errors.firstName?.message}
            className="mb-0"
            {...register('firstName')}
          />
          <AuthField
            label="Last name"
            autoComplete="family-name"
            placeholder="Cooper"
            error={errors.lastName?.message}
            className="mb-0"
            {...register('lastName')}
          />
        </div>

        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="hello.alex@gmail.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <AuthPasswordField
          label="Password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {password && strength.label && (
          <p className="-mt-3 mb-4 text-[11px] text-gray-400">Password strength: {strength.label}</p>
        )}

        <AuthPasswordField
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <label className="mb-5 flex items-start gap-2.5 text-[13px] leading-normal text-gray-400">
          <input type="checkbox" {...register('acceptTerms')} className="mt-0.5 accent-neutral-950" />
          <span>
            I agree to the{' '}
            <a href="/terms" className="font-medium text-neutral-950">
              Terms
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-medium text-neutral-950">
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="-mt-3 mb-4 text-xs text-red-500" role="alert">
            {errors.acceptTerms.message}
          </p>
        )}

        <AuthPrimaryButton disabled={isSubmitting || googleLoading}>
          {isSubmitting ? <AuthSpinner /> : 'Sign up'}
        </AuthPrimaryButton>
      </form>

      <AuthGoogleButton
        label="Sign up with Google"
        onSuccess={handleGoogleSuccess}
        onError={() => setServerError('Google sign-in was cancelled.')}
        disabled={isSubmitting || googleLoading}
      />
    </KreativeAuthShell>
  );
}
