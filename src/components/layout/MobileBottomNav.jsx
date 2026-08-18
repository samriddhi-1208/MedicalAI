import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, TrendingUp, Pill, Siren, User } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { getTranslation } from '../../utils/translations';

export const MobileBottomNav = () => {
  const { language } = useHealthData();
  const t = (key) => getTranslation(language, key);

  const navItems = [
    { label: t('dashboard'), path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Reports', path: '/app/analysis', icon: FileText },
    { label: 'Trends', path: '/app/trends', icon: TrendingUp },
    { label: 'Meds', path: '/app/medicines', icon: Pill },
    { label: 'SOS', path: '/app/sos', icon: Siren, isEmergency: true },
    { label: t('profile'), path: '/app/profile', icon: User },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-1 py-1 shadow-lg safe-area-bottom"
    >
      <div className="flex items-center justify-between w-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-h-[44px] px-1 py-1 rounded transition-colors flex-1 ${
                  item.isEmergency
                    ? 'text-red-600 font-bold'
                    : isActive
                    ? 'text-[#0F172A] font-bold'
                    : 'text-slate-500 font-medium hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[10px] leading-tight mt-0.5 font-semibold text-center truncate max-w-[54px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
