import { useTheme } from '../../context/ThemeContext';

const PLATFORM_ALIASES = {
  facebook: 'facebook',
  fb: 'facebook',
  instagram: 'instagram',
  ig: 'instagram',
  youtube: 'youtube',
  yt: 'youtube',
  threads: 'threads',
  th: 'threads',
};

const PLATFORM_LABELS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  threads: 'Threads',
};

function normalizePlatform(platform) {
  return PLATFORM_ALIASES[platform?.trim().toLowerCase()] || null;
}

function IconSvg({ platform, className }) {
  if (platform === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="white" strokeWidth="2" />
        <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2" />
        <circle cx="17.6" cy="6.4" r="1.3" fill="white" />
      </svg>
    );
  }

  if (platform === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="white" />
        <path
          d="M13.5 7.5h2V5.4C15.1 5.1 14.1 5 13 5c-2.2 0-3.7 1.4-3.7 3.9V12H7v2.3h2.3V19h3.3v-4.7H15l.4-2.3h-2.4V9.1c0-.7.2-1.1 1.1-1.1z"
          fill="#1877F2"
        />
      </svg>
    );
  }

  if (platform === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="1.5" y="5" width="21" height="14" rx="4" fill="white" />
        <path d="M10 9l5 3-5 3V9z" fill="#FF0000" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <text x="12" y="16.5" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">
        @
      </text>
    </svg>
  );
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
};

const ICON_SIZE_CLASSES = {
  sm: 'h-4 w-4',
  md: 'h-[18px] w-[18px]',
};

export default function SocialPlatformIcon({ platform, size = 'sm', className = '', style }) {
  const { isDark } = useTheme();
  const key = normalizePlatform(platform);
  if (!key) return null;

  const shellClass = {
    facebook: 'bg-[#1877F2]',
    instagram: 'bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]',
    youtube: 'bg-[#FF0000]',
    threads: isDark ? 'bg-white text-[#101010]' : 'bg-[#101010] text-white',
  }[key];

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full border-2 border-surface-container-lowest shadow-sm ${SIZE_CLASSES[size]} ${shellClass} ${className}`}
      title={PLATFORM_LABELS[key]}
      style={style}
    >
      <IconSvg platform={key} className={ICON_SIZE_CLASSES[size]} />
    </span>
  );
}

export function SocialPlatformIcons({ platforms = [], size = 'sm', className = '' }) {
  if (!platforms.length) return null;

  return (
    <div className={`flex items-center ${className}`}>
      {platforms.map((platform, index) => (
        <SocialPlatformIcon
          key={`${platform}-${index}`}
          platform={platform}
          size={size}
          className={index > 0 ? '-ml-2.5' : ''}
          style={{ zIndex: platforms.length - index }}
        />
      ))}
    </div>
  );
}
