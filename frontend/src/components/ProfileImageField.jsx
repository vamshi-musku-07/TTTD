import { useRef, useState } from 'react';
import { NameAvatar } from './NameAvatar';
import { useAuth } from '../context/AuthContext';
import { api, ApiError, isSessionExpiredError } from '../lib/api';

const MAX_BYTES = 2 * 1024 * 1024;

export function ProfileImageField({
  name,
  avatar,
  onChange,
  onClear,
  sizeClass = 'h-20 w-20 rounded-2xl',
}) {
  const inputRef = useRef(null);
  const { accessToken } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onChange(null, 'Please choose an image file');
      return;
    }
    if (file.size > MAX_BYTES) {
      onChange(null, 'Image must be under 2MB');
      return;
    }

    setUploading(true);
    try {
      const data = await api.uploadAvatar(file, accessToken);
      onChange(data.url);
    } catch (err) {
      if (isSessionExpiredError(err)) return;
      onChange(null, err instanceof ApiError ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <NameAvatar
        name={name || 'U'}
        avatar={avatar}
        className={`flex items-center justify-center bg-primary-container text-lg font-bold text-on-primary border-2 border-surface-container-lowest shadow-sm ${sizeClass}`}
        title={name}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="mf-btn-secondary !h-10 !text-xs font-bold uppercase tracking-wide"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <span className="material-symbols-outlined text-[16px]">
            {uploading ? 'progress_activity' : 'upload'}
          </span>
          {uploading ? 'Uploading...' : 'Upload photo'}
        </button>
        {avatar && (
          <button
            type="button"
            className="mf-btn-secondary !h-10 !text-xs font-bold uppercase tracking-wide !border-error/30 !text-error hover:!bg-error/10"
            onClick={() => onClear?.()}
            disabled={uploading}
          >
            Remove
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}
