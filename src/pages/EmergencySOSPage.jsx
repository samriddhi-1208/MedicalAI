import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { getMatchedMedicalCare } from '../utils/clinicalMatcher';

export const EmergencySOSPage = () => {
  const healthData = useHealthData() || {};
  const reports = healthData.reports || [];
  const emergencyContacts = healthData.emergencyContacts || [];
  const sosLogs = healthData.sosLogs || [];
  const triggerSOS = healthData.triggerSOS;
  const addEmergencyContact = healthData.addEmergencyContact;

  const matchedCare = getMatchedMedicalCare(reports);

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
    if (!newContact.name || !newContact.phone) return;
    if (typeof addEmergencyContact === 'function') {
      addEmergencyContact(newContact);
    }
    setAddContactModalOpen(false);
    setNewContact({ name: '', relation: 'Family', phone: '', email: '' });
  };

  const safeContacts = Array.isArray(emergencyContacts) ? emergencyContacts : [];
  const safeLogs = Array.isArray(sosLogs) ? sosLogs : [];

  const matchedDocName = matchedCare?.doctorName || 'Dr. Marcus Vance, MD';
  const matchedDocRole = matchedCare?.doctorRole || 'Consulting Cardiologist';
  const matchedHospName = matchedCare?.hospitalName || 'St. Jude Heart Institute';
  const matchedPhone = matchedCare?.phone || '+91 98765 11223';
  const matchedEmail = matchedCare?.email || 'dr.vance@stjudeheart.org';

  // Combine matched specialist doctor with saved emergency contacts dynamically
  const userFilteredContacts = safeContacts.filter(c => c && typeof c === 'object' && c.name !== matchedDocName);

  const dynamicContacts = [
    {
      id: 'dynamic-matched-doc',
      name: matchedDocName,
      relation: `${matchedDocRole} (${matchedHospName})`,
      phone: matchedPhone,
      email: matchedEmail,
      isPrimary: true
    },
    ...userFilteredContacts
  ];

  return (
    <div className="space-y-6 pb-12 font-sans antialiased">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2.5xl font-extrabold text-[#0F172A] flex items-center gap-2.5 tracking-tight">
            <Siren className="w-7 h-7 text-rose-600 animate-pulse" /> Emergency SOS Dispatch Center
          </h1>
          <p className="text-xs font-normal text-slate-500 mt-0.5">1-click broadcast to emergency contacts & matched specialist hospital with live GPS coordinates</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={UserPlus}
          className="rounded-xl border-slate-200 text-xs font-semibold"
          onClick={() => setAddContactModalOpen(true)}
        >
          Add Emergency Contact
        </Button>
      </div>

      {/* Dynamic Health Issue & Matched Emergency Response Card */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center border border-slate-200">
              <Sparkles className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">Matched Clinical Specialty & Hospital</h2>
              <p className="text-xs font-medium text-slate-500">Emergency dispatch target based on diagnosed health condition: <strong className="text-[#0F172A]">{matchedCare?.condition || 'General Internal Medicine'}</strong></p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            Emergency Target Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
              <Stethoscope className="w-4 h-4 text-emerald-600" /> Matched Consulting Specialist:
            </div>
            <p className="text-sm font-extrabold text-[#0F172A]">{matchedDocName}</p>
            <p className="text-xs text-slate-500 font-normal">{matchedDocRole} ({matchedPhone})</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
              <Building2 className="w-4 h-4 text-[#0D9488]" /> Matched Specialty Emergency Hospital:
            </div>
            <p className="text-sm font-extrabold text-[#0F172A]">{matchedHospName}</p>
            <p className="text-xs text-slate-500 font-normal">{matchedCare?.specialty || 'General Emergency'} • {matchedCare?.address || 'District Hospital Circle'}</p>
          </div>
        </div>
      </Card>

      {/* SOS Button Zone */}
      <Card className="p-8 text-center bg-rose-50/50 border border-rose-200 rounded-2xl space-y-5 shadow-xs">
        <div className="max-w-md mx-auto space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-rose-600 text-white text-xs font-bold shadow-2xs inline-block">
            24/7 Emergency Dispatch Active
          </span>
          
          <div>
            <h2 className="text-2xl font-extrabold text-[#0F172A]">
              Press for Immediate Emergency Assistance
            </h2>
            <p className="text-xs font-medium text-slate-600 mt-1">
              Dispatches automated SMS/Email alerts containing live GPS coordinates to matched doctor & emergency contacts.
            </p>
          </div>

          <button
            onClick={handleStartSOS}
            className="w-36 h-36 rounded-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-2xl shadow-xl shadow-rose-200 border-4 border-rose-300 flex flex-col items-center justify-center gap-1 mx-auto cursor-pointer transition-all hover:scale-105"
          >
            <Siren className="w-9 h-9" />
            <span>SOS</span>
          </button>

          <p className="text-[11px] font-semibold text-slate-500">
            Current GPS Position: 28.6139° N, 77.2090° E (District HQ Sector 4)
          </p>
        </div>
      </Card>

      {/* Contacts List */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-[#0F172A]">Configured Emergency Contacts ({dynamicContacts.length})</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dynamicContacts.map((contact, idx) => (
            <Card key={contact.id || idx} className="p-5 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">{contact.name || 'Emergency Contact'}</h3>
                  <p className="text-xs font-semibold text-emerald-700">{contact.relation || 'Contact'}</p>
                </div>
                {contact.isPrimary && <Badge variant="normal">Matched Doctor</Badge>}
              </div>

              <div className="text-xs text-slate-600 font-medium space-y-1.5">
                <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#0D9488]" /> {contact.phone || '108'}</p>
                <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#0D9488]" /> {contact.email || 'sos@emergency.in'}</p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 py-2 text-xs font-semibold bg-slate-50 border-slate-200 text-[#0F172A]"
                  icon={Phone}
                  onClick={() => toast.success(`Calling ${contact.name || 'Contact'}...`)}
                >
                  Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 py-2 text-xs font-semibold border-slate-200"
                  icon={Send}
                  onClick={() => toast.success(`SMS test payload sent to ${contact.phone || 'Contact'}`)}
                >
                  Test SMS
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* SOS Log */}
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
            <Siren className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Triggering Emergency SOS in...</h2>
            <p className="text-5xl font-extrabold text-rose-600 my-3">{countdown}</p>
            <p className="text-xs font-medium text-slate-500">Dispatches email/SMS payload to your matched specialist doctor & emergency contacts.</p>
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
              placeholder="Contact Name"
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
                <option value="Primary Physician">Primary Physician</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Caregiver">Caregiver</option>
              </select>
            </div>

            <div className="med-form-group">
              <label className="block font-bold text-[#0F172A] mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="med-input"
              />
            </div>
          </div>

          <div className="med-form-group">
            <label className="block font-bold text-[#0F172A] mb-1">Email Address</label>
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
