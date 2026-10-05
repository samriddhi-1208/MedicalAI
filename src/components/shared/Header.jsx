import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Siren, 
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
  User, 
  Settings,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../../context/HealthDataContext';
import { useTheme } from '../../context/ThemeContext';
import { formatDisplayName } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import { NotificationDropdown } from '../ui/NotificationDropdown';

export const Header = ({ collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, logout, language, setLanguage, setAppLanguage } = useHealthData();
  const { theme, toggleTheme } = useTheme();
  
  const displayName = formatDisplayName(userProfile?.name, userProfile?.email);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const t = (key) => getTranslation(language, key);

  const changeLanguage = (langCode) => {
    if (typeof setLanguage === 'function') setLanguage(langCode);
    if (typeof setAppLanguage === 'function') setAppLanguage(langCode);
  };

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
      className={`fixed top-0 right-0 z-40 h-16 bg-[var(--bg-surface)] border-b border-[var(--border-color)] transition-all duration-200 flex items-center justify-between px-2.5 sm:px-6 ${
        collapsed ? 'md:left-20' : 'md:left-64'
      } left-0`}
    >
      {/* Left Title & Workspace Info */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="min-w-0">
          <h1 className="text-xs sm:text-base font-bold text-[var(--text-main)] leading-tight truncate">
            {getPageTitle(location.pathname)}
          </h1>
          <p className="text-[11px] font-medium text-[var(--text-muted)] hidden md:block truncate mt-0.5">
            {t('patient')}: <span className="font-semibold text-[var(--text-main)]">{displayName}</span> • {t('clinicalWorkspace')}
          </p>
        </div>

        <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-subtle)] text-[var(--color-primary)] text-xs font-medium border border-[var(--border-color)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-primary)]" /> {t('authenticatedSession')}
        </span>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        
        {/* Language Selector Pill */}
        <div className="flex items-center p-1 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-color)] gap-1 text-xs">
          <button
            onClick={() => {
              changeLanguage('EN');
              toast.success("Switched to English");
            }}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
              language === 'EN'
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="Switch to English"
          >
            EN
          </button>

          <button
            onClick={() => {
              changeLanguage('HI');
              toast.success("हिंदी भाषा चुनी गई (Hindi)");
            }}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
              language === 'HI'
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="Switch to Hindi"
          >
            हिंदी
          </button>

          <button
            onClick={() => {
              changeLanguage('GU');
              toast.success("ગુજરાતી ભાષા પસંદ કરી (Gujarati)");
            }}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
              language === 'GU'
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="Switch to Gujarati"
          >
            ગુજરાતી
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer border border-[var(--border-color)]"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[var(--color-primary)]" />}
        </button>

        {/* Emergency SOS Button */}
        <button
          onClick={() => navigate('/app/sos')}
          className="med-btn med-btn-emergency py-1.5 px-3 sm:px-3.5 font-bold shrink-0 cursor-pointer rounded-xl flex items-center gap-1.5 shadow-xs"
        >
          <Siren className="w-4 h-4 text-white" /> 
          <span className="inline text-xs sm:text-[13px] font-bold">
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
            className="flex items-center gap-1 p-0.5 rounded-lg hover:bg-[var(--bg-surface-subtle)] cursor-pointer transition-all border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            aria-label="User Profile Menu"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white font-bold text-xs flex items-center justify-center border border-[var(--border-color)]">
              {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:block transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-lg z-50 py-2 text-xs divide-y divide-[var(--border-color)]">
              <div className="px-4 py-2.5">
                <p className="font-bold text-[var(--text-main)] text-sm">{displayName}</p>
                <p className="text-[var(--text-muted)] text-[11px] truncate">{userProfile?.email || ''}</p>
              </div>

              <div className="py-1">
                <Link 
                  to="/app/profile" 
                  onClick={() => setProfileOpen(false)} 
                  className="px-4 py-2 font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)] flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>{t('personalHealthProfile')}</span>
                </Link>
                <Link 
                  to="/app/settings" 
                  onClick={() => setProfileOpen(false)} 
                  className="px-4 py-2 font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)] flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>{t('applicationSettings')}</span>
                </Link>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
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
