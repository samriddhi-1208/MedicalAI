import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Siren, 
  ChevronDown, 
  Bell,
  Globe,
  Share2,
  PhoneCall,
  MoreHorizontal,
  LogOut,
  ShieldCheck,
  User,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../../context/HealthDataContext';
import { formatDisplayName } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';

export const Header = ({ collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, notifications, logout, language, setLanguage } = useHealthData();
  
  const displayName = formatDisplayName(userProfile?.name);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [moreToolsOpen, setMoreToolsOpen] = useState(false);

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

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`🏥 MedGuardian AI Patient Record: View health updates for ${displayName} on MedGuardian AI.`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    toast.success("Opening WhatsApp share...");
  };

  const cycleLanguage = () => {
    if (language === 'EN') {
      setLanguage('HI');
      toast.success("भाषा बदलकर हिंदी की गई");
    } else if (language === 'HI') {
      setLanguage('GU');
      toast.success("ભાષા બદલીને ગુજરાતી કરવામાં આવી");
    } else {
      setLanguage('EN');
      toast.success("Switched to English");
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white border-b border-slate-200 transition-all duration-200 flex items-center justify-between px-4 sm:px-6 shadow-2xs ${
        collapsed ? 'md:left-20' : 'md:left-64'
      } left-0`}
    >
      {/* Left Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-[#1A4B84] leading-tight truncate tracking-tight">
            {getPageTitle(location.pathname)}
          </h1>
          <p className="text-xs font-medium text-slate-500 hidden sm:block truncate mt-0.5">
            {t('patient')}: <span className="font-bold text-slate-800">{displayName}</span> • {t('clinicalWorkspace')}
          </p>
        </div>

        <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF6F8] text-[#2D90A6] text-xs font-semibold border border-[#2D90A6]/30">
          <ShieldCheck className="w-3.5 h-3.5" /> {t('authenticatedSession')}
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Language & Tools Selector Button */}
        <div className="relative">
          <button
            onClick={() => setMoreToolsOpen(!moreToolsOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
            title="Patient Tools & Language"
          >
            <Globe className="w-4 h-4 text-[#2D90A6]" />
            <span className="font-bold text-[#1A4B84]">
              {language === 'HI' ? 'हिंदी' : language === 'GU' ? 'ગુજરાતી' : 'EN'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {moreToolsOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 text-xs space-y-1 animate-in fade-in duration-150">
              <button
                onClick={() => {
                  setLanguage('EN');
                  setMoreToolsOpen(false);
                  toast.success("Language: English");
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-semibold cursor-pointer ${language === 'EN' ? 'bg-[#EBF6F8] text-[#1A4B84]' : 'hover:bg-slate-50 text-slate-800'}`}
              >
                <span>English (EN)</span>
                {language === 'EN' && <span className="font-bold">✓</span>}
              </button>

              <button
                onClick={() => {
                  setLanguage('HI');
                  setMoreToolsOpen(false);
                  toast.success("भाषा: हिंदी (Hindi)");
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-semibold cursor-pointer ${language === 'HI' ? 'bg-[#EBF6F8] text-[#1A4B84]' : 'hover:bg-slate-50 text-slate-800'}`}
              >
                <span>Hindi (हिंदी)</span>
                {language === 'HI' && <span className="font-bold">✓</span>}
              </button>

              <button
                onClick={() => {
                  setLanguage('GU');
                  setMoreToolsOpen(false);
                  toast.success("ભાષા: ગુજરાતી (Gujarati)");
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-semibold cursor-pointer ${language === 'GU' ? 'bg-[#EBF6F8] text-[#1A4B84]' : 'hover:bg-slate-50 text-slate-800'}`}
              >
                <span>Gujarati (ગુજરાતી)</span>
                {language === 'GU' && <span className="font-bold">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Emergency SOS Button */}
        <button
          onClick={() => navigate('/app/sos')}
          className="med-btn med-btn-emergency text-xs sm:text-sm py-1.5 px-3 sm:px-4 font-bold shrink-0 cursor-pointer rounded-xl"
        >
          <Siren className="w-4 h-4" /> <span>{t('emergencySOS')}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative border border-slate-200 cursor-pointer transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2D90A6] rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-[#1A4B84] border-b border-slate-100 pb-2">
                <span>{t('notifications')}</span>
              </div>
              <p className="text-slate-500 py-2">No unread notifications.</p>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#1A4B84] text-white font-bold text-xs flex items-center justify-center border border-slate-300 shadow-2xs">
              {displayName ? displayName.charAt(0) : 'S'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 text-xs">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="font-bold text-[#1A4B84] text-sm">{displayName}</p>
                <p className="text-slate-500 text-[11px] truncate font-medium">{userProfile?.email || ''}</p>
              </div>
              <Link 
                to="/app/profile" 
                onClick={() => setProfileOpen(false)} 
                className="px-4 py-2.5 font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-[#2D90A6]" />
                <span>{t('personalHealthProfile')}</span>
              </Link>
              <Link 
                to="/app/settings" 
                onClick={() => setProfileOpen(false)} 
                className="px-4 py-2.5 font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('applicationSettings')}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
