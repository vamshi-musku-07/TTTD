import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { label, error, id, type = 'text', hint, ...props },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[13px] font-medium text-[#d4d4d8]"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={`field-input ${error ? 'field-input--error' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-[#52525b]">{hint}</p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-[#fb7185]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
