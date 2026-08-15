import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#0F172A]/60 backdrop-blur-xs">
      <div className={`relative w-[calc(100%-24px)] ${maxWidth} max-h-[calc(100vh-32px)] bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150`}>
        
        {/* Fixed Non-scrolling Header */}
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-200/90 bg-slate-50 shrink-0">
            <h3 className="text-xs sm:text-sm font-black text-[#0F172A] truncate pr-2">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-[#0F172A] rounded-lg hover:bg-slate-200 cursor-pointer shrink-0 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-5 text-[#0F172A] overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
