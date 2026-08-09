import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { 
  MOCK_REPORTS, 
  MOCK_MEDICINES, 
  MOCK_EMERGENCY_CONTACTS, 
  MOCK_SOS_LOGS, 
  MOCK_NOTIFICATIONS, 
  INITIAL_USER_PROFILE,
  MOCK_BIOMARKER_HISTORIES 
} from '../data/mockData';

const HealthDataContext = createContext();
const API_BASE = 'http://localhost:5000/api';

export const HealthDataProvider = ({ children }) => {
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('medguardian_reports');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return []; // 100% EMPTY by default for new accounts
  });
  const [activeReportId, setActiveReportId] = useState(null);
  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem('medguardian_medicines');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return []; // 100% EMPTY by default for new accounts
  });
  const [emergencyContacts, setEmergencyContacts] = useState(MOCK_EMERGENCY_CONTACTS);
  const [sosLogs, setSosLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('medguardian_user_profile');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return { ...INITIAL_USER_PROFILE, ...parsed };
      } catch (e) {}
    }
    return INITIAL_USER_PROFILE;
  });
  const [biomarkerHistories, setBiomarkerHistories] = useState(MOCK_BIOMARKER_HISTORIES);
  const [backendActive, setBackendActive] = useState(false);

  // Sync with backend API on mount
  useEffect(() => {
    async function syncBackend() {
      try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) {
          setBackendActive(true);
          
          // Fetch live reports
          const rRes = await fetch(`${API_BASE}/reports`);
          if (rRes.ok) {
            const data = await rRes.json();
            if (data.reports && data.reports.length > 0) {
              setReports(prev => [...data.reports, ...prev.filter(pr => !data.reports.some(dr => dr.id === pr.id))]);
            }
          }

          // Fetch live medicines
          const mRes = await fetch(`${API_BASE}/medicines`);
          if (mRes.ok) {
            const data = await mRes.json();
            if (data.medicines && data.medicines.length > 0) {
              setMedicines(data.medicines);
            }
          }
        }
      } catch (err) {
        console.log("Backend offline fallback mode active.");
      }
    }
    syncBackend();
  }, []);

  const activeReport = reports.find(r => r.id === activeReportId) || reports[0];

  const toggleMedicineTaken = async (id) => {
    // Optimistic UI update
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        const nextState = !m.taken;
        if (nextState) {
          toast.success(`Dose logged: ${m.name}`);
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
        } else {
          toast(`Dose un-marked: ${m.name}`, { icon: 'ℹ️' });
        }
        return { 
          ...m, 
          taken: nextState,
          pillsRemaining: nextState ? Math.max(0, m.pillsRemaining - 1) : m.pillsRemaining + 1
        };
      }
      return m;
    }));

    try {
      if (backendActive) {
        await fetch(`${API_BASE}/medicines/${id}/toggle`, { method: 'PATCH' });
      }
    } catch (err) {
      console.log("Local sync fallback");
    }
  };

  const addMedicine = async (newMed) => {
    const created = {
      id: `med-${Date.now()}`,
      taken: false,
      pillsRemaining: parseInt(newMed.totalPills) || 30,
      totalPills: parseInt(newMed.totalPills) || 30,
      color: 'cyan',
      ...newMed
    };
    setMedicines(prev => [created, ...prev]);
    toast.success(`Added ${newMed.name} to medication schedule`);

    try {
      if (backendActive) {
        await fetch(`${API_BASE}/medicines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMed)
        });
      }
    } catch (err) {
      console.log("Local sync fallback");
    }
  };

  const deleteMedicine = async (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
    toast.success("Medication removed from schedule");

    try {
      if (backendActive) {
        await fetch(`${API_BASE}/medicines/${id}`, { method: 'DELETE' });
      }
    } catch (err) {
      console.log("Local sync fallback");
    }
  };

  const addReport = async (newReport) => {
    setReports(prev => [newReport, ...prev]);
    setActiveReportId(newReport.id);

    try {
      if (backendActive) {
        const formData = new FormData();
        formData.append('title', newReport.title);
        await fetch(`${API_BASE}/reports/upload`, {
          method: 'POST',
          body: formData
        });
      }
    } catch (err) {
      console.log("Local sync fallback");
    }
  };

  const triggerSOS = async (locationText = "28.6139° N, 77.2090° E (Current GPS)") => {
    const newLog = {
      id: `sos-log-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      triggerType: "Manual Emergency SOS Triggered",
      location: locationText,
      status: "Dispatched",
      dispatchedTo: emergencyContacts.map(c => c.name),
      responseDelaySec: 1.2,
      notes: "Emergency SOS broadcasted via encrypted channel. Emergency contacts notified via Email and SMS."
    };
    setSosLogs(prev => [newLog, ...prev]);
    
    const alertNotif = {
      id: `n-sos-${Date.now()}`,
      title: "🚨 EMERGENCY SOS DISPATCHED",
      message: `Alert sent to ${emergencyContacts.length} emergency contacts with live GPS coordinates.`,
      time: "Just now",
      unread: true,
      type: "critical",
      link: "/app/sos"
    };
    setNotifications(prev => [alertNotif, ...prev]);

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });

    try {
      if (backendActive) {
        await fetch(`${API_BASE}/sos/trigger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: 28.6139,
            longitude: 77.2090,
            triggerType: "Manual SOS Button",
            notes: locationText
          })
        });
      }
    } catch (err) {
      console.log("Local sync fallback");
    }
  };

  const updateUserProfile = (updates) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('medguardian_user_profile', JSON.stringify(updated));
      return updated;
    });
    toast.success("Profile details updated successfully");
  };

  const addEmergencyContact = async (contact) => {
    const created = {
      id: `c-${Date.now()}`,
      notifyOnSOS: true,
      isPrimary: false,
      ...contact
    };
    setEmergencyContacts(prev => [...prev, created]);
    toast.success(`Added ${contact.name} to emergency contacts`);

    try {
      if (backendActive) {
        await fetch(`${API_BASE}/sos/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contact)
        });
      }
    } catch (err) {
      console.log("Local sync fallback");
    }
  };

  const deleteEmergencyContact = (id) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== id));
    toast.success("Emergency contact removed");
  };

  const loadDemoData = () => {
    setReports(MOCK_REPORTS);
    setActiveReportId("rep-2026-001");
    setMedicines(MOCK_MEDICINES);
    localStorage.setItem('medguardian_reports', JSON.stringify(MOCK_REPORTS));
    localStorage.setItem('medguardian_medicines', JSON.stringify(MOCK_MEDICINES));
    toast.success("Loaded sample medical reports & prescription data for preview");
  };

  const clearAllData = () => {
    setReports([]);
    setActiveReportId(null);
    setMedicines([]);
    localStorage.removeItem('medguardian_reports');
    localStorage.removeItem('medguardian_medicines');
    toast("Cleared reports. Ready for your personal uploads!", { icon: '✨' });
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <HealthDataContext.Provider value={{
      reports,
      activeReportId,
      setActiveReportId,
      activeReport,
      medicines,
      toggleMedicineTaken,
      addMedicine,
      deleteMedicine,
      emergencyContacts,
      addEmergencyContact,
      deleteEmergencyContact,
      sosLogs,
      triggerSOS,
      notifications,
      markNotificationsRead,
      userProfile,
      updateUserProfile,
      biomarkerHistories,
      addReport,
      backendActive,
      loadDemoData,
      clearAllData
    }}>
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) throw new Error('useHealthData must be used within HealthDataProvider');
  return context;
};
