export function Alert({ type = 'error', children }) {
  const styles = {
    error: 'bg-[rgba(225,29,72,0.08)] border-[rgba(225,29,72,0.2)] text-[#fda4af]',
    success: 'bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.2)] text-[#86efac]',
    info: 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-[#a1a1aa]',
  };

  const icons = {
    error: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    success: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    info: null,
  };

  return (
    <div
      className={`flex gap-2.5 rounded-lg border px-3.5 py-3 text-[13px] leading-relaxed ${styles[type]}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      {icons[type]}
      <div>{children}</div>
    </div>
  );
}
