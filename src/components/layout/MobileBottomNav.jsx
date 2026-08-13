import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, TrendingUp, User } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { getTranslation } from '../../utils/translations';

export const MobileBottomNav = () => {
  const { language } = useHealthData();
  const t = (key) => getTranslation(language, key);

  const navItems = [
    { label: t('dashboard'), path: '/app/dashboard', icon: Home },
    { label: t('medicalReports'), path: '/app/analysis', icon: FileText },
    { label: t('healthTrends'), path: '/app/trends', icon: TrendingUp },
    { label: t('profile'), path: '/app/profile', icon: User },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 shadow-lg"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#1A4B84] font-extrabold scale-105'
                    : 'text-slate-500 font-medium hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] leading-none mt-1 truncate max-w-[70px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
