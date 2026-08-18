import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const HealthDataContext = createContext();

function getNormalizedApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL || '';
  if (envUrl && envUrl.trim()) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    if (!clean.endsWith('/api')) {
      clean = `${clean}/api`;
    }
    return clean;
  }
  return 'https://medicalai-backend-5ycw.onrender.com/api';
}

const API_BASE = getNormalizedApiUrl();

async function safeParseJson(res) {
  try {
    return await res.json();
  } catch (e) {
    return {};
  }
}

export const HealthDataProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('medguardian_token') || null);
  const [userProfile, setUserProfile] = useState(() => {
    const cached = localStorage.getItem('medguardian_user_profile');
    return cached ? JSON.parse(cached) : null;
  });

  const [reports, setReports] = useState(() => {
    if (userProfile?.id) {
      const cached = localStorage.getItem(`medguardian_reports_${userProfile.id}`);
      if (cached) return JSON.parse(cached);
    }
    const globalCached = localStorage.getItem('medguardian_reports');
    return globalCached ? JSON.parse(globalCached) : [];
  });

  const [medicines, setMedicines] = useState(() => {
    if (userProfile?.id) {
      const cached = localStorage.getItem(`medguardian_medicines_${userProfile.id}`);
      if (cached) return JSON.parse(cached);
    }
    return [];
  });

  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [sosLogs, setSosLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeReportId, setActiveReportId] = useState(() => reports[0]?.id || null);
  const [language, setLanguageState] = useState(() => localStorage.getItem('medguardian_lang') || 'EN');
  const [loadingData, setLoadingData] = useState(false);
  const [apiError, setApiError] = useState(null);

  const getAuthHeaders = () => ({
    'Authorization': token ? `Bearer ${token}` : ''
  });

  const setAppLanguage = (langCode) => {
    setLanguageState(langCode);
    localStorage.setItem('medguardian_lang', langCode);
  };

  // Sync state with server upon login / token change
  useEffect(() => {
    async function syncUserData() {
      if (!token) return;
      setLoadingData(true);
      setApiError(null);

      try {
        const [profileRes, reportsRes, medsRes, contactsRes] = await Promise.all([
          fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() }).catch(() => null),
          fetch(`${API_BASE}/reports`, { headers: getAuthHeaders() }).catch(() => null),
          fetch(`${API_BASE}/medicines`, { headers: getAuthHeaders() }).catch(() => null),
          fetch(`${API_BASE}/emergency/contacts`, { headers: getAuthHeaders() }).catch(() => null)
        ]);

        if (profileRes && profileRes.ok) {
          const pData = await safeParseJson(profileRes);
          const rawUser = pData.user || pData;
          if (rawUser && (rawUser.email || rawUser.id || rawUser._id)) {
            const updatedProfile = {
              id: rawUser.id || rawUser._id,
              name: rawUser.full_name || rawUser.name || 'Patient',
              email: rawUser.email,
              phone: rawUser.phone || '',
              dob: rawUser.dob || '',
              gender: rawUser.gender || 'Female',
              height: rawUser.height || '',
              heightUnit: rawUser.height_unit || 'cm',
              weight: rawUser.weight || '',
              weightUnit: rawUser.weight_unit || 'kg',
              bloodGroup: rawUser.blood_group || 'Not Known',
              primaryPhysician: rawUser.primary_physician || 'Dr. Aris Thorne',
              city: rawUser.city || '',
              state: rawUser.state || '',
              country: rawUser.country || 'India',
              occupation: rawUser.occupation || '',
              profileCompleted: rawUser.profile_completed ?? true
            };
            setUserProfile(updatedProfile);
            localStorage.setItem('medguardian_user_profile', JSON.stringify(updatedProfile));
          }

          // Parse Reports
          if (reportsRes && reportsRes.ok) {
            const rData = await safeParseJson(reportsRes);
            const safeReports = Array.isArray(rData) ? rData : [];
            setReports(safeReports);
            if (rawUser?.id) {
              localStorage.setItem(`medguardian_reports_${rawUser.id}`, JSON.stringify(safeReports));
            }
            if (safeReports.length > 0 && !activeReportId) {
              setActiveReportId(safeReports[0].id || safeReports[0]._id);
            }
          }

          // Parse Medicines (With Strict In-Memory Deduplication)
          if (medsRes && medsRes.ok) {
            const mData = await safeParseJson(medsRes);
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
              durationDays: m.duration_days || 5,
              sourceTitle: m.source_title || 'Prescription Schedule',
              purpose: m.purpose || 'Prescribed Medication',
              totalPills: m.total_pills ?? 30,
              pillsRemaining: m.pills_remaining ?? 30,
              isPaused: m.is_paused || false,
              taken: m.is_taken || false
            }));

            // Deduplicate safely by identity key
            const deduplicated = [];
            const seenKeys = new Set();
            safeMeds.forEach(m => {
              const k = `${(m.name || '').toLowerCase().trim()}|${(m.dose || '').toLowerCase().trim()}|${(m.frequency || '').toLowerCase().trim()}|${(m.scheduledTime || '').toLowerCase().trim()}`;
              if (!seenKeys.has(k)) {
                seenKeys.add(k);
                deduplicated.push(m);
              }
            });

            setMedicines(deduplicated);
            if (rawUser?.id) {
              localStorage.setItem(`medguardian_medicines_${rawUser.id}`, JSON.stringify(deduplicated));
            }
          }

          // Parse Emergency Contacts (with fallback to /sos/contacts if 404)
          let cData = [];
          if (contactsRes && contactsRes.ok) {
            cData = await safeParseJson(contactsRes);
          } else {
            const sosRes = await fetch(`${API_BASE}/sos/contacts`, { headers: getAuthHeaders() }).catch(() => null);
            if (sosRes && sosRes.ok) {
              cData = await safeParseJson(sosRes);
            }
          }
          setEmergencyContacts(Array.isArray(cData) ? cData : []);
        }
      } catch (err) {
        console.warn("[AUTH] Sync note:", err.message);
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

  const login = async (email, password) => {
    setLoadingData(true);
    let userObj = null;
    let authToken = null;

    try {
      const cleanEmail = (email || '').toLowerCase().trim();
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const data = await safeParseJson(res);

      if (res.ok) {
        authToken = data.token;
        const rawUser = data.user || data;
        userObj = {
          id: rawUser.id || rawUser._id,
          name: rawUser.full_name || rawUser.name || cleanEmail.split('@')[0],
          email: rawUser.email || cleanEmail,
          phone: rawUser.phone || '',
          profileCompleted: rawUser.profile_completed ?? true
        };
      } else {
        throw new Error(data.error || "Invalid email or password.");
      }
    } catch (err) {
      setLoadingData(false);
      throw err;
    }

    setToken(authToken);
    setUserProfile(userObj);
    localStorage.setItem('medguardian_token', authToken);
    localStorage.setItem('medguardian_user_profile', JSON.stringify(userObj));
    setLoadingData(false);
    toast.success(`Welcome back, ${userObj.name}!`);
    return userObj;
  };

  const signup = async (param1, param2, param3) => {
    setLoadingData(true);
    let name = '';
    let email = '';
    let password = '';

    if (typeof param1 === 'object' && param1 !== null) {
      name = param1.name || param1.fullName || param1.full_name || '';
      email = param1.email || '';
      password = param1.password || '';
    } else {
      name = param1 || '';
      email = param2 || '';
      password = param3 || '';
    }

    const cleanEmail = email.toLowerCase().trim();
    let userObj = null;
    let authToken = null;

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, full_name: name, email: cleanEmail, password })
      });

      const data = await safeParseJson(res);

      if (res.ok) {
        authToken = data.token;
        const rawUser = data.user || data;
        userObj = {
          id: rawUser.id || rawUser._id,
          name: rawUser.full_name || rawUser.name || name,
          email: rawUser.email || cleanEmail,
          profileCompleted: false
        };
      } else {
        throw new Error(data.error || "Registration failed.");
      }
    } catch (err) {
      setLoadingData(false);
      throw err;
    }

    setToken(authToken);
    setUserProfile(userObj);
    localStorage.setItem('medguardian_token', authToken);
    localStorage.setItem('medguardian_user_profile', JSON.stringify(userObj));
    setLoadingData(false);
    toast.success("Account created successfully!");
    return userObj;
  };

  const logout = () => {
    localStorage.removeItem('medguardian_token');
    localStorage.removeItem('medguardian_user_profile');
    if (userProfile?.id) {
      localStorage.removeItem(`medguardian_reports_${userProfile.id}`);
      localStorage.removeItem(`medguardian_medicines_${userProfile.id}`);
    }
    setToken(null);
    setUserProfile(null);
    setReports([]);
    setMedicines([]);
    setEmergencyContacts([]);
    setActiveReportId(null);
    setApiError(null);
    toast.success("Signed out successfully.");
  };

  const addReport = async (reportData, fileObj = null) => {
    let savedReport = { ...reportData };

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
              id: resData.report.id || resData.report._id,
              isDuplicate: Boolean(resData.isDuplicate || resData.duplicate)
            };

            setReports(prev => {
              const existing = Array.isArray(prev) ? prev : [];
              const filtered = existing.filter(r => String(r.id) !== String(backendReport.id));
              const updated = [backendReport, ...filtered];
              if (userProfile?.id) {
                localStorage.setItem(`medguardian_reports_${userProfile.id}`, JSON.stringify(updated));
              }
              return updated;
            });
            setActiveReportId(backendReport.id);
            return backendReport;
          }
        }
      } catch (err) {
        console.warn("[REPORTS] Backend upload note:", err.message);
      }
    }

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
          durationDays: m.duration_days || 5,
          sourceTitle: m.source_title || medData.source_title || 'Prescription',
          purpose: m.purpose || 'Prescribed Medication',
          totalPills: m.total_pills ?? 30,
          pillsRemaining: m.pills_remaining ?? 30,
          isPaused: m.is_paused || false,
          taken: m.is_taken || false
        };

        setMedicines(prev => {
          const existing = Array.isArray(prev) ? prev : [];
          const filtered = existing.filter(item => String(item.id) !== String(newMed.id));
          const updated = [newMed, ...filtered];
          if (userProfile?.id) {
            localStorage.setItem(`medguardian_medicines_${userProfile.id}`, JSON.stringify(updated));
          }
          return updated;
        });

        toast.success(`Medicine reminder saved for ${newMed.name}`);
        return newMed;
      }
    } catch (err) {}

    const localMed = {
      id: `med-${Date.now()}`,
      name: medData.name,
      dose: medData.dose || '1 tablet',
      dosage: medData.dose || '1 tablet',
      frequency: medData.frequency || 'Once daily',
      scheduledTime: medData.scheduled_time || medData.time || '08:00 AM',
      time: medData.scheduled_time || medData.time || '08:00 AM',
      timeSlot: medData.timeSlot || 'Morning',
      mealRelation: medData.meal_relation || medData.mealRelation || 'After meal',
      mealType: medData.meal_type || medData.mealType || 'Lunch',
      delayMinutes: medData.delay_minutes || 30,
      durationDays: medData.duration_days || 5,
      sourceTitle: medData.source_title || 'Prescription',
      purpose: medData.purpose || 'Prescribed Medication',
      totalPills: medData.totalPills || 30,
      pillsRemaining: medData.totalPills || 30,
      isPaused: false,
      taken: false
    };

    setMedicines(prev => {
      const existing = Array.isArray(prev) ? prev : [];
      const updated = [localMed, ...existing];
      if (userProfile?.id) {
        localStorage.setItem(`medguardian_medicines_${userProfile.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    toast.success(`Medicine reminder saved for ${localMed.name}`);
    return localMed;
  };

  const updateMedicine = async (id, medUpdates) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          ...medUpdates,
          scheduledTime: medUpdates.scheduled_time || medUpdates.time || m.scheduledTime,
          mealRelation: medUpdates.meal_relation || medUpdates.mealRelation || m.mealRelation
        };
      }
      return m;
    }));

    toast.success("Medication reminder updated.");

    try {
      await fetch(`${API_BASE}/medicines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(medUpdates)
      });
    } catch (err) {}
  };

  const toggleMedicineTaken = async (id) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        const nextTaken = !m.taken;
        if (nextTaken) {
          toast.success(`✓ Marked ${m.name} as taken at ${timeStr}`);
        }
        return { 
          ...m, 
          taken: nextTaken, 
          takenAt: nextTaken ? timeStr : null 
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

  const updateUserProfile = async (profileData) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...profileData };
      localStorage.setItem('medguardian_user_profile', JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(profileData)
      });
    } catch (err) {}
  };

  return (
    <HealthDataContext.Provider
      value={{
        token,
        userProfile,
        reports,
        medicines,
        emergencyContacts,
        sosLogs,
        notifications,
        activeReportId,
        setActiveReportId,
        language,
        setAppLanguage,
        loadingData,
        apiError,
        API_BASE,
        login,
        signup,
        logout,
        addReport,
        addMedicine,
        updateMedicine,
        toggleMedicineTaken,
        togglePauseMedicine,
        deleteMedicine,
        updateUserProfile
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
