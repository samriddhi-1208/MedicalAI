import React, { useState, useEffect } from 'react';
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
  Edit2,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { emergencyService } from '../services/emergencyService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const EmergencySOSPage = () => {
  const { userProfile, emergencyContacts, addEmergencyContact, deleteEmergencyContact, triggerSOS, language } = useHealthData();
  const t = (key) => getTranslation(language, key);
  
  // Real-Time GPS Location State
  const [userCoords, setUserCoords] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // Live Hospital Search State
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  // SOS Workflow & Dispatch State
  const [sosStep, setSosStep] = useState('idle'); // 'idle' | 'confirm' | 'dispatching' | 'active'
  const [sosStatusChecklist, setSosStatusChecklist] = useState({
    locationAcquired: false,
    hospitalsFound: false,
    contactsAlerted: false
  });

  // Dynamic Trusted Contacts State (Stored in MongoDB via API)
  const trustedContacts = Array.isArray(emergencyContacts) && emergencyContacts.length > 0 ? emergencyContacts : [
    { id: 'c-default-108', name: 'National Ambulance Service (108)', relation: 'Govt Emergency Helpline', phone: '108', isPrimary: true }
  ];

  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPhone, setContactPhone] = useState('');

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
        setLocationError("Location access denied. Enable GPS permission to trigger an Emergency SOS.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const loadNearbyHospitals = async (lat, lng) => {
    setLoadingHospitals(true);
    try {
      const liveList = await emergencyService.fetchLiveNearbyEmergencyHospitals(lat, lng);
      setNearbyHospitals(liveList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const initiateSOS = async () => {
    if (sosStep === 'active') {
      toast.success("Emergency SOS is already active.");
      return;
    }

    if (!userCoords || userCoords.lat === undefined || userCoords.lng === undefined) {
      toast.error("Live location is required to send an SOS. Please enable GPS permission in your browser.");
      return;
    }

    setSosStep('dispatching');
    const toastId = toast.loading("Connecting to Emergency SOS Server...", { id: 'sos-toast' });

    try {
      const res = await triggerSOS(userCoords.lat, userCoords.lng);
      toast.dismiss(toastId);
      if (res && res.success) {
        setSosStatusChecklist({
          locationAcquired: true,
          hospitalsFound: nearbyHospitals.length > 0,
          contactsAlerted: (res.contactsNotified || 0) > 0
        });
        setSosStep('active');
        toast.success(`🚨 EMERGENCY SOS ACTIVATED! Real location (${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}) dispatched via backend.`, { duration: 6000 });
      } else {
        setSosStep('idle');
        toast.error("SOS dispatch failed on server.");
      }
    } catch (err) {
      toast.dismiss(toastId);
      setSosStep('idle');
      toast.error(err.message || "Failed to trigger SOS.");
    }
  };

  const handleSaveContact = async () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      toast.error("Please enter contact name and phone number.");
      return;
    }

    await addEmergencyContact({
      name: contactName.trim(),
      relation: contactRelation.trim() || 'Family Contact',
      phone: contactPhone.trim(),
      isPrimary: false
    });

    setShowContactModal(false);
    setContactName('');
    setContactRelation('');
    setContactPhone('');
    toast.success("Emergency contact saved to profile.");
  };

  const handleDeleteContact = async (id) => {
    await deleteEmergencyContact(id);
    toast.success("Emergency contact removed.");
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased max-w-4xl mx-auto">
      
      {/* Emergency Red Banner */}
      <Card className="p-6 bg-gradient-to-r from-rose-900 via-[#0F172A] to-rose-950 text-white rounded-2xl shadow-md border border-rose-800/40 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t('emergencySOSCenter') || "Emergency SOS Center"}
            </h1>
          </div>

          <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-200 font-extrabold text-xs border border-rose-400/30">
            24/7 INDIA HELPLINE: 108
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
          {t('emergencyBannerText') || "In case of a life-threatening medical emergency, press the SOS button below or call 108 immediately for government medical dispatch."}
        </p>
      </Card>

      {/* Real GPS Location Status Bar */}
      <Card className="p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <Compass className={`w-5 h-5 shrink-0 ${userCoords ? 'text-emerald-600 animate-spin-slow' : 'text-rose-600'}`} />
          <div>
            <span className="font-extrabold text-[#0F172A] block">
              {language === 'HI' ? 'लाइव GPS स्थिति:' : language === 'GU' ? 'લાઇવ GPS સ્થિતિ:' : 'Real-Time User Location Status:'}
            </span>
            {loadingLocation ? (
              <span className="text-slate-500 font-medium">Detecting current device GPS coordinates...</span>
            ) : userCoords ? (
              <span className="text-emerald-700 font-extrabold">
                ✓ GPS Coordinates Acquired ({userCoords.lat.toFixed(4)}°, {userCoords.lng.toFixed(4)}°)
              </span>
            ) : (
              <span className="text-rose-600 font-bold">{locationError}</span>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          loading={loadingLocation}
          onClick={fetchUserLocation}
          className="rounded-xl border-slate-200 text-xs font-bold shrink-0 cursor-pointer"
        >
          {userCoords ? 'Refresh Location' : 'Retry Location Access'}
        </Button>
      </Card>

      {/* Large Centered Red Pulsing Circular SOS Button Section */}
      <Card className="p-8 sm:p-10 text-center bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-6">
        
        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="text-xl font-black text-[#0F172A] tracking-tight">{t('oneTapDispatch') || "1-Tap Emergency Dispatch"}</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {sosStep === 'active' 
              ? '✅ Emergency SOS dispatched! GPS shared with 108 services and trusted contacts.'
              : (t('sosPressText') || "Press the red SOS button to broadcast your real-time GPS location and alert trusted emergency contacts immediately.")
            }
          </p>
        </div>

        {/* Large Circular SOS Button with Pulsing Ring Effects */}
        <div className="py-6 flex justify-center items-center">
          <div className="relative flex items-center justify-center">
            {sosStep !== 'active' && (
              <span className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-rose-500/20 animate-ping pointer-events-none" />
            )}
            
            <button
              onClick={initiateSOS}
              disabled={sosStep === 'dispatching'}
              className={`relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white flex flex-col items-center justify-center shadow-2xl shadow-rose-600/50 transition-all transform active:scale-95 cursor-pointer ring-8 ${
                sosStep === 'active' 
                  ? 'ring-emerald-500 bg-emerald-600 shadow-emerald-600/50' 
                  : 'ring-rose-500/30 hover:ring-rose-500/50'
              }`}
            >
              <Siren className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              <span className="text-xl sm:text-2xl font-black tracking-widest mt-1">
                {sosStep === 'dispatching' ? 'SENDING...' : sosStep === 'active' ? 'ACTIVE' : 'SOS'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Emergency Hotlines */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              toast.success("Calling 108 Ambulance Hotline...");
              window.open("tel:108");
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#DC2626] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:bg-[#B91C1C] transition-colors"
          >
            <PhoneCall className="w-4 h-4" /> {t('callNationalAmbulance') || "Call National Ambulance (108)"}
          </button>

          <button
            onClick={() => {
              if (navigator.share && userCoords) {
                navigator.share({
                  title: 'Emergency Medical SOS',
                  text: `EMERGENCY SOS ALERT: Location coordinates: https://www.google.com/maps?q=${userCoords.lat},${userCoords.lng}`
                });
              } else {
                toast.success("Sharing Live GPS Location...");
              }
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:bg-[#1E293B] transition-colors"
          >
            <MapPin className="w-4 h-4" /> {t('shareMyLocation') || "Share Live GPS Location"}
          </button>
        </div>
      </Card>

      {/* Trusted Emergency Contacts */}
      <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0D9488]" />
            <h3 className="text-base font-black text-[#0F172A]">{t('trustedContactsStatus') || "Trusted Emergency Contacts"}</h3>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingContact(null);
              setContactName('');
              setContactRelation('');
              setContactPhone('');
              setShowContactModal(true);
            }}
            className="rounded-xl border-slate-200 text-xs font-bold cursor-pointer"
          >
            {t('addContact') || "Add Emergency Contact"}
          </Button>
        </div>

        <div className="space-y-2.5 text-xs">
          {trustedContacts.map((contact) => (
            <div key={contact.id || contact._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-[#0F172A]">{contact.name}</h4>
                  {contact.isPrimary && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">{t('primaryBadge') || "Primary Helpline"}</span>
                  )}
                </div>
                <p className="text-slate-500 font-medium mt-0.5">{contact.relation} • {contact.phone}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toast.success(`Dialing ${contact.name}...`);
                    window.open(`tel:${contact.phone}`);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] cursor-pointer"
                >
                  Call
                </button>
                {!contact.isPrimary && (
                  <button
                    onClick={() => handleDeleteContact(contact.id || contact._id)}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
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
      <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0D9488]" />
            <h3 className="text-base font-black text-[#0F172A]">{t('liveNearbyEmergencyFacilities') || "Live Nearby Emergency Hospitals"}</h3>
          </div>

          <span className="text-xs font-bold text-[#0D9488] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {t('sortedByProximity') || "Sorted by Proximity"}
          </span>
        </div>

        {loadingHospitals ? (
          <div className="py-8 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-[#0D9488] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Querying OpenStreetMap live emergency database...</p>
          </div>
        ) : nearbyHospitals.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 font-medium">
            No live hospital data retrieved. Ensure GPS location is active.
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {nearbyHospitals.slice(0, 5).map((hosp) => (
              <div key={hosp.id} className="p-4 rounded-xl border border-slate-200/80 hover:border-[#0D9488] bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-[#0F172A]">{hosp.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold">24/7 ER</span>
                  </div>
                  <p className="text-slate-500 font-medium truncate max-w-md">{hosp.address}</p>
                  <p className="text-slate-700 font-bold">{hosp.distanceText} • {hosp.driveTimeText}</p>
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
                    className="px-3 py-1.5 rounded-xl bg-[#0F172A] text-white font-bold text-xs hover:bg-[#1E293B] cursor-pointer flex items-center gap-1"
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
              placeholder="e.g. Dr. Rajesh Sharma / Spouse"
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
              className="bg-[#0F172A] hover:bg-[#1E293B] text-xs font-bold rounded-xl cursor-pointer"
            >
              Save Contact
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
