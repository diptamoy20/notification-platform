import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 transition-opacity" 
        style={{ background: 'rgba(13, 28, 74, 0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ 
          border: '1px solid #d0deff',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#eef4ff' }}>
          <h3 className="text-lg font-bold" style={{ color: '#0d1c4a' }}>
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5" style={{ color: '#0d1c4a' }}>
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: '#eef4ff', background: '#fafcff' }}>
          <button 
            onClick={onClose}
            className="btn-navy"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
