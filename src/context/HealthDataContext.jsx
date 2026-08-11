import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const HealthDataContext = createContext();
const API_BASE = 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('medguardian_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const HealthDataProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('medguardian_language') || 'EN';
  });

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    localStorage.setItem('medguardian_language', newLang);
  };

  const [token, setToken] = useState(() => localStorage.getItem('medguardian_token') || null);
  const [userProfile, setUserProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [sosLogs, setSosLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeReportId, setActiveReportId] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Synchronize authenticated user profile & data from backend on mount or token change
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('medguardian_token');
      if (!storedToken) {
        setToken(null);
        setUserProfile(null);
        setReports([]);
        setMedicines([]);
        setEmergencyContacts([]);
        setLoadingAuth(false);
        return;
      }

      try {
        setLoadingAuth(true);
        const headers = { 'Authorization': `Bearer ${storedToken}` };
        
        // 1. Verify token & get user profile
        const profileRes = await fetch(`${API_BASE}/auth/me`, { headers });
        if (!profileRes.ok) {
          throw new Error("Session expired");
        }
        const profileData = await profileRes.json();

        setUserProfile({
          id: profileData.id || profileData._id,
          name: profileData.full_name || profileData.name || 'Patient',
          email: profileData.email,
          phone: profileData.phone || '',
          age: profileData.age || 20,
          gender: profileData.gender || 'Female',
          bloodGroup: profileData.blood_group || 'O+',
          height: profileData.height || '',
          weight: profileData.weight || '',
          primaryPhysician: profileData.primary_physician || ''
        });

        // 2. Fetch authenticated user's reports ONLY
        const rRes = await fetch(`${API_BASE}/reports`, { headers });
        if (rRes.ok) {
          const rData = await rRes.json();
          setReports(Array.isArray(rData) ? rData : []);
        }

        // 3. Fetch authenticated user's medicines ONLY
        const mRes = await fetch(`${API_BASE}/medicines`, { headers });
        if (mRes.ok) {
          const mData = await mRes.json();
          setMedicines(Array.isArray(mData) ? mData : []);
        }

        // 4. Fetch authenticated user's emergency contacts ONLY
        const cRes = await fetch(`${API_BASE}/sos/contacts`, { headers });
        if (cRes.ok) {
          const cData = await cRes.json();
          setEmergencyContacts(Array.isArray(cData) ? cData : []);
        }

        setToken(storedToken);
      } catch (err) {
        console.log("Auth session invalid or backend offline:", err.message);
        localStorage.removeItem('medguardian_token');
        setToken(null);
        setUserProfile(null);
        setReports([]);
        setMedicines([]);
        setEmergencyContacts([]);
      } finally {
        setLoadingAuth(false);
      }
    }

    initAuth();
  }, [token]);

  // Auth Action: Sign In
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Invalid email or password");
    }

    localStorage.setItem('medguardian_token', data.token);
    setToken(data.token);
    setUserProfile({
      id: data.user.id || data.user._id,
      name: data.user.full_name || email.split('@')[0],
      email: data.user.email,
      phone: data.user.phone || '',
      age: data.user.age || 20,
      gender: data.user.gender || 'Female',
      bloodGroup: data.user.blood_group || 'O+',
      height: data.user.height || '',
      weight: data.user.weight || '',
      primaryPhysician: data.user.primary_physician || ''
    });

    toast.success(`Welcome back, ${data.user.full_name || 'Patient'}!`);
    return data.user;
  };

  // Auth Action: Register Account
  const signup = async ({ name, email, password, confirmPassword, phone, age, gender, bloodGroup, height, weight }) => {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match. Please re-enter your password.");
    }

    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, age, gender, bloodGroup, height, weight })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }

    localStorage.setItem('medguardian_token', data.token);
    setToken(data.token);
    setUserProfile({
      id: data.user.id || data.user._id,
      name: data.user.full_name || name,
      email: data.user.email || email,
      phone: data.user.phone || phone || '',
      age: data.user.age || age || 20,
      gender: data.user.gender || gender || 'Female',
      bloodGroup: data.user.blood_group || bloodGroup || 'O+',
      height: data.user.height || '',
      weight: data.user.weight || '',
      primaryPhysician: ''
    });

    // Newly registered account starts 100% empty!
    setReports([]);
    setMedicines([]);
    setEmergencyContacts([]);
    toast.success(`Account registered for ${name}! Welcome to MedicalAI.`);
    return data.user;
  };

  // Auth Action: Sign Out
  const logout = () => {
    localStorage.removeItem('medguardian_token');
    setToken(null);
    setUserProfile(null);
    setReports([]);
    setMedicines([]);
    setEmergencyContacts([]);
    setSosLogs([]);
    setNotifications([]);
    setActiveReportId(null);
    toast.success("Signed out successfully.");
  };

  const activeReport = (Array.isArray(reports) ? reports : []).find(r => r.id === activeReportId) || (reports && reports.length > 0 ? reports[0] : null);

  const addReport = (newReport) => {
    setReports(prev => [newReport, ...(Array.isArray(prev) ? prev : [])]);
    setActiveReportId(newReport.id);
  };

  const toggleMedicineTaken = async (id) => {
    setMedicines(prev => (Array.isArray(prev) ? prev : []).map(m => {
      if (m.id === id) {
        const nextState = !m.taken;
        if (nextState) {
          toast.success(`Dose logged: ${m.name}`);
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
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
      await fetch(`${API_BASE}/medicines/${id}/take`, { 
        method: 'PUT',
        headers: getAuthHeaders()
      });
    } catch (err) {}
  };

  const addMedicine = async (newMed) => {
    try {
      const res = await fetch(`${API_BASE}/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(newMed)
      });
      if (res.ok) {
        const data = await res.json();
        setMedicines(prev => [data, ...prev]);
        toast.success(`Added ${newMed.name} to medication schedule`);
        return;
      }
    } catch (err) {}

    const created = {
      id: `med-${Date.now()}`,
      taken: false,
      pillsRemaining: parseInt(newMed.totalPills) || 30,
      totalPills: parseInt(newMed.totalPills) || 30,
      ...newMed
    };
    setMedicines(prev => [created, ...prev]);
    toast.success(`Added ${newMed.name} to medication schedule`);
  };

  const deleteMedicine = async (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
    toast.success("Medication removed");
    try {
      await fetch(`${API_BASE}/medicines/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (err) {}
  };

  const addEmergencyContact = async (contact) => {
    try {
      const res = await fetch(`${API_BASE}/sos/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(contact)
      });
      if (res.ok) {
        const data = await res.json();
        setEmergencyContacts(prev => [...prev, data]);
        toast.success(`Added ${contact.name} to emergency contacts`);
        return;
      }
    } catch (err) {}

    const created = { id: `c-${Date.now()}`, ...contact };
    setEmergencyContacts(prev => [...prev, created]);
    toast.success(`Added ${contact.name} to emergency contacts`);
  };

  const deleteEmergencyContact = (id) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== id));
    toast.success("Emergency contact removed");
  };

  const triggerSOS = async (locationText = "Current GPS Position") => {
    const safeC = Array.isArray(emergencyContacts) ? emergencyContacts : [];
    const newLog = {
      id: `sos-log-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      triggerType: "Manual Emergency SOS Triggered",
      location: locationText,
      status: "Dispatched",
      dispatchedTo: safeC.map(c => c.name)
    };
    setSosLogs(prev => [newLog, ...prev]);
    toast.error("🚨 EMERGENCY SOS DISPATCHED TO CONTACTS!", { duration: 5000 });
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });

    try {
      await fetch(`${API_BASE}/sos/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ triggerType: "Manual SOS Button", notes: locationText })
      });
    } catch (err) {}
  };

  const updateUserProfile = async (updates) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    toast.success("Profile updated");
    try {
      await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(updates)
      });
    } catch (err) {}
  };

  return (
    <HealthDataContext.Provider value={{
      language,
      setLanguage,
      token,
      isAuthenticated: !!token && !!userProfile,
      userProfile,
      loadingAuth,
      login,
      signup,
      logout,
      reports: Array.isArray(reports) ? reports : [],
      activeReportId,
      setActiveReportId,
      activeReport,
      addReport,
      medicines: Array.isArray(medicines) ? medicines : [],
      toggleMedicineTaken,
      addMedicine,
      deleteMedicine,
      emergencyContacts: Array.isArray(emergencyContacts) ? emergencyContacts : [],
      addEmergencyContact,
      deleteEmergencyContact,
      sosLogs,
      triggerSOS,
      notifications,
      updateUserProfile
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
