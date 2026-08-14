import { memo } from 'react';

/**
 * Button — deep navy theme matching System Notifications design.
 * primary   → solid navy gradient (matches Login CTA)
 * secondary → outlined navy (pagination Prev/Next)
 * danger    → solid red
 * ghost     → transparent
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  id,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const base = `
    inline-flex items-center justify-center font-bold select-none
    transition-all duration-200 focus:outline-none
    focus:ring-2 focus:ring-blue-400/40 focus:ring-offset-2
  `;

  const variants = {
    primary:   'btn-navy',
    secondary: 'btn-navy-outline',
    danger:    'bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-200 font-bold',
    ghost:     'hover:bg-blue-50 text-[#1a3a8f] rounded-xl',
    outline:   'border-2 border-[#b4ccff] hover:bg-[#eef4ff] text-[#1a3a8f] rounded-xl',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs gap-1.5 rounded-xl',
    md: 'px-5 py-2.5 text-sm gap-2 rounded-[0.875rem]',
    lg: 'px-7 py-3.5 text-base gap-2.5 rounded-[0.875rem]',
  };

  return (
    <button
      id={id}
      disabled={isDisabled}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? 'opacity-45 cursor-not-allowed !transform-none !shadow-none' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            style={{ color: variant === 'secondary' ? '#1a3a8f' : '#ffffff' }}
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Sending…</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default memo(Button);
