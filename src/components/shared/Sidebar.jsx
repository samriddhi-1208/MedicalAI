import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  MapPin, 
  Pill, 
  Siren, 
  User, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Activity
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { getTranslation } from '../../utils/translations';

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { medicines, language } = useHealthData();

  const pendingMedsCount = (Array.isArray(medicines) ? medicines : []).filter(m => !m.taken).length;
  const t = (key) => getTranslation(language, key);

  const navItems = [
    { label: t('dashboard'), path: '/app/dashboard', icon: LayoutDashboard },
    { label: t('medicalReports'), path: '/app/analysis', icon: FileText },
    { label: t('healthTrends'), path: '/app/trends', icon: TrendingUp },
    { label: t('findHospital'), path: '/app/hospitals', icon: MapPin },
    { 
      label: t('medications'), 
      path: '/app/medicines', 
      icon: Pill, 
      badge: pendingMedsCount > 0 ? `${pendingMedsCount} due` : null 
    },
    { label: t('emergency'), path: '/app/sos', icon: Siren, badge: '24/7' },
    { label: t('profile'), path: '/app/profile', icon: User },
    { label: t('settings'), path: '/app/settings', icon: Settings }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-[var(--bg-surface)] border-r border-[var(--border-color)] transition-all duration-200 hidden md:flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--border-color)]">
          <NavLink to="/app/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Activity className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col justify-center">
                <span className="font-bold text-base text-[var(--text-main)] leading-none tracking-tight">
                  Med<span className="text-[var(--color-primary)]">Guardian AI</span>
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider mt-0.5">{t('clinicalWorkspace')}</span>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
            aria-label="Toggle navigation bar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path + item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white font-semibold'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-main)]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Emergency SOS Fixed Bottom Shortcut */}
      <div className="p-3 border-t border-[var(--border-color)]">
        {!collapsed ? (
          <NavLink
            to="/app/sos"
            className="flex items-center gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 transition-colors animate-sos-pulse"
          >
            <Siren className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-rose-900 dark:text-rose-100">{t('emergencySOS')}</p>
              <p className="text-[10px] font-medium text-rose-700 dark:text-rose-300">{t('oneClickDispatch')}</p>
            </div>
          </NavLink>
        ) : (
          <NavLink
            to="/app/sos"
            className="flex items-center justify-center p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
            title={t('emergencySOS')}
          >
            <Siren className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </NavLink>
        )}
      </div>
    </aside>
  );
};
