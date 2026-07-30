import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { api, ApiError, isSessionExpiredError } from '../../lib/api';
import { NameAvatar } from '../../components/NameAvatar';

const fieldClass =
  'w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60';

const MAX_BYTES = 2 * 1024 * 1024;

function formatDisplayName(user) {
  const first = user?.firstName || '';
  const last = user?.lastName || '';
  if (first && first === last) return first;
  return user?.fullName?.trim() || `${first} ${last}`.trim();
}

function SectionCard({ icon, title, description, children, action }) {
  return (
    <section className="mf-card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-outline-variant bg-surface-container-low/60 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-bright text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </span>
          <div className="min-w-0">
            <h2 className="mf-text-card-title">{title}</h2>
            {description && <p className="mf-text-body mt-1 text-sm">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  );
}

function Toast({ type, message, onDismiss }) {
  if (!message) return null;

  const styles =
    type === 'success'
      ? 'border-green-500/30 bg-green-500/5 text-green-700'
      : 'border-error/30 bg-error/5 text-error';

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles}`} role="status">
      <span className="material-symbols-outlined mt-0.5 text-[18px] shrink-0">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      <p className="flex-1 min-w-0">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-lg p-1 opacity-70 transition hover:opacity-100"
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}

function passwordStrength(password) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: 'Weak', width: '33%', className: 'bg-error' };
  if (score === 2) return { label: 'Fair', width: '66%', className: 'bg-amber-500' };
  return { label: 'Strong', width: '100%', className: 'bg-green-600' };
}

export default function SettingsPage() {
  const { user, accessToken, updateUser } = useAuth();
  const { roleInfo, isSuperAdmin } = useRole();
  const fileInputRef = useRef(null);

  const initialName = formatDisplayName(user);
  const initialAvatar = user?.avatar || null;
  const initialEmail = user?.email || '';

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldError, setFieldError] = useState({});

  useEffect(() => {
    setName(formatDisplayName(user));
    setEmail(user?.email || '');
    setAvatar(user?.avatar || null);
  }, [user]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(''), 3500);
    return () => clearTimeout(timer);
  }, [success]);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const isDirty = useMemo(() => {
    const nameChanged = name.trim() !== (initialName || '').trim();
    const avatarChanged = (avatar || '') !== (initialAvatar || '');
    const emailChanged = isSuperAdmin && email.trim().toLowerCase() !== (initialEmail || '').trim().toLowerCase();
    const passwordChanged = Boolean(password.trim());
    return nameChanged || avatarChanged || emailChanged || passwordChanged;
  }, [name, avatar, email, password, initialName, initialAvatar, initialEmail, isSuperAdmin]);

  const resetForm = () => {
    setName(formatDisplayName(user));
    setEmail(user?.email || '');
    setAvatar(user?.avatar || null);
    setPassword('');
    setConfirmPassword('');
    setFieldError({});
    setError('');
    setSuccess('');
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be under 2MB.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const data = await api.uploadAvatar(file, accessToken);
      setAvatar(data.url);
      setSuccess('Photo uploaded. Click Save changes to apply.');
    } catch (err) {
      if (isSessionExpiredError(err)) return;
      setError(err instanceof ApiError ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = 'Name is required';
    if (isSuperAdmin) {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) nextErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        nextErrors.email = 'Enter a valid email address';
      }
    }
    if (password.trim()) {
      if (password.trim().length < 8) nextErrors.password = 'Password must be at least 8 characters';
      if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    }

    setFieldError(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!isDirty) return;

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        name: name.trim(),
        avatar: avatar || '',
      };
      if (isSuperAdmin) payload.email = email.trim().toLowerCase();
      if (password.trim()) payload.password = password.trim();

      const data = await api.updateProfile(payload, accessToken);
      updateUser(data.user);
      setPassword('');
      setConfirmPassword('');
      setSuccess('Your profile has been updated.');
    } catch (err) {
      if (isSessionExpiredError(err)) return;
      setError(err instanceof ApiError ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <header className="mb-8">
        <h1 className="mf-text-display text-[32px] leading-tight">Settings</h1>
        <p className="mf-text-body mt-2 text-[16px]">
          Manage how you appear across Tea Time Telugu and keep your account secure.
        </p>
      </header>

      <div className="mb-5 space-y-3">
        <Toast type="error" message={error} onDismiss={() => setError('')} />
        <Toast type="success" message={success} onDismiss={() => setSuccess('')} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <SectionCard
          icon="account_circle"
          title="Profile"
          description="This is how teammates see you in the app."
        >
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-outline-variant/70 bg-surface-container-low/40 p-6 text-center sm:flex-row sm:items-center sm:text-left">
            <div className="relative shrink-0">
              <NameAvatar
                name={name || 'U'}
                avatar={avatar}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-container text-2xl font-bold text-on-primary shadow-sm"
                title={name}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-surface-bright text-on-surface shadow-sm transition hover:bg-surface-container disabled:opacity-60"
                aria-label="Change profile photo"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {uploading ? 'progress_activity' : 'photo_camera'}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-on-surface truncate">{name || 'Your name'}</p>
              <p className="mf-text-meta mt-0.5 truncate">{isSuperAdmin ? email : user?.email}</p>
              <span className="mt-3 inline-flex rounded-full border border-outline-variant bg-surface-bright px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                {roleInfo.title}
              </span>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <button
                  type="button"
                  className="mf-btn-secondary !h-10 !text-xs font-bold uppercase tracking-wide"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  {uploading ? 'Uploading…' : 'Change photo'}
                </button>
                {avatar && (
                  <button
                    type="button"
                    className="mf-btn-secondary !h-10 !text-xs font-bold uppercase tracking-wide !border-error/30 !text-error hover:!bg-error/10"
                    onClick={() => {
                      setAvatar(null);
                      setSuccess('Photo cleared. Click Save changes to apply.');
                    }}
                    disabled={uploading || saving}
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="mf-text-meta mt-3">JPG, PNG, or WebP · max 2MB</p>
            </div>
          </div>

          <div>
            <label htmlFor="settings-name" className="mb-1.5 block mf-text-label-caps">
              Display name
            </label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldError.name) setFieldError((prev) => ({ ...prev, name: '' }));
              }}
              className={`${fieldClass} ${fieldError.name ? 'border-error' : ''}`}
              placeholder="Your name"
              autoComplete="name"
              required
            />
            {fieldError.name ? (
              <p className="mt-1.5 text-xs text-error">{fieldError.name}</p>
            ) : (
              <p className="mt-1.5 text-xs text-on-surface-variant">Shown in headers, uploads, and team cards.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          icon="badge"
          title="Account"
          description={
            isSuperAdmin
              ? 'You can update your login email anytime. Role stays Super Admin.'
              : 'These details are managed by your admin and can’t be edited here.'
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="settings-email" className="mb-1.5 block mf-text-label-caps">
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </span>
                <input
                  id="settings-email"
                  type="email"
                  value={isSuperAdmin ? email : user?.email || ''}
                  onChange={
                    isSuperAdmin
                      ? (e) => {
                          setEmail(e.target.value);
                          if (fieldError.email) setFieldError((prev) => ({ ...prev, email: '' }));
                        }
                      : undefined
                  }
                  className={`${fieldClass} pl-10 ${fieldError.email ? 'border-error' : ''}`}
                  disabled={!isSuperAdmin}
                  autoComplete="email"
                />
              </div>
              {fieldError.email && (
                <p className="mt-1.5 text-xs text-error">{fieldError.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="settings-role" className="mb-1.5 block mf-text-label-caps">
                Role
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">shield_person</span>
                </span>
                <input
                  id="settings-role"
                  type="text"
                  value={roleInfo.title}
                  className={`${fieldClass} pl-10`}
                  disabled
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon="lock"
          title="Security"
          description={
            isSuperAdmin
              ? 'Change your password whenever you want. Leave blank to keep the current one.'
              : 'Leave blank to keep your current password.'
          }
        >
          <div>
            <label htmlFor="settings-password" className="mb-1.5 block mf-text-label-caps">
              New password
            </label>
            <div className="relative">
              <input
                id="settings-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldError.password) setFieldError((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="Minimum 8 characters"
                className={`${fieldClass} pr-12 ${fieldError.password ? 'border-error' : ''}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition hover:text-on-surface"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {fieldError.password && (
              <p className="mt-1.5 text-xs text-error">{fieldError.password}</p>
            )}
            {strength && (
              <div className="mt-3">
                <div className="mb-1.5 flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Password strength</span>
                  <span className="font-semibold text-on-surface">{strength.label}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
                  <div
                    className={`h-full rounded-full transition-all ${strength.className}`}
                    style={{ width: strength.width }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="settings-confirm-password" className="mb-1.5 block mf-text-label-caps">
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="settings-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldError.confirmPassword) {
                    setFieldError((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                placeholder="Re-enter new password"
                className={`${fieldClass} pr-12 ${fieldError.confirmPassword ? 'border-error' : ''}`}
                autoComplete="new-password"
                disabled={!password}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition hover:text-on-surface disabled:opacity-40"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
                disabled={!password}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {fieldError.confirmPassword && (
              <p className="mt-1.5 text-xs text-error">{fieldError.confirmPassword}</p>
            )}
          </div>
        </SectionCard>

        <div
          className={`sticky bottom-4 z-20 rounded-2xl border border-outline-variant bg-surface-container-lowest/95 p-4 shadow-lg backdrop-blur transition ${
            isDirty ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-on-surface-variant">
              {isDirty ? 'You have unsaved changes.' : 'All changes saved.'}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="mf-btn-secondary"
                onClick={resetForm}
                disabled={!isDirty || saving || uploading}
              >
                Discard
              </button>
              <button type="submit" className="mf-btn-primary" disabled={!isDirty || saving || uploading}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
