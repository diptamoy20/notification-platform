import { forwardRef, memo } from 'react';

/**
 * TextArea — ice-blue / navy theme matching System Notifications design.
 */
const TextArea = forwardRef(
  ({ value, onChange, placeholder, rows = 4, maxLength = 1000, label, id = 'textarea', error }, ref) => {
    const remaining   = maxLength - (value?.length ?? 0);
    const isNearLimit = remaining < 100;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-semibold" style={{ color: '#0d1c4a' }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full px-4 py-3 resize-none text-sm leading-relaxed transition-all duration-200"
          style={{
            background: '#ffffff',
            border: `1.5px solid ${error ? '#fca5a5' : '#d0deff'}`,
            borderRadius: '0.875rem',
            color: '#0d1c4a',
            outline: 'none',
            boxShadow: '0 1px 4px rgba(26,58,143,0.07)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? '#f87171' : '#4677f5';
            e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(239,68,68,0.12)' : 'rgba(70,119,245,0.15)'}, 0 1px 4px rgba(26,58,143,0.07)`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#fca5a5' : '#d0deff';
            e.target.style.boxShadow = '0 1px 4px rgba(26,58,143,0.07)';
          }}
        />
        <div className="flex justify-between items-center px-0.5">
          {error
            ? <p className="text-xs text-red-500">{error}</p>
            : <span />}
          <span
            className="text-xs font-medium"
            style={{ color: isNearLimit ? '#d97706' : '#8aa0cc' }}
          >
            {remaining} / {maxLength}
          </span>
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
export default memo(TextArea);
