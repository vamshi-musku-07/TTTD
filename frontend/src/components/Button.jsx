export function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  disabled,
  ...props
}) {
  const variants = {
    primary: 'btn-primary w-full',
    secondary: 'btn-secondary w-full',
    ghost: 'btn-ghost',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
