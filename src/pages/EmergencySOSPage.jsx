import React, { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const EmergencySOSPage = () => {
  const { userProfile } = useHealthData();
  const [sosActive, setSosActive] = useState(false);
  const [sosStep, setSosStep] = useState('idle'); // 'idle' | 'activating' | 'sent'
  const [locationShared, setLocationShared] = useState(false);

  const handleActivateSOS = () => {
    setSosStep('activating');
    toast.loading("Activating 108 Emergency SOS...", { id: 'sos-toast' });

    setTimeout(() => {
      setSosStep('sent');
      setSosActive(true);
      setLocationShared(true);
      toast.dismiss('sos-toast');
      toast.success("EMERGENCY ALERT DISPATCHED TO 108 & TRUSTED CONTACTS!");
    }, 2000);
  };

  const trustedContacts = [
    { name: "Michael (Son)", relation: "Primary Contact", phone: "+1 (555) 234-5678", notified: sosStep === 'sent' },
    { name: "Dr. Sarah Jenkins", relation: "Primary Care Physician", phone: "+1 (555) 987-6543", notified: sosStep === 'sent' }
  ];

  const emergencyHospitals = [
    {
      name: "City General Hospital",
      distance: "1.2 mi",
      driveTime: "3 min drive",
      address: "100 Medical Center Blvd",
      phone: "+1 (555) 100-2000",
      emergencyType: "Level 1 Trauma Center"
    },
    {
      name: "Mercy Medical Center",
      distance: "3.5 mi",
      driveTime: "8 min drive",
      address: "500 Healthcare Way",
      phone: "+1 (555) 300-4000",
      emergencyType: "Urgent Care & ER"
    }
  ];

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
            24/7 ACTIVE DISPATCH
          </span>
        </div>

        <p className="text-xs sm:text-sm text-white/90 font-medium">
          If you are experiencing a life-threatening medical emergency, call 108 or activate SOS immediately below.
        </p>
      </Card>

      {/* Large Centered Red Pulsing Circular SOS Button Section */}
      <Card className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
        
        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-xl font-extrabold text-[#1A4B84]">1-Tap Emergency Dispatch</h2>
          <p className="text-xs text-slate-500 font-normal">
            {sosStep === 'sent' 
              ? '✅ Emergency SOS dispatched! Location shared with 108 services and trusted contacts.'
              : 'Press the SOS button to instantly share your location and alert emergency contacts.'
            }
          </p>
        </div>

        {/* Large Circular SOS Button */}
        <div className="py-4 flex justify-center">
          <button
            onClick={handleActivateSOS}
            disabled={sosStep === 'activating'}
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white flex flex-col items-center justify-center shadow-xl transition-transform active:scale-95 cursor-pointer ${
              sosStep === 'sent' ? 'ring-8 ring-emerald-500 bg-emerald-600' : 'animate-sos-pulse'
            }`}
          >
            <Siren className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            <span className="text-xl sm:text-2xl font-black tracking-widest mt-1">
              {sosStep === 'activating' ? 'SENDING...' : sosStep === 'sent' ? 'ACTIVE' : 'SOS'}
            </span>
          </button>
        </div>

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
            Call Emergency Services (108)
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={MapPin}
            onClick={() => {
              setLocationShared(true);
              toast.success("GPS Location broadcast updated!");
            }}
            className="py-3.5 px-6 text-xs font-semibold rounded-xl border-slate-200 text-slate-700 w-full sm:w-auto cursor-pointer"
          >
            {locationShared ? 'Location Shared ✓' : 'Share My Location'}
          </Button>
        </div>

      </Card>

      {/* Trusted Contacts Status Panel */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-[#1A4B84] flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-[#2D90A6]" /> Trusted Contacts Alert Status
          </h3>
          <span className="text-xs font-semibold text-slate-500">Auto-Notified on SOS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {trustedContacts.map((c, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-[#1A4B84]">{c.name}</h4>
                <p className="text-xs text-slate-500 font-medium">{c.relation}</p>
                <p className="text-xs text-slate-700 font-mono mt-0.5">{c.phone}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                c.notified 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {c.notified ? 'Notified ✓' : 'Alert Ready'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Nearest Emergency Rooms List */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-[#1A4B84] flex items-center gap-2">
            <Building2 className="w-4.5 h-4.5 text-[#2D90A6]" /> Nearest Emergency Rooms
          </h3>
          <span className="text-xs font-semibold text-slate-500">Sorted by Proximity</span>
        </div>

        <div className="space-y-3">
          {emergencyHospitals.map((h, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-[#1A4B84]">{h.name}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200">
                    {h.emergencyType}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-normal">{h.address}</p>
                <p className="text-xs font-bold text-[#2D90A6]">{h.distance} • {h.driveTime}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="sos"
                  size="sm"
                  icon={Phone}
                  onClick={() => window.open(`tel:${h.phone}`)}
                  className="py-2 px-3 text-xs font-semibold rounded-xl cursor-pointer bg-[#DC2626]"
                >
                  Call Ahead
                </Button>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name)}`}
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
      </Card>

    </div>
  );
};
