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
      className={`fixed top-0 left-0 z-30 h-screen bg-white border-r border-slate-200 transition-all duration-200 hidden md:flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          <NavLink to="/app/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-md bg-[#0F172A] flex items-center justify-center text-white shrink-0 font-bold">
              <Activity className="w-4 h-4 text-[#0D9488]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col justify-center">
                <span className="font-bold text-sm text-[#0F172A] leading-tight">
                  Med<span className="text-[#0D9488]">Guardian AI</span>
                </span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Clinical Workspace</span>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-2.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path + item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#0F172A] text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0D9488]' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                    isActive ? 'bg-[#0D9488] text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Emergency SOS Compact Shortcut */}
      <div className="p-2.5 border-t border-slate-200">
        {!collapsed ? (
          <NavLink
            to="/app/sos"
            className="flex items-center gap-2.5 p-2 rounded-md bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 transition-colors"
          >
            <Siren className="w-4 h-4 text-red-600 shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-red-900 truncate">Emergency SOS</p>
              <p className="text-[10px] text-red-700 truncate">1-Click Dispatch</p>
            </div>
          </NavLink>
        ) : (
          <NavLink
            to="/app/sos"
            className="flex items-center justify-center p-2 rounded-md bg-red-50 text-red-600 border border-red-200"
            title="Emergency SOS"
          >
            <Siren className="w-4 h-4 text-red-600" />
          </NavLink>
        )}
      </div>
    </aside>
  );
};
