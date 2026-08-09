import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-[#0F172A]/40">
      <div className={`relative w-full ${maxWidth} bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-xl z-10 overflow-hidden my-8`}>
        
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-[#475569] hover:text-[#0F172A] rounded-lg hover:bg-[#E2E8F0]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-5 text-[#0F172A]">
          {children}
        </div>
      </div>
    </div>
  );
};
