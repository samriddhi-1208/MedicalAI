import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  BrainCircuit, 
  MapPin, 
  Pill, 
  Siren, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Shield
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { medicines } = useHealthData();

  const pendingMedsCount = medicines.filter(m => !m.taken).length;

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Upload Report', path: '/app/upload', icon: Upload },
    { label: 'AI Diagnosis & Analysis', path: '/app/analysis', icon: BrainCircuit },
    { label: 'Hospital Finder', path: '/app/hospitals', icon: MapPin },
    { 
      label: 'Medicine Reminders', 
      path: '/app/medicines', 
      icon: Pill, 
      badge: pendingMedsCount > 0 ? `${pendingMedsCount} due` : null 
    },
    { label: 'Emergency SOS', path: '/app/sos', icon: Siren, badge: '24/7' },
    { label: 'Settings', path: '/app/settings', icon: Settings }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-[#FFFFFF] border-r border-[#E2E8F0] transition-all duration-200 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#E2E8F0]">
          <NavLink to="/app/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#11476C] flex items-center justify-center text-white shrink-0">
              <Shield className="w-4.5 h-4.5 text-[#77CAF3]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col justify-center">
                <span className="font-semibold text-base text-[#11476C] leading-none">MedGuardian <span className="text-[#77CAF3]">AI</span></span>
                <span className="text-xs text-[#475569] font-normal mt-0.5">Patient Portal</span>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] hidden md:block"
            aria-label="Toggle navigation"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Items with 14px Medium Typography */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#F0F9FF] text-[#11476C] font-semibold border-l-4 border-[#11476C]'
                    : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#11476C]' : 'text-[#475569]'}`} />
                {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#E0F2FE] text-[#11476C]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* SOS Button at bottom */}
      <div className="p-3 border-t border-[#E2E8F0]">
        {!collapsed ? (
          <NavLink
            to="/app/sos"
            className="flex items-center gap-3 p-3 rounded-lg bg-[#FEE2E2] hover:bg-[#FCA5A5]/30 border border-[#FCA5A5] text-[#DC2626] transition-colors animate-sos-pulse"
          >
            <Siren className="w-5 h-5 text-[#EF4444] shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold text-[#DC2626]">Emergency SOS</p>
              <p className="text-xs font-normal text-[#DC2626]">1-Click Dispatch</p>
            </div>
          </NavLink>
        ) : (
          <NavLink
            to="/app/sos"
            className="flex items-center justify-center p-2.5 rounded-lg bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5]"
            title="Emergency SOS"
          >
            <Siren className="w-5 h-5" />
          </NavLink>
        )}
      </div>
    </aside>
  );
};
