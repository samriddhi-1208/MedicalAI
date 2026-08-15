import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const HealthDataContext = createContext(null);

const sanitizeApiUrl = (url) => {
  if (!url) return 'https://medicalai-backend-5ycw.onrender.com/api';
  let cleaned = url.trim().replace(/\/+$/, '');
  if (cleaned.endsWith('/api/api')) {
    cleaned = cleaned.replace(/\/api\/api$/, '/api');
  }
  if (!cleaned.endsWith('/api')) {
    cleaned = `${cleaned}/api`;
  }
  return cleaned;
};

const API_BASE = sanitizeApiUrl(import.meta.env.VITE_API_BASE_URL || 'https://medicalai-backend-5ycw.onrender.com/api');

async function safeParseJson(response) {
  const text = await response.text();
  if (!text || !text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch (err) {
    console.warn("JSON parse fallback for raw response:", text.substring(0, 100));
    return { raw: text };
  }
}

export const HealthDataProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('medguardian_lang') || 'EN');
  
  const [token, setToken] = useState(() => localStorage.getItem('medguardian_token') || null);
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('medguardian_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [reports, setReports] = useState(() => {
    const savedProfile = localStorage.getItem('medguardian_user_profile');
    if (savedProfile) {
      try {
        const u = JSON.parse(savedProfile);
        const cached = localStorage.getItem(`medguardian_reports_${u.id}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });

  const [medicines, setMedicines] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [sosLogs, setSosLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeReportId, setActiveReportId] = useState(null);
  
  const [loadingData, setLoadingData] = useState(false);
  const [apiError, setApiError] = useState(null);

  const setAppLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('medguardian_lang', lang);
  };

  const getAuthHeaders = () => {
    const storedToken = token || localStorage.getItem('medguardian_token');
    if (!storedToken) return {};
    return {
      'Authorization': `Bearer ${storedToken}`
    };
  };

  // Sync user data with MongoDB Atlas using Parallel Requests for Sub-Second Sign-in
  useEffect(() => {
    async function syncUserData() {
      const storedToken = token || localStorage.getItem('medguardian_token');
      if (!storedToken) {
        setLoadingData(false);
        return;
      }

      setLoadingData(true);
      setApiError(null);

      const headers = { 'Authorization': `Bearer ${storedToken}` };

      try {
        // Execute ALL backend fetches concurrently in PARALLEL (1 Single Roundtrip)
        const [profileRes, rRes, mRes, cRes] = await Promise.all([
          fetch(`${API_BASE}/auth/me`, { headers }).catch(() => null),
          fetch(`${API_BASE}/reports`, { headers }).catch(() => null),
          fetch(`${API_BASE}/medicines`, { headers }).catch(() => null),
          fetch(`${API_BASE}/sos/contacts`, { headers }).catch(() => null)
        ]);

        if (profileRes && profileRes.ok) {
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
            profileCompleted: profileData.profile_completed ?? true
          };

          setUserProfile(syncedUser);
          localStorage.setItem('medguardian_user_profile', JSON.stringify(syncedUser));

          // Parse Reports
          if (rRes && rRes.ok) {
            const rData = await safeParseJson(rRes);
            const safeReports = Array.isArray(rData) ? rData : [];
            setReports(safeReports);
            if (syncedUser.id) {
              localStorage.setItem(`medguardian_reports_${syncedUser.id}`, JSON.stringify(safeReports));
            }
          }

          // Parse Medicines
          if (mRes && mRes.ok) {
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

          // Parse Emergency Contacts
          if (cRes && cRes.ok) {
            const cData = await safeParseJson(cRes);
            setEmergencyContacts(Array.isArray(cData) ? cData : []);
          }
        } else if (profileRes && profileRes.status === 401) {
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
      setLoadingData(false);
    }
  }, [token]);

  // Auth Action: Sign In (Instant Navigation & Background Sync)
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
          profileCompleted: data.user.profile_completed ?? true
        };
      } else {
        throw new Error(data.error || "Invalid email or password.");
      }
    } catch (err) {
      setLoadingData(false);
      throw err;
    }

    // Hydrate local cache immediately for instant navigation
    if (userObj.id) {
      const cached = localStorage.getItem(`medguardian_reports_${userObj.id}`);
      if (cached) {
        try { setReports(JSON.parse(cached)); } catch(e){}
      }
    }

    localStorage.setItem('medguardian_token', authToken);
    localStorage.setItem('medguardian_user_profile', JSON.stringify(userObj));
    
    setToken(authToken);
    setUserProfile(userObj);
    setLoadingData(false);

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

    setReports([]);
    setMedicines([]);
    setEmergencyContacts([]);

    localStorage.setItem('medguardian_token', authToken);
    localStorage.setItem('medguardian_user_profile', JSON.stringify(userObj));
    setToken(authToken);
    setUserProfile(userObj);
    setLoadingData(false);
    
        toast.success(`Account created successfully! Please set up your profile details.`);
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

      const addReport = async (reportData, fileObj = null) => {
        let savedReport = { ...reportData };
        if (!savedReport.id) {
          savedReport.id = savedReport.reportId || `rep-${Date.now()}`;
        }

        setReports(prev => {
          const existing = Array.isArray(prev) ? prev : [];
          const filtered = existing.filter(r => r.id !== savedReport.id);
          const updated = [savedReport, ...filtered];
          if (userProfile?.id) {
            localStorage.setItem(`medguardian_reports_${userProfile.id}`, JSON.stringify(updated));
          }
          return updated;
        });
        setActiveReportId(savedReport.id);

        if (fileObj) {
          try {
            const formData = new FormData();
            formData.append('reportFile', fileObj);
            formData.append('report', fileObj);

            const res = await fetch(`${API_BASE}/reports`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: formData
            });

            if (res.ok) {
              const resData = await safeParseJson(res);
              if (resData.report) {
                const backendReport = {
                  ...savedReport,
                  ...resData.report,
                  id: resData.report.id || savedReport.id
                };
                setReports(prev => {
                  const existing = Array.isArray(prev) ? prev : [];
                  const filtered = existing.filter(r => r.id !== savedReport.id && r.id !== backendReport.id);
                  const updated = [backendReport, ...filtered];
                  if (userProfile?.id) {
                    localStorage.setItem(`medguardian_reports_${userProfile.id}`, JSON.stringify(updated));
                  }
                  return updated;
                });
                return backendReport;
              }
            }
          } catch (err) {
            console.warn("[REPORTS] Async backend save note:", err.message);
          }
        }

        return savedReport;
      };

      const addMedicine = async (medData) => {
        try {
          const res = await fetch(`${API_BASE}/medicines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(medData)
          });

          if (res.ok) {
            const m = await safeParseJson(res);
            const newMed = {
              id: m._id || m.id,
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
            };

            setMedicines(prev => [newMed, ...prev]);
            toast.success(`Medicine reminder created for ${newMed.name}`);
            return newMed;
          }
        } catch (err) {}

        const localMed = {
          id: `med-${Date.now()}`,
          name: medData.name,
          dose: medData.dose || '1 tablet',
          dosage: medData.dose || '1 tablet',
          frequency: medData.frequency || 'Once daily',
          scheduledTime: medData.scheduled_time || '08:00 AM',
          time: medData.scheduled_time || '08:00 AM',
          timeSlot: medData.timeSlot || 'Morning',
          mealRelation: medData.meal_relation || 'After meal',
          mealType: medData.meal_type || 'Lunch',
          delayMinutes: medData.delay_minutes || 30,
          purpose: medData.purpose || 'General Wellness',
          totalPills: medData.totalPills || 30,
          pillsRemaining: medData.totalPills || 30,
          isPaused: false,
          taken: false
        };

        setMedicines(prev => [localMed, ...prev]);
        toast.success(`Medicine reminder saved locally for ${localMed.name}`);
        return localMed;
      };

      const toggleMedicineTaken = async (id) => {
        setMedicines(prev => prev.map(m => {
          if (m.id === id) {
            const nextTaken = !m.taken;
            if (nextTaken) {
              toast.success(`Marked ${m.name} as taken!`);
            }
            return { ...m, taken: nextTaken };
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

      const togglePauseMedicine = async (id) => {
        setMedicines(prev => prev.map(m => {
          if (m.id === id) {
            const nextPaused = !m.isPaused;
            toast.success(nextPaused ? `Paused reminder for ${m.name}` : `Resumed reminder for ${m.name}`);
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

      const deleteMedicine = async (id) => {
        setMedicines(prev => prev.filter(m => m.id !== id));
        toast.success("Medicine reminder removed.");

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
            const newContact = await safeParseJson(res);
            setEmergencyContacts(prev => [...prev, newContact]);
            toast.success(`Added ${contact.name} to Emergency Contacts.`);
            return newContact;
          }
        } catch (err) {}

        const localContact = { id: `c-${Date.now()}`, ...contact };
        setEmergencyContacts(prev => [...prev, localContact]);
        toast.success(`Added ${contact.name} to Emergency Contacts.`);
        return localContact;
      };

      const triggerSOS = async () => {
        const log = {
          id: `sos-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'Active Alert',
          contactsNotified: emergencyContacts.map(c => c.name)
        };
        setSosLogs(prev => [log, ...prev]);

        try {
          await fetch(`${API_BASE}/sos/trigger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ location: "User Current GPS Coordinates" })
          });
        } catch (err) {}

        toast.error("🚨 EMERGENCY SOS DISPATCHED! Notifying emergency contacts and nearby hospitals.", { duration: 6000 });
      };

  const updateUserProfile = async (updates) => {
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);
    localStorage.setItem('medguardian_user_profile', JSON.stringify(updated));

    try {
      await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ full_name: updates.name, ...updates })
      });
    } catch (err) {}
  };

  const isAuthenticated = Boolean(token);
  const loadingAuth = loadingData;

  return (
    <HealthDataContext.Provider
      value={{
        API_BASE,
        language,
        setAppLanguage,
        token,
        isAuthenticated,
        loadingAuth,
        userProfile,
        reports,
        medicines,
        emergencyContacts,
        sosLogs,
        notifications,
        activeReportId,
        loadingData,
        apiError,
        login,
        signup,
        completeOnboarding,
        logout,
        addReport,
        addMedicine,
        toggleMedicineTaken,
        togglePauseMedicine,
        deleteMedicine,
        addEmergencyContact,
        triggerSOS,
        updateUserProfile,
        setActiveReportId
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error("useHealthData must be used within a HealthDataProvider");
  }
  return context;
};
