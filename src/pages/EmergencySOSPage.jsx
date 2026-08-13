import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Siren, 
  Phone, 
  MapPin, 
  Mail, 
  UserPlus, 
  History, 
  Send,
  Building2,
  Stethoscope,
  Sparkles,
  Compass,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { getMatchedMedicalCare } from '../utils/clinicalMatcher';

export const EmergencySOSPage = () => {
  const navigate = useNavigate();
  const healthData = useHealthData() || {};
  const { reports, userProfile, emergencyContacts, sosLogs, triggerSOS, addEmergencyContact } = healthData;

  const matchedCare = getMatchedMedicalCare(reports || []);

  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [addContactModalOpen, setAddContactModalOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  const [newContact, setNewContact] = useState({
    name: '',
    relation: 'Family',
    phone: '',
    email: ''
  });

  useEffect(() => {
    let timer;
    if (sosModalOpen && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (sosModalOpen && countdown === 0) {
      if (typeof triggerSOS === 'function') {
        triggerSOS("Manual High-Priority Emergency SOS");
      }
      setSosModalOpen(false);
      setSosActive(true);
      toast.error("🚨 EMERGENCY SOS DISPATCHED TO ALL CONTACTS!", { duration: 5000 });
    }
    return () => clearInterval(timer);
  }, [sosModalOpen, countdown]);

  const handleStartSOS = () => {
    setCountdown(5);
    setSosModalOpen(true);
  };

  const handleCancelSOS = () => {
    setSosModalOpen(false);
    toast.success("Emergency SOS dispatch cancelled.");
  };

  const handleAddContactSubmit = (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) {
      toast.error("Please enter contact name and phone number.");
      return;
    }
    if (typeof addEmergencyContact === 'function') {
      addEmergencyContact(newContact);
    }
    setAddContactModalOpen(false);
    setNewContact({ name: '', relation: 'Family', phone: '', email: '' });
  };

  const safeContacts = Array.isArray(emergencyContacts) && emergencyContacts.length > 0 
    ? emergencyContacts 
    : [
        { id: 'c-default-1', name: 'Michael (Son)', relation: 'Son / Primary Contact', phone: '+91 98765 43210', email: 'michael@example.com', isPrimary: true },
        { id: 'c-default-2', name: 'Dr. Sarah Jenkins', relation: 'Primary Care Physician', phone: '+91 98123 45678', email: 'dr.jenkins@clinic.org', isPrimary: false }
      ];

  const safeLogs = Array.isArray(sosLogs) ? sosLogs : [];

  return (
    <div className="space-y-6 pb-12 font-sans antialiased">
      
      {/* Header Bar matching Figma */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span className="text-xs text-rose-800 font-bold uppercase tracking-wider">24/7 Patient Emergency Center</span>
          </div>
          <h1 className="text-2.5xl font-extrabold text-[#0F172A] flex items-center gap-2.5 tracking-tight mt-0.5">
            Emergency SOS Dispatch Center
          </h1>
          <p className="text-xs font-normal text-slate-500">
            1-click emergency broadcast to your saved contacts & 108 helpline with live GPS coordinates
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={UserPlus}
            className="rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
            onClick={() => setAddContactModalOpen(true)}
          >
            Add Emergency Contact
          </Button>
        </div>
      </div>

      {/* Large Red Pulsing SOS Button Zone matching Mobile & Desktop Figma Artboards */}
      <Card className="p-8 text-center bg-rose-50/60 border border-rose-200 rounded-2xl space-y-6 shadow-xs">
        <div className="max-w-md mx-auto space-y-5">
          
          <span className="px-3.5 py-1 rounded-full bg-rose-600 text-white text-xs font-bold shadow-2xs inline-block">
            24/7 Emergency Dispatch Active
          </span>
          
          {/* Pulsing Large SOS Circle Button */}
          <button
            onClick={handleStartSOS}
            className="w-40 h-40 rounded-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-3xl shadow-2xl shadow-rose-300 border-4 border-rose-300 flex flex-col items-center justify-center gap-1 mx-auto cursor-pointer transition-all hover:scale-105 animate-pulse"
          >
            <span className="text-4xl leading-none">*</span>
            <span className="tracking-widest">SOS</span>
          </button>

          <p className="text-xs font-semibold text-slate-600">
            {sosActive ? '🚨 Emergency location payload sent to trusted contacts!' : 'Sending live GPS coordinates to trusted contacts...'}
          </p>

          {/* Prominent Call Ambulance Button matching Figma */}
          <button
            onClick={() => {
              toast.success("Dialing National Ambulance Hotline 108...");
              window.open("tel:108");
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-rose-200 cursor-pointer transition-colors"
          >
            <PhoneCall className="w-5 h-5 text-white" />
            <span>Call Ambulance (108 / 911)</span>
          </button>

        </div>
      </Card>

      {/* Nearest Emergency Rooms & Trusted Contacts Grid matching Figma */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Nearest Emergency Rooms (7 cols) */}
        <Card className="lg:col-span-7 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Building2 className="w-4.5 h-4.5 text-[#0D9488]" /> Nearest Emergency Rooms
              </h3>
              <p className="text-xs text-slate-500 font-medium">Real-time GPS proximity distance</p>
            </div>

            <button
              onClick={() => navigate('/app/hospitals')}
              className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Map</span> <Navigation className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0F172A]">City General District Hospital</h4>
                  <p className="text-slate-500 font-medium">Emergency Room & Trauma Center • 108 Enabled</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-[#0F172A] block">1.2 km</span>
                <span className="text-[11px] text-slate-500">~3 min drive</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5 text-[#0D9488]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0F172A]">Mercy Medical Specialty Center</h4>
                  <p className="text-slate-500 font-medium">Trauma & Cardiac ICU Unit</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-[#0F172A] block">3.5 km</span>
                <span className="text-[11px] text-slate-500">~8 min drive</span>
              </div>
            </div>

          </div>
        </Card>

        {/* Right: Trusted Contacts Notified List matching Figma (5 cols) */}
        <Card className="lg:col-span-5 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-[#0F172A]">Trusted Contacts Notified</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              Active List
            </span>
          </div>

          <div className="space-y-3">
            {safeContacts.map((contact, idx) => (
              <div key={contact.id || idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white font-bold flex items-center justify-center text-xs">
                    {contact.name ? contact.name.charAt(0) : 'C'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#0F172A]">{contact.name}</h4>
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> {sosActive ? 'Alert Sent' : 'Ready for Alert'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      toast.success(`Calling ${contact.name}...`);
                      window.open(`tel:${contact.phone}`);
                    }}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                    title={`Call ${contact.phone}`}
                  >
                    <Phone className="w-4 h-4 text-[#0D9488]" />
                  </button>
                  <button
                    onClick={() => toast.success(`Test SMS alert dispatched to ${contact.name}`)}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                    title="Send Test SMS"
                  >
                    <Send className="w-4 h-4 text-[#0D9488]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* SOS Log History */}
      <Card className="p-7 space-y-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <h2 className="text-lg font-extrabold text-[#0F172A]">Emergency SOS Dispatch History</h2>

        {safeLogs.length === 0 ? (
          <p className="text-xs font-medium text-slate-500 py-4 text-center">No emergency SOS alerts triggered.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="med-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Trigger Type</th>
                  <th>GPS Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {safeLogs.map((log, idx) => (
                  <tr key={log.id || idx}>
                    <td className="font-mono text-slate-500">{log.timestamp || 'N/A'}</td>
                    <td className="font-bold text-rose-600">{log.triggerType || 'SOS Trigger'}</td>
                    <td className="text-slate-600">{log.location || 'Current GPS'}</td>
                    <td><Badge variant="critical">{log.status || 'Dispatched'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 5-Second Countdown Modal */}
      <Modal
        isOpen={sosModalOpen}
        onClose={handleCancelSOS}
        maxWidth="max-w-md"
      >
        <div className="text-center space-y-4 py-2 font-sans">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <Siren className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Triggering Emergency SOS in...</h2>
            <p className="text-5xl font-extrabold text-rose-600 my-3">{countdown}</p>
            <p className="text-xs font-medium text-slate-500">Dispatches email/SMS payload to your saved emergency contacts with live GPS coordinates.</p>
          </div>

          <Button variant="danger" size="md" className="w-full py-3 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700" onClick={handleCancelSOS}>
            CANCEL SOS DISPATCH NOW
          </Button>
        </div>
      </Modal>

      {/* Add Contact Modal */}
      <Modal
        isOpen={addContactModalOpen}
        onClose={() => setAddContactModalOpen(false)}
        title="Add Emergency Contact"
      >
        <form onSubmit={handleAddContactSubmit} className="space-y-3.5 text-xs font-sans">
          <div className="med-form-group">
            <label className="block font-bold text-[#0F172A] mb-1">Contact Name</label>
            <input
              type="text"
              required
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="med-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="med-form-group">
              <label className="block font-bold text-[#0F172A] mb-1">Relationship</label>
              <select
                value={newContact.relation}
                onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                className="med-input"
              >
                <option value="Family">Family</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Caregiver">Caregiver</option>
                <option value="Primary Doctor">Primary Doctor</option>
              </select>
            </div>

            <div className="med-form-group">
              <label className="block font-bold text-[#0F172A] mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="med-input"
              />
            </div>
          </div>

          <div className="med-form-group">
            <label className="block font-bold text-[#0F172A] mb-1">Email Address (Optional)</label>
            <input
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              placeholder="contact@example.com"
              className="med-input"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setAddContactModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-[#0F172A] hover:bg-[#1E293B]">
              Save Contact
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
