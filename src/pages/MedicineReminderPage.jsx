import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Calendar,
  Upload,
  Info,
  History,
  ShieldCheck,
  CheckSquare,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const MedicineReminderPage = () => {
  const navigate = useNavigate();
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
    durationDays: '5',
    purpose: 'Prescribed Medication',
    totalPills: '30'
  });

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const safeMedicines = Array.isArray(medicines) ? medicines : [];
  const totalCount = safeMedicines.length;
  const takenCount = safeMedicines.filter(m => m.taken).length;
  const hasMedicines = totalCount > 0;

  // REQUIREMENT 14: ADHERENCE RATE FORMULA (DO NOT SHOW 0% WHEN ZERO MEDS)
  const adherencePercent = hasMedicines ? Math.round((takenCount / totalCount) * 100) : null;
  const lowRefills = safeMedicines.filter(m => (m.pillsRemaining || m.pills_remaining || 30) <= 5);

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
      durationDays: '5',
      purpose: 'Prescribed Medication',
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
      durationDays: String(med.durationDays || 5),
      purpose: med.purpose || 'Prescribed Medication',
      totalPills: String(med.totalPills || med.total_pills || 30)
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
        duration_days: Number(formData.durationDays),
        purpose: formData.purpose,
        total_pills: parseInt(formData.totalPills || 30),
        pills_remaining: parseInt(formData.totalPills || 30)
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
        duration_days: Number(formData.durationDays),
        source_title: 'Manual Entry',
        purpose: formData.purpose,
        totalPills: formData.totalPills
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased w-full min-w-0 flex-1">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#54816C] dark:bg-[#91C1AC] animate-pulse" />
            <span className="text-xs sm:text-[13px] text-[#3D6352] dark:text-[#91C1AC] font-black uppercase tracking-[0.04em]">{t('prescriptionScheduleBadge')}</span>
          </div>
          <h1 className="text-2.5xl sm:text-3xl font-black text-[#0F172A] dark:text-[#F5F7FA] tracking-tight mt-1 flex items-center gap-2.5">
            <Pill className="w-7 h-7 text-[#3D6352] dark:text-[#91C1AC]" /> {t('todaysMedicationSchedule')}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-[#C8D0E0] mt-1.5">
            {t('confirmedPrescriptionsSub')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={Upload}
            onClick={() => navigate('/app/upload')}
            className="text-sm font-bold rounded-xl border-slate-200 dark:border-slate-700 dark:text-[#F5F7FA] dark:hover:bg-slate-800 cursor-pointer px-4 py-2"
          >
            {t('uploadPrescriptionBtn')}
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            className="bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#91C1AC] dark:hover:bg-[#7FAF9A] dark:text-[#0A0E1A] text-white text-sm font-bold rounded-xl cursor-pointer shadow-2xs px-4 py-2"
            onClick={handleOpenAdd}
          >
            {t('addMedicine')}
          </Button>
        </div>
      </div>

      {/* Adherence & Refill Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Adherence Rate Card */}
        <Card className="p-5 sm:p-6 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white border border-[#0F172A] flex items-center justify-between rounded-2xl shadow-2xs">
          <div>
            <p className="text-xs sm:text-[13px] font-bold text-slate-300 uppercase tracking-[0.04em]">{t('todaysAdherenceRate')}</p>
            {hasMedicines ? (
              <>
                <p className="text-4xl font-black text-white mt-1">{adherencePercent}%</p>
                <p className="text-sm text-slate-300 font-medium mt-1">{takenCount} {t('of')} {totalCount} {t('dosesLogged')}</p>
              </>
            ) : (
              <>
                <p className="text-base font-extrabold text-slate-300 mt-2">{t('noMedsScheduledToday')}</p>
                <p className="text-sm text-slate-400 font-medium mt-1">{t('uploadPrescriptionToTrack')}</p>
              </>
            )}
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center font-bold text-xl border border-white/10 shrink-0">
            ✓
          </div>
        </Card>

        {/* REQUIREMENT 15: REFILL WARNING CARD */}
        <Card className="p-5 sm:p-6 md:col-span-2 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between rounded-2xl shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-[#0F172A] dark:text-[#F5F7FA] flex items-center gap-2 uppercase tracking-[0.04em]">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600" /> {t('refillWarningThreshold')} ({lowRefills.length})
            </span>
            <Badge variant={lowRefills.length > 0 ? "warning" : "normal"}>
              {lowRefills.length > 0 ? t('refillAlert') : t('supplyNormal')}
            </Badge>
          </div>

          {hasMedicines ? (
            lowRefills.length > 0 ? (
              <div className="space-y-1 mt-2 text-sm">
                {lowRefills.map(m => (
                  <p key={m.id} className="text-slate-700 dark:text-slate-300">
                    ⚠️ <strong className="text-[#0F172A] dark:text-[#F5F7FA]">{m.name}</strong>: Only <span className="text-amber-800 dark:text-amber-300 font-bold">{m.pillsRemaining || m.pills_remaining} doses remaining</span> in supply.
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-[#C8D0E0] font-medium mt-2">
                All active prescription supplies are sufficient.
              </p>
            )
          ) : (
            <p className="text-sm text-slate-500 dark:text-[#C8D0E0] font-medium mt-2">
              {t('noActiveRefillsTracked')}
            </p>
          )}
        </Card>
      </div>

      {/* REQUIREMENT 16: NEW USER EMPTY STATE (0 MEDICATIONS) */}
      {!hasMedicines && (
        <Card className="p-8 sm:p-12 text-center bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs space-y-5 max-w-2xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-[#EEF7F1] dark:bg-[#24283A] text-[#3D6352] dark:text-[#91C1AC] flex items-center justify-center mx-auto border border-[#D5E8DC] dark:border-slate-800">
            <Pill className="w-8 h-8 text-[#3D6352] dark:text-[#91C1AC]" />
          </div>
          
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">
              {t('noMedsScheduledTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#C8D0E0] font-normal leading-relaxed">
              {t('noMedsScheduledSub')}
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              icon={Upload}
              onClick={() => navigate('/app/upload')}
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-[#F5F7FA] py-3 px-6 text-xs font-bold rounded-xl cursor-pointer dark:hover:bg-slate-800"
            >
              {t('uploadMedicalReport')}
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenAdd}
              className="bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#91C1AC] dark:hover:bg-[#7FAF9A] dark:text-[#0A0E1A] text-white py-3 px-6 text-xs font-bold rounded-xl cursor-pointer shadow-2xs"
            >
              {t('addMedicine')}
            </Button>
          </div>
        </Card>
      )}

      {/* REQUIREMENTS 7, 8, 17, 18, 19: TODAY'S MEDICATIONS SCHEDULE */}
      {hasMedicines && (
        <div className="space-y-4 w-full min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-[22px] font-black text-[#0F172A] dark:text-[#F5F7FA]">Today's Medication Schedule ({totalCount})</h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0">
            {safeMedicines.map((med, idx) => (
              <Card 
                key={med.id || idx} 
                className={`p-5 sm:p-6 space-y-4 bg-white dark:bg-[#1C1F2E] border rounded-2xl shadow-2xs transition-all w-full min-w-0 flex flex-col justify-between ${
                  med.isPaused 
                    ? 'border-[#D6B86A]/40 opacity-90 bg-[#D6B86A]/5 dark:bg-[#D6B86A]/10' 
                    : med.taken
                      ? 'border-[#6FA89E]/40'
                      : 'border-slate-200/90 dark:border-slate-800'
                }`}
              >
                
                {/* Top Row: Time, Name, Dose, Source Tag, Edit/Delete Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#25293C] font-black text-xs sm:text-[13px] text-[#0F172A] dark:text-[#F1F3F9] border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 shrink-0">
                      <Clock className="w-4 h-4 text-[#5F958C] dark:text-[#8BC7B5]" />
                      {med.scheduledTime || med.time || '08:00 AM'}
                    </span>

                    <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                      <h3 className="text-base sm:text-lg font-black text-[#0F172A] dark:text-[#F1F3F9] truncate">💊 {med.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#25293C] text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 shrink-0">
                        {med.dose || med.dosage || '1 tablet'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenEdit(med)}
                      className="p-2 text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit medication schedule"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMedicine(med.id)}
                      className="p-2 text-slate-400 hover:text-[#DC2626] rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete medication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Schedule Attribute Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-sm p-3.5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200/80 dark:border-slate-800">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[13px] font-semibold">Frequency</span>
                    <strong className="text-[#0F172A] dark:text-[#F1F3F9] font-bold truncate block text-sm">{med.frequency || 'Once daily'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[13px] font-semibold">Meal Relation</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold truncate block text-sm">{med.mealRelation || 'After meal'} ({med.mealType || 'Lunch'})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[13px] font-semibold">Duration / Supply</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold truncate block text-sm">{med.pillsRemaining ?? med.pills_remaining ?? 30} doses left</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[13px] font-semibold">Indication / Purpose</span>
                    <strong className="text-[#5F958C] dark:text-[#8BC7B5] font-bold truncate block text-sm">{med.purpose || 'Prescription'}</strong>
                  </div>
                </div>

                {/* REQUIREMENT 17: MEDICATION SOURCE DISCLOSURE */}
                <div className="flex items-center justify-between text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <FileText className="w-4 h-4 text-[#5F958C] dark:text-[#8BC7B5]" /> Source: <strong className="text-slate-800 dark:text-slate-200 font-bold">{med.sourceTitle || 'Prescription Schedule'}</strong>
                  </span>

                  {med.instructions && (
                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-sm lg:max-w-md">
                      Instructions: {med.instructions}
                    </span>
                  )}
                </div>

                {/* Actions Row: Status Badge, Pause/Resume, Mark as Taken */}
                <div className="flex items-center justify-between pt-1.5 flex-wrap gap-2.5">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                    med.taken 
                      ? 'bg-[#6FA89E]/15 text-[#2D5A52] dark:text-[#9DD3C8] border border-[#6FA89E]/30' 
                      : med.isPaused 
                        ? 'bg-[#D6B86A]/20 text-[#4D3F1E] dark:text-[#E2C785] border border-[#D6B86A]/30' 
                        : 'bg-slate-100 dark:bg-[#25293C] text-slate-700 dark:text-[#949DB3]'
                  }`}>
                    Status: {med.taken ? 'Logged' : med.isPaused ? 'Paused' : 'Upcoming'}
                  </span>

                  <div className="flex items-center gap-2.5">
                    {/* Secondary Pause/Resume Action — Soft Muted Amber (#D6B86A) */}
                    <button
                      onClick={() => toggleMedicinePause(med.id)}
                      className={`px-3.5 py-2 rounded-xl font-bold text-sm border transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                        med.isPaused 
                          ? 'bg-[#6FA89E]/20 text-[#2D5A52] dark:text-[#A8D5CC] border-[#6FA89E]/40 hover:bg-[#6FA89E]/30' 
                          : 'bg-[#D6B86A] text-[#332D1A] border-[#C5A85D] hover:bg-[#C5A85D]'
                      }`}
                      title={med.isPaused ? "Resume this medication schedule" : "Pause this medication schedule"}
                    >
                      {med.isPaused ? <PlayCircle className="w-4 h-4 text-[#2D5A52] dark:text-[#A8D5CC]" /> : <PauseCircle className="w-4 h-4 text-[#332D1A]" />}
                      <span>{med.isPaused ? 'Resume' : 'Pause'}</span>
                    </button>

                    {/* Primary Mark as Taken Action — Softer Muted Healthcare Teal/Sage (#6FA89E) */}
                    <button
                      disabled={med.isPaused}
                      onClick={() => toggleMedicineTaken(med.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 border disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs ${
                        med.taken
                          ? 'bg-[#6FA89E]/15 text-[#2D5A52] dark:text-[#9DD3C8] border-[#6FA89E]/30 hover:bg-[#6FA89E]/25'
                          : 'bg-[#6FA89E] hover:bg-[#5F958C] text-[#0F172A] border-[#5F958C]'
                      }`}
                    >
                      {med.taken ? (
                        <>
                          <Check className="w-4 h-4 text-[#2D5A52] dark:text-[#9DD3C8]" />
                          <span>{t('logged')}</span>
                        </>
                      ) : (
                        <>
                          <Pill className="w-4 h-4 text-[#0F172A]" />
                          <span>{t('markAsTaken')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </Card>
            ))}
          </div>
        </div>
      )}

      {/* REQUIREMENT 20: MEDICATION HISTORY LOG */}
      {hasMedicines && (
        <Card className="p-5 sm:p-6 space-y-4 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs w-full min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-[22px] font-black text-[#0F172A] dark:text-[#F5F7FA] flex items-center gap-2.5">
              <History className="w-5.5 h-5.5 text-[#3D6352] dark:text-[#91C1AC]" /> Medication History Log
            </h3>
            <span className="text-sm font-bold text-slate-500 dark:text-[#C8D0E0]">
              {safeMedicines.length} {safeMedicines.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-sm w-full min-w-0">
            {safeMedicines.map((m) => (
              <div 
                key={m.id} 
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 min-w-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-sm text-[#0F172A] dark:text-[#F5F7FA] truncate">{m.name}</p>
                  <p className="text-slate-500 dark:text-[#C8D0E0] text-[13px] truncate">
                    {m.dose || m.dosage} • {m.scheduledTime || m.time}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full font-bold text-[13px] shrink-0 ${
                  m.taken 
                    ? 'bg-[#6FA89E]/20 text-[#2D5A52] dark:text-[#9DD3C8] border border-[#6FA89E]/30' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {m.taken ? 'Taken ✓' : 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

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
              <label className="block font-bold text-[#0F172A] mb-1">Duration (Days)</label>
              <input
                type="number"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                placeholder="5"
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
            <Button variant="primary" size="sm" type="submit" className="bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#52857C] dark:hover:bg-[#45726A] text-white">
              {editingMedId ? "Update Schedule" : "Save Reminder"}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
