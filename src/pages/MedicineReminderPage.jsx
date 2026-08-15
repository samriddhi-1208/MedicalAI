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
  Calendar
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
    <div className="space-y-6 pb-12 font-sans antialiased max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <h1 className="text-2.5xl font-black text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <Pill className="w-7 h-7 text-[#0D9488]" /> Today's Medications & Schedule
          </h1>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            View prescribed timings, meal relations, dosages, and confirm taken doses
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          className="bg-[#0F172A] hover:bg-[#1E293B] text-xs font-bold rounded-xl cursor-pointer shadow-2xs"
          onClick={handleOpenAdd}
        >
          {t('addMedicine')}
        </Button>
      </div>

      {/* Adherence & Supply Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <Card className="p-5 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white border border-[#0F172A] flex items-center justify-between rounded-2xl shadow-2xs">
          <div>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Today's Adherence Rate</p>
            <p className="text-3.5xl font-black text-white mt-1">{adherencePercent}%</p>
            <p className="text-xs text-slate-300 font-medium mt-1">{takenCount} of {totalCount} doses logged</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center font-bold text-lg border border-white/10">
            ✓
          </div>
        </Card>

        <Card className="p-5 md:col-span-2 bg-white border border-slate-200/90 flex flex-col justify-between rounded-2xl shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Refill Warning Threshold ({lowRefills.length})
            </span>
            <Badge variant="warning">Supply Alert</Badge>
          </div>

          {lowRefills.length > 0 ? (
            <div className="space-y-1 mt-2 text-xs">
              {lowRefills.map(m => (
                <p key={m.id} className="text-slate-700">
                  ⚠️ <strong className="text-[#0F172A]">{m.name}</strong>: Only <span className="text-amber-800 font-bold">{m.pillsRemaining} doses</span> remaining in supply.
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-medium mt-2">All prescribed medication supplies are currently sufficient for over 7 days.</p>
          )}
        </Card>

      </div>

      {/* REQUIREMENTS 12 & 13: TODAY'S MEDICATIONS TIMELINE SCHEDULE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#0F172A]">Today's Schedule Timeline</h2>
        </div>

        {safeMedicines.length > 0 ? (
          <div className="relative border-l-2 border-slate-200/90 ml-4 pl-6 space-y-6">
            {safeMedicines.map((med, idx) => (
              <div key={med.id || idx} className="relative">
                {/* Timeline Dot */}
                <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white ${
                  med.taken ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-[#0F172A]'
                }`} />

                <Card className={`p-5 space-y-3 bg-white border rounded-2xl shadow-2xs transition-all ${
                  med.isPaused ? 'border-amber-200 opacity-80 bg-amber-50/20' : 'border-slate-200/90'
                }`}>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 font-black text-xs text-[#0F172A] border border-slate-200/80 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
                        {med.scheduledTime || med.time || '08:00 AM'}
                      </span>

                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-[#0F172A]">💊 {med.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                          {med.dose || med.dosage || '1 tablet'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(med)}
                        className="p-1.5 text-slate-400 hover:text-[#0F172A] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
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

                  {/* Clear UX Schedule Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <span className="text-slate-500 block">Frequency</span>
                      <strong className="text-[#0F172A] font-bold">{med.frequency || 'Once daily'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Meal Relation</span>
                      <strong className="text-slate-800 font-bold">{med.mealRelation || 'After meal'} ({med.mealType || 'Lunch'})</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Duration / Supply</span>
                      <strong className="text-slate-800 font-bold">{med.pillsRemaining ?? 30} doses left</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Indication</span>
                      <strong className="text-[#0D9488] font-bold">{med.purpose || 'Prescription'}</strong>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      med.taken ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      Status: {med.taken ? 'Logged' : 'Upcoming'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMedicinePause(med.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer flex items-center gap-1 ${
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
                        className={`text-xs font-bold rounded-xl cursor-pointer ${
                          med.taken ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-[#0F172A] hover:bg-[#1E293B] text-white'
                        }`}
                        onClick={() => toggleMedicineTaken(med.id)}
                      >
                        {med.taken ? t('logged') : t('markAsTaken')}
                      </Button>
                    </div>
                  </div>

                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-4 max-w-xl mx-auto my-6">
            <Pill className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-[#0F172A]">No Medicine Reminders Configured</h3>
              <p className="text-xs text-slate-500 font-normal">Add your daily prescriptions and set custom timers based on meal relations.</p>
            </div>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenAdd}
              className="bg-[#0F172A] hover:bg-[#1E293B] text-xs font-bold rounded-xl cursor-pointer"
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
            <label className="block font-bold text-[#0F172A] mb-1">Medicine Name *</label>
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
              <label className="block font-bold text-[#0F172A] mb-1">Dose / Quantity *</label>
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
              <label className="block font-bold text-[#0F172A] mb-1">Frequency *</label>
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
              <label className="block font-bold text-[#0F172A] mb-1">Scheduled Time *</label>
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

          <div className="grid grid-cols-3 gap-3">
            <div className="med-form-group">
              <label className="block font-bold text-[#0F172A] mb-1">Meal Relation</label>
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
              <label className="block font-bold text-[#0F172A] mb-1">Meal Type</label>
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
              <label className="block font-bold text-[#0F172A] mb-1">Delay (Mins)</label>
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
              <label className="block font-bold text-[#0F172A] mb-1">Purpose / Indication</label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="e.g. Pain relief, Diabetes control"
                className="med-input"
              />
            </div>

            <div className="med-form-group">
              <label className="block font-bold text-[#0F172A] mb-1">Total Pill Count</label>
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
            <Button variant="primary" size="sm" type="submit" className="bg-[#0F172A] hover:bg-[#1E293B]">
              {editingMedId ? "Update Schedule" : "Save Reminder"}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
