import React, { useState, useEffect } from 'react';
import { 
  Siren, 
  Phone, 
  MapPin, 
  Mail, 
  UserPlus, 
  History, 
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const EmergencySOSPage = () => {
  const { emergencyContacts, sosLogs, triggerSOS, addEmergencyContact } = useHealthData();
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
      triggerSOS("Manual High-Priority Emergency SOS");
      setSosModalOpen(false);
      toast.error("🚨 EMERGENCY SOS DISPATCHED TO ALL CONTACTS!", { duration: 5000 });
    }
    return () => clearInterval(timer);
  }, [sosModalOpen, countdown, triggerSOS]);

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
    addEmergencyContact(newContact);
    setAddContactModalOpen(false);
    setNewContact({ name: '', relation: 'Family', phone: '', email: '' });
  };

  return (
    <div className="space-y-6 pb-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Siren className="w-6 h-6 text-red-600" /> Emergency SOS Dispatch Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">1-click broadcast to emergency contacts with live GPS coordinates</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={UserPlus}
          onClick={() => setAddContactModalOpen(true)}
        >
          Add Emergency Contact
        </Button>
      </div>

      {/* SOS Button Zone */}
      <Card className="p-8 text-center bg-red-50 border-red-200 space-y-4">
        <div className="max-w-md mx-auto space-y-4">
          <Badge variant="critical">24/7 Emergency Response</Badge>
          
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Press for Immediate Emergency Assistance
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Dispatches automated email & SMS alerts containing your live GPS position to saved contacts.
            </p>
          </div>

          <button
            onClick={handleStartSOS}
            className="w-36 h-36 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-2xl shadow-lg border-4 border-red-300 flex flex-col items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <Siren className="w-8 h-8" />
            <span>SOS</span>
          </button>

          <p className="text-[11px] text-slate-500">
            Current GPS Position: 28.6139° N, 77.2090° E
          </p>
        </div>
      </Card>

      {/* Contacts List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Configured Emergency Contacts ({emergencyContacts.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emergencyContacts.map((contact) => (
            <Card key={contact.id} className="p-4 space-y-2 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{contact.name}</h4>
                  <p className="text-xs text-sky-700 font-medium">{contact.relation}</p>
                </div>
                {contact.isPrimary && <Badge variant="normal">Primary</Badge>}
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {contact.phone}</p>
                <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {contact.email}</p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  icon={Phone}
                  onClick={() => toast.success(`Calling ${contact.name}...`)}
                >
                  Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  icon={Send}
                  onClick={() => toast.success(`SMS test payload sent to ${contact.phone}`)}
                >
                  Test SMS
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* SOS Log */}
      <Card className="p-5 space-y-4 bg-white">
        <h3 className="text-base font-bold text-slate-900">Emergency SOS Dispatch History</h3>

        {sosLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No emergency SOS alerts triggered.</p>
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
                {sosLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="font-mono text-slate-600">{log.timestamp}</td>
                    <td className="font-semibold text-red-700">{log.triggerType}</td>
                    <td className="text-slate-600">{log.location}</td>
                    <td><Badge variant="critical">{log.status}</Badge></td>
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
        <div className="text-center space-y-4 py-2">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Siren className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">Triggering Emergency SOS in...</h3>
            <p className="text-4xl font-extrabold text-red-600 my-2">{countdown}</p>
            <p className="text-xs text-slate-600">Dispatches email/SMS payload to your emergency contacts.</p>
          </div>

          <Button variant="danger" size="md" className="w-full" onClick={handleCancelSOS}>
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
        <form onSubmit={handleAddContactSubmit} className="space-y-3 text-xs">
          <div className="med-form-group">
            <label>Contact Name</label>
            <input
              type="text"
              required
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              placeholder="Dr. Aris Thorne"
              className="med-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="med-form-group">
              <label>Relationship</label>
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
              <label>Phone Number</label>
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
            <label>Email Address</label>
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
            <Button variant="primary" size="sm" type="submit">
              Save Contact
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
