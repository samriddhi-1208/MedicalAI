import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Check,
  PauseCircle,
  PlayCircle,
  Edit2,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const MedicineReminderPage = () => {
  const { 
    language,
    medicines, 
    addMedicine, 
    updateMedicine,
    deleteMedicine, 
    toggleMedicinePause,
    toggleMedicineTaken 
  } = useHealthData();

  const t = (key) => getTranslation(language, key);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    dose: '1 tablet',
    dosage: '1 tablet',
    frequency: 'Once daily',
    scheduled_time: '08:00 AM',
    time: '08:00 AM',
    timeSlot: 'Morning',
    mealRelation: 'After meal',
    mealType: 'Lunch',
    delayMinutes: '30',
    purpose: 'General Wellness',
    totalPills: '30'
  });

  // Request browser notification permission for medicine reminders
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const safeMedicines = Array.isArray(medicines) ? medicines : [];
  const takenCount = safeMedicines.filter(m => m.taken).length;
  const totalCount = safeMedicines.length;
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;
  const lowRefills = safeMedicines.filter(m => (m.pillsRemaining || 30) <= 5);

  const handleOpenAdd = () => {
    setEditingMedId(null);
    setFormData({
      name: '',
      dose: '1 tablet',
      dosage: '1 tablet',
      frequency: 'Once daily',
      scheduled_time: '08:00 AM',
      time: '08:00 AM',
      timeSlot: 'Morning',
      mealRelation: 'After meal',
      mealType: 'Lunch',
      delayMinutes: '30',
      purpose: 'General Wellness',
      totalPills: '30'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setEditingMedId(med.id);
    setFormData({
      name: med.name || '',
      dose: med.dose || med.dosage || '1 tablet',
      dosage: med.dosage || med.dose || '1 tablet',
      frequency: med.frequency || 'Once daily',
      scheduled_time: med.scheduledTime || med.time || '08:00 AM',
      time: med.scheduledTime || med.time || '08:00 AM',
      timeSlot: med.timeSlot || 'Morning',
      mealRelation: med.mealRelation || 'After meal',
      mealType: med.mealType || 'Lunch',
      delayMinutes: String(med.delayMinutes || 30),
      purpose: med.purpose || 'General Wellness',
      totalPills: String(med.totalPills || 30)
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingMedId) {
      updateMedicine(editingMedId, {
        name: formData.name.trim(),
        dose: formData.dose,
        dosage: formData.dose,
        frequency: formData.frequency,
        scheduled_time: formData.time,
        time: formData.time,
        timeSlot: formData.timeSlot,
        meal_relation: formData.mealRelation,
        mealRelation: formData.mealRelation,
        meal_type: formData.mealType,
        mealType: formData.mealType,
        delay_minutes: Number(formData.delayMinutes),
        delayMinutes: Number(formData.delayMinutes),
        purpose: formData.purpose,
        total_pills: parseInt(formData.totalPills || 30),
        totalPills: parseInt(formData.totalPills || 30)
      });
    } else {
      addMedicine({
        name: formData.name.trim(),
        dose: formData.dose,
        dosage: formData.dose,
        frequency: formData.frequency,
        scheduled_time: formData.time,
        time: formData.time,
        timeSlot: formData.timeSlot,
        mealRelation: formData.mealRelation,
        mealType: formData.mealType,
        delayMinutes: Number(formData.delayMinutes),
        purpose: formData.purpose,
        totalPills: formData.totalPills
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2.5xl font-extrabold text-[#1A4B84] tracking-tight flex items-center gap-2.5">
            <Pill className="w-7 h-7 text-[#2D90A6]" /> Medicine Reminders & Adherence
          </h1>
          <p className="text-xs font-normal text-slate-500 mt-1">Configure your personalized prescription schedule, meal relations, and timer notifications</p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          className="bg-[#1A4B84] hover:bg-[#143A66] text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
          onClick={handleOpenAdd}
        >
          {t('addMedicine')}
        </Button>
      </div>

      {/* Adherence & Supply Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <Card className="p-5 bg-gradient-to-br from-[#1A4B84] to-[#143A66] text-white border border-[#1A4B84] flex items-center justify-between rounded-2xl shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">Today's Adherence Rate</p>
            <p className="text-3.5xl font-extrabold text-white mt-1">{adherencePercent}%</p>
            <p className="text-xs text-slate-300 font-medium mt-1">{takenCount} of {totalCount} doses logged</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center font-bold text-lg border border-white/10">
            ✓
          </div>
        </Card>

        <Card className="p-5 md:col-span-2 bg-white border border-slate-200 flex flex-col justify-between rounded-2xl shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#1A4B84] flex items-center gap-1.5 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Refill Warning Threshold ({lowRefills.length})
            </span>
            <Badge variant="warning">Supply Alert</Badge>
          </div>

          {lowRefills.length > 0 ? (
            <div className="space-y-1 mt-2 text-xs">
              {lowRefills.map(m => (
                <p key={m.id} className="text-slate-700">
                  ⚠️ <strong className="text-[#1A4B84]">{m.name}</strong>: Only <span className="text-amber-800 font-bold">{m.pillsRemaining} doses</span> remaining in supply.
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-medium mt-2">All prescribed medication supplies are currently sufficient for over 7 days.</p>
          )}
        </Card>

      </div>

      {/* Medicines CRUD Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#1A4B84]">Active Prescriptions ({safeMedicines.length})</h3>
        </div>

        {safeMedicines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeMedicines.map((med) => (
              <Card key={med.id} className={`p-5 space-y-4 bg-white border rounded-2xl shadow-xs transition-all ${med.isPaused ? 'border-amber-200 opacity-80 bg-amber-50/20' : 'border-slate-200'}`}>
                
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF6F8] text-[#1A4B84] flex items-center justify-center shrink-0 border border-[#2D90A6]/30 font-bold">
                      <Pill className="w-5 h-5 text-[#2D90A6]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-[#1A4B84]">{med.name}</h4>
                        {med.isPaused && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            Paused
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{med.dose || med.dosage} • {med.frequency}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(med)}
                      className="p-1.5 text-slate-400 hover:text-[#1A4B84] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit medicine"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMedicine(med.id)}
                      className="p-1.5 text-slate-400 hover:text-[#DC2626] rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
                  <p className="flex justify-between items-center">
                    <span className="text-slate-500">Scheduled Time:</span>
                    <strong className="text-[#1A4B84] flex items-center gap-1 font-bold">
                      <Clock className="w-3.5 h-3.5 text-[#2D90A6]" /> {med.scheduledTime || med.time} ({med.timeSlot || 'Morning'})
                    </strong>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-slate-500">Meal Relation:</span>
                    <strong className="text-slate-800 font-semibold">{med.mealRelation} ({med.delayMinutes} mins delay after {med.mealType})</strong>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-slate-500">Pills Remaining:</span>
                    <strong className={(med.pillsRemaining || 30) <= 5 ? 'text-amber-800 font-bold' : 'text-slate-800 font-bold'}>{med.pillsRemaining ?? 30} of {med.totalPills ?? 30}</strong>
                  </p>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <Badge variant="info">{med.purpose || 'General Wellness'}</Badge>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMedicinePause(med.id)}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition-colors cursor-pointer flex items-center gap-1 ${
                        med.isPaused 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
                          : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {med.isPaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                      {med.isPaused ? 'Resume' : 'Pause'}
                    </button>

                    <Button
                      variant={med.taken ? 'emerald' : 'primary'}
                      size="sm"
                      icon={med.taken ? Check : Pill}
                      disabled={med.isPaused}
                      className={`text-xs font-semibold rounded-xl cursor-pointer ${
                        med.taken ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-[#1A4B84] hover:bg-[#143A66] text-white'
                      }`}
                      onClick={() => toggleMedicineTaken(med.id)}
                    >
                      {med.taken ? t('logged') : t('markAsTaken')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 max-w-xl mx-auto my-6">
            <Pill className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-[#1A4B84]">No Medicine Reminders Configured</h3>
              <p className="text-xs text-slate-500 font-normal">Add your daily prescriptions and set custom timers based on meal relations.</p>
            </div>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenAdd}
              className="bg-[#1A4B84] hover:bg-[#143A66] text-xs font-bold rounded-xl cursor-pointer"
            >
              {t('addMedicine')}
            </Button>
          </Card>
        )}
      </div>

      {/* Add / Edit Prescription Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingMedId ? "Edit Prescription Reminder" : "Add Medicine Reminder"}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-sans">
          
          <div className="med-form-group">
            <label className="block font-bold text-[#1A4B84] mb-1">Medicine Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Paracetamol, Metformin 500mg"
              className="med-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="med-form-group">
              <label className="block font-bold text-[#1A4B84] mb-1">Dose / Quantity *</label>
              <input
                type="text"
                required
                value={formData.dose}
                onChange={(e) => setFormData({ ...formData, dose: e.target.value, dosage: e.target.value })}
                placeholder="e.g. 1 tablet, 5 ml, 2 capsules"
                className="med-input"
              />
            </div>

            <div className="med-form-group">
              <label className="block font-bold text-[#1A4B84] mb-1">Frequency *</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="med-input"
              >
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="Custom">Custom Schedule</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="med-form-group">
              <label className="block font-bold text-[#1A4B84] mb-1">Scheduled Time *</label>
              <input
                type="text"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value, scheduled_time: e.target.value })}
                placeholder="08:00 AM"
                className="med-input"
              />
            </div>

            <div className="med-form-group">
              <label className="block font-bold text-[#1A4B84] mb-1">Time Slot</label>
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

          <div className="grid grid-cols-3 gap-3">
            <div className="med-form-group">
              <label className="block font-bold text-[#1A4B84] mb-1">Meal Relation</label>
              <select
                value={formData.mealRelation}
                onChange={(e) => setFormData({ ...formData, mealRelation: e.target.value })}
                className="med-input"
              >
                <option value="Before meal">Before meal</option>
                <option value="With meal">With meal</option>
                <option value="After meal">After meal</option>
                <option value="No meal relation">No meal relation</option>
              </select>
            </div>

            <div className="med-form-group">
              <label className="block font-bold text-[#1A4B84] mb-1">Meal Type</label>
              <select
                value={formData.mealType}
                onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                className="med-input"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>

            <div className="med-form-group">
              <label className="block font-bold text-[#1A4B84] mb-1">Delay (Mins)</label>
              <input
                type="number"
                value={formData.delayMinutes}
                onChange={(e) => setFormData({ ...formData, delayMinutes: e.target.value })}
                placeholder="30"
                className="med-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="med-form-group">
              <label className="block font-bold text-[#1A4B84] mb-1">Purpose / Indication</label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="e.g. Pain relief, Diabetes control"
                className="med-input"
              />
            </div>

            <div className="med-form-group">
              <label className="block font-bold text-[#1A4B84] mb-1">Total Pill Count</label>
              <input
                type="number"
                value={formData.totalPills}
                onChange={(e) => setFormData({ ...formData, totalPills: e.target.value })}
                placeholder="30"
                className="med-input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-[#1A4B84] hover:bg-[#143A66]">
              {editingMedId ? "Update Schedule" : "Save Reminder"}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
