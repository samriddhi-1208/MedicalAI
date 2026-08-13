/**
 * MedGuardian AI — Emergency Service Architecture
 * Manages 108 ambulance dispatch, trusted contact notifications, and location payload broadcasting.
 */

export const emergencyService = {
  getTrustedContacts: () => {
    return [
      {
        id: "c-1",
        name: "Michael (Son)",
        relation: "Son / Primary Emergency Contact",
        phone: "+1 (555) 234-5678",
        status: "Alert Ready",
        notified: true
      },
      {
        id: "c-2",
        name: "Dr. Sarah Jenkins",
        relation: "Primary Care Physician",
        phone: "+1 (555) 987-6543",
        status: "Alert Ready",
        notified: true
      }
    ];
  },

  getEmergencyHelpline: () => {
    return {
      nationalHelpline: "108",
      label: "108 National Emergency Ambulance",
      description: "Direct 24/7 emergency dispatch line"
    };
  }
};
