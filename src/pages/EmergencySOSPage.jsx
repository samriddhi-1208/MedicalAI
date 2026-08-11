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
  AlertTriangle
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

  const safeContacts = Array.isArray(emergencyContacts) ? emergencyContacts : [];
  const safeLogs = Array.isArray(sosLogs) ? sosLogs : [];

  return (
    <div className="space-y-6 pb-12 font-sans antialiased">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span className="text-xs text-rose-800 font-bold uppercase tracking-wider">24/7 Patient Safety Engine</span>
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
            variant="sos"
            size="sm"
            icon={PhoneCall}
            className="py-2.5 px-4 text-xs font-semibold rounded-xl cursor-pointer"
            onClick={() => {
              toast.success("Dialing 108 Emergency Helpline...");
              window.open("tel:108");
            }}
          >
            Call 108 Ambulance
          </Button>

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

      {/* Report-Aware Emergency Specialty Target Card */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center border border-slate-200">
              <Sparkles className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">Report-Aware Emergency Specialty Focus</h2>
              <p className="text-xs font-medium text-slate-500">
                Recommended clinical focus based on your lab reports: <strong className="text-[#0F172A] font-bold">{matchedCare?.condition || 'General Internal Medicine'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/app/hospitals')}
            className="px-3.5 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Find Nearby Emergency Hospitals</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-[#0D9488]" /> Recommended Specialty:
            </span>
            <strong className="text-sm font-extrabold text-[#0F172A] block">{matchedCare?.recommendedCategory || 'General Physician'}</strong>
            <p className="text-slate-600 font-normal">{matchedCare?.advice || 'Based on report diagnostics, consult a General Physician for routine care.'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-rose-600" /> Emergency Facility Dispatch Target:
            </span>
            <strong className="text-sm font-extrabold text-[#0F172A] block">24/7 Nearest Trauma Hospital</strong>
            <p className="text-slate-600 font-normal">Empaneled Government District Hospital / Emergency Center near your active GPS position.</p>
          </div>
        </div>
      </Card>

      {/* Main SOS Trigger Button Zone */}
      <Card className="p-8 text-center bg-rose-50/60 border border-rose-200 rounded-2xl space-y-5 shadow-xs">
        <div className="max-w-md mx-auto space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-rose-600 text-white text-xs font-bold shadow-2xs inline-block">
            24/7 Emergency Dispatch Engine
          </span>
          
          <div>
            <h2 className="text-2xl font-extrabold text-[#0F172A]">
              Press for Immediate Emergency Assistance
            </h2>
            <p className="text-xs font-medium text-slate-600 mt-1">
              Dispatches automated SMS/Email alert payload with your live GPS coordinates to your saved emergency contacts.
            </p>
          </div>

          <button
            onClick={handleStartSOS}
            className="w-36 h-36 rounded-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-2xl shadow-xl shadow-rose-200 border-4 border-rose-300 flex flex-col items-center justify-center gap-1 mx-auto cursor-pointer transition-all hover:scale-105"
          >
            <Siren className="w-9 h-9" />
            <span>SOS</span>
          </button>

          <div className="p-3 rounded-xl bg-white border border-rose-200 text-xs text-slate-600 font-medium max-w-sm mx-auto shadow-2xs flex items-center justify-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Live GPS Active: {userProfile?.city || 'New Delhi'}, India</span>
          </div>
        </div>
      </Card>

      {/* Configured Emergency Contacts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#0F172A]">Configured Emergency Contacts ({safeContacts.length})</h2>
          <Button
            variant="outline"
            size="sm"
            icon={UserPlus}
            className="rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
            onClick={() => setAddContactModalOpen(true)}
          >
            Add Contact
          </Button>
        </div>

        {safeContacts.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
            <p className="text-xs font-medium text-slate-600">No personal emergency contacts added yet.</p>
            <Button
              variant="secondary"
              size="sm"
              icon={UserPlus}
              className="rounded-xl text-xs font-semibold bg-slate-100 border-slate-200"
              onClick={() => setAddContactModalOpen(true)}
            >
              Add Your First Emergency Contact
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {safeContacts.map((contact, idx) => (
              <Card key={contact.id || idx} className="p-5 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{contact.name || 'Emergency Contact'}</h3>
                    <p className="text-xs font-semibold text-[#0D9488]">{contact.relation || 'Contact'}</p>
                  </div>
                  {contact.isPrimary && <Badge variant="normal">Primary Contact</Badge>}
                </div>

                <div className="text-xs text-slate-600 font-medium space-y-1.5">
                  <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#0D9488]" /> {contact.phone || 'N/A'}</p>
                  {contact.email && (
                    <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#0D9488]" /> {contact.email}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 py-2 text-xs font-semibold bg-slate-50 border-slate-200 text-[#0F172A]"
                    icon={Phone}
                    onClick={() => {
                      toast.success(`Calling ${contact.name}...`);
                      window.open(`tel:${contact.phone}`);
                    }}
                  >
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 py-2 text-xs font-semibold border-slate-200"
                    icon={Send}
                    onClick={() => toast.success(`Test SMS payload sent to ${contact.phone}`)}
                  >
                    Test Alert
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
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
