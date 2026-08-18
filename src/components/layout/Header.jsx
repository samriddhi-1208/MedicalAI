import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Siren, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings,
  Globe
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
  const profileRef = useRef(null);

  const t = (key) => getTranslation(language, key);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      className={`fixed top-0 right-0 z-40 h-16 bg-white border-b border-slate-200 transition-all duration-200 flex items-center justify-between px-3 sm:px-6 ${
        collapsed ? 'md:left-20' : 'md:left-64'
      } left-0`}
    >
      {/* Left Title & Patient Context */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-[#0F172A] leading-tight truncate">
            {getPageTitle(location.pathname)}
          </h1>
          <p className="text-xs text-slate-500 hidden md:block truncate">
            Patient: <span className="font-semibold text-slate-800">{displayName}</span>
          </p>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Language Selector (Desktop) */}
        <div className="hidden md:flex items-center p-0.5 rounded-md bg-slate-100 border border-slate-200 gap-0.5 text-xs">
          <button
            onClick={() => {
              setAppLanguage('EN');
              toast.success("Switched to English");
            }}
            className={`px-2 py-1 rounded font-semibold transition-colors cursor-pointer ${
              language === 'EN'
                ? 'bg-[#0F172A] text-white'
                : 'text-slate-600 hover:text-slate-900'
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
            className={`px-2 py-1 rounded font-semibold transition-colors cursor-pointer ${
              language === 'HI'
                ? 'bg-[#0F172A] text-white'
                : 'text-slate-600 hover:text-slate-900'
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
            className={`px-2 py-1 rounded font-semibold transition-colors cursor-pointer ${
              language === 'GU'
                ? 'bg-[#0F172A] text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Switch to Gujarati"
          >
            ગુજરાતી
          </button>
        </div>

        {/* Emergency SOS Header Button */}
        <button
          onClick={() => navigate('/app/sos')}
          className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1.5 transition-colors"
        >
          <Siren className="w-3.5 h-3.5" /> 
          <span>{t('emergencySOS')}</span>
        </button>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* Profile Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(prev => !prev)}
            className="flex items-center gap-1 p-1 rounded-md hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none"
            aria-label="User Profile Menu"
          >
            <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center border border-slate-300">
              {displayName ? displayName.charAt(0).toUpperCase() : 'S'}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 hidden sm:block transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1.5 text-xs divide-y divide-slate-100">
              <div className="px-3 py-2">
                <p className="font-bold text-[#0F172A] text-xs">{displayName}</p>
                <p className="text-slate-500 text-[11px] truncate font-normal">{userProfile?.email || ''}</p>
              </div>

              <div className="py-1">
                <Link 
                  to="/app/profile" 
                  onClick={() => setProfileOpen(false)} 
                  className="px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0F172A] flex items-center gap-2 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>{t('personalHealthProfile')}</span>
                </Link>
                <Link 
                  to="/app/settings" 
                  onClick={() => setProfileOpen(false)} 
                  className="px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0F172A] flex items-center gap-2 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('applicationSettings')}</span>
                </Link>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
