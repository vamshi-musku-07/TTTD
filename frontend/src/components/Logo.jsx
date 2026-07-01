export function Logo({ size = 'md' }) {
  const sizes = {
    sm: { icon: 28, text: 'text-base' },
    md: { icon: 32, text: 'text-lg' },
    lg: { icon: 36, text: 'text-xl' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-2.5">
      <svg width={s.icon} height={s.icon} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#111" stroke="rgba(255,255,255,0.1)" />
        <path
          d="M8 22V10h4.2c2.8 0 4.6 1.4 4.6 3.7 0 1.5-.7 2.6-1.9 3.2l2.5 5.1h-2.4l-2.2-4.6H10.2V22H8zm2.2-6.4h2c1.4 0 2.2-.7 2.2-1.9s-.8-1.9-2.2-1.9h-2v3.8z"
          fill="#fafafa"
        />
        <circle cx="23" cy="16" r="3" fill="#e11d48" />
      </svg>
      <span className={`${s.text} font-semibold tracking-[-0.02em] text-[#fafafa]`}>TTTD</span>
    </div>
  );
}
