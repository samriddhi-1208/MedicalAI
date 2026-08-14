import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const HealthDataContext = createContext();

// Dynamic API Base URL Sanitizer (Guarantees valid /api endpoint regardless of environment variable format)
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
let cleanUrl = rawApiUrl.trim().replace(/\/+$/, '');
if (!cleanUrl.endsWith('/api')) {
  cleanUrl = cleanUrl + '/api';
}
const API_BASE = cleanUrl;

function getAuthHeaders() {
  const token = localStorage.getItem('medguardian_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function safeParseJson(res) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await res.json();
  }
  throw new Error(`Backend API returned unexpected non-JSON response (${res.status}). Please check Render backend deployment status.`);
}

export const HealthDataProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('medguardian_language') || 'EN';
  });

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    localStorage.setItem('medguardian_language', newLang);
  };

  // Initialize token and userProfile cleanly without cross-user contamination
  const [token, setToken] = useState(() => {
    return localStorage.getItem('medguardian_token') || null;
  });

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('medguardian_user_profile');
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  // State: User-specific medical reports & medicines (MUST DEFAULT TO EMPTY ARRAY FOR NEW USERS)
  const [reports, setReports] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [sosLogs, setSosLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeReportId, setActiveReportId] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Synchronize authenticated user profile, reports, and medicines from backend
  useEffect(() => {
    async function syncUserData() {
      const storedToken = localStorage.getItem('medguardian_token');
      if (!storedToken) {
        setToken(null);
        setUserProfile(null);
        setReports([]);
        setMedicines([]);
        setEmergencyContacts([]);
        return;
      }

      setLoadingData(true);
      setApiError(null);

      try {
        const headers = { 'Authorization': `Bearer ${storedToken}` };
        
        // 1. Verify session & profile
        const profileRes = await fetch(`${API_BASE}/auth/me`, { headers });
        if (profileRes.ok) {
          const profileData = await safeParseJson(profileRes);
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

          // 2. Fetch authenticated user's reports from backend (EXCLUSIVELY scoped to req.user.id)
          const rRes = await fetch(`${API_BASE}/reports`, { headers });
          if (rRes.ok) {
            const rData = await safeParseJson(rRes);
            const safeReports = Array.isArray(rData) ? rData : [];
            setReports(safeReports);
            if (syncedUser.id) {
              localStorage.setItem(`medguardian_reports_${syncedUser.id}`, JSON.stringify(safeReports));
            }
          }

          // 3. Fetch authenticated user's medicines from backend (EXCLUSIVELY scoped to req.user.id)
          const mRes = await fetch(`${API_BASE}/medicines`, { headers });
          if (mRes.ok) {
            const mData = await safeParseJson(mRes);
            const safeMeds = (Array.isArray(mData) ? mData : []).map(m => ({
              id: m.id || m._id,
              name: m.name,
              dose: m.dose || m.dosage || '1 tablet',
              dosage: m.dosage || m.dose || '1 tablet',
              frequency: m.frequency || 'Once daily',
              scheduledTime: m.scheduled_time || m.time || '08:00 AM',
              time: m.scheduled_time || m.time || '08:00 AM',
              timeSlot: m.time_slot || 'Morning',
              mealRelation: m.meal_relation || 'After meal',
              mealType: m.meal_type || 'Lunch',
              delayMinutes: m.delay_minutes || 30,
              purpose: m.purpose || 'General Wellness',
              totalPills: m.total_pills ?? 30,
              pillsRemaining: m.pills_remaining ?? 30,
              isPaused: m.is_paused || false,
              taken: m.is_taken || false
            }));
            setMedicines(safeMeds);
          }

          // 4. Fetch authenticated user's emergency contacts
          const cRes = await fetch(`${API_BASE}/sos/contacts`, { headers });
          if (cRes.ok) {
            const cData = await safeParseJson(cRes);
            setEmergencyContacts(Array.isArray(cData) ? cData : []);
          }
        } else if (profileRes.status === 401) {
          console.warn("[AUTH] Server rejected token (401). Signing out.");
          logout();
        }
      } catch (err) {
        console.warn("[AUTH] Network or offline note:", err.message);
        setApiError("Unable to connect to backend server.");
      } finally {
        setLoadingData(false);
      }
    }

    if (token) {
      syncUserData();
    } else {
      setReports([]);
      setMedicines([]);
      setEmergencyContacts([]);
    }
  }, [token]);

  // Auth Action: Sign In
  const login = async (email, password) => {
    setLoadingData(true);
    let userObj = null;
    let authToken = null;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await safeParseJson(res);

      if (res.ok) {
        authToken = data.token;
        userObj = {
          id: data.user.id || data.user._id,
          name: data.user.full_name || email.split('@')[0],
          email: data.user.email,
          phone: data.user.phone || '',
          profileCompleted: true
        };
      } else {
        throw new Error(data.error || "Login failed.");
      }
    } catch (err) {
      setLoadingData(false);
      throw err;
    }

    // Reset user-specific state before loading new user data
    setReports([]);
    setMedicines([]);

    localStorage.setItem('medguardian_token', authToken);
    localStorage.setItem('medguardian_user_profile', JSON.stringify(userObj));
    setToken(authToken);
    setUserProfile(userObj);

    toast.success(`Welcome back, ${userObj.name}!`);
    return userObj;
  };

  // Auth Action: Register Account (MUST START WITH 0 MEDICAL DATA)
  const signup = async ({ name, email, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match. Please re-enter your password.");
    }

    setLoadingData(true);
    let userObj = null;
    let authToken = null;

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await safeParseJson(res);

      if (res.ok) {
        authToken = data.token;
        userObj = {
          id: data.user.id || data.user._id,
          name: data.user.full_name || name,
          email: data.user.email || email,
          profileCompleted: false
        };
      } else {
        throw new Error(data.error || "Registration failed.");
      }
    } catch (err) {
      setLoadingData(false);
      throw err;
    }

    // NEW USERS MUST START WITH 100% EMPTY MEDICAL DASHBOARD
    setReports([]);
    setMedicines([]);
    setEmergencyContacts([]);

    localStorage.setItem('medguardian_token', authToken);
    localStorage.setItem('medguardian_user_profile', JSON.stringify(userObj));
    setToken(authToken);
    setUserProfile(userObj);
    
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

  // Auth Action: Sign Out (RESET ALL USER STATE IMMEDIATELY)
  const logout = () => {
    localStorage.removeItem('medguardian_token');
    localStorage.removeItem('medguardian_user_profile');
    if (userProfile?.id) {
      localStorage.removeItem(`medguardian_reports_${userProfile.id}`);
      localStorage.removeItem(`medguardian_medicines_${userProfile.id}`);
    }
    localStorage.removeItem('medguardian_reports');
    
    setToken(null);
    setUserProfile(null);
    setReports([]);
    setMedicines([]);
    setEmergencyContacts([]);
    setSosLogs([]);
    setNotifications([]);
    setActiveReportId(null);
    setApiError(null);
    toast.success("Signed out successfully.");
  };

  const addReport = (newReport) => {
    setReports(prev => {
      const updated = [newReport, ...(Array.isArray(prev) ? prev : [])];
      if (userProfile?.id) {
        localStorage.setItem(`medguardian_reports_${userProfile.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    setActiveReportId(newReport.id);
  };

  // Medicine CRUD Methods
  const addMedicine = async (medData) => {
    try {
      const res = await fetch(`${API_BASE}/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(medData)
      });
      if (res.ok) {
        const created = await safeParseJson(res);
        const formatted = {
          id: created.id || created._id,
          name: created.name,
          dose: created.dose || created.dosage || medData.dose || '1 tablet',
          dosage: created.dosage || created.dose || medData.dosage || '1 tablet',
          frequency: created.frequency || medData.frequency || 'Once daily',
          scheduledTime: created.scheduled_time || medData.scheduled_time || medData.time || '08:00 AM',
          time: created.scheduled_time || medData.time || '08:00 AM',
          timeSlot: created.time_slot || medData.timeSlot || 'Morning',
          mealRelation: created.meal_relation || medData.mealRelation || 'After meal',
          mealType: created.meal_type || medData.mealType || 'Lunch',
          delayMinutes: created.delay_minutes || medData.delayMinutes || 30,
          purpose: created.purpose || medData.purpose || 'General Wellness',
          totalPills: created.total_pills ?? parseInt(medData.totalPills || 30),
          pillsRemaining: created.pills_remaining ?? parseInt(medData.totalPills || 30),
          isPaused: false,
          taken: false
        };
        setMedicines(prev => [formatted, ...(Array.isArray(prev) ? prev : [])]);
        toast.success(`Medicine reminder added: ${created.name}`);
        return formatted;
      }
    } catch (err) {
      console.error("Add medicine error:", err);
    }
  };

  const updateMedicine = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_BASE}/medicines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        setMedicines(prev => (Array.isArray(prev) ? prev : []).map(m => m.id === id ? { ...m, ...updatedData } : m));
        toast.success("Medicine reminder updated.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMedicine = async (id) => {
    setMedicines(prev => (Array.isArray(prev) ? prev : []).filter(m => m.id !== id));
    toast.success("Medicine reminder removed.");
    try {
      await fetch(`${API_BASE}/medicines/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (err) {}
  };

  const toggleMedicinePause = async (id) => {
    setMedicines(prev => (Array.isArray(prev) ? prev : []).map(m => {
      if (m.id === id) {
        const nextPaused = !m.isPaused;
        toast.success(nextPaused ? `Paused reminder: ${m.name}` : `Resumed reminder: ${m.name}`);
        return { ...m, isPaused: nextPaused };
      }
      return m;
    }));

    try {
      await fetch(`${API_BASE}/medicines/${id}/pause`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
    } catch (err) {}
  };

  const toggleMedicineTaken = async (id) => {
    setMedicines(prev => (Array.isArray(prev) ? prev : []).map(m => {
      if (m.id === id) {
        const nextTaken = !m.taken;
        if (nextTaken) {
          toast.success(`Dose marked as taken: ${m.name}`);
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
        }
        return { 
          ...m, 
          taken: nextTaken,
          pillsRemaining: nextTaken ? Math.max(0, (m.pillsRemaining || 30) - 1) : (m.pillsRemaining || 30) + 1
        };
      }
      return m;
    }));

    try {
      await fetch(`${API_BASE}/medicines/${id}/taken`, { 
        method: 'PATCH',
        headers: getAuthHeaders()
      });
    } catch (err) {}
  };

  const updateUserProfile = (newProfileData) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...newProfileData };
      localStorage.setItem('medguardian_user_profile', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <HealthDataContext.Provider
      value={{
        language,
        setLanguage,
        token,
        userProfile,
        setUserProfile,
        updateUserProfile,
        reports,
        setReports,
        medicines,
        setMedicines,
        emergencyContacts,
        setEmergencyContacts,
        sosLogs,
        notifications,
        activeReportId,
        setActiveReportId,
        loadingData,
        apiError,
        login,
        signup,
        completeOnboarding,
        logout,
        addReport,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        toggleMedicinePause,
        toggleMedicineTaken
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};
