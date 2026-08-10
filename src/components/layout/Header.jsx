import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Siren, 
  ChevronDown, 
  Bell,
  Globe,
  Share2,
  PhoneCall,
  Wifi,
  Mic,
  Volume2,
  MoreHorizontal,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../../context/HealthDataContext';

export const Header = ({ collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, notifications, clearAllData, language, setLanguage } = useHealthData();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [moreToolsOpen, setMoreToolsOpen] = useState(false);

  const handleSignOut = () => {
    setProfileOpen(false);
    localStorage.removeItem('medguardian_token');
    localStorage.removeItem('medguardian_user_profile');
    clearAllData();
    toast.success("Signed out successfully. Returning to Create Account...");
    navigate('/signup');
  };

  const getPageTitle = (path) => {
    switch (path) {
      case '/app/dashboard': 
        if (language === 'HI') return 'मरीज़ डैशबोर्ड';
        if (language === 'GU') return 'દર્દી ડેશબોર્ડ';
        return 'Patient Dashboard';
      case '/app/upload': 
        if (language === 'HI') return 'रिपोर्ट अपलोड करें';
        if (language === 'GU') return 'રિપોર્ટ અપલોડ કરો';
        return 'Upload Medical Report';
      case '/app/analysis': 
        if (language === 'HI') return 'एआई जांच विश्लेषण';
        if (language === 'GU') return 'એઆઈ નિદાન નિષ્કર્ષ';
        return 'AI Diagnostic Analysis';
      case '/app/hospitals': 
        if (language === 'HI') return '24/7 नजदीकी अस्पताल';
        if (language === 'GU') return '24/7 નજીકની હોસ્પિટલ';
        return '24/7 Hospital Finder';
      case '/app/medicines': 
        if (language === 'HI') return 'दवा रिमाइंडर';
        if (language === 'GU') return 'દવા રિમાઇન્ડર';
        return 'Medication Schedule';
      case '/app/sos': 
        if (language === 'HI') return 'इमरजेंसी 108 एसओएस';
        if (language === 'GU') return 'ઇમરજન્સી 108 એસઓએસ';
        return 'Emergency SOS Center';
      case '/app/settings': 
        if (language === 'HI') return 'खाता सेटिंग्स';
        if (language === 'GU') return 'એકાઉન્ટ સેટિંગ્સ';
        return 'Account Settings';
      default: return 'MedGuardian AI';
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`🏥 MedGuardian AI Patient Record: View health updates for ${userProfile.name} on MedGuardian AI.`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    toast.success("Opening WhatsApp share...");
  };

  const cycleLanguage = () => {
    if (language === 'EN') {
      setLanguage('HI');
      toast.success("Switched to Hindi (हिंदी)");
    } else if (language === 'HI') {
      setLanguage('GU');
      toast.success("Switched to Gujarati (ગુજરાતી)");
    } else {
      setLanguage('EN');
      toast.success("Switched to English");
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'GU' ? 'gu-IN' : language === 'HI' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
      toast.loading("Listening... Speak now...", { id: 'voice-toast' });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      toast.dismiss('voice-toast');
      toast.success(`Recognized: "${transcript}"`);

      const lower = transcript.toLowerCase();
      if (lower.includes('hospital') || lower.includes('હોસ્પિટલ') || lower.includes('अस्पताल')) {
        navigate('/app/hospitals');
      } else if (lower.includes('upload') || lower.includes('અપલોડ') || lower.includes('अपलोड')) {
        navigate('/app/upload');
      } else if (lower.includes('medicine') || lower.includes('દવા') || lower.includes('दवा')) {
        navigate('/app/medicines');
      } else if (lower.includes('sos') || lower.includes('help') || lower.includes('મદદ')) {
        navigate('/app/sos');
      }
    };

    recognition.onerror = () => {
      toast.dismiss('voice-toast');
    };

    recognition.onend = () => {
      toast.dismiss('voice-toast');
    };

    recognition.start();
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] transition-all duration-200 flex items-center justify-between px-4 sm:px-6 shadow-xs ${
        collapsed ? 'md:left-20' : 'md:left-64'
      } left-0`}
    >
      {/* Left & Center-Left Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-[#11476C] leading-tight truncate">
            {getPageTitle(location.pathname)}
          </h1>
          <p className="text-xs font-normal text-[#475569] hidden sm:block truncate mt-0.5">
            Patient: <span className="font-medium text-[#0F172A]">{userProfile.name}</span> • Ayushman PM-JAY
          </p>
        </div>

        <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-medium border border-[#BBF7D0]">
          <Wifi className="w-3.5 h-3.5" /> 2G/3G Fast
        </span>
      </div>

      {/* Right Essential Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Secondary Tools Menu Popover */}
        <div className="relative">
          <button
            onClick={() => setMoreToolsOpen(!moreToolsOpen)}
            className="p-2 rounded-lg text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] border border-[#E2E8F0] flex items-center gap-1 text-xs font-medium cursor-pointer"
            title="Patient Tools & Language"
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="hidden lg:inline">Tools</span>
          </button>

          {moreToolsOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-lg z-50 p-2 text-xs space-y-1">
              <button
                onClick={() => {
                  cycleLanguage();
                  setMoreToolsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-between text-[#0F172A] font-medium cursor-pointer"
              >
                <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-[#11476C]" /> Language</span>
                <span className="text-xs font-bold text-[#11476C]">
                  {language === 'HI' ? 'Hindi (हिंदी)' : language === 'GU' ? 'Gujarati (ગુજ)' : 'English (EN)'}
                </span>
              </button>

              <button
                onClick={() => {
                  startVoiceInput();
                  setMoreToolsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F8FAFC] flex items-center gap-2 text-[#0F172A] font-medium cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-[#11476C]" /> 
                {language === 'HI' ? 'Voice Search (आवाज से बोलें)' : language === 'GU' ? 'Voice Search (અવાજથી બોલો)' : 'Voice Search'}
              </button>

              <button
                onClick={() => {
                  toast.success("Dialing National Ambulance Helpline 108...");
                  navigate('/app/sos');
                  setMoreToolsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FEE2E2] flex items-center gap-2 text-[#DC2626] font-medium cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#EF4444]" /> 108 Ambulance Helpline
              </button>

              <button
                onClick={() => {
                  handleShareWhatsApp();
                  setMoreToolsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#DCFCE7] flex items-center gap-2 text-[#16A34A] font-medium cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Share via WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* Emergency SOS Button */}
        <button
          onClick={() => navigate('/app/sos')}
          className="med-btn med-btn-sos text-xs sm:text-sm py-1.5 px-3 sm:px-4 font-semibold shrink-0 cursor-pointer"
        >
          <Siren className="w-4 h-4" /> <span>Emergency SOS</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-lg text-[#475569] hover:bg-[#F8FAFC] relative border border-[#E2E8F0] cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#11476C] rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-lg z-50 p-3 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-2">
                <span>Notifications</span>
                <span className="text-[#11476C] font-normal cursor-pointer">Mark read</span>
              </div>
              <p className="text-[#475569] py-2">No unread notifications.</p>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-[#F8FAFC] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#F0F9FF] text-[#11476C] font-semibold text-xs flex items-center justify-center border border-[#77CAF3]/40 shadow-2xs">
              {userProfile.name ? userProfile.name.charAt(0) : 'P'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#475569] hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-xl z-50 py-1.5 text-xs">
              <div className="px-4 py-2.5 border-b border-[#E2E8F0]">
                <p className="font-bold text-[#11476C]">{userProfile.name}</p>
                <p className="text-[#64748B] text-[11px] truncate">{userProfile.email || 'patient@example.com'}</p>
              </div>
              <Link to="/app/settings" onClick={() => setProfileOpen(false)} className="block px-4 py-2 font-semibold text-[#0F172A] hover:bg-[#F8FAFC]">
                Profile & Vitals
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 font-bold text-[#DC2626] hover:bg-[#FEE2E2] flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out (Create Account)</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
