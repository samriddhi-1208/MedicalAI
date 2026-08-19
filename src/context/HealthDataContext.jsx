import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const HealthDataContext = createContext(null);

const getNormalizedApiUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.includes('localhost:5000')) {
    envUrl = 'https://medicalai-backend-5ycw.onrender.com/api';
  }
  envUrl = envUrl.trim().replace(/\/+$/, '');
  if (!envUrl.endsWith('/api')) {
    envUrl += '/api';
  }
  return envUrl;
};

const API_BASE = getNormalizedApiUrl();

function isTakenToday(lastTakenAt) {
  if (!lastTakenAt) return false;
  const takenDate = new Date(lastTakenAt);
  const today = new Date();
  return (
    takenDate.getFullYear() === today.getFullYear() &&
    takenDate.getMonth() === today.getMonth() &&
    takenDate.getDate() === today.getDate()
  );
}

export const HealthDataProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('medguardian_jwt_token') || null);
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('medguardian_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [reports, setReports] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [language, setLanguage] = useState(() => localStorage.getItem('medguardian_lang') || 'EN');
  const [activeReportId, setActiveReportId] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [apiError, setApiError] = useState(null);

  const getAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const safeParseJson = async (res) => {
    try {
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (e) {
      console.warn("[API] JSON parse warning:", e);
      return null;
    }
  };

  // Sync user profile, reports, medicines, and emergency contacts on mount or token change
  useEffect(() => {
    async function syncUserData() {
      if (!token) return;
      setLoadingData(true);
      setApiError(null);

      try {
        const [meRes, reportsRes, medsRes, contactsRes] = await Promise.all([
          fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() }).catch(() => null),
          fetch(`${API_BASE}/reports`, { headers: getAuthHeaders() }).catch(() => null),
          fetch(`${API_BASE}/medicines`, { headers: getAuthHeaders() }).catch(() => null),
          fetch(`${API_BASE}/emergency/contacts`, { headers: getAuthHeaders() }).catch(() => null)
        ]);

        if (meRes && meRes.ok) {
          const meData = await safeParseJson(meRes);
          const rawUser = meData?.user || meData;

          if (rawUser) {
            const userEmail = typeof rawUser.email === 'string' ? rawUser.email : '';
            const emailPrefix = userEmail.split('@')[0] || '';
            const fallbackName = emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'User';

            const rawName = typeof rawUser.name === 'string' ? rawUser.name : (typeof rawUser.full_name === 'string' ? rawUser.full_name : '');
            const finalName = (rawName && rawName.toLowerCase() !== 'patient') ? rawName : fallbackName;

            const updatedProfile = {
              id: rawUser.id || rawUser._id,
              name: finalName,
              email: userEmail,
              phone: rawUser.phone || '',
              dob: rawUser.dob || '',
              gender: rawUser.gender || 'Not Specified',
              height: rawUser.height || '',
              heightUnit: rawUser.height_unit || 'cm',
              weight: rawUser.weight || '',
              weightUnit: rawUser.weight_unit || 'kg',
              bloodGroup: rawUser.blood_group || 'Not Known',
              primaryPhysician: rawUser.primary_physician || '',
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

          // Parse Medicines
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
              taken: m.is_taken && isTakenToday(m.last_taken_at || m.lastTakenAt)
            }));

            const deduplicated = [];
            const seenNames = new Set();
            
            safeMeds.sort((a, b) => {
              const aHasMg = /\d+\s*(mg|g|mcg|ml)/i.test(a.dose);
              const bHasMg = /\d+\s*(mg|g|mcg|ml)/i.test(b.dose);
              if (aHasMg && !bHasMg) return -1;
              if (!aHasMg && bHasMg) return 1;
              return 0;
            });

            safeMeds.forEach(m => {
              const k = (m.name || '').toLowerCase().trim();
              if (k && !seenNames.has(k)) {
                seenNames.add(k);
                deduplicated.push(m);
              }
            });

            setMedicines(deduplicated);
            if (rawUser?.id) {
              localStorage.setItem(`medguardian_medicines_${rawUser.id}`, JSON.stringify(deduplicated));
            }
          }

          // Parse Emergency Contacts
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
      setNotifications([]);
      setLoadingData(false);
    }
  }, [token]);

  // Support both login("email", "pass") and login({ email, password })
  const login = async (arg1, arg2) => {
    setLoadingData(true);
    let emailStr = '';
    let passStr = '';

    if (typeof arg1 === 'object' && arg1 !== null) {
      emailStr = (arg1.email || '').trim();
      passStr = (arg1.password || '').trim();
    } else {
      emailStr = (arg1 || '').trim();
      passStr = (arg2 || '').trim();
    }

    let userObj = null;

    try {
      let res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailStr, password: passStr })
      });

      if (!res.ok) {
        res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailStr, password: passStr })
        });
      }

      const data = await safeParseJson(res);
      if (res.ok && data && data.token) {
        setToken(data.token);
        localStorage.setItem('medguardian_jwt_token', data.token);

        userObj = data.user || { email: emailStr };
        const userEmail = userObj.email || emailStr;
        const emailPrefix = userEmail.split('@')[0] || '';
        const fallbackName = emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'User';

        const rawName = typeof userObj.name === 'string' ? userObj.name : (typeof userObj.full_name === 'string' ? userObj.full_name : '');
        const finalName = (rawName && rawName.toLowerCase() !== 'patient') ? rawName : fallbackName;

        const newProf = {
          id: userObj.id || userObj._id,
          name: finalName,
          email: userEmail,
          phone: userObj.phone || '',
          gender: userObj.gender || 'Not Specified',
          height: userObj.height || '',
          weight: userObj.weight || '',
          bloodGroup: userObj.blood_group || 'Not Known',
          primaryPhysician: userObj.primary_physician || '',
          country: userObj.country || 'India'
        };

        setUserProfile(newProf);
        localStorage.setItem('medguardian_user_profile', JSON.stringify(newProf));
        toast.success(`Welcome back, ${newProf.name}!`);
        return { success: true, user: newProf };
      } else {
        const errMsg = data?.error || data?.message || "Invalid email or password.";
        toast.error(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      toast.error("Network error during login.");
      return { success: false, error: "Network error." };
    } finally {
      setLoadingData(false);
    }
  };

  // Support both signup("Name", "email", "pass") and signup({ name, email, password })
  const signup = async (arg1, arg2, arg3) => {
    setLoadingData(true);
    let nameStr = '';
    let emailStr = '';
    let passStr = '';

    if (typeof arg1 === 'object' && arg1 !== null) {
      nameStr = (arg1.name || arg1.fullName || arg1.full_name || '').trim();
      emailStr = (arg1.email || '').trim();
      passStr = (arg1.password || '').trim();
    } else {
      nameStr = (arg1 || '').trim();
      emailStr = (arg2 || '').trim();
      passStr = (arg3 || '').trim();
    }

    try {
      let res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameStr, email: emailStr, password: passStr })
      });

      if (!res.ok) {
        res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nameStr, email: emailStr, password: passStr })
        });
      }

      const data = await safeParseJson(res);
      if (res.ok && data && data.token) {
        setToken(data.token);
        localStorage.setItem('medguardian_jwt_token', data.token);

        const userEmail = emailStr;
        const emailPrefix = userEmail.split('@')[0] || '';
        const fallbackName = emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'User';

        const rawName = data.user?.name || data.user?.full_name || nameStr;
        const finalName = (rawName && rawName.toLowerCase() !== 'patient') ? rawName : fallbackName;

        const newProf = {
          id: data.user?.id || data.user?._id,
          name: finalName,
          email: userEmail,
          gender: 'Not Specified',
          bloodGroup: 'Not Known',
          primaryPhysician: '',
          country: 'India'
        };

        setUserProfile(newProf);
        localStorage.setItem('medguardian_user_profile', JSON.stringify(newProf));
        toast.success("Account created successfully!");
        return { success: true, user: newProf };
      } else {
        const errMsg = data?.error || data?.message || "Signup failed.";
        toast.error(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      toast.error("Network error during registration.");
      return { success: false, error: "Network error." };
    } finally {
      setLoadingData(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUserProfile(null);
    setReports([]);
    setMedicines([]);
    setEmergencyContacts([]);
    setNotifications([]);
    localStorage.removeItem('medguardian_jwt_token');
    localStorage.removeItem('medguardian_user_profile');
    toast.success("Logged out successfully.");
  };

  const updateUserProfile = async (updatedFields) => {
    const payload = { ...updatedFields };
    if (updatedFields.name) {
      payload.full_name = updatedFields.name;
    }

    setUserProfile(prev => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('medguardian_user_profile', JSON.stringify(merged));
      return merged;
    });

    if (token) {
      try {
        await fetch(`${API_BASE}/auth/profile`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.warn("[API] Profile update sync note:", e);
      }
    }
  };

  const addReport = async (reportObj, fileFile) => {
    if (!token) return null;

    try {
      const formData = new FormData();
      if (fileFile) {
        formData.append('report', fileFile);
      } else {
        formData.append('title', reportObj.title || 'Lab Report');
        formData.append('data', JSON.stringify(reportObj));
      }

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/reports/upload`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await safeParseJson(res);

      if (res.ok && data && data.report) {
        if (data.isDuplicate || data.duplicate) {
          return { ...data.report, isDuplicate: true, duplicate: true };
        }

        setReports(prev => [data.report, ...prev]);
        setActiveReportId(data.report.id || data.report._id);
        return data.report;
      }
      return null;
    } catch (err) {
      console.error("[API] Upload report error:", err);
      return null;
    }
  };

  const addMedicine = async (medObj) => {
    if (!token) {
      toast.error("Please login to manage medications.");
      return null;
    }

    const k = (medObj.name || '').toLowerCase().trim();
    const existing = medicines.find(m => (m.name || '').toLowerCase().trim() === k);
    if (existing) {
      return existing;
    }

    try {
      const res = await fetch(`${API_BASE}/medicines`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(medObj)
      });
      const data = await safeParseJson(res);
      if (res.ok && data) {
        const confirmedMed = {
          id: data._id || data.id,
          name: data.name,
          dose: data.dose || data.dosage || '1 tablet',
          dosage: data.dosage || data.dose || '1 tablet',
          frequency: data.frequency || 'Once daily',
          scheduledTime: data.scheduled_time || data.time || '08:00 AM',
          time: data.scheduled_time || data.time || '08:00 AM',
          timeSlot: data.time_slot || 'Morning',
          mealRelation: data.meal_relation || data.mealRelation || 'After meal',
          mealType: data.meal_type || data.mealType || 'Lunch',
          delayMinutes: data.delay_minutes || data.delayMinutes || 30,
          durationDays: data.duration_days || data.durationDays || 5,
          sourceTitle: data.source_title || 'Prescription Schedule',
          purpose: data.purpose || 'Prescribed Medication',
          totalPills: data.total_pills || data.totalPills || 30,
          pillsRemaining: data.pills_remaining || data.pillsRemaining || 30,
          isPaused: data.is_paused || false,
          taken: data.is_taken || false
        };
        setMedicines(prev => [confirmedMed, ...prev]);
        toast.success(`${confirmedMed.name} added to schedule.`);
        return confirmedMed;
      } else {
        const err = data?.error || "Failed to add medication.";
        toast.error(err);
        return null;
      }
    } catch (e) {
      console.error("[API] Add medicine error:", e);
      toast.error("Failed to connect to backend server.");
      return null;
    }
  };

  const updateMedicine = async (medId, updatedFields) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/medicines/${medId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields)
      });
      const data = await safeParseJson(res);
      if (res.ok && data) {
        setMedicines(prev => prev.map(m => m.id === medId ? { ...m, ...updatedFields } : m));
        toast.success("Medication updated successfully.");
      } else {
        toast.error(data?.error || "Failed to update medication.");
      }
    } catch (e) {
      console.error("[API] Update medicine error:", e);
      toast.error("Network error while updating medication.");
    }
  };

  const deleteMedicine = async (medId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/medicines/${medId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setMedicines(prev => prev.filter(m => m.id !== medId));
        toast.success("Medication deleted.");
      } else {
        const data = await safeParseJson(res);
        toast.error(data?.error || "Failed to delete medication.");
      }
    } catch (e) {
      console.error("[API] Delete medicine error:", e);
      toast.error("Network error while deleting medication.");
    }
  };

  const toggleMedicinePause = async (medId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/medicines/${medId}/toggle-pause`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await safeParseJson(res);
      if (res.ok && data) {
        setMedicines(prev => prev.map(m => m.id === medId ? { ...m, isPaused: data.is_paused } : m));
      } else {
        toast.error("Failed to toggle medication status.");
      }
    } catch (e) {
      console.error("[API] Toggle pause error:", e);
      toast.error("Network error.");
    }
  };

  const toggleMedicineTaken = async (medId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/medicines/${medId}/taken`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await safeParseJson(res);
      if (res.ok && data) {
        setMedicines(prev => prev.map(m => m.id === medId ? {
          ...m,
          taken: data.is_taken,
          pillsRemaining: data.pills_remaining
        } : m));
        toast.success(data.is_taken ? "Medication logged as taken." : "Medication status updated.");
      } else {
        toast.error("Failed to log medication.");
      }
    } catch (e) {
      console.error("[API] Toggle taken error:", e);
      toast.error("Network error.");
    }
  };

  const addEmergencyContact = async (contactObj) => {
    if (!token) {
      toast.error("Please login to save emergency contacts.");
      return null;
    }
    try {
      const res = await fetch(`${API_BASE}/emergency/contacts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(contactObj)
      });
      const data = await safeParseJson(res);
      if (res.ok && data) {
        const confirmedContact = {
          id: data._id || data.id,
          name: data.name,
          relation: data.relation,
          phone: data.phone,
          email: data.email,
          isPrimary: Boolean(data.is_primary)
        };
        setEmergencyContacts(prev => [...prev, confirmedContact]);
        toast.success("Emergency contact saved.");
        return confirmedContact;
      } else {
        toast.error(data?.error || "Failed to save contact.");
        return null;
      }
    } catch (e) {
      console.error("[API] Add contact error:", e);
      toast.error("Network error saving contact.");
      return null;
    }
  };

  const deleteEmergencyContact = async (contactId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/emergency/contacts/${contactId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setEmergencyContacts(prev => prev.filter(c => c.id !== contactId));
        toast.success("Contact deleted.");
      } else {
        const data = await safeParseJson(res);
        toast.error(data?.error || "Failed to delete contact.");
      }
    } catch (e) {
      console.error("[API] Delete contact error:", e);
      toast.error("Network error deleting contact.");
    }
  };

  const triggerSOS = async (latitude, longitude) => {
    if (!token) {
      throw new Error("Authentication required to send an SOS.");
    }

    if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
      throw new Error("Live location is required to send an SOS.");
    }

    const res = await fetch(`${API_BASE}/emergency/sos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        latitude: Number(latitude),
        longitude: Number(longitude),
        triggerType: "Manual SOS Button"
      })
    });

    const data = await safeParseJson(res);
    if (res.ok && data && data.success) {
      return data;
    } else {
      throw new Error(data?.error || "SOS dispatch request failed.");
    }
  };

  const markNotificationsRead = () => {
    setNotifications(prev => (Array.isArray(prev) ? prev : []).map(n => ({ ...n, unread: false })));
  };

  const activeReport = reports.find(r => r.id === activeReportId || r._id === activeReportId) || (reports.length > 0 ? reports[0] : null);

  const handleSetLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('medguardian_lang', newLang);
  };

  const value = {
    token,
    userProfile,
    updateUserProfile,
    reports,
    activeReport,
    activeReportId,
    setActiveReportId,
    medicines,
    emergencyContacts,
    notifications,
    markNotificationsRead,
    language,
    setLanguage: handleSetLanguage,
    setAppLanguage: handleSetLanguage,
    loadingData,
    loadingAuth,
    apiError,
    API_BASE,
    login,
    signup,
    logout,
    addReport,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    toggleMedicinePause,
    toggleMedicineTaken,
    addEmergencyContact,
    deleteEmergencyContact,
    triggerSOS,
    isAuthenticated: Boolean(token)
  };

  return (
    <HealthDataContext.Provider value={value}>
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
