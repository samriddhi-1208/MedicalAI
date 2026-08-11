import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { MOCK_REPORTS } from '../data/mockData';

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

  // Initialize token and profile - auto-purge any old cached demo sessions from browser localStorage
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('medguardian_token');
    const storedProfile = localStorage.getItem('medguardian_user_profile');
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        if (parsed.email === 'laxmi12345@gmail.com' || parsed.email === 'laxmi.manapure@example.com' || parsed.email === 'patient@example.com') {
          localStorage.removeItem('medguardian_token');
          localStorage.removeItem('medguardian_user_profile');
          return null;
        }
      } catch (e) {}
    }
    return storedToken || null;
  });

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('medguardian_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email === 'laxmi12345@gmail.com' || parsed.email === 'laxmi.manapure@example.com' || parsed.email === 'patient@example.com') {
          localStorage.removeItem('medguardian_token');
          localStorage.removeItem('medguardian_user_profile');
          return null;
        }
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  // State: Reports (with auto-purge for old 12.8 cached reports)
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem('medguardian_reports');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Purge if cached report contains old 12.8 value or Fasting Glucose
          const isOldFormat = parsed.some(r => 
            Array.isArray(r.biomarkers) && r.biomarkers.some(b => b.value === 12.8 || b.name === 'Fasting Blood Glucose')
          );
          if (!isOldFormat) {
            return parsed;
          }
        }
      }
    } catch (e) {}
    localStorage.removeItem('medguardian_reports');
    return MOCK_REPORTS;
  });

  const [medicines, setMedicines] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [sosLogs, setSosLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeReportId, setActiveReportId] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Synchronize authenticated user profile & data from backend when logged in
  useEffect(() => {
    async function syncUserData() {
      const storedToken = localStorage.getItem('medguardian_token');
      if (!storedToken) {
        setToken(null);
        setUserProfile(null);
        setReports(MOCK_REPORTS);
        setMedicines([]);
        setEmergencyContacts([]);
        return;
      }

      try {
        const headers = { 'Authorization': `Bearer ${storedToken}` };
        
        // Try to verify session & sync profile from database
        const profileRes = await fetch(`${API_BASE}/auth/me`, { headers });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const syncedUser = {
            id: profileData.id || profileData._id,
            name: profileData.full_name || profileData.name,
            email: profileData.email,
            phone: profileData.phone || '',
            dateOfBirth: profileData.date_of_birth || '',
            age: profileData.age || 0,
            gender: profileData.gender || 'Female',
            height: profileData.height || '',
            heightUnit: profileData.height_unit || 'cm',
            weight: profileData.weight || '',
            weightUnit: profileData.weight_unit || 'kg',
            bloodGroup: profileData.blood_group || 'Not Known',
            city: profileData.city || '',
            state: profileData.state || '',
            country: profileData.country || 'India',
            occupation: profileData.occupation || '',
            primaryPhysician: profileData.primary_physician || '',
            profileCompleted: true
          };

          setUserProfile(syncedUser);
          localStorage.setItem('medguardian_user_profile', JSON.stringify(syncedUser));

          // Fetch authenticated user's reports from backend if online
          const rRes = await fetch(`${API_BASE}/reports`, { headers });
          if (rRes.ok) {
            const rData = await rRes.json();
            if (Array.isArray(rData) && rData.length > 0) {
              setReports(rData);
              localStorage.setItem('medguardian_reports', JSON.stringify(rData));
            }
          }

          // Fetch authenticated user's medicines
          const mRes = await fetch(`${API_BASE}/medicines`, { headers });
          if (mRes.ok) {
            const mData = await mRes.json();
            setMedicines(Array.isArray(mData) ? mData : []);
          }

          // Fetch authenticated user's emergency contacts
          const cRes = await fetch(`${API_BASE}/sos/contacts`, { headers });
          if (cRes.ok) {
            const cData = await cRes.json();
            setEmergencyContacts(Array.isArray(cData) ? cData : []);
          }
        } else if (profileRes.status === 401) {
          console.warn("[AUTH] Server rejected token (401). Signing out.");
          logout();
        }
      } catch (err) {
        console.log("[AUTH] Server sync note (offline or network error):", err.message);
      }
    }

    if (token) {
      syncUserData();
    }
  }, [token]);

  // Auth Action: Sign In
  const login = async (email, password) => {
    let userObj = null;
    let authToken = null;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        authToken = data.token;
        userObj = {
          id: data.user.id || data.user._id,
          name: data.user.full_name || email.split('@')[0],
          email: data.user.email,
          phone: data.user.phone || '',
          dateOfBirth: data.user.date_of_birth || '',
          age: data.user.age || 0,
          gender: data.user.gender || 'Female',
          height: data.user.height || '',
          heightUnit: data.user.height_unit || 'cm',
          weight: data.user.weight || '',
          weightUnit: data.user.weight_unit || 'kg',
          bloodGroup: data.user.blood_group || 'Not Known',
          city: data.user.city || '',
          state: data.user.state || '',
          country: data.user.country || 'India',
          occupation: data.user.occupation || '',
          primaryPhysician: data.user.primary_physician || '',
          profileCompleted: true
        };
      } else {
        const data = await res.json();
        if (data.error && data.error.includes("Invalid")) {
          throw new Error(data.error);
        }
      }
    } catch (err) {
      if (err.message.includes("Invalid")) {
        throw err;
      }
      console.log("[AUTH] Login network fallback:", err.message);
    }

    if (!userObj) {
      authToken = 'token-' + Date.now();
      userObj = {
        id: 'usr-' + Date.now(),
        name: email.split('@')[0],
        email: email,
        profileCompleted: true
      };
    }

    localStorage.setItem('medguardian_token', authToken);
    localStorage.setItem('medguardian_user_profile', JSON.stringify(userObj));
    setToken(authToken);
    setUserProfile(userObj);

    toast.success(`Welcome back, ${userObj.name}!`);
    return userObj;
  };

  // Auth Action: Register Account
  const signup = async ({ name, email, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match. Please re-enter your password.");
    }

    let userObj = null;
    let authToken = null;

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (res.ok) {
        const data = await res.json();
        authToken = data.token;
        userObj = {
          id: data.user.id || data.user._id,
          name: data.user.full_name || name,
          email: data.user.email || email,
          profileCompleted: false
        };
      } else {
        const data = await res.json();
        if (data.error) throw new Error(data.error);
      }
    } catch (err) {
      if (err.message.includes("already exists") || err.message.includes("required") || err.message.includes("Password must contain")) {
        throw err;
      }
      console.log("[AUTH] Signup network fallback:", err.message);
    }

    if (!userObj) {
      authToken = 'token-' + Date.now();
      userObj = {
        id: 'usr-' + Date.now(),
        name: name,
        email: email,
        profileCompleted: false
      };
    }

    localStorage.setItem('medguardian_token', authToken);
    localStorage.setItem('medguardian_user_profile', JSON.stringify(userObj));
    setToken(authToken);
    setUserProfile(userObj);
    setReports(MOCK_REPORTS);
    setMedicines([]);
    setEmergencyContacts([]);
    toast.success(`Account created successfully!`);
    return userObj;
  };

  // Onboarding Action: Complete Health Profile
  const completeOnboarding = async (profileData) => {
    const payload = {
      full_name: profileData.name,
      date_of_birth: profileData.dateOfBirth,
      age: profileData.age,
      gender: profileData.gender,
      height: profileData.height,
      height_unit: profileData.heightUnit,
      weight: profileData.weight,
      weight_unit: profileData.weightUnit,
      blood_group: profileData.bloodGroup,
      city: profileData.city,
      state: profileData.state,
      country: profileData.country,
      occupation: profileData.occupation,
      profile_completed: true
    };

    try {
      await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload)
      });
    } catch (err) {}

    const updatedUser = {
      ...userProfile,
      name: profileData.name,
      dateOfBirth: profileData.dateOfBirth,
      age: profileData.age,
      gender: profileData.gender,
      height: profileData.height,
      heightUnit: profileData.heightUnit,
      weight: profileData.weight,
      weightUnit: profileData.weightUnit,
      bloodGroup: profileData.bloodGroup,
      city: profileData.city,
      state: profileData.state,
      country: profileData.country,
      occupation: profileData.occupation,
      profileCompleted: true
    };

    setUserProfile(updatedUser);
    localStorage.setItem('medguardian_user_profile', JSON.stringify(updatedUser));
  };

  // Auth Action: Sign Out
  const logout = () => {
    localStorage.removeItem('medguardian_token');
    localStorage.removeItem('medguardian_user_profile');
    localStorage.removeItem('medguardian_user_email');
    localStorage.removeItem('medguardian_user_name');
    localStorage.removeItem('medguardian_reports');
    setToken(null);
    setUserProfile(null);
    setReports(MOCK_REPORTS);
    setMedicines([]);
    setEmergencyContacts([]);
    setSosLogs([]);
    setNotifications([]);
    setActiveReportId(null);
    toast.success("Signed out successfully.");
  };

  const activeReport = (Array.isArray(reports) && reports.length > 0) ? reports[0] : null;

  const addReport = (newReport) => {
    setReports(prev => {
      const updated = [newReport, ...(Array.isArray(prev) ? prev : [])];
      localStorage.setItem('medguardian_reports', JSON.stringify(updated));
      return updated;
    });
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
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updates)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update profile");
    }

    const updated = await res.json();
    const newProfile = {
      ...userProfile,
      name: updated.full_name || userProfile.name,
      phone: updated.phone ?? userProfile.phone,
      dateOfBirth: updated.date_of_birth ?? userProfile.dateOfBirth,
      age: updated.age ?? userProfile.age,
      gender: updated.gender ?? userProfile.gender,
      height: updated.height ?? userProfile.height,
      heightUnit: updated.height_unit ?? userProfile.heightUnit,
      weight: updated.weight ?? userProfile.weight,
      weightUnit: updated.weight_unit ?? userProfile.weightUnit,
      bloodGroup: updated.blood_group ?? userProfile.bloodGroup,
      city: updated.city ?? userProfile.city,
      state: updated.state ?? userProfile.state,
      country: updated.country ?? userProfile.country,
      occupation: updated.occupation ?? userProfile.occupation,
      primaryPhysician: updated.primary_physician ?? userProfile.primaryPhysician,
      profileCompleted: true
    };

    setUserProfile(newProfile);
    localStorage.setItem('medguardian_user_profile', JSON.stringify(newProfile));
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
      completeOnboarding,
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
