import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pill, 
  Plus, 
  Check, 
  Clock, 
  AlertCircle, 
  Trash2, 
  PauseCircle, 
  PlayCircle, 
  Edit2, 
  Calendar, 
  Upload, 
  Info, 
  Eye,
  CheckCircle2,
  FileText,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { formatReportTitle } from '../utils/formatters';
import { Modal } from '../components/ui/Modal';

export const MedicineReminderPage = () => {
  const navigate = useNavigate();
  const { 
    language,
    medicines, 
    reports,
    addMedicine, 
    updateMedicine,
    deleteMedicine, 
    togglePauseMedicine,
    toggleMedicineTaken 
  } = useHealthData();

  const t = (key) => getTranslation(language, key);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailMed, setSelectedDetailMed] = useState(null);
  const [editingMedId, setEditingMedId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    dose: '500 mg',
    frequency: 'Twice daily',
    scheduled_time: '08:00 AM',
    mealRelation: 'After meal',
    durationDays: '5',
    instructions: 'Take with water after meals',
    purpose: 'Prescribed Medication',
    source_title: 'Added manually'
  });

  const safeMedicines = Array.isArray(medicines) ? medicines : [];
  const safeReports = Array.isArray(reports) ? reports : [];

  // Identify any unconfirmed medications from latest uploaded report
  const latestReport = safeReports[0] || null;
  const unconfirmedMedsFromLatestReport = useMemo(() => {
    if (!latestReport) return [];
    const reportMeds = [
      ...(Array.isArray(latestReport.extractedMedications) ? latestReport.extractedMedications : []),
      ...(Array.isArray(latestReport.medications) ? latestReport.medications : [])
    ];
    return reportMeds.filter(rm => {
      const rmName = (rm.medicineName || rm.name || '').toLowerCase();
      return rmName && !safeMedicines.some(m => m.name.toLowerCase() === rmName);
    });
  }, [latestReport, safeMedicines]);

  // Generate today's doses safely without duplicated dose entries
  const todayDoses = useMemo(() => {
    const doses = [];
    const now = new Date();
    const currentHour = now.getHours();
    const seenDoseKeys = new Set();

    safeMedicines.forEach(m => {
      if (m.isPaused) return;

      const freqStr = (m.frequency || '').toLowerCase();
      let times = [m.scheduledTime || m.time || '08:00 AM'];
      if (freqStr.includes('twice') || freqStr.includes('2x') || freqStr.includes('2 times')) {
        times = ['08:00 AM', '08:00 PM'];
      } else if (freqStr.includes('three') || freqStr.includes('3x') || freqStr.includes('3 times')) {
        times = ['08:00 AM', '02:00 PM', '08:00 PM'];
      }

      times.forEach((tStr, index) => {
        const isPm = tStr.includes('PM');
        let h = parseInt(tStr.split(':')[0]) || 8;
        if (isPm && h < 12) h += 12;
        if (!isPm && h === 12) h = 0;

        const doseKey = `${(m.name || '').toLowerCase().trim()}|${(m.dose || m.dosage || '').toLowerCase().trim()}|${tStr}`;

        if (!seenDoseKeys.has(doseKey)) {
          seenDoseKeys.add(doseKey);

          let status = 'upcoming';
          if (m.taken) {
            status = 'taken';
          } else if (currentHour > h + 2) {
            status = 'missed';
          }

          doses.push({
            doseId: `${m.id}-dose-${index}`,
            medId: m.id,
            name: m.name,
            dose: m.dose || m.dosage || '1 tablet',
            timeStr: tStr,
            hour: h,
            mealRelation: m.mealRelation || m.meal_relation || 'After meals',
            sourceTitle: m.sourceTitle || m.source_title || 'Prescribed',
            taken: Boolean(m.taken),
            takenAt: m.takenAt || (m.taken ? '8:04 AM' : null),
            status,
            originalMed: m
          });
        }
      });
    });

    return doses.sort((a, b) => a.hour - b.hour);
  }, [safeMedicines]);

  // Calculate daily summary metrics
  const totalDosesCount = todayDoses.length;
  const takenDosesCount = todayDoses.filter(d => d.taken).length;
  const remainingDosesCount = todayDoses.filter(d => !d.taken && d.status !== 'missed').length;
  const missedDosesCount = todayDoses.filter(d => !d.taken && d.status === 'missed').length;

  const currentDateFormatted = useMemo(() => {
    const d = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `TODAY · ${d.getDate()} ${months[d.getMonth()]}`;
  }, []);

  const handleOpenAdd = () => {
    setEditingMedId(null);
    setFormData({
      name: '',
      dose: '500 mg',
      frequency: 'Twice daily',
      scheduled_time: '08:00 AM',
      mealRelation: 'After meal',
      durationDays: '5',
      instructions: 'Take with water after meals',
      purpose: 'Prescribed Medication',
      source_title: 'Added manually'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setEditingMedId(med.id);
    setFormData({
      name: med.name || '',
      dose: med.dose || med.dosage || '500 mg',
      frequency: med.frequency || 'Twice daily',
      scheduled_time: med.scheduledTime || med.time || '08:00 AM',
      mealRelation: med.mealRelation || med.meal_relation || 'After meal',
      durationDays: String(med.durationDays || 5),
      instructions: med.instructions || '',
      purpose: med.purpose || 'Prescribed Medication',
      source_title: med.sourceTitle || med.source_title || 'Added manually'
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a medicine name.");
      return;
    }

    try {
      if (editingMedId) {
        await updateMedicine(editingMedId, {
          name: formData.name,
          dose: formData.dose,
          dosage: formData.dose,
          frequency: formData.frequency,
          scheduled_time: formData.scheduled_time,
          time: formData.scheduled_time,
          meal_relation: formData.mealRelation,
          duration_days: Number(formData.durationDays) || 5,
          instructions: formData.instructions
        });
      } else {
        await addMedicine({
          name: formData.name,
          dose: formData.dose,
          dosage: formData.dose,
          frequency: formData.frequency,
          scheduled_time: formData.scheduled_time,
          time: formData.scheduled_time,
          meal_relation: formData.mealRelation,
          duration_days: Number(formData.durationDays) || 5,
          instructions: formData.instructions,
          source_title: 'Added manually'
        });
      }
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save medicine.");
    }
  };

  const handleReviewUnconfirmedMeds = () => {
    if (latestReport) {
      navigate('/app/analysis');
    }
  };

  const handleViewDetail = (med) => {
    setSelectedDetailMed(med);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-[#0F172A] max-w-5xl mx-auto w-full min-w-0">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">
            Today's Medicines
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Keep track of your medications and daily doses.
          </p>

          {/* Dynamic real calculation summary line */}
          <div className="text-xs text-slate-600 font-semibold mt-1 flex items-center gap-2">
            <span>{safeMedicines.length} {safeMedicines.length === 1 ? 'medicine' : 'medicines'}</span>
            <span>•</span>
            <span>{totalDosesCount} {totalDosesCount === 1 ? 'dose' : 'doses'} today</span>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-md bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4 text-[#0D9488]" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* 11. DAILY SUMMARY ROW */}
      {safeMedicines.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-0.5">
            <span className="text-slate-500 font-medium block">Today's Doses</span>
            <strong className="text-sm font-bold text-[#0F172A]">{totalDosesCount}</strong>
          </div>

          <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-0.5">
            <span className="text-slate-500 font-medium block">Taken</span>
            <strong className="text-sm font-bold text-emerald-700">{takenDosesCount}</strong>
          </div>

          <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-0.5">
            <span className="text-slate-500 font-medium block">Remaining</span>
            <strong className="text-sm font-bold text-slate-800">{remainingDosesCount}</strong>
          </div>

          <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-0.5">
            <span className="text-slate-500 font-medium block">Missed</span>
            <strong className="text-sm font-bold text-amber-800">{missedDosesCount}</strong>
          </div>
        </div>
      )}

      {/* 6. NEW MEDICATIONS FROM REPORT BANNER */}
      {unconfirmedMedsFromLatestReport.length > 0 && (
        <div className="p-4 rounded-lg bg-teal-50/70 border border-teal-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
              <FileText className="w-4 h-4 text-[#0D9488]" />
              <span>New medications found in latest report</span>
            </div>
            <p className="text-slate-600 font-normal">
              {unconfirmedMedsFromLatestReport.length} medication(s) detected in {formatReportTitle(latestReport)}. Review before adding to active reminders.
            </p>
          </div>

          <button
            onClick={handleReviewUnconfirmedMeds}
            className="px-3.5 py-1.5 rounded-md bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs shrink-0 cursor-pointer transition-colors"
          >
            Review Medications
          </button>
        </div>
      )}

      {/* 2. TODAY'S MEDICATION SCHEDULE */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0D9488]" />
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">{currentDateFormatted}</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Chronological Daily Schedule</span>
        </div>

        {todayDoses.length > 0 ? (
          <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100">
            {todayDoses.map((dose) => {
              const isTaken = dose.taken;
              const isMissed = dose.status === 'missed';

              return (
                <div 
                  key={dose.doseId}
                  className={`relative pl-8 p-3.5 rounded-lg border transition-colors ${
                    isTaken 
                      ? 'bg-emerald-50/40 border-emerald-200/80' 
                      : isMissed 
                      ? 'bg-amber-50/40 border-amber-200/80' 
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-2.5 top-4 w-2.5 h-2.5 rounded-full border-2 bg-white ${
                    isTaken ? 'border-emerald-600 bg-emerald-600' : isMissed ? 'border-amber-600 bg-amber-600' : 'border-[#0F172A]'
                  }`} />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#0F172A] text-sm">{dose.timeStr}</span>
                        <span className="font-bold text-slate-800 text-sm">💊 {dose.name}</span>
                        <span className="text-slate-600 font-medium">{dose.dose}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500 font-normal flex-wrap">
                        <span>{dose.mealRelation}</span>
                        <span>•</span>
                        <span className="truncate">
                          Source: <strong className="text-slate-700">{dose.sourceTitle || 'Uploaded report'}</strong>
                        </span>
                      </div>

                      {/* DOSE STATUS TAG */}
                      {isTaken && (
                        <p className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Taken {dose.takenAt ? `at ${dose.takenAt}` : 'today'}</span>
                        </p>
                      )}

                      {isMissed && !isTaken && (
                        <p className="text-amber-800 font-semibold text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Dose scheduled past time</span>
                        </p>
                      )}
                    </div>

                    {/* MARK AS TAKEN ACTION */}
                    <div className="shrink-0">
                      <button
                        onClick={() => toggleMedicineTaken(dose.medId)}
                        className={`px-3.5 py-1.5 rounded-md font-semibold text-xs cursor-pointer flex items-center gap-1.5 transition-colors ${
                          isTaken
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-[#0F172A] text-white hover:bg-[#1E293B]'
                        }`}
                      >
                        {isTaken ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Taken</span>
                          </>
                        ) : (
                          <span>Mark as Taken</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="p-8 text-center space-y-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
              <Pill className="w-5 h-5 text-slate-500" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto text-xs">
              <h3 className="font-bold text-[#0F172A]">No medications scheduled</h3>
              <p className="text-slate-500 font-normal">
                Upload a medical report or add a medicine manually to start your medication schedule.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => navigate('/app/upload')}
                className="px-3.5 py-1.5 rounded-md bg-white border border-slate-300 text-slate-800 text-xs font-semibold cursor-pointer hover:bg-slate-100"
              >
                Upload Report
              </button>
              <button
                onClick={handleOpenAdd}
                className="px-3.5 py-1.5 rounded-md bg-[#0F172A] text-white text-xs font-semibold cursor-pointer hover:bg-[#1E293B]"
              >
                + Add Medicine
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ALL MEDICATIONS TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-[#0F172A]">All Active Medications</h3>
          <span className="text-xs font-medium text-slate-500">{safeMedicines.length} total</span>
        </div>

        {safeMedicines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Medicine</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Next Dose</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                {safeMedicines.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-semibold text-[#0F172A]">
                      <button
                        onClick={() => handleViewDetail(m)}
                        className="hover:underline text-left cursor-pointer font-bold"
                      >
                        💊 {m.name}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{m.dose || m.dosage || '1 tablet'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.frequency || 'Once daily'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.durationDays ? `${m.durationDays} days` : 'Ongoing'}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#0F172A]">{m.scheduledTime || m.time || '08:00 AM'}</td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{m.sourceTitle || 'Prescription'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        m.isPaused ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {m.isPaused ? 'Paused' : 'Active'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleViewDetail(m)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                        title="View Full Details"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                        title="Edit Details"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => togglePauseMedicine(m.id)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                      >
                        {m.isPaused ? 'Resume' : 'Pause'}
                      </button>
                      <button
                        onClick={() => deleteMedicine(m.id)}
                        className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-[11px]"
                        title="Delete Medicine"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-normal p-3 bg-slate-50 rounded-md">
            No active medications registered.
          </p>
        )}
      </div>

      {/* SAFETY & CONFIRMATION FOOTER NOTE */}
      <div className="p-3 rounded-md bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-500 shrink-0" />
        <span>Medication information is based on your uploaded records. Follow your healthcare professional's instructions.</span>
      </div>

      {/* MEDICATION DETAILS MODAL */}
      {selectedDetailMed && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Medication Details: ${selectedDetailMed.name}`}
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-sm text-[#0F172A]">💊 {selectedDetailMed.name}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                  {selectedDetailMed.isPaused ? 'Paused' : 'Active Reminder'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 text-slate-700">
                <div>
                  <span className="text-slate-500 block">Dosage</span>
                  <strong className="text-[#0F172A] font-bold">{selectedDetailMed.dose || selectedDetailMed.dosage || '1 tablet'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Frequency</span>
                  <strong className="text-[#0F172A] font-bold">{selectedDetailMed.frequency || 'Once daily'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Scheduled Time</span>
                  <strong className="text-[#0F172A] font-bold">{selectedDetailMed.scheduledTime || selectedDetailMed.time || '08:00 AM'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Meal Relation</span>
                  <strong className="text-[#0F172A] font-bold">{selectedDetailMed.mealRelation || 'After meal'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Duration</span>
                  <strong className="text-[#0F172A] font-bold">{selectedDetailMed.durationDays ? `${selectedDetailMed.durationDays} days` : '5 days'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Source Record</span>
                  <strong className="text-[#0F172A] font-bold">{selectedDetailMed.sourceTitle || 'Uploaded report'}</strong>
                </div>
              </div>

              {selectedDetailMed.instructions && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block font-semibold">Special Instructions:</span>
                  <p className="text-slate-800 font-normal">{selectedDetailMed.instructions}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD / EDIT MEDICINE FORM MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingMedId ? "Edit Medication Details" : "+ Add Medicine"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Medicine Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Paracetamol"
              className="med-input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dosage</label>
              <input
                type="text"
                value={formData.dose}
                onChange={(e) => setFormData(prev => ({ ...prev, dose: e.target.value }))}
                placeholder="500 mg / 1 tablet"
                className="med-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                className="med-input"
              >
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="As needed (PRN)">As needed (PRN)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scheduled Time</label>
              <input
                type="text"
                value={formData.scheduled_time}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                placeholder="08:00 AM"
                className="med-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Meal Relation</label>
              <select
                value={formData.mealRelation}
                onChange={(e) => setFormData(prev => ({ ...prev, mealRelation: e.target.value }))}
                className="med-input"
              >
                <option value="After meal">After meal</option>
                <option value="Before meal">Before meal</option>
                <option value="With meal">With meal</option>
                <option value="No relation">No relation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Duration (days)</label>
            <input
              type="number"
              value={formData.durationDays}
              onChange={(e) => setFormData(prev => ({ ...prev, durationDays: e.target.value }))}
              placeholder="5"
              className="med-input"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Special Instructions</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              rows={2}
              placeholder="e.g. Take after breakfast with warm water"
              className="med-input"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs cursor-pointer"
            >
              {editingMedId ? "Update Medicine" : "Save Medicine"}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
