import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Siren, 
  PhoneCall, 
  MapPin, 
  Users, 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  Building2, 
  Phone,
  Navigation,
  Compass,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Share2,
  MessageSquare,
  Heart,
  Activity,
  ArrowLeft,
  LifeBuoy,
  Zap,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { emergencyService } from '../services/emergencyService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const EmergencySOSPage = () => {
  const location = useLocation();
  const isPublicStandalone = !location.pathname.startsWith('/app');

  const { 
    userProfile, 
    emergencyContacts, 
    addEmergencyContact, 
    deleteEmergencyContact, 
    triggerSOS, 
    cancelSOS, 
    language,
    isAuthenticated 
  } = useHealthData();
  
  const t = (key) => getTranslation(language, key);
  
  // Real-Time GPS Location State
  const [userCoords, setUserCoords] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // Live Hospital Search State
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  // SOS Workflow & Dispatch State
  const [sosStep, setSosStep] = useState('idle'); // 'idle' | 'dispatching' | 'active'
  const [sosStatusChecklist, setSosStatusChecklist] = useState({
    locationAcquired: false,
    hospitalsFound: false,
    contactsAlerted: false
  });

  // Offline / LocalStorage Emergency Contacts Fallback for Unauthenticated Users
  const [localContacts, setLocalContacts] = useState(() => {
    try {
      const saved = localStorage.getItem('medguardian_emergency_contacts_cache');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Effective trusted contacts list
  const activeContactsList = (Array.isArray(emergencyContacts) && emergencyContacts.length > 0)
    ? emergencyContacts
    : (localContacts.length > 0 ? localContacts : [
        { id: 'c-default-108', name: 'National Ambulance Service (108)', relation: 'Govt Emergency Helpline', phone: '108', isPrimary: true },
        { id: 'c-default-112', name: 'National All-in-One Helpline (112)', relation: 'Police / Fire / Medical', phone: '112', isPrimary: false }
      ]);

  // Modals & First-Aid State
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [activeFirstAidTab, setActiveFirstAidTab] = useState('cpr'); // 'cpr' | 'bleeding' | 'choking' | 'heart' | 'seizure'

  // Auto-fetch real browser location on mount
  useEffect(() => {
    fetchUserLocation();
  }, []);

  const fetchUserLocation = () => {
    setLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your device browser.");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });
        setLoadingLocation(false);

        // Fetch real nearby hospitals for lat, lng
        loadNearbyHospitals(lat, lng);
      },
      (err) => {
        setLoadingLocation(false);
        setLocationError("Location permission required. Please allow GPS access in your browser bar.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const loadNearbyHospitals = async (lat, lng) => {
    setLoadingHospitals(true);
    try {
      const liveList = await emergencyService.fetchLiveNearbyEmergencyHospitals(lat, lng);
      setNearbyHospitals(liveList);
    } catch (e) {
      console.warn("Nearby hospitals fetch error:", e);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const initiateSOS = async () => {
    if (sosStep === 'active') {
      try {
        if (cancelSOS) await cancelSOS();
      } catch (e) {}
      setSosStep('idle');
      toast.success("ℹ️ Emergency alert cancelled. Standby mode restored.", { duration: 4000 });
      return;
    }

    if (!userCoords || userCoords.lat === undefined || userCoords.lng === undefined) {
      toast.error("Live GPS location is needed. Please allow location access or call 108 directly.");
      return;
    }

    setSosStep('dispatching');
    const toastId = toast.loading("Broadcasting Emergency SOS...", { id: 'sos-toast' });

    try {
      const res = await triggerSOS(userCoords.lat, userCoords.lng, activeContactsList);
      toast.dismiss(toastId);
      
      setSosStatusChecklist({
        locationAcquired: true,
        hospitalsFound: nearbyHospitals.length > 0,
        contactsAlerted: true
      });
      setSosStep('active');
      toast.success(`🚨 EMERGENCY SOS DISPATCHED! Tap the button again anytime to cancel.`, { duration: 6000 });
    } catch (err) {
      toast.dismiss(toastId);
      setSosStep('idle');
      toast.error(err.message || "Unable to send server alert. Dial 108 immediately!");
    }
  };

  const handleSaveContact = async () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      toast.error("Please enter both contact name and phone number.");
      return;
    }

    const newContact = {
      id: 'c-loc-' + Date.now(),
      name: contactName.trim(),
      relation: contactRelation.trim() || 'Family / Emergency Contact',
      phone: contactPhone.trim(),
      isPrimary: false
    };

    if (isAuthenticated && addEmergencyContact) {
      try {
        await addEmergencyContact(newContact);
      } catch {
        // Fallback to local state if backend call fails
      }
    }

    // Always update local cache
    const updated = [...localContacts, newContact];
    setLocalContacts(updated);
    try {
      localStorage.setItem('medguardian_emergency_contacts_cache', JSON.stringify(updated));
    } catch {}

    setShowContactModal(false);
    setContactName('');
    setContactRelation('');
    setContactPhone('');
    toast.success("Emergency contact saved successfully.");
  };

  const handleDeleteContact = async (id) => {
    if (isAuthenticated && deleteEmergencyContact) {
      try {
        await deleteEmergencyContact(id);
      } catch {}
    }
    const updated = localContacts.filter(c => c.id !== id && c._id !== id);
    setLocalContacts(updated);
    try {
      localStorage.setItem('medguardian_emergency_contacts_cache', JSON.stringify(updated));
    } catch {}
    toast.success("Contact removed.");
  };

  const getMapsUrl = () => {
    if (!userCoords) return 'https://maps.google.com';
    return `https://maps.google.com/?q=${userCoords.lat},${userCoords.lng}`;
  };

  const getEmergencyMessage = () => {
    const coordsStr = userCoords ? `${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)}` : 'Detecting...';
    const mapsLink = getMapsUrl();
    return `🚨 MEDICAL EMERGENCY ALERT! I need immediate medical help. My live GPS location is: ${mapsLink} (${coordsStr}). Please send an ambulance immediately.`;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getEmergencyMessage());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareSMS = () => {
    const text = encodeURIComponent(getEmergencyMessage());
    window.open(`sms:?body=${text}`, '_blank');
  };

  const handleCopyLocation = () => {
    const text = getEmergencyMessage();
    navigator.clipboard.writeText(text);
    toast.success("📋 Emergency location copied to clipboard!");
  };

  return (
    <div className={`font-sans antialiased max-w-5xl mx-auto pb-16 space-y-6 ${isPublicStandalone ? 'pt-4 px-4 sm:px-6' : ''}`}>
      
      {/* Standalone Public Header (If accessed directly via /sos or /emergency) */}
      {isPublicStandalone && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md hover:bg-red-700 transition-colors">
              <Siren className="w-6 h-6 animate-pulse" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-[#0F172A] dark:text-white tracking-tight">
                  MedGuardian <span className="text-red-600">Emergency SOS</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-700">
                  ⚡ Zero-Login Access
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Public emergency portal • No email, password, or OTP required
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Link
              to="/"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0F172A] dark:bg-teal-700 hover:bg-[#1E293B] transition-colors"
              >
                Sign In (Non-Emergency)
              </Link>
            )}
          </div>
        </div>
      )}

      {/* High-Alert Header Banner */}
      <Card className="p-6 bg-gradient-to-r from-red-600 via-rose-700 to-red-800 text-white rounded-2xl shadow-lg border border-red-500/50 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                {t('emergencySOSCenter') || "Emergency Medical SOS"}
              </h1>
              <p className="text-xs text-red-100 font-medium">
                Instant Lifesaving Dispatch & National Helplines (24x7 India)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:108"
              className="px-4 py-2 rounded-xl bg-white text-red-700 font-black text-xs sm:text-sm hover:bg-red-50 transition-all shadow-md flex items-center gap-2 active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-red-600 animate-bounce" /> Call 108 Now
            </a>
            <a
              href="tel:112"
              className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-950 text-white font-black text-xs sm:text-sm transition-all border border-red-300/30 flex items-center gap-1.5"
            >
              <Phone className="w-4 h-4" /> 112 (All-in-One)
            </a>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-red-50 font-normal leading-relaxed">
          {t('emergencyBannerText') || "In life-threatening emergencies, press the large SOS button below to broadcast your live GPS coordinates, alert emergency contacts, and locate the nearest hospital immediately."}
        </p>

        {/* 1-Tap Government Hotlines Bar */}
        <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
          <a
            href="tel:108"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-between transition-colors"
          >
            <span>🚑 Ambulance</span>
            <span className="font-black text-yellow-300">108</span>
          </a>
          <a
            href="tel:112"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-between transition-colors"
          >
            <span>🚨 National ER</span>
            <span className="font-black text-yellow-300">112</span>
          </a>
          <a
            href="tel:102"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-between transition-colors"
          >
            <span>👶 Maternity/Ped</span>
            <span className="font-black text-yellow-300">102</span>
          </a>
          <a
            href="tel:1075"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-between transition-colors"
          >
            <span>🩺 Health Helpline</span>
            <span className="font-black text-yellow-300">1075</span>
          </a>
        </div>
      </Card>

      {/* Real GPS Location & 1-Click Share Bar */}
      <Card className="p-5 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Compass className={`w-5 h-5 shrink-0 ${userCoords ? 'text-emerald-600 animate-spin-slow' : 'text-red-600'}`} />
            <div>
              <span className="font-extrabold text-[#0F172A] dark:text-white block text-sm">
                {language === 'HI' ? 'लाइव GPS स्थिति:' : 'Live GPS Geolocation Status:'}
              </span>
              {loadingLocation ? (
                <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" /> Detecting precise device GPS coordinates...
                </span>
              ) : userCoords ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-black mt-0.5 block">
                  ✓ GPS Locked: {userCoords.lat.toFixed(5)}° N, {userCoords.lng.toFixed(5)}° E
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-bold mt-0.5 block">{locationError}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={loadingLocation}
              onClick={fetchUserLocation}
              className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
            >
              {userCoords ? 'Refresh GPS' : 'Enable GPS'}
            </Button>
            {userCoords && (
              <a
                href={getMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-red-600" /> View Map
              </a>
            )}
          </div>
        </div>

        {/* 1-Click WhatsApp, SMS & Copy Share Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
            Broadcast Location:
          </span>
          <button
            onClick={handleShareWhatsApp}
            disabled={!userCoords}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
          </button>
          <button
            onClick={handleShareSMS}
            disabled={!userCoords}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Share2 className="w-3.5 h-3.5" /> SMS Alert
          </button>
          <button
            onClick={handleCopyLocation}
            disabled={!userCoords}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Copy className="w-3.5 h-3.5" /> Copy GPS Link
          </button>
        </div>
      </Card>

      {/* Main Circular Pulsing SOS Button */}
      <Card className="p-8 sm:p-10 text-center bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-black uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> 1-Tap Emergency Trigger
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
            {sosStep === 'active' ? "🚨 SOS ACTIVE — HELP IS ON THE WAY" : "Press for Instant Emergency Alert"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {sosStep === 'active'
              ? 'Your coordinates have been dispatched. Emergency contacts have been notified. Tap again anytime to cancel.'
              : 'Triggers instant dispatch, notifies your designated emergency contacts with live GPS coordinates, and alerts ambulance services.'}
          </p>
        </div>

        {/* Large Circular SOS Button with Pulsing Ring Effects */}
        <div className="py-6 flex justify-center items-center">
          <div className="relative flex items-center justify-center">
            {sosStep !== 'active' && (
              <span className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-red-500/25 animate-ping pointer-events-none" />
            )}
            
            <button
              onClick={initiateSOS}
              disabled={sosStep === 'dispatching'}
              className={`relative z-10 w-40 h-40 sm:w-48 sm:h-48 rounded-full text-white flex flex-col items-center justify-center shadow-2xl transition-all transform active:scale-95 cursor-pointer ring-8 ${
                sosStep === 'active' 
                  ? 'ring-emerald-500 bg-emerald-600 shadow-emerald-600/50 hover:bg-emerald-700' 
                  : 'bg-red-600 hover:bg-red-700 shadow-red-600/60 ring-red-400/40 hover:ring-red-400/70'
              }`}
            >
              <Siren className={`w-14 h-14 sm:w-16 sm:h-16 text-white ${sosStep === 'active' ? 'animate-bounce' : 'animate-pulse'}`} />
              <span className="text-2xl sm:text-3xl font-black tracking-widest mt-1">
                {sosStep === 'dispatching' ? 'ALERTING...' : sosStep === 'active' ? 'CANCEL' : 'SOS'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-100 mt-0.5">
                {sosStep === 'active' ? 'Tap to Stand-Down' : 'No Login Needed'}
              </span>
            </button>
          </div>
        </div>

        {/* Active Checklist */}
        {sosStep === 'active' && (
          <div className="max-w-md mx-auto p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left space-y-2 text-xs">
            <div className="font-black text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active Emergency Dispatch Summary:
            </div>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300 font-medium pl-5 list-disc">
              <li>Live GPS coordinates locked and broadcasted.</li>
              <li>Nearby trauma centers identified ({nearbyHospitals.length} available).</li>
              <li>Emergency contact dispatch packet transmitted.</li>
            </ul>
          </div>
        )}

        {/* Quick Dial 108 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="tel:108"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-red-600 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md hover:bg-red-700 transition-colors"
          >
            <PhoneCall className="w-4 h-4" /> Call National Ambulance (108)
          </a>
          <button
            onClick={handleShareWhatsApp}
            disabled={!userCoords}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0F172A] dark:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md hover:bg-[#1E293B] transition-colors disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" /> Share Location via WhatsApp
          </button>
        </div>
      </Card>

      {/* Offline First-Aid Emergency Triage Guides */}
      <Card className="p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-black text-[#0F172A] dark:text-white">
              Offline First-Aid Emergency Guides
            </h3>
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#66729F] dark:text-[#9DA8D0] bg-[#D9DDEC]/40 dark:bg-[#7C87B8]/20 px-2.5 py-1 rounded-full border border-[#AEB7D5]/40 dark:border-[#7C87B8]/40">
            Immediate Bystander Protocols
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveFirstAidTab('cpr')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeFirstAidTab === 'cpr'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            🫀 Adult CPR
          </button>
          <button
            onClick={() => setActiveFirstAidTab('bleeding')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeFirstAidTab === 'bleeding'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            🩸 Severe Bleeding
          </button>
          <button
            onClick={() => setActiveFirstAidTab('choking')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeFirstAidTab === 'choking'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            🫁 Choking (Heimlich)
          </button>
          <button
            onClick={() => setActiveFirstAidTab('heart')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeFirstAidTab === 'heart'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            💔 Heart Attack
          </button>
          <button
            onClick={() => setActiveFirstAidTab('seizure')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeFirstAidTab === 'seizure'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ⚡ Seizure & Stroke
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200/80 dark:border-slate-800 text-xs space-y-3">
          {activeFirstAidTab === 'cpr' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-[#0F172A] dark:text-white">Hands-Only CPR Protocol (Unresponsive & Not Breathing)</h4>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded">100–120 Beats/Min</span>
              </div>
              <ol className="space-y-2 text-slate-600 dark:text-slate-300 list-decimal pl-4 font-medium leading-relaxed">
                <li><strong className="text-slate-900 dark:text-white">Call 108 immediately:</strong> Put phone on speaker while starting CPR.</li>
                <li><strong className="text-slate-900 dark:text-white">Hand Placement:</strong> Place heel of one hand in the center of victim's chest, interlock the other hand on top.</li>
                <li><strong className="text-slate-900 dark:text-white">Hard & Fast Compressions:</strong> Push straight down at least 2 inches (5 cm) at a rate of 100 to 120 compressions per minute (to the beat of "Stayin' Alive").</li>
                <li><strong className="text-slate-900 dark:text-white">Chest Recoil:</strong> Allow chest to completely rise between each compression. Do not stop until medical personnel arrive.</li>
              </ol>
            </div>
          )}

          {activeFirstAidTab === 'bleeding' && (
            <div className="space-y-2.5">
              <h4 className="font-black text-sm text-[#0F172A] dark:text-white">Severe Bleeding & Hemorrhage Control</h4>
              <ol className="space-y-2 text-slate-600 dark:text-slate-300 list-decimal pl-4 font-medium leading-relaxed">
                <li><strong className="text-slate-900 dark:text-white">Direct Firm Pressure:</strong> Press firmly directly over the bleeding wound using sterile gauze or clean cloth.</li>
                <li><strong className="text-slate-900 dark:text-white">Do Not Remove Soaked Dressing:</strong> If blood seeps through, place more cloth directly on top and press harder.</li>
                <li><strong className="text-slate-900 dark:text-white">Elevate:</strong> If no bone fracture, raise the bleeding limb above heart level.</li>
                <li><strong className="text-slate-900 dark:text-white">Tourniquet for Limbs:</strong> If life-threatening arterial spurting bleeding on arm or leg doesn't stop, apply a tourniquet 2-3 inches above the wound (never on a joint).</li>
              </ol>
            </div>
          )}

          {activeFirstAidTab === 'choking' && (
            <div className="space-y-2.5">
              <h4 className="font-black text-sm text-[#0F172A] dark:text-white">Conscious Choking (Heimlich Maneuver)</h4>
              <ol className="space-y-2 text-slate-600 dark:text-slate-300 list-decimal pl-4 font-medium leading-relaxed">
                <li><strong className="text-slate-900 dark:text-white">5 Back Blows:</strong> Stand behind person, lean them forward, give 5 firm blows between shoulder blades with heel of hand.</li>
                <li><strong className="text-slate-900 dark:text-white">5 Abdominal Thrusts:</strong> Make a fist with thumb side just above navel. Grasp fist with other hand and thrust inward and upward sharply.</li>
                <li><strong className="text-slate-900 dark:text-white">Alternate 5 & 5:</strong> Repeat until object dislodges or patient breathes. If patient falls unconscious, lower them gently and start CPR.</li>
              </ol>
            </div>
          )}

          {activeFirstAidTab === 'heart' && (
            <div className="space-y-2.5">
              <h4 className="font-black text-sm text-[#0F172A] dark:text-white">Heart Attack / Acute Coronary Syndrome</h4>
              <ol className="space-y-2 text-slate-600 dark:text-slate-300 list-decimal pl-4 font-medium leading-relaxed">
                <li><strong className="text-slate-900 dark:text-white">Symptoms:</strong> Crushing chest heaviness, pain in left arm, neck, or jaw, cold sweats, nausea, shortness of breath.</li>
                <li><strong className="text-slate-900 dark:text-white">Rest Upright:</strong> Sit the patient comfortably upright (W-position or against a wall) to reduce cardiac workload.</li>
                <li><strong className="text-slate-900 dark:text-white">Aspirin:</strong> If available, give 300mg soluble Aspirin to chew immediately (unless patient has known allergy or bleeding ulcer).</li>
                <li><strong className="text-slate-900 dark:text-white">Call 108:</strong> Do not let patient walk or drive themselves. Keep AED ready.</li>
              </ol>
            </div>
          )}

          {activeFirstAidTab === 'seizure' && (
            <div className="space-y-2.5">
              <h4 className="font-black text-sm text-[#0F172A] dark:text-white">Seizure Protocol & Stroke F.A.S.T. Assessment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="font-bold text-red-600 block">⚡ For Seizures / Convulsions:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                    <li>Clear sharp objects away. Cushion their head.</li>
                    <li><strong className="text-red-600">NEVER</strong> restrain them or force objects into their mouth.</li>
                    <li>Turn person onto their side (recovery position) once shaking ends.</li>
                  </ul>
                </div>
                <div className="space-y-1.5">
                  <span className="font-bold text-blue-600 block">🧠 Stroke F.A.S.T. Test:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                    <li><strong>F - Face:</strong> Is one side of the face drooping?</li>
                    <li><strong>A - Arms:</strong> Can they lift both arms?</li>
                    <li><strong>S - Speech:</strong> Is speech slurred or strange?</li>
                    <li><strong>T - Time:</strong> Call 108 immediately if ANY symptom is present!</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Trusted Emergency Contacts */}
      <Card className="p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#66729F] dark:text-[#9DA8D0]" />
            <h3 className="text-base font-black text-[#0F172A] dark:text-[#F5F7FA]">Designated Emergency Contacts</h3>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => {
              setContactName('');
              setContactRelation('');
              setContactPhone('');
              setShowContactModal(true);
            }}
            className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer dark:text-[#F5F7FA] dark:hover:bg-slate-800"
          >
            {t('addContact') || "Add Contact"}
          </Button>
        </div>

        <div className="space-y-2.5 text-xs">
          {activeContactsList.map((contact) => (
            <div key={contact.id || contact._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200/80 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-[#0F172A] dark:text-[#F5F7FA]">{contact.name}</h4>
                  {contact.isPrimary && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold">Primary Helpline</span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-[#C8D0E0] font-medium mt-0.5">{contact.relation} • {contact.phone}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call
                </a>
                {!contact.isPrimary && (
                  <button
                    onClick={() => handleDeleteContact(contact.id || contact._id)}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer transition-colors"
                    title="Remove Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Live Nearby Emergency Facilities */}
      <Card className="p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#66729F] dark:text-[#9DA8D0]" />
            <h3 className="text-base font-black text-[#0F172A] dark:text-[#F5F7FA]">
              {t('liveNearbyEmergencyFacilities') || "Live Nearby Emergency Hospitals & Trauma Centers"}
            </h3>
          </div>

          <span className="text-xs font-bold text-[#66729F] dark:text-[#9DA8D0] bg-[#EEF1FA] dark:bg-[#2C3146] px-3 py-1 rounded-full border border-[#D9DDEC] dark:border-[#313750]">
            {t('sortedByProximity') || "Sorted by Live Proximity"}
          </span>
        </div>

        {loadingHospitals ? (
          <div className="py-8 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-[#66729F] dark:text-[#9DA8D0] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 dark:text-[#C8D0E0] font-medium">Scanning live OpenStreetMap emergency facilities...</p>
          </div>
        ) : nearbyHospitals.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-[#C8D0E0] font-medium">
            No live hospital data retrieved. Ensure GPS location is active or retry location detection.
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {nearbyHospitals.slice(0, 6).map((hosp) => (
              <div key={hosp.id} className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-[#66729F] dark:hover:border-[#7C87B8] bg-slate-50/60 dark:bg-[#151824] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-[#0F172A] dark:text-[#F5F7FA]">{hosp.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[10px] font-extrabold">24/7 ER</span>
                  </div>
                  <p className="text-slate-500 dark:text-[#C8D0E0] font-medium truncate max-w-md">{hosp.address}</p>
                  <p className="text-slate-700 dark:text-slate-300 font-bold">{hosp.distanceText} • {hosp.driveTimeText}</p>
                </div>

                <div className="flex items-center gap-2">
                  {hosp.phone && (
                    <a
                      href={`tel:${hosp.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 cursor-pointer flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                  )}

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${hosp.lat},${hosp.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#66729F] hover:bg-[#55608B] dark:bg-[#7C87B8] dark:hover:bg-[#8F99C8] text-white dark:text-[#172033] font-bold text-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Emergency Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Add Emergency Contact"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="text-slate-600 font-bold block">Contact Name</label>
            <input
              type="text"
              placeholder="e.g. Dr. Rajesh Sharma / Spouse / Parent"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="med-input w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-600 font-bold block">Relationship</label>
            <input
              type="text"
              placeholder="e.g. Personal Physician / Family Member"
              value={contactRelation}
              onChange={(e) => setContactRelation(e.target.value)}
              className="med-input w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-600 font-bold block">Phone Number</label>
            <input
              type="text"
              placeholder="e.g. +91 98765 43210"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="med-input w-full"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowContactModal(false)}
              className="rounded-xl border-slate-200 text-xs font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveContact}
              className="bg-red-600 hover:bg-red-700 text-xs font-bold rounded-xl cursor-pointer text-white"
            >
              Save Contact
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
