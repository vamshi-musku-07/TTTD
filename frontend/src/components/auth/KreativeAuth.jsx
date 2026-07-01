import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const inputBase =
  'w-full border-0 border-b bg-transparent text-[15px] text-neutral-950 outline-none transition-colors placeholder:text-[#c4c4c4] focus:border-neutral-950';

function AuthVisual() {
  return (
    <div className=" w-full max-w-full overflow-hidden rounded-[28px] bg-[#f0f0f4]">
      <img
        src="/sideimg.png"
        alt=""
        className="block h-full w-full object-cover object-center"
        aria-hidden="true"
      />
    </div>
  );
}

function AuthLogo() {
  return (
    <div className=" flex items-center justify-center gap-2.5">
      <div
        className="flex h-9 w-9 items-center justify-center gap-1.5 rounded-[10px] bg-neutral-950"
        aria-hidden="true"
      >
        <span className="h-[5px] w-[5px] rounded-full bg-white" />
        <span className="h-[5px] w-[5px] rounded-full bg-white" />
      </div>
      <span className="text-[22px] font-bold tracking-tight text-neutral-950">MediaFlow</span>
    </div>
  );
}

export function KreativeAuthShell({ heading, subheading, footerText, footerLinkText, footerTo, children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#e9e9ee] px-4  font-sans">


      <div className="flex w-full max-w-7xl   overflow-hidden rounded-[48px] bg-white shadow-xl">
        <div className="hidden w-1/2 items-center justify-center   md:flex">
          <AuthVisual />
        </div>

        <div className="flex w-full shrink-0 flex-col items-center justify-center overflow-y-auto  md:w-1/2">
          <div className="w-full px-15">
            <AuthLogo />
            <div className="mb-7 text-center">
              <h1 className="m-0 text-[30px] font-bold tracking-tight text-neutral-950">{heading}</h1>
              <p className="mt-1.5 text-sm text-gray-400">{subheading}</p>
            </div>
            {children}
            <p className="text-center text-sm text-gray-400">
              {footerText}{' '}
              <Link to={footerTo} className="font-semibold text-neutral-950 no-underline hover:underline">
                {footerLinkText}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthAlert({ children }) {
  return (
    <div className=" rounded-xl bg-red-50 px-3.5  text-center text-[13px] text-red-700">
      {children}
    </div>
  );
}

export function AuthField({ label, error, type = 'text', id, className = '', ...props }) {
  const inputId = id || props.name;

  return (
    <div className={`mb-[22px] ${className}`}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] text-gray-400">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`${inputBase} ${error ? 'border-red-500' : 'border-gray-200'}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthPasswordField({ label, error, id, ...props }) {
  const [visible, setVisible] = useState(false);
  const inputId = id || props.name;

  return (
    <div className="mb-[22px]">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] text-gray-400">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={`${inputBase} pr-9 ${error ? 'border-red-500' : 'border-gray-200'}`}
          {...props}
        />
        <button
          type="button"
          className="absolute bottom-2.5 right-0 flex cursor-pointer items-center border-0 bg-transparent p-1 text-gray-400"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            {visible ? (
              <>
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            ) : (
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthPrimaryButton({ children, disabled }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="mb-3 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-neutral-950 text-[15px] font-semibold text-white transition active:scale-[0.99] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
    >
      {children}
    </button>
  );
}

export function AuthSpinner() {
  return (
    <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthGoogleButton({ onSuccess, onError, disabled, label = 'Log in with Google' }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId || clientId.includes('your-google-client-id')) {
    return (
      <button
        type="button"
        disabled
        className="mb-7 flex h-12 w-full items-center justify-center gap-2.5 rounded-full border-0 bg-gray-100 text-sm font-medium text-gray-700 opacity-60"
      >
        <GoogleIcon />
        Google sign-in unavailable
      </button>
    );
  }

  return (
    <div
      className={`relative mb-7 h-12 w-full [&_iframe]:!m-0 [&_iframe]:!h-full [&_iframe]:!w-full [&>div]:!absolute [&>div]:!inset-0 [&>div]:!z-[2] [&>div]:!cursor-pointer [&>div]:!opacity-0 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        theme="outline"
        size="large"
        width="340"
        text="continue_with"
        shape="pill"
      />
      <div className="pointer-events-none flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
        <GoogleIcon />
        {label}
      </div>
    </div>
  );
}
