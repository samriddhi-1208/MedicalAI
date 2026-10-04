import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, TrendingUp, User } from 'lucide-react';

export const MobileNav = () => {
  const navItems = [
    { label: 'Home', path: '/app/dashboard', icon: Home },
    { label: 'Reports', path: '/app/analysis', icon: FileText },
    { label: 'Trends', path: '/app/trends', icon: TrendingUp },
    { label: 'Profile', path: '/app/settings', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#0D9488] font-extrabold scale-105'
                    : 'text-slate-500 font-medium hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] leading-none">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
