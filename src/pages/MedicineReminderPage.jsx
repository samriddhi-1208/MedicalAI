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

  const takenCount = medicines.filter(m => m.taken).length;
  const totalCount = medicines.length;
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const lowRefills = medicines.filter(m => m.pillsRemaining <= 5);

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
    <div className="space-y-6 pb-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Medication Reminders & Adherence</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage your daily prescription schedule & refill warnings</p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add New Medication
        </Button>
      </div>

      {/* Adherence Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <Card className="p-5 bg-sky-50 border-sky-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase">Today's Adherence Rate</p>
            <p className="text-3xl font-extrabold text-sky-900 mt-1">{adherencePercent}%</p>
            <p className="text-xs text-sky-700 font-medium mt-1">{takenCount} of {totalCount} doses logged</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white text-sky-600 flex items-center justify-center font-bold text-lg border border-sky-200">
            ✓
          </div>
        </Card>

        <Card className="p-5 md:col-span-2 bg-white border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Refill Alerts ({lowRefills.length})
            </span>
            <Badge variant="warning">Pharmacy Alert</Badge>
          </div>

          {lowRefills.length > 0 ? (
            <div className="space-y-1 mt-2">
              {lowRefills.map(m => (
                <p key={m.id} className="text-xs text-slate-700">
                  ⚠️ <strong className="text-slate-900">{m.name}</strong>: Only <span className="text-amber-700 font-bold">{m.pillsRemaining} tablets</span> left in bottle.
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-2">All prescribed medicine supplies are currently sufficient for over 7 days.</p>
          )}
        </Card>

      </div>

      {/* Medicines List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Configured Medication Schedule</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicines.map((med) => (
            <Card key={med.id} className="p-5 space-y-3 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{med.name}</h4>
                    <p className="text-xs text-slate-500">{med.dosage} • {med.form}</p>
                  </div>
                </div>

                <button
                  onClick={() => deleteMedicine(med.id)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded"
                  title="Remove medicine"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="flex justify-between">
                  <span className="text-slate-500">Scheduled Time:</span>
                  <strong className="text-sky-800 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {med.time} ({med.timeSlot})</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500">Pills Remaining:</span>
                  <strong className={med.pillsRemaining <= 5 ? 'text-amber-700' : 'text-slate-800'}>{med.pillsRemaining} of {med.totalPills}</strong>
                </p>
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">💡 {med.instructions}</p>
              </div>

              <div className="flex justify-between items-center pt-1">
                <Badge variant="info">{med.purpose}</Badge>

                <Button
                  variant={med.taken ? 'emerald' : 'primary'}
                  size="sm"
                  icon={med.taken ? Check : Pill}
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
        <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
          <div className="med-form-group">
            <label>Medication Name</label>
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
              <label>Dosage</label>
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
              <label>Time Slot</label>
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
            <label>Instructions</label>
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
            <Button variant="primary" size="sm" type="submit">
              Save Schedule
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
