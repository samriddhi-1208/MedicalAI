import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Siren, 
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
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
  
  const displayName = formatDisplayName(userProfile?.name, userProfile?.email);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const t = (key) => getTranslation(language, key);

  // Close profile dropdown when clicking outside
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
      className={`fixed top-0 right-0 z-40 h-16 bg-white border-b border-slate-200/90 transition-all duration-200 flex items-center justify-between px-2.5 sm:px-6 shadow-2xs ${
        collapsed ? 'md:left-20' : 'md:left-64'
      } left-0`}
    >
      {/* Left Title & Workspace Info */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="min-w-0">
          <h1 className="text-xs sm:text-base font-extrabold text-[#0F172A] leading-tight truncate tracking-tight">
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
        
        {/* Language Selector Pill (Desktop Only) */}
        <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 gap-1 text-xs">
          <button
            onClick={() => {
              setAppLanguage('EN');
              toast.success("Switched to English");
            }}
            className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
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
            className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
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
            className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              language === 'GU'
                ? 'bg-[#0F172A] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Switch to Gujarati"
          >
            ગુજરાતી
          </button>
        </div>

        {/* Compact Responsive Emergency SOS Button */}
        <button
          onClick={() => navigate('/app/sos')}
          className="med-btn med-btn-emergency text-xs py-1.5 px-2.5 sm:px-4 font-bold shrink-0 cursor-pointer rounded-xl flex items-center gap-1"
        >
          <Siren className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
          <span className="inline text-[11px] sm:text-xs">
            <span className="sm:hidden">SOS</span>
            <span className="hidden sm:inline">{t('emergencySOS')}</span>
          </span>
        </button>

        {/* Notifications Dropdown Component */}
        <NotificationDropdown />

        {/* Profile Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(prev => !prev)}
            className="flex items-center gap-1 p-0.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-all active:scale-95 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            aria-label="User Profile Menu"
          >
            <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white font-black text-xs flex items-center justify-center border border-slate-300 shadow-2xs ring-2 ring-slate-100">
              {displayName ? displayName.charAt(0).toUpperCase() : 'S'}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 hidden sm:block transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 py-2 text-xs divide-y divide-slate-100">
              <div className="px-4 py-3">
                <p className="font-black text-[#0F172A] text-sm">{displayName}</p>
                <p className="text-slate-500 text-[11px] truncate font-medium">{userProfile?.email || ''}</p>
              </div>

              {/* Mobile Language Switcher inside Profile Menu */}
              <div className="py-2 px-4 md:hidden space-y-1.5 bg-slate-50">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#0D9488]" /> Language / भाषा
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setAppLanguage('EN'); toast.success("Switched to English"); }}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg ${language === 'EN' ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-700 border'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => { setAppLanguage('HI'); toast.success("हिंदी चुनी गई"); }}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg ${language === 'HI' ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-700 border'}`}
                  >
                    हिंदी
                  </button>
                  <button
                    onClick={() => { setAppLanguage('GU'); toast.success("ગુજરાતી પસંદ કરી"); }}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg ${language === 'GU' ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-700 border'}`}
                  >
                    ગુજરાતી
                  </button>
                </div>
              </div>

              <div className="py-1">
                <Link 
                  to="/app/profile" 
                  onClick={() => setProfileOpen(false)} 
                  className="px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0F172A] flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-[#0D9488]" />
                  <span>{t('personalHealthProfile')}</span>
                </Link>
                <Link 
                  to="/app/settings" 
                  onClick={() => setProfileOpen(false)} 
                  className="px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0F172A] flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>{t('applicationSettings')}</span>
                </Link>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 font-black text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
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
