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
import { loginSchema } from '../lib/validation';
import { ApiError } from '../lib/api';
import { getDefaultAppRoute } from '../lib/appRoutes';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, googleAuth } = useAuth();
  const [serverError, setServerError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const result = await login(data);
      navigate(getDefaultAppRoute(result.user?.role));
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Invalid email or password.');
    }
  };

  const handleGoogleSuccess = async (response) => {
    setServerError('');
    setGoogleLoading(true);
    try {
      const result = await googleAuth(response.credential, true);
      navigate(getDefaultAppRoute(result.user?.role));
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
      heading="Welcome Back!"
      subheading="Enter Your Details Below"
      footerText="Don't have an account?"
      footerLinkText="Sign Up"
      footerTo="/signup"
    >
      {serverError && <AuthAlert>{serverError}</AuthAlert>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="mb-6 flex items-center justify-between text-[13px]">
          <label className="flex cursor-pointer items-center gap-2 text-gray-400">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-[15px] w-[15px] cursor-pointer accent-neutral-950"
            />
            Remember me
          </label>
          <a href="/forgot-password" className="text-gray-400 no-underline transition hover:text-neutral-950">
            Forgot password?
          </a>
        </div>

        <AuthPrimaryButton disabled={isSubmitting || googleLoading}>
          {isSubmitting ? <AuthSpinner /> : 'Log in'}
        </AuthPrimaryButton>
      </form>

      <AuthGoogleButton
        label="Log in with Google"
        onSuccess={handleGoogleSuccess}
        onError={() => setServerError('Google sign-in was cancelled.')}
        disabled={isSubmitting || googleLoading}
      />
    </KreativeAuthShell>
  );
}
