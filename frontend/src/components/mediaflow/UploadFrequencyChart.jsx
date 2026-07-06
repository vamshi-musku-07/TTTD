import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { UPLOAD_PLATFORMS } from '../../lib/editorDashboardData';

const PLATFORM_STYLES = {
  instagram: {
    label: 'Instagram',
    barClass: 'bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]',
    dotClass: 'bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]',
  },
  facebook: {
    label: 'Facebook',
    barClass: 'bg-[#1877F2]',
    dotClass: 'bg-[#1877F2]',
  },
  threads: {
    label: 'Threads',
    barClass: 'bg-[#101010]',
    barClassDark: 'bg-white',
    dotClass: 'bg-[#101010]',
    dotClassDark: 'bg-white',
  },
  youtubeLong: {
    label: 'YouTube Long',
    barClass: 'bg-[#FF0000]',
    dotClass: 'bg-[#FF0000]',
  },
  youtubeShorts: {
    label: 'YouTube Shorts',
    barClass: 'bg-gradient-to-t from-[#ff0844] to-[#ff5e3a]',
    dotClass: 'bg-gradient-to-t from-[#ff0844] to-[#ff5e3a]',
  },
};

function PlatformLogo({ platform, className = 'h-4 w-4', isDark = false }) {
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

  if (platform === 'youtubeLong') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="1.5" y="5" width="21" height="14" rx="4" fill="white" />
        <path d="M10 9l5 3-5 3V9z" fill="#FF0000" />
      </svg>
    );
  }

  if (platform === 'threads') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <text
          x="12"
          y="16.5"
          textAnchor="middle"
          fill={isDark ? '#101010' : 'white'}
          fontSize="14"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          @
        </text>
      </svg>
    );
  }

  if (platform === 'youtubeShorts') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="4" y="2" width="16" height="20" rx="5" fill="white" transform="rotate(18 12 12)" />
        <path d="M10.5 9l4.5 3-4.5 3V9z" fill="#ff2d4b" />
      </svg>
    );
  }

  return null;
}

export default function UploadFrequencyChart({ chartData, subtitle = 'All editor uploads over the last 7 days' }) {
  const [mounted, setMounted] = useState(false);
  const { isDark } = useTheme();

  const getPlatformClass = (key, type = 'bar') => {
    const style = PLATFORM_STYLES[key];
    if (key === 'threads' && isDark) {
      return type === 'bar' ? style.barClassDark : style.dotClassDark;
    }
    return type === 'bar' ? style.barClass : style.dotClass;
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, [chartData]);

  const stackOrder = ['youtubeShorts', 'youtubeLong', 'facebook', 'threads', 'instagram'];
  const hasData = chartData.some(
    (d) =>
      d.counts.instagram +
        d.counts.facebook +
        d.counts.threads +
        d.counts.youtubeLong +
        d.counts.youtubeShorts >
      0
  );

  return (
    <div className="mf-card flex h-[420px] flex-col p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <h3 className="mf-text-card-title">Upload Frequency</h3>
          <p className="mf-text-meta mt-1">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {UPLOAD_PLATFORMS.map((p) => (
            <div key={p.key} className="flex items-center gap-2">
              <span className={`flex h-5 w-5 items-center justify-center rounded-md ${getPlatformClass(p.key, 'dot')}`}>
                <PlatformLogo platform={p.key} className="h-3 w-3" isDark={isDark} />
              </span>
              <span className="mf-text-body">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-1 items-center justify-center mf-text-body">
          No uploads yet. Videos uploaded by any editor will appear here.
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 items-end justify-between gap-5 pt-6 sm:gap-8">
          <div className="pointer-events-none absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between">
            {[0, 1, 2, 3].map((line) => (
              <div key={line} className="w-full border-b border-outline-variant/30" />
            ))}
          </div>

          {chartData.map((item, dayIndex) => (
            <div key={`${item.day}-${dayIndex}`} className="group relative z-10 flex flex-1 flex-col items-center gap-1">
              <div className="flex h-64 w-full max-w-[72px] flex-col justify-end">
                {stackOrder.map((key, segIndex) => {
                  const value = item[key];
                  const count = item.counts?.[key] ?? 0;
                  const isTop = segIndex === 0;
                  return (
                    <div
                      key={key}
                      className={`relative flex w-full items-center justify-center overflow-hidden ${
                        isTop ? 'rounded-t-md' : ''
                      } ${getPlatformClass(key)}`}
                      style={{
                        height: mounted && count > 0 ? `${Math.max(value, 8)}%` : '0%',
                        transition: 'height 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                        transitionDelay: `${dayIndex * 70 + (stackOrder.length - segIndex) * 60}ms`,
                      }}
                      title={`${PLATFORM_STYLES[key].label}: ${count}`}
                    >
                      {count > 0 && (
                        <span
                          className="drop-shadow-sm transition-opacity duration-500"
                          style={{
                            opacity: mounted ? 1 : 0,
                            transitionDelay: `${dayIndex * 70 + 400}ms`,
                          }}
                        >
                          <PlatformLogo platform={key} className="h-3.5 w-3.5" isDark={isDark} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <span className="mf-text-label-caps shrink-0 text-[10px]">{item.day}</span>
              {item.counts?.total > 0 && (
                <span className="mf-text-meta text-[9px]">{item.counts.total} uploads</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
