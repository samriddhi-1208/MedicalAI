// Complete realistic dataset for MedicalAI

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

export const MOCK_REPORTS = [
  {
    id: "rep-2026-001",
    title: "Complete Blood Count (CBC) Report",
    labName: "Apex Clinical Laboratories",
    doctorName: "Dr. Aris Thorne, MD",
    date: "2026-07-28",
    status: "Attention Needed",
    statusType: "warning",
    score: 86,
    fileSize: "2.4 MB",
    fileType: "PDF",
    ocrConfidence: "99.1%",
    aiSummary: "Your recent Complete Blood Count (CBC) report shows Hemoglobin at 11.4 g/dL (Slightly Low) and Total Leucocyte Count (WBC) at 6000 cell/cu.mm (Normal). Red cell indices (MCV 66.9 fL, MCH 22.0 pg) demonstrate mild microcytic features.",
    keyFindings: [
      "Hemoglobin is 11.4 g/dL (Reference female range: 12.0 - 15.5 g/dL).",
      "Total Leucocyte Count (WBC) is optimal at 6000 cell/cu.mm.",
      "RBC Count is 5.19 mill/cu.mm (Normal).",
      "MCV (66.9 fL) and MCH (22.0 pg) show mild microcytic hypochromic features."
    ],
    recommendations: {
      lifestyle: [
        "Include iron-rich foods (spinach, lentils, beetroot) paired with Vitamin C to support hemoglobin synthesis.",
        "Maintain 2.5 Liters of daily fluid hydration."
      ],
      medical: [
        "Schedule a follow-up consultation with Dr. Aris Thorne in 4 weeks.",
        "Consider serum ferritin & iron profile evaluation."
      ],
      questionsForDoctor: [
        "Would mild dietary iron supplementation be beneficial for my microcytic RBC indices?"
      ]
    },
    biomarkers: [
      { id: "b1", name: "Hemoglobin (Hb)", value: 11.4, unit: "g/dL", refRange: "12.0 - 15.5", status: "Slightly Low", statusType: "warning", trend: "down", category: "Hematology", notes: "Mild microcytic tendency." },
      { id: "b3", name: "WBC (Total Leucocyte)", value: 6000, unit: "cell/cu.mm", refRange: "4000 - 11000", status: "Normal", statusType: "normal", trend: "stable", category: "Hematology", notes: "Normal immune response." },
      { id: "b2", name: "RBC Count", value: 5.19, unit: "mill/cu.mm", refRange: "3.80 - 5.20", status: "Normal", statusType: "normal", trend: "stable", category: "Hematology", notes: "Optimal RBC count." },
      { id: "b4", name: "HCT / PCV", value: 34.7, unit: "%", refRange: "36.0 - 46.0", status: "Borderline Low", statusType: "warning", trend: "down", category: "Hematology", notes: "Packed cell volume." },
      { id: "b5", name: "MCV", value: 66.9, unit: "fL", refRange: "80.0 - 100.0", status: "Low", statusType: "warning", trend: "down", category: "Hematology", notes: "Microcytic red cell index." },
      { id: "b6", name: "MCH", value: 22.0, unit: "pg", refRange: "27.0 - 32.0", status: "Low", statusType: "warning", trend: "down", category: "Hematology", notes: "Hypochromic cell index." },
      { id: "b7", name: "Platelet Count", value: 2.85, unit: "lakh/cu.mm", refRange: "1.50 - 4.50", status: "Normal", statusType: "normal", trend: "stable", category: "Hematology", notes: "Normal blood clotting platelets." }
    ]
  },
  {
    id: "rep-2026-002",
    title: "Thyroid Function Panel & Metabolic Assessment",
    labName: "MetroDiagnostics Center",
    doctorName: "Dr. Elena Rostova",
    date: "2026-05-12",
    status: "Optimal",
    statusType: "normal",
    score: 95,
    fileSize: "1.8 MB",
    fileType: "PDF",
    ocrConfidence: "99.2%",
    aiSummary: "Your thyroid gland function is fully balanced with TSH, Free T3, and Free T4 within ideal physiological boundaries. Electrolyte levels demonstrate excellent renal homeostasis.",
    keyFindings: [
      "TSH (Thyroid Stimulating Hormone) is 2.1 mIU/L (Normal: 0.4 - 4.0 mIU/L).",
      "Free T4 is 1.3 ng/dL (Normal: 0.8 - 1.8 ng/dL)."
    ],
    recommendations: {
      lifestyle: ["Maintain current balanced iodine and mineral intake.", "Stay well-hydrated."],
      medical: ["Routine annual thyroid follow-up scheduled for May 2027."],
      questionsForDoctor: ["Are any seasonal electrolyte adjustments needed?"]
    },
    biomarkers: [
      { id: "b11", name: "TSH", value: 2.1, unit: "mIU/L", refRange: "0.4 - 4.0", status: "Normal", statusType: "normal", trend: "stable", category: "Endocrine" },
      { id: "b12", name: "Free T3", value: 3.1, unit: "pg/mL", refRange: "2.3 - 4.2", status: "Normal", statusType: "normal", trend: "stable", category: "Endocrine" },
      { id: "b13", name: "Free T4", value: 1.3, unit: "ng/dL", refRange: "0.8 - 1.8", status: "Normal", statusType: "normal", trend: "stable", category: "Endocrine" }
    ]
  }
];

export const MOCK_BIOMARKER_HISTORIES = {
  "Hemoglobin": [
    { date: "Jan 2026", value: 10.8, targetMin: 12.0, targetMax: 15.5 },
    { date: "Feb 2026", value: 10.9, targetMin: 12.0, targetMax: 15.5 },
    { date: "Mar 2026", value: 11.0, targetMin: 12.0, targetMax: 15.5 },
    { date: "Apr 2026", value: 11.1, targetMin: 12.0, targetMax: 15.5 },
    { date: "May 2026", value: 11.2, targetMin: 12.0, targetMax: 15.5 },
    { date: "Jun 2026", value: 11.3, targetMin: 12.0, targetMax: 15.5 },
    { date: "Jul 2026", value: 11.4, targetMin: 12.0, targetMax: 15.5 }
  ],
  "WBC Count": [
    { date: "Jan 2026", value: 6500, targetMin: 4000, targetMax: 11000 },
    { date: "Feb 2026", value: 6400, targetMin: 4000, targetMax: 11000 },
    { date: "Mar 2026", value: 6200, targetMin: 4000, targetMax: 11000 },
    { date: "Apr 2026", value: 6100, targetMin: 4000, targetMax: 11000 },
    { date: "May 2026", value: 6000, targetMin: 4000, targetMax: 11000 },
    { date: "Jun 2026", value: 6000, targetMin: 4000, targetMax: 11000 },
    { date: "Jul 2026", value: 6000, targetMin: 4000, targetMax: 11000 }
  ]
};

export const MOCK_MEDICINES = [
  {
    id: "med-1",
    name: "Ferrous Ascorbate (Iron)",
    dosage: "100 mg",
    form: "Tablet",
    frequency: "Once Daily",
    timeSlot: "Morning",
    time: "08:00 AM",
    purpose: "Hemoglobin Support",
    taken: true,
    pillsRemaining: 18,
    totalPills: 30,
    color: "emerald",
    instructions: "Take with Vitamin C fruit juice post breakfast"
  },
  {
    id: "med-2",
    name: "Vitamin D3 (Cholecalciferol)",
    dosage: "2000 IU",
    form: "Softgel",
    frequency: "Once Daily",
    timeSlot: "Morning",
    time: "08:30 AM",
    purpose: "Bone & Immune Support",
    taken: true,
    pillsRemaining: 45,
    totalPills: 60,
    color: "amber",
    instructions: "Take after breakfast with healthy fats"
  }
];

export const MOCK_HOSPITALS = [
  {
    id: "hosp-1",
    name: "District Civil Hospital & Trauma Centre",
    type: "Government District Hospital (PM-JAY Empaneled)",
    distanceKm: 1.2,
    etaMins: 4,
    rating: 4.8,
    reviewsCount: 420,
    address: "Station Road, Near Bus Stand, District HQ",
    phone: "108 / 0522-2239001",
    emergencyOpen: true,
    icuAvailable: 14,
    specialties: ["General Medicine", "Trauma ICU", "Maternal Care (102)", "Emergency Surgery"],
    lat: 28.6145,
    lng: 77.2095,
    ayushmanBharat: true
  },
  {
    id: "hosp-2",
    name: "Sanjeevani Multispecialty Hospital & Diagnostic Centre",
    type: "Private Community Hospital (Cashless Insurance)",
    distanceKm: 2.8,
    etaMins: 8,
    rating: 4.7,
    reviewsCount: 318,
    address: "Main Market Road, Sector 4",
    phone: "+91 98765 43210",
    emergencyOpen: true,
    icuAvailable: 6,
    specialties: ["Internal Medicine", "Hematology", "Pathology", "Pediatrics"],
    lat: 28.6210,
    lng: 77.2180,
    ayushmanBharat: true
  }
];

export const MOCK_EMERGENCY_CONTACTS = [
  {
    id: "c-1",
    name: "Dr. Aris Thorne",
    relation: "Primary Physician (Civil Hospital)",
    phone: "+91 98765 43210",
    email: "dr.aris@civilhospital.in",
    isPrimary: true,
    notifyOnSOS: true
  },
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

export const MOCK_NOTIFICATIONS = [
  {
    id: "n-1",
    title: "CBC Report Parsed Successfully",
    message: "Your Complete Blood Count (CBC) report has been structured with 100% accuracy.",
    time: "10 mins ago",
    unread: true,
    type: "report",
    link: "/app/analysis"
  }
];
