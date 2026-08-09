import React from 'react';

export const Card = ({
  children,
  className = '',
  padding = 'p-7',
  ...props
}) => {
  return (
    <div className={`med-card ${padding} ${className}`} {...props}>
      {children}
    </div>
  );
};
