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

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { medicines } = useHealthData();

  const pendingMedsCount = (Array.isArray(medicines) ? medicines : []).filter(m => !m.taken).length;

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Medical Reports', path: '/app/analysis', icon: FileText },
    { label: 'Health Trends', path: '/app/trends', icon: TrendingUp },
    { label: 'Find Hospital', path: '/app/hospitals', icon: MapPin },
    { 
      label: 'Medications', 
      path: '/app/medicines', 
      icon: Pill, 
      badge: pendingMedsCount > 0 ? `${pendingMedsCount} due` : null 
    },
    { label: 'Emergency', path: '/app/sos', icon: Siren, badge: '24/7' },
    { label: 'Profile', path: '/app/settings', icon: User },
    { label: 'Settings', path: '/app/settings', icon: Settings }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-white border-r border-slate-200 transition-all duration-200 hidden md:flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
          <NavLink to="/app/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#1A4B84] flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Activity className="w-5 h-5 text-[#2D90A6]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col justify-center">
                <span className="font-extrabold text-base text-[#1A4B84] leading-none tracking-tight">
                  Med<span className="text-[#2D90A6]">Guardian AI</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">Clinical Workspace</span>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path + item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1A4B84] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#2D90A6]' : 'text-slate-500'}`} />
                {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive ? 'bg-[#2D90A6] text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Emergency SOS Shortcut */}
      <div className="p-3 border-t border-slate-200">
        {!collapsed ? (
          <NavLink
            to="/app/sos"
            className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 hover:bg-rose-100/70 border border-rose-200 text-rose-800 transition-colors animate-sos-pulse"
          >
            <Siren className="w-5 h-5 text-[#DC2626] shrink-0" />
            <div className="text-left">
              <p className="text-sm font-bold text-rose-900">Emergency SOS</p>
              <p className="text-[11px] font-medium text-rose-700">1-Click Dispatch</p>
            </div>
          </NavLink>
        ) : (
          <NavLink
            to="/app/sos"
            className="flex items-center justify-center p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200"
            title="Emergency SOS"
          >
            <Siren className="w-5 h-5" />
          </NavLink>
        )}
      </div>
    </aside>
  );
};
