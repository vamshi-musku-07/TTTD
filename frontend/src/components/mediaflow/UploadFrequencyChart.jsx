import { useEffect, useMemo, useState } from 'react';
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

export default function UploadFrequencyChart({
  chartData = [],
  subtitle = 'All editor uploads over the last 7 days',
}) {
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
    setMounted(false);
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, [chartData]);

  const stackOrder = ['youtubeShorts', 'youtubeLong', 'facebook', 'threads', 'instagram'];
  const hasData = chartData.some(
    (d) =>
      (d.counts?.instagram || 0) +
        (d.counts?.facebook || 0) +
        (d.counts?.threads || 0) +
        (d.counts?.youtubeLong || 0) +
        (d.counts?.youtubeShorts || 0) >
      0
  );

  const pointCount = chartData.length;
  const needsScroll = pointCount > 10;

  // Keep bars readable: fixed column width when scrolling, flexible when few days
  const columnStyle = useMemo(() => {
    if (!needsScroll) return undefined;
    const width = pointCount > 20 ? 44 : 52;
    return { width, minWidth: width, maxWidth: width };
  }, [needsScroll, pointCount]);

  return (
    <div className="mf-card flex min-w-0 flex-col overflow-hidden p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-4 border-b border-outline-variant pb-4 sm:mb-5">
        <div className="min-w-0">
          <h3 className="mf-text-card-title">Upload Frequency</h3>
          <p className="mf-text-meta mt-1 break-words">{subtitle}</p>
        </div>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
          {UPLOAD_PLATFORMS.map((p) => (
            <div key={p.key} className="flex shrink-0 items-center gap-2">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md ${getPlatformClass(p.key, 'dot')}`}
              >
                <PlatformLogo platform={p.key} className="h-3 w-3" isDark={isDark} />
              </span>
              <span className="whitespace-nowrap text-xs text-on-surface-variant sm:text-sm">
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="flex min-h-[220px] flex-1 items-center justify-center px-2 py-10 text-center mf-text-body">
          No uploads in this period. Try another range or editor.
        </div>
      ) : (
        <div className="relative min-w-0">
          {needsScroll && (
            <p className="mb-2 text-[11px] text-on-surface-variant sm:hidden">
              Swipe sideways to see all days
            </p>
          )}
          <div
            className={`-mx-1 overflow-x-auto px-1 pb-2 [scrollbar-width:thin] ${
              needsScroll ? 'snap-x snap-mandatory' : ''
            }`}
          >
            <div
              className={`relative flex h-[280px] items-end gap-2 pt-4 sm:h-[320px] sm:gap-3 ${
                needsScroll ? 'w-max min-w-full' : 'w-full justify-between'
              }`}
            >
              <div className="pointer-events-none absolute inset-x-0 top-4 bottom-10 flex flex-col justify-between">
                {[0, 1, 2, 3].map((line) => (
                  <div key={line} className="w-full border-b border-outline-variant/30" />
                ))}
              </div>

              {chartData.map((item, dayIndex) => (
                <div
                  key={`${item.day}-${dayIndex}`}
                  className={`group relative z-10 flex flex-col items-center gap-1 ${
                    needsScroll ? 'snap-start' : 'min-w-0 flex-1'
                  }`}
                  style={columnStyle}
                >
                  <div
                    className={`flex h-[200px] flex-col justify-end sm:h-[240px] ${
                      needsScroll ? 'w-9 sm:w-10' : 'w-full max-w-[56px]'
                    }`}
                  >
                    {stackOrder.map((key, segIndex) => {
                      const value = item[key] || 0;
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
                            transitionDelay: `${Math.min(dayIndex, 12) * 40 + (stackOrder.length - segIndex) * 40}ms`,
                          }}
                          title={`${PLATFORM_STYLES[key].label}: ${count}`}
                        >
                          {count > 0 && value >= 18 && (
                            <span
                              className="drop-shadow-sm transition-opacity duration-500"
                              style={{
                                opacity: mounted ? 1 : 0,
                                transitionDelay: `${Math.min(dayIndex, 12) * 40 + 280}ms`,
                              }}
                            >
                              <PlatformLogo platform={key} className="h-3 w-3" isDark={isDark} />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <span className="mt-1 max-w-full truncate text-center text-[9px] font-semibold uppercase tracking-wide text-on-surface-variant sm:text-[10px]">
                    {item.day}
                  </span>
                  {item.counts?.total > 0 && (
                    <span className="text-[9px] text-on-surface-variant">{item.counts.total}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
