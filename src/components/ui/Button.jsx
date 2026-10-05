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
  const base = "med-btn cursor-pointer inline-flex items-center justify-center gap-2 font-bold transition-all";
  
  const sizes = {
    sm: "px-3.5 py-2 text-xs min-h-[36px]",
    md: "px-4.5 py-2.5 text-sm min-h-[42px]",
    lg: "px-6 py-3 text-base min-h-[48px]"
  };

  const variants = {
    primary: "med-btn-primary",
    secondary: "med-btn-secondary",
    teal: "med-btn-teal",
    skyblue: "med-btn-teal",
    emerald: "med-btn-teal",
    danger: "med-btn-sos",
    sos: "med-btn-sos",
    outline: "med-btn-secondary",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    glass: "med-btn-secondary"
  };

  const sizeClass = (/\bpx-\d|\bpy-\d/.test(className)) ? '' : (sizes[size] || sizes.md);

  return (
    <button
      className={`${base} ${sizeClass} ${variants[variant] || variants.primary} ${className}`.trim()}
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
