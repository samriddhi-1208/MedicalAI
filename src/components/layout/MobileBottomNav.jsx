import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, TrendingUp, Pill, Siren, User } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { getTranslation } from '../../utils/translations';

export const MobileBottomNav = () => {
  const { language } = useHealthData();
  const t = (key) => getTranslation(language, key);

  const navItems = [
    { label: t('dashboard'), path: '/app/dashboard', icon: Home },
    { label: 'Reports', path: '/app/analysis', icon: FileText },
    { label: 'Trends', path: '/app/trends', icon: TrendingUp },
    { label: 'Meds', path: '/app/medicines', icon: Pill },
    { label: 'SOS', path: '/app/sos', icon: Siren, isEmergency: true },
    { label: t('profile'), path: '/app/profile', icon: User },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 py-1.5 shadow-2xl safe-area-bottom"
    >
      <div className="flex items-center justify-between w-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-h-[44px] px-1.5 py-1 rounded-xl transition-all flex-1 ${
                  item.isEmergency
                    ? 'text-[#DC2626] font-black'
                    : isActive
                    ? 'text-[#0F172A] font-extrabold scale-105'
                    : 'text-slate-500 font-bold hover:text-slate-900'
                }`
              }
            >
              <Icon className={`w-5 h-5 shrink-0 ${item.isEmergency ? 'text-[#DC2626] animate-pulse' : ''}`} />
              <span className="text-[10px] leading-tight mt-0.5 font-bold whitespace-nowrap text-center truncate max-w-[54px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
