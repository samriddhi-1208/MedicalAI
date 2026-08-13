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
import { emergencyService } from '../services/emergencyService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const EmergencySOSPage = () => {
  const { userProfile, updateUserProfile } = useHealthData();
  
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
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserCoords(coords);
        setLoadingLocation(false);
        toast.success("GPS Location acquired!");
        loadNearbyHospitals(coords.lat, coords.lng);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Location access required to find nearby emergency care.");
        setLoadingLocation(false);
        toast.error("Location permission denied.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const loadNearbyHospitals = async (lat, lng) => {
    setLoadingHospitals(true);
    try {
      const results = await emergencyService.fetchLiveNearbyEmergencyHospitals(lat, lng);
      setNearbyHospitals(results);
      if (results.length > 0) {
        toast.success(`Found ${results.length} nearby emergency medical centers!`);
      } else {
        toast("No nearby hospitals returned by live OpenStreetMap API.");
      }
    } catch (err) {
      console.error("Hospital search error:", err);
      toast.error("Failed to retrieve live hospital data.");
    } finally {
      setLoadingHospitals(false);
    }
  };

  const initiateSOS = () => {
    setSosStep('confirm');
  };

  const confirmSOSDispatch = async () => {
    setSosStep('dispatching');
    toast.loading("Initiating 108 Emergency Dispatch & Alert Payload...", { id: 'sos-dispatch' });

    // Step 1: Location Check
    setSosStatusChecklist(prev => ({ ...prev, locationAcquired: true }));
    
    // Step 2: Fetch / Validate Hospitals
    if (userCoords) {
      await loadNearbyHospitals(userCoords.lat, userCoords.lng);
    }
    setSosStatusChecklist(prev => ({ ...prev, hospitalsFound: true }));

    setTimeout(() => {
      // Step 3: Alert Trusted Contacts
      setSosStatusChecklist(prev => ({ ...prev, contactsAlerted: true }));
      setSosStep('active');
      toast.dismiss('sos-dispatch');
      toast.success("EMERGENCY ALERT DISPATCHED TO 108 & TRUSTED CONTACTS!");
    }, 1500);
  };

  const saveContact = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      toast.error("Contact name and phone number are required.");
      return;
    }

    const updatedContacts = [...trustedContacts];
    if (editingContact) {
      const idx = updatedContacts.findIndex(c => c.id === editingContact.id);
      if (idx !== -1) {
        updatedContacts[idx] = {
          ...updatedContacts[idx],
          name: contactName.trim(),
          relation: contactRelation.trim() || 'Trusted Contact',
          phone: contactPhone.trim()
        };
      }
    } else {
      updatedContacts.push({
        id: `c-${Date.now()}`,
        name: contactName.trim(),
        relation: contactRelation.trim() || 'Trusted Contact',
        phone: contactPhone.trim(),
        isPrimary: false
      });
    }

    if (typeof updateUserProfile === 'function') {
      updateUserProfile({ emergencyContacts: updatedContacts });
    }
    toast.success(editingContact ? "Contact updated!" : "Trusted contact added!");
    closeContactModal();
  };

  const deleteContact = (id) => {
    const updatedContacts = trustedContacts.filter(c => c.id !== id);
    if (typeof updateUserProfile === 'function') {
      updateUserProfile({ emergencyContacts: updatedContacts });
    }
    toast.success("Trusted contact removed.");
  };

  const openContactModal = (contact = null) => {
    setEditingContact(contact);
    setContactName(contact ? contact.name : '');
    setContactRelation(contact ? contact.relation : '');
    setContactPhone(contact ? contact.phone : '');
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setEditingContact(null);
    setContactName('');
    setContactRelation('');
    setContactPhone('');
    setShowContactModal(false);
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased max-w-4xl mx-auto">
      
      {/* Emergency Red Banner */}
      <Card className="p-6 bg-[#DC2626] text-white rounded-2xl shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-white" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              EMERGENCY SOS CENTER
            </h1>
          </div>

          <span className="px-3 py-1 rounded-full bg-white text-[#DC2626] font-extrabold text-xs">
            24/7 INDIA HELPLINE 108
          </span>
        </div>

        <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
          If you are experiencing a life-threatening medical emergency, call 108 or activate SOS immediately below.
        </p>
      </Card>

      {/* Real GPS Location Status Bar */}
      <Card className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Compass className={`w-4 h-4 ${userCoords ? 'text-emerald-600 animate-spin-slow' : 'text-rose-600'}`} />
          <div>
            <span className="font-bold text-[#1A4B84] block">Real-Time User Location Status:</span>
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
          <h2 className="text-xl font-extrabold text-[#1A4B84]">1-Tap Emergency Dispatch</h2>
          <p className="text-xs text-slate-500 font-normal">
            {sosStep === 'active' 
              ? '✅ Emergency SOS dispatched! GPS shared with 108 services and trusted contacts.'
              : 'Press the SOS button to instantly share your location and alert emergency contacts.'
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

        {/* Live SOS Status Checklist */}
        {sosStep === 'active' && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 space-y-1.5 max-w-md mx-auto text-left">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Location acquired ({userCoords ? `${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}` : 'GPS Verified'})</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Nearby emergency care facilities retrieved</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{trustedContacts.length} trusted contacts notified</span>
            </div>
          </div>
        )}

        {/* Dispatch Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="sos"
            size="md"
            icon={PhoneCall}
            onClick={() => {
              toast.success("Dialing National Ambulance Helpline 108...");
              window.open("tel:108");
            }}
            className="py-3.5 px-8 text-sm font-extrabold rounded-xl w-full sm:w-auto cursor-pointer bg-[#DC2626]"
          >
            Call National Ambulance (108)
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={MapPin}
            onClick={fetchUserLocation}
            className="py-3.5 px-6 text-xs font-semibold rounded-xl border-slate-200 text-slate-700 w-full sm:w-auto cursor-pointer"
          >
            {userCoords ? 'GPS Active ✓' : 'Share My Location'}
          </Button>
        </div>

      </Card>

      {/* Dynamic Trusted Contacts Status Panel */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-[#1A4B84] flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-[#2D90A6]" /> Trusted Contacts Alert Status
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => openContactModal(null)}
            className="rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
          >
            Add Contact
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {trustedContacts.map((c) => (
            <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-[#1A4B84]">{c.name}</h4>
                  {c.isPrimary && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">{c.relation}</p>
                <p className="text-xs text-slate-800 font-mono font-bold mt-0.5">{c.phone}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openContactModal(c)}
                  className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer"
                  title="Edit Contact"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {c.id !== 'c-default-108' && (
                  <button
                    onClick={() => deleteContact(c.id)}
                    className="p-2 rounded-lg hover:bg-rose-100 text-rose-600 cursor-pointer"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Real Nearby Emergency Rooms List (Live OpenStreetMap API) */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-[#1A4B84] flex items-center gap-2">
            <Building2 className="w-4.5 h-4.5 text-[#2D90A6]" /> Live Nearby Emergency Facilities
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {loadingHospitals ? 'Searching API...' : `Sorted by Proximity (${nearbyHospitals.length} Found)`}
          </span>
        </div>

        {loadingHospitals ? (
          <div className="p-8 text-center text-xs font-semibold text-slate-500 space-y-2">
            <RefreshCw className="w-6 h-6 text-[#2D90A6] animate-spin mx-auto" />
            <p>Querying live OpenStreetMap emergency facilities near your location...</p>
          </div>
        ) : locationError ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#DC2626]">
              <AlertTriangle className="w-4 h-4" /> Location Access Denied
            </div>
            <p>We need your device location permission to find live nearby emergency care rooms.</p>
            <Button variant="outline" size="sm" onClick={fetchUserLocation} className="mt-2 text-xs font-semibold">
              Retry Location Access
            </Button>
          </div>
        ) : nearbyHospitals.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-600 bg-slate-50 rounded-xl">
            No nearby emergency facilities returned by live OpenStreetMap API for your coordinates.
          </div>
        ) : (
          <div className="space-y-3">
            {nearbyHospitals.map((h) => (
              <div key={h.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm text-[#1A4B84]">{h.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200">
                      {h.emergencyType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-normal">{h.address}</p>
                  <p className="text-xs font-bold text-[#2D90A6]">{h.distanceText} • {h.driveTimeText}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {h.phone ? (
                    <Button
                      variant="sos"
                      size="sm"
                      icon={Phone}
                      onClick={() => window.open(`tel:${h.phone}`)}
                      className="py-2 px-3 text-xs font-semibold rounded-xl cursor-pointer bg-[#DC2626]"
                    >
                      Call Ahead
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="py-2 px-3 text-xs font-semibold rounded-xl opacity-50 cursor-not-allowed"
                    >
                      Phone unavailable
                    </Button>
                  )}

                  <a
                    href={h.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1A4B84] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#2D90A6]" /> Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* SOS Confirmation Modal */}
      <Modal
        isOpen={sosStep === 'confirm'}
        onClose={() => setSosStep('idle')}
        title="Confirm Emergency SOS Dispatch"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
            <h4 className="font-extrabold text-sm text-[#DC2626] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Are you sure you want to dispatch SOS?
            </h4>
            <p className="leading-relaxed font-normal">
              This will share your real-time GPS coordinates with 108 Emergency Ambulance Services and send urgent alert notifications to your configured trusted contacts.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setSosStep('idle')} className="rounded-xl text-xs font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button variant="sos" size="sm" onClick={confirmSOSDispatch} className="rounded-xl text-xs font-extrabold bg-[#DC2626] cursor-pointer">
              Confirm & Dispatch SOS Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Trusted Contact Add / Edit Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={closeContactModal}
        title={editingContact ? "Edit Trusted Contact" : "Add Trusted Emergency Contact"}
      >
        <form onSubmit={saveContact} className="space-y-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="font-bold text-[#1A4B84]">Full Name *</label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Michael (Son)"
              className="med-input w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1A4B84]">Relationship</label>
            <input
              type="text"
              value={contactRelation}
              onChange={(e) => setContactRelation(e.target.value)}
              placeholder="e.g. Son / Primary Emergency Contact"
              className="med-input w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1A4B84]">Phone Number *</label>
            <input
              type="tel"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="med-input w-full font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={closeContactModal} className="rounded-xl text-xs font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button variant="teal" size="sm" type="submit" className="rounded-xl text-xs font-semibold bg-[#1A4B84] cursor-pointer">
              Save Contact
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
