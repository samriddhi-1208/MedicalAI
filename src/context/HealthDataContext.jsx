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
        
        // Verify token & get user profile from database
        const profileRes = await fetch(`${API_BASE}/auth/me`, { headers });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfile({
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
            profileCompleted: !!profileData.profile_completed
          });

          // Fetch authenticated user's reports
          const rRes = await fetch(`${API_BASE}/reports`, { headers });
          if (rRes.ok) {
            const rData = await rRes.json();
            setReports(Array.isArray(rData) ? rData : []);
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

          setToken(storedToken);
        } else {
          // Token is invalid/expired - clear authentication completely
          console.warn("[AUTH] Session expired or server rejected token. Clearing auth state.");
          localStorage.removeItem('medguardian_token');
          localStorage.removeItem('medguardian_user_email');
          localStorage.removeItem('medguardian_user_name');
          setToken(null);
          setUserProfile(null);
          setReports([]);
          setMedicines([]);
          setEmergencyContacts([]);
        }
      } catch (err) {
        console.warn("[AUTH] Backend server unreachable during token verification:", err.message);
        // Clear token if backend rejected authentication
        localStorage.removeItem('medguardian_token');
        localStorage.removeItem('medguardian_user_email');
        localStorage.removeItem('medguardian_user_name');
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
      throw new Error(data.error || "Invalid email or password.");
    }

    localStorage.setItem('medguardian_token', data.token);
    localStorage.setItem('medguardian_user_email', data.user.email);
    localStorage.setItem('medguardian_user_name', data.user.full_name || email.split('@')[0]);
    setToken(data.token);
    
    const userObj = {
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
      profileCompleted: !!data.user.profile_completed
    };

    setUserProfile(userObj);
    toast.success(`Welcome back, ${userObj.name}!`);
    return userObj;
  };

  // Auth Action: Register Account
  const signup = async ({ name, email, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match. Please re-enter your password.");
    }

    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Registration failed.");
    }

    localStorage.setItem('medguardian_token', data.token);
    localStorage.setItem('medguardian_user_email', data.user.email);
    localStorage.setItem('medguardian_user_name', name);
    setToken(data.token);
    
    const userObj = {
      id: data.user.id || data.user._id,
      name: data.user.full_name || name,
      email: data.user.email || email,
      profileCompleted: false
    };

    setUserProfile(userObj);
    setReports([]);
    setMedicines([]);
    setEmergencyContacts([]);
    toast.success(`Account created successfully! Please complete your health profile.`);
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

    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to update profile.");
    }

    const updated = await res.json();
    setUserProfile(prev => ({
      ...prev,
      name: updated.full_name || profileData.name,
      dateOfBirth: updated.date_of_birth || profileData.dateOfBirth,
      age: updated.age || profileData.age,
      gender: updated.gender || profileData.gender,
      height: updated.height || profileData.height,
      heightUnit: updated.height_unit || profileData.heightUnit,
      weight: updated.weight || profileData.weight,
      weightUnit: updated.weight_unit || profileData.weightUnit,
      bloodGroup: updated.blood_group || profileData.bloodGroup,
      city: updated.city || profileData.city,
      state: updated.state || profileData.state,
      country: updated.country || profileData.country,
      occupation: updated.occupation || profileData.occupation,
      profileCompleted: true
    }));
  };

  // Auth Action: Sign Out
  const logout = () => {
    localStorage.removeItem('medguardian_token');
    localStorage.removeItem('medguardian_user_email');
    localStorage.removeItem('medguardian_user_name');
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
    setUserProfile(prev => ({
      ...prev,
      name: updated.full_name || prev.name,
      phone: updated.phone ?? prev.phone,
      dateOfBirth: updated.date_of_birth ?? prev.dateOfBirth,
      age: updated.age ?? prev.age,
      gender: updated.gender ?? prev.gender,
      height: updated.height ?? prev.height,
      heightUnit: updated.height_unit ?? prev.heightUnit,
      weight: updated.weight ?? prev.weight,
      weightUnit: updated.weight_unit ?? prev.weightUnit,
      bloodGroup: updated.blood_group ?? prev.bloodGroup,
      city: updated.city ?? prev.city,
      state: updated.state ?? prev.state,
      country: updated.country ?? prev.country,
      occupation: updated.occupation ?? prev.occupation,
      primaryPhysician: updated.primary_physician ?? prev.primaryPhysician,
      profileCompleted: true
    }));
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
