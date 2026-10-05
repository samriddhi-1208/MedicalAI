import React from 'react';

export const Card = ({
  children,
  className = '',
  padding = '',
  ...props
}) => {
  const padClass = padding || (/\bp-\d|\bpx-\d|\bpy-\d/.test(className) ? '' : 'p-5 sm:p-6');
  return (
    <div className={`med-card ${padClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};
