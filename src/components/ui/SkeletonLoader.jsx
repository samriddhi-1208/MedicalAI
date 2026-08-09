import React from 'react';

export const SkeletonLoader = ({ className = '', variant = 'card' }) => {
  if (variant === 'table') {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-10 bg-slate-800/60 rounded-xl w-full" />
        <div className="h-12 bg-slate-800/40 rounded-xl w-full" />
        <div className="h-12 bg-slate-800/40 rounded-xl w-full" />
        <div className="h-12 bg-slate-800/40 rounded-xl w-full" />
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className="w-full h-64 bg-slate-800/30 rounded-2xl animate-pulse flex items-end p-6 gap-4">
        <div className="h-1/3 bg-slate-800/60 w-full rounded-t-lg" />
        <div className="h-2/3 bg-slate-800/60 w-full rounded-t-lg" />
        <div className="h-1/2 bg-slate-800/60 w-full rounded-t-lg" />
        <div className="h-3/4 bg-slate-800/60 w-full rounded-t-lg" />
        <div className="h-2/5 bg-slate-800/60 w-full rounded-t-lg" />
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 animate-pulse rounded-2xl ${className}`} />
  );
};
