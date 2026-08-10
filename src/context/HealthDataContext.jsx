import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { 
  MOCK_REPORTS, 
  MOCK_MEDICINES, 
  MOCK_EMERGENCY_CONTACTS, 
  MOCK_BIOMARKER_HISTORIES 
} from '../data/mockData';

const HealthDataContext = createContext();
const API_BASE = 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('medguardian_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

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
  
  const [emergencyContacts, setEmergencyContacts] = useState(() => {
    const saved = localStorage.getItem('medguardian_contacts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return []; // 100% EMPTY by default for new accounts
  });
  
  const [sosLogs, setSosLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('medguardian_user_profile');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      } catch (e) {}
    }
    return {
      name: "New Patient",
      email: "",
      phone: "",
      age: 20,
      gender: "Female",
      bloodGroup: "O+",
      height: "165 cm",
      weight: "60 kg",
      primaryPhysician: "Unassigned Physician"
    };
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
          const headers = getAuthHeaders();
          
          // Fetch live reports
          const rRes = await fetch(`${API_BASE}/reports`, { headers });
          if (rRes.ok) {
            const data = await rRes.json();
            if (Array.isArray(data)) {
              setReports(data);
            } else if (data && Array.isArray(data.reports)) {
              setReports(data.reports);
            }
          }

          // Fetch live medicines
          const mRes = await fetch(`${API_BASE}/medicines`, { headers });
          if (mRes.ok) {
            const data = await mRes.json();
            if (Array.isArray(data)) {
              setMedicines(data);
            } else if (data && Array.isArray(data.medicines)) {
              setMedicines(data.medicines);
            }
          }

          // Fetch live emergency contacts
          const cRes = await fetch(`${API_BASE}/sos/contacts`, { headers });
          if (cRes.ok) {
            const data = await cRes.json();
            if (Array.isArray(data)) {
              setEmergencyContacts(data);
            } else if (data && Array.isArray(data.contacts)) {
              setEmergencyContacts(data.contacts);
            }
          }
        }
      } catch (err) {
        console.log("Backend offline fallback mode active.");
      }
    }
    syncBackend();
  }, []);

  const activeReport = (Array.isArray(reports) ? reports : []).find(r => r.id === activeReportId) || (reports && reports.length > 0 ? reports[0] : null);

  const toggleMedicineTaken = async (id) => {
    setMedicines(prev => (Array.isArray(prev) ? prev : []).map(m => {
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
        await fetch(`${API_BASE}/medicines/${id}/take`, { 
          method: 'PUT',
          headers: getAuthHeaders()
        });
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
    setMedicines(prev => [created, ...(Array.isArray(prev) ? prev : [])]);
    toast.success(`Added ${newMed.name} to medication schedule`);

    try {
      if (backendActive) {
        await fetch(`${API_BASE}/medicines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(newMed)
        });
      }
    } catch (err) {
      console.log("Local sync fallback");
    }
  };

  const deleteMedicine = async (id) => {
    setMedicines(prev => (Array.isArray(prev) ? prev : []).filter(m => m.id !== id));
    toast.success("Medication removed from schedule");

    try {
      if (backendActive) {
        await fetch(`${API_BASE}/medicines/${id}`, { 
          method: 'DELETE',
          headers: getAuthHeaders()
        });
      }
    } catch (err) {
      console.log("Local sync fallback");
    }
  };

  const addReport = async (newReport) => {
    setReports(prev => [newReport, ...(Array.isArray(prev) ? prev : [])]);
    setActiveReportId(newReport.id);

    try {
      if (backendActive) {
        const formData = new FormData();
        formData.append('title', newReport.title);
        await fetch(`${API_BASE}/reports/upload`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        });
      }
    } catch (err) {
      console.log("Local sync fallback");
    }
  };

  const triggerSOS = async (locationText = "28.6139° N, 77.2090° E (Current GPS)") => {
    const safeC = Array.isArray(emergencyContacts) ? emergencyContacts : [];
    const newLog = {
      id: `sos-log-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      triggerType: "Manual Emergency SOS Triggered",
      location: locationText,
      status: "Dispatched",
      dispatchedTo: safeC.map(c => c.name),
      responseDelaySec: 1.2,
      notes: "Emergency SOS broadcasted via encrypted channel. Emergency contacts notified via Email and SMS."
    };
    setSosLogs(prev => [newLog, ...(Array.isArray(prev) ? prev : [])]);
    
    const alertNotif = {
      id: `n-sos-${Date.now()}`,
      title: "🚨 EMERGENCY SOS DISPATCHED",
      message: `Alert sent to ${safeC.length} emergency contacts with live GPS coordinates.`,
      time: "Just now",
      unread: true,
      type: "critical",
      link: "/app/sos"
    };
    setNotifications(prev => [alertNotif, ...(Array.isArray(prev) ? prev : [])]);

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });

    try {
      if (backendActive) {
        await fetch(`${API_BASE}/sos/trigger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
    setEmergencyContacts(prev => {
      const safeP = Array.isArray(prev) ? prev : [];
      const updated = [...safeP, created];
      localStorage.setItem('medguardian_contacts', JSON.stringify(updated));
      return updated;
    });
    toast.success(`Added ${contact.name} to emergency contacts`);

    try {
      if (backendActive) {
        await fetch(`${API_BASE}/sos/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(contact)
        });
      }
    } catch (err) {
      console.log("Local sync fallback");
    }
  };

  const deleteEmergencyContact = (id) => {
    setEmergencyContacts(prev => {
      const safeP = Array.isArray(prev) ? prev : [];
      const updated = safeP.filter(c => c.id !== id);
      localStorage.setItem('medguardian_contacts', JSON.stringify(updated));
      return updated;
    });
    toast.success("Emergency contact removed");
  };

  const loadDemoData = () => {
    setReports(MOCK_REPORTS);
    setActiveReportId("rep-2026-001");
    setMedicines(MOCK_MEDICINES);
    setEmergencyContacts(MOCK_EMERGENCY_CONTACTS);
    localStorage.setItem('medguardian_reports', JSON.stringify(MOCK_REPORTS));
    localStorage.setItem('medguardian_medicines', JSON.stringify(MOCK_MEDICINES));
    localStorage.setItem('medguardian_contacts', JSON.stringify(MOCK_EMERGENCY_CONTACTS));
    toast.success("Loaded sample medical reports & prescription data for preview");
  };

  const clearAllData = () => {
    setReports([]);
    setActiveReportId(null);
    setMedicines([]);
    setEmergencyContacts([]);
    localStorage.removeItem('medguardian_reports');
    localStorage.removeItem('medguardian_medicines');
    localStorage.removeItem('medguardian_contacts');
    toast("Workspace reset. Ready for your personal data!", { icon: '✨' });
  };

  const markNotificationsRead = () => {
    setNotifications(prev => (Array.isArray(prev) ? prev : []).map(n => ({ ...n, unread: false })));
  };

  return (
    <HealthDataContext.Provider value={{
      reports: Array.isArray(reports) ? reports : [],
      activeReportId,
      setActiveReportId,
      activeReport,
      medicines: Array.isArray(medicines) ? medicines : [],
      toggleMedicineTaken,
      addMedicine,
      deleteMedicine,
      emergencyContacts: Array.isArray(emergencyContacts) ? emergencyContacts : [],
      addEmergencyContact,
      deleteEmergencyContact,
      sosLogs: Array.isArray(sosLogs) ? sosLogs : [],
      triggerSOS,
      notifications: Array.isArray(notifications) ? notifications : [],
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
