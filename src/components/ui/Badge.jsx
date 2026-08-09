import React from 'react';

export const Badge = ({ children, variant = 'normal', className = '' }) => {
  const variants = {
    normal: "med-badge med-badge-normal",
    success: "med-badge med-badge-normal",
    warning: "med-badge med-badge-warning",
    critical: "med-badge med-badge-critical",
    lavender: "med-badge med-badge-lavender",
    info: "med-badge med-badge-info",
    neutral: "med-badge bg-[#F8FAFC] text-[#11476C] border border-[#E2E8F0]"
  };

  return (
    <span className={`${variants[variant] || variants.normal} ${className}`}>
      {children}
    </span>
  );
};
