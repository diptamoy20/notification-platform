import { useRef, memo } from 'react';

/**
 * SearchBar — ice-blue / navy theme matching System Notifications design.
 */
const SearchBar = ({ value, onChange, placeholder = 'Search…', id = 'search-bar' }) => {
  const inputRef = useRef(null);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          style={{ color: '#4677f5' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-sm transition-all duration-200"
        style={{
          background: '#ffffff',
          border: '1.5px solid #d0deff',
          borderRadius: '0.875rem',
          color: '#0d1c4a',
          outline: 'none',
          boxShadow: '0 1px 4px rgba(26,58,143,0.07)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#4677f5';
          e.target.style.boxShadow = '0 0 0 3px rgba(70,119,245,0.15), 0 1px 4px rgba(26,58,143,0.07)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d0deff';
          e.target.style.boxShadow = '0 1px 4px rgba(26,58,143,0.07)';
        }}
      />

      {value && (
        <button
          id="search-clear-btn"
          onClick={() => { onChange(''); inputRef.current?.focus(); }}
          className="absolute inset-y-0 right-3 flex items-center transition-colors"
          style={{ color: '#8aa0cc' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#1a3a8f'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#8aa0cc'}
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default memo(SearchBar);
