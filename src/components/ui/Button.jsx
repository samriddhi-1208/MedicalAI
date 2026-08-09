import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled = false,
  ...props
}) => {
  const base = "med-btn";
  
  const variants = {
    primary: "med-btn-primary",
    secondary: "med-btn-secondary",
    skyblue: "med-btn-skyblue",
    teal: "med-btn-skyblue",
    emerald: "med-btn-skyblue",
    danger: "med-btn-sos",
    sos: "med-btn-sos",
    outline: "med-btn-secondary",
    ghost: "bg-transparent text-[#11476C] hover:bg-[#F8FAFC]",
    glass: "med-btn-secondary"
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};
