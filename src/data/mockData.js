// Realistic dataset for MedicalAI Patient Portal
// ZERO MOCK/HARDCODED MEDICAL REPORTS — Uploaded Document is the ONLY Source of Truth

export const INITIAL_USER_PROFILE = {
  name: "New Patient",
  email: "",
  phone: "",
  birthDate: "",
  age: "",
  gender: "Female",
  bloodGroup: "O+",
  height: "",
  weight: "",
  primaryPhysician: "",
  emergencyPhone: "108",
  chronicConditions: [],
  allergies: [],
  avatar: ""
};

export const MOCK_REPORTS = [];

export const MOCK_BIOMARKER_HISTORIES = {};

export const MOCK_MEDICINES = [];

export const MOCK_HOSPITALS = [];

export const MOCK_EMERGENCY_CONTACTS = [
  {
    id: "c-2",
    name: "National Emergency Ambulance (108)",
    relation: "Govt 108 Emergency Helpline",
    phone: "108",
    email: "sos@108ambulance.in",
    isPrimary: true,
    notifyOnSOS: true
  }
];

export const MOCK_SOS_LOGS = [];
