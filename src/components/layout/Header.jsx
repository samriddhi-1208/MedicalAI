import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Siren, 
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
  User, 
  Settings,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../../context/HealthDataContext';
import { formatDisplayName } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import { NotificationDropdown } from '../ui/NotificationDropdown';

export const Header = ({ collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, logout, language, setAppLanguage } = useHealthData();
  
  const displayName = formatDisplayName(userProfile?.name);
  const [profileOpen, setProfileOpen] = useState(false);

  const t = (key) => getTranslation(language, key);

  const handleSignOut = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  const getPageTitle = (path) => {
    switch (path) {
      case '/app/dashboard': return t('dashboard');
      case '/app/upload': return t('uploadMedicalReport');
      case '/app/analysis': return t('aiDiagnosticAnalysis');
      case '/app/trends': return t('healthTrends');
      case '/app/hospitals': return t('findHospital');
      case '/app/medicines': return t('medications');
      case '/app/sos': return t('emergencySOS');
      case '/app/profile': return t('personalHealthProfile');
      case '/app/settings': return t('applicationSettings');
      default: return 'MedGuardian AI';
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white border-b border-slate-200/90 transition-all duration-200 flex items-center justify-between px-3 sm:px-6 shadow-2xs ${
        collapsed ? 'md:left-20' : 'md:left-64'
      } left-0 overflow-x-hidden`}
    >
      {/* Left Title & Workspace Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-extrabold text-[#0F172A] leading-tight truncate tracking-tight">
            {getPageTitle(location.pathname)}
          </h1>
          <p className="text-[11px] font-medium text-slate-500 hidden md:block truncate mt-0.5">
            {t('patient')}: <span className="font-bold text-[#1E293B]">{displayName}</span> • {t('clinicalWorkspace')}
          </p>
        </div>

        <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[#0D9488] text-xs font-bold border border-slate-200/80">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" /> {t('authenticatedSession')}
        </span>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        
        {/* Language Selector Pill */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 gap-1 text-xs">
          <button
            onClick={() => {
              setAppLanguage('EN');
              toast.success("Switched to English");
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              language === 'EN'
                ? 'bg-[#0F172A] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Switch to English"
          >
            EN
          </button>

          <button
            onClick={() => {
              setAppLanguage('HI');
              toast.success("हिंदी भाषा चुनी गई (Hindi)");
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              language === 'HI'
                ? 'bg-[#0F172A] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Switch to Hindi"
          >
            हिंदी
          </button>

          <button
            onClick={() => {
              setAppLanguage('GU');
              toast.success("ગુજરાતી ભાષા પસંદ કરી (Gujarati)");
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              language === 'GU'
                ? 'bg-[#0F172A] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Switch to Gujarati"
          >
            ગુજરાતી
          </button>
        </div>

        {/* Emergency SOS Button */}
        <button
          onClick={() => navigate('/app/sos')}
          className="med-btn med-btn-emergency text-xs py-1.5 px-3 sm:px-4 font-bold shrink-0 cursor-pointer rounded-xl flex items-center gap-1.5"
        >
          <Siren className="w-4 h-4" /> 
          <span className="inline">{t('emergencySOS')}</span>
        </button>

        {/* Notifications Dropdown Component */}
        <NotificationDropdown />

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white font-extrabold text-xs flex items-center justify-center border border-slate-300 shadow-2xs">
              {displayName ? displayName.charAt(0) : 'S'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 text-xs animate-in fade-in duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="font-extrabold text-[#0F172A] text-sm">{displayName}</p>
                <p className="text-slate-500 text-[11px] truncate font-medium">{userProfile?.email || ''}</p>
              </div>
              <Link 
                to="/app/profile" 
                onClick={() => setProfileOpen(false)} 
                className="px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-[#0D9488]" />
                <span>{t('personalHealthProfile')}</span>
              </Link>
              <Link 
                to="/app/settings" 
                onClick={() => setProfileOpen(false)} 
                className="px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>{t('applicationSettings')}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 font-extrabold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
