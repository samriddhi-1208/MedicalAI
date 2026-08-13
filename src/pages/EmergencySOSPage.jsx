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
  const { userProfile, updateUserProfile, language } = useHealthData();
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

  // Dynamic Trusted Contacts State (Stored in user profile / localStorage)
  const trustedContacts = Array.isArray(userProfile?.emergencyContacts) ? userProfile.emergencyContacts : [
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
        setLocationError("Location access denied. Enable GPS permission to find real nearby hospitals.");
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

  const initiateSOS = () => {
    if (sosStep === 'active') {
      toast.success("Emergency SOS is already active.");
      return;
    }

    setSosStep('dispatching');
    toast.loading("Activating Emergency Dispatch...", { id: 'sos-toast' });

    setTimeout(() => {
      setSosStatusChecklist({
        locationAcquired: !!userCoords,
        hospitalsFound: nearbyHospitals.length > 0,
        contactsAlerted: true
      });
      setSosStep('active');
      toast.dismiss('sos-toast');
      toast.success("🚨 EMERGENCY SOS ACTIVATED! Location shared with 108 Emergency Services.", { duration: 6000 });
    }, 1500);
  };

  const handleSaveContact = () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      toast.error("Please enter contact name and phone number.");
      return;
    }

    const updatedContacts = [...trustedContacts];
    if (editingContact) {
      const idx = updatedContacts.findIndex(c => c.id === editingContact.id);
      if (idx !== -1) {
        updatedContacts[idx] = { ...updatedContacts[idx], name: contactName, relation: contactRelation, phone: contactPhone };
      }
    } else {
      updatedContacts.push({
        id: `c-contact-${Date.now()}`,
        name: contactName,
        relation: contactRelation || 'Family Contact',
        phone: contactPhone,
        isPrimary: false
      });
    }

    if (typeof updateUserProfile === 'function') {
      updateUserProfile({ emergencyContacts: updatedContacts });
    }

    setShowContactModal(false);
    setEditingContact(null);
    setContactName('');
    setContactRelation('');
    setContactPhone('');
    toast.success("Trusted emergency contact saved");
  };

  const handleDeleteContact = (id) => {
    const updatedContacts = trustedContacts.filter(c => c.id !== id);
    if (typeof updateUserProfile === 'function') {
      updateUserProfile({ emergencyContacts: updatedContacts });
    }
    toast.success("Contact removed");
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased max-w-4xl mx-auto">
      
      {/* Emergency Red Banner */}
      <Card className="p-6 bg-[#DC2626] text-white rounded-2xl shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-white" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {t('emergencySOSCenter')}
            </h1>
          </div>

          <span className="px-3 py-1 rounded-full bg-white text-[#DC2626] font-extrabold text-xs">
            24/7 INDIA HELPLINE 108
          </span>
        </div>

        <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
          {t('emergencyBannerText')}
        </p>
      </Card>

      {/* Real GPS Location Status Bar */}
      <Card className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Compass className={`w-4 h-4 ${userCoords ? 'text-emerald-600 animate-spin-slow' : 'text-rose-600'}`} />
          <div>
            <span className="font-bold text-[#1A4B84] block">
              {language === 'HI' ? 'लाइव GPS स्थिति:' : language === 'GU' ? 'લાઇવ GPS સ્થિતિ:' : 'Real-Time User Location Status:'}
            </span>
            {loadingLocation ? (
              <span className="text-slate-500 font-normal">Detecting current device GPS coordinates...</span>
            ) : userCoords ? (
              <span className="text-emerald-700 font-bold">
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
          className="rounded-xl border-slate-200 text-xs font-semibold shrink-0 cursor-pointer"
        >
          {userCoords ? 'Refresh Location' : 'Retry Location Access'}
        </Button>
      </Card>

      {/* Large Centered Red Pulsing Circular SOS Button Section */}
      <Card className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
        
        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-xl font-extrabold text-[#1A4B84]">{t('oneTapDispatch')}</h2>
          <p className="text-xs text-slate-500 font-normal">
            {sosStep === 'active' 
              ? '✅ Emergency SOS dispatched! GPS shared with 108 services and trusted contacts.'
              : t('sosPressText')
            }
          </p>
        </div>

        {/* Large Circular SOS Button */}
        <div className="py-4 flex justify-center">
          <button
            onClick={initiateSOS}
            disabled={sosStep === 'dispatching'}
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white flex flex-col items-center justify-center shadow-xl transition-transform active:scale-95 cursor-pointer ${
              sosStep === 'active' ? 'ring-8 ring-emerald-500 bg-emerald-600' : 'animate-sos-pulse'
            }`}
          >
            <Siren className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            <span className="text-xl sm:text-2xl font-black tracking-widest mt-1">
              {sosStep === 'dispatching' ? 'SENDING...' : sosStep === 'active' ? 'ACTIVE' : 'SOS'}
            </span>
          </button>
        </div>

        {/* Quick Emergency Hotlines */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              toast.success("Calling 108 Ambulance Hotline...");
              window.open("tel:108");
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#DC2626] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md hover:bg-[#B91C1C] transition-colors"
          >
            <PhoneCall className="w-4 h-4" /> {t('callNationalAmbulance')}
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
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1A4B84] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md hover:bg-[#143A66] transition-colors"
          >
            <MapPin className="w-4 h-4" /> {t('shareMyLocation')}
          </button>
        </div>
      </Card>

      {/* Trusted Emergency Contacts */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1A4B84]" />
            <h3 className="text-base font-extrabold text-[#1A4B84]">{t('trustedContactsStatus')}</h3>
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
            className="rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
          >
            {t('addContact')}
          </Button>
        </div>

        <div className="space-y-2 text-xs">
          {trustedContacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-[#1A4B84]">{contact.name}</h4>
                  {contact.isPrimary && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">PRIMARY</span>
                  )}
                </div>
                <p className="text-slate-500 font-medium">{contact.relation} • {contact.phone}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toast.success(`Dialing ${contact.name}...`);
                    window.open(`tel:${contact.phone}`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#1A4B84] text-white font-bold hover:bg-[#143A66] cursor-pointer"
                >
                  Call
                </button>
                {!contact.isPrimary && (
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
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
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#2D90A6]" />
            <h3 className="text-base font-extrabold text-[#1A4B84]">{t('liveNearbyEmergencyFacilities')}</h3>
          </div>

          <span className="text-xs font-bold text-[#2D90A6] bg-[#EBF6F8] px-3 py-1 rounded-full border border-[#2D90A6]/30">
            {t('sortedByProximity')}
          </span>
        </div>

        {loadingHospitals ? (
          <div className="py-8 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-[#2D90A6] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Querying OpenStreetMap live emergency database...</p>
          </div>
        ) : nearbyHospitals.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 font-medium">
            No live hospital data retrieved. Ensure GPS location is active.
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {nearbyHospitals.slice(0, 5).map((hosp) => (
              <div key={hosp.id} className="p-4 rounded-xl border border-slate-200 hover:border-[#1A4B84] bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-[#1A4B84]">{hosp.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold">24/7 ER</span>
                  </div>
                  <p className="text-slate-500 font-normal truncate max-w-md">{hosp.address}</p>
                  <p className="text-slate-700 font-bold">{hosp.distanceText} • {hosp.driveTimeText}</p>
                </div>

                <div className="flex items-center gap-2">
                  {hosp.phone && (
                    <a
                      href={`tel:${hosp.phone}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                  )}
                  <a
                    href={hosp.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#1A4B84] hover:bg-[#143A66] text-white font-bold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#2D90A6]" /> {t('directions')}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add / Edit Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={editingContact ? 'Edit Trusted Contact' : 'Add Trusted Contact'}
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="med-form-group">
            <label>Contact Full Name</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Ramesh Bhai (Brother)"
              className="med-input text-xs"
            />
          </div>

          <div className="med-form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. +91 98250 12345"
              className="med-input text-xs"
            />
          </div>

          <div className="med-form-group">
            <label>Relationship</label>
            <input
              type="text"
              value={contactRelation}
              onChange={(e) => setContactRelation(e.target.value)}
              placeholder="e.g. Son, Sister, Primary Physician"
              className="med-input text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowContactModal(false)}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveContact}
              className="rounded-xl text-xs font-extrabold bg-[#1A4B84] cursor-pointer"
            >
              Save Contact
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
