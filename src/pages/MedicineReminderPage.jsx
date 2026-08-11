import React, { useState } from 'react';
import { 
  Pill, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const MedicineReminderPage = () => {
  const { medicines, toggleMedicineTaken, addMedicine, deleteMedicine } = useHealthData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    dosage: '500 mg',
    form: 'Tablet',
    frequency: 'Once Daily',
    timeSlot: 'Morning',
    time: '08:00 AM',
    purpose: 'Blood Sugar Management',
    totalPills: '30',
    instructions: 'Take after meals with water'
  });

  const safeMedicines = Array.isArray(medicines) ? medicines : [];
  const takenCount = safeMedicines.filter(m => m.taken).length;
  const totalCount = safeMedicines.length;
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const lowRefills = safeMedicines.filter(m => m.pillsRemaining <= 5);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    addMedicine(formData);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      dosage: '500 mg',
      form: 'Tablet',
      frequency: 'Once Daily',
      timeSlot: 'Morning',
      time: '08:00 AM',
      purpose: 'General Wellness',
      totalPills: '30',
      instructions: 'Take after meals with water'
    });
  };

  return (
    <div className="space-y-6 pb-10 font-sans antialiased">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2.5xl font-extrabold text-[#0F172A] tracking-tight">Medication Schedule & Adherence</h1>
          <p className="text-xs font-normal text-slate-500 mt-0.5">Track daily doses, logged prescriptions, and pharmacy refill alerts</p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          className="bg-[#0F172A] hover:bg-[#1E293B] text-xs font-semibold rounded-xl cursor-pointer"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add New Medication
        </Button>
      </div>

      {/* Adherence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <Card className="p-5 bg-slate-900 text-white border border-slate-800 flex items-center justify-between rounded-2xl shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Adherence Rate</p>
            <p className="text-3.5xl font-extrabold text-white mt-1">{adherencePercent}%</p>
            <p className="text-xs text-slate-300 font-medium mt-1">{takenCount} of {totalCount} doses logged</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center font-bold text-lg border border-white/10">
            ✓
          </div>
        </Card>

        <Card className="p-5 md:col-span-2 bg-white border border-slate-200 flex flex-col justify-between rounded-2xl shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-amber-700" /> Pharmacy Refill Warnings ({lowRefills.length})
            </span>
            <Badge variant="warning">Low Supply</Badge>
          </div>

          {lowRefills.length > 0 ? (
            <div className="space-y-1 mt-2 text-xs">
              {lowRefills.map(m => (
                <p key={m.id} className="text-slate-700">
                  ⚠️ <strong className="text-[#0F172A]">{m.name}</strong>: Only <span className="text-amber-800 font-bold">{m.pillsRemaining} tablets</span> remaining in bottle.
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-medium mt-2">All prescribed medication supplies are currently sufficient for over 7 days.</p>
          )}
        </Card>

      </div>

      {/* Medicines List */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-[#0F172A]">Prescription Schedule</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeMedicines.map((med) => (
            <Card key={med.id} className="p-5 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center shrink-0 border border-slate-200">
                    <Pill className="w-4.5 h-4.5 text-[#0D9488]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">{med.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{med.dosage} • {med.form}</p>
                  </div>
                </div>

                <button
                  onClick={() => deleteMedicine(med.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove medicine"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
                <p className="flex justify-between">
                  <span className="text-slate-500">Scheduled Time:</span>
                  <strong className="text-[#0F172A] flex items-center gap-1 font-bold"><Clock className="w-3.5 h-3.5 text-[#0D9488]" /> {med.time} ({med.timeSlot})</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500">Pills Remaining:</span>
                  <strong className={med.pillsRemaining <= 5 ? 'text-amber-800 font-bold' : 'text-slate-800 font-bold'}>{med.pillsRemaining} of {med.totalPills}</strong>
                </p>
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 font-medium">💡 {med.instructions}</p>
              </div>

              <div className="flex justify-between items-center pt-1">
                <Badge variant="info">{med.purpose}</Badge>

                <Button
                  variant={med.taken ? 'emerald' : 'primary'}
                  size="sm"
                  icon={med.taken ? Check : Pill}
                  className={`text-xs font-semibold rounded-xl cursor-pointer ${
                    med.taken ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-[#0F172A] hover:bg-[#1E293B] text-white'
                  }`}
                  onClick={() => toggleMedicineTaken(med.id)}
                >
                  {med.taken ? 'Logged ✓' : 'Mark Taken'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Medication Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Prescription Medication"
      >
        <form onSubmit={handleAddSubmit} className="space-y-3 text-xs font-sans">
          <div className="med-form-group">
            <label className="block font-bold text-[#0F172A] mb-1">Medication Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Metformin 500mg"
              className="med-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="med-form-group">
              <label className="block font-bold text-[#0F172A] mb-1">Dosage</label>
              <input
                type="text"
                required
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="500 mg"
                className="med-input"
              />
            </div>

            <div className="med-form-group">
              <label className="block font-bold text-[#0F172A] mb-1">Time Slot</label>
              <select
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="med-input"
              >
                <option value="Morning">Morning (08:00 AM)</option>
                <option value="Afternoon">Afternoon (01:30 PM)</option>
                <option value="Evening">Evening (07:00 PM)</option>
                <option value="Night">Night (09:30 PM)</option>
              </select>
            </div>
          </div>

          <div className="med-form-group">
            <label className="block font-bold text-[#0F172A] mb-1">Instructions</label>
            <input
              type="text"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Take after food with water"
              className="med-input"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-[#0F172A] hover:bg-[#1E293B]">
              Save Schedule
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
