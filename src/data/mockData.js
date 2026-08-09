// Complete realistic dummy dataset for MedGuardian AI

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
    title: "Complete Blood Count (CBC) & Lipid Profile",
    labName: "Apex Clinical Laboratories",
    doctorName: "Dr. Aris Thorne",
    date: "2026-07-28",
    status: "Attention Needed",
    statusType: "warning",
    score: 84,
    fileSize: "2.4 MB",
    fileType: "PDF",
    ocrConfidence: "98.7%",
    aiSummary: "Your recent blood panel shows elevated total cholesterol and slightly low serum hemoglobin. Blood sugar levels (HbA1c) remain stable within prediabetic range. White blood cell count indicates normal immune system response without active infection.",
    keyFindings: [
      "Total Cholesterol is 224 mg/dL (Desirable: <200 mg/dL).",
      "Hemoglobin is 11.2 g/dL (Slightly below female reference range 12.0 - 15.5 g/dL).",
      "HbA1c level is 5.8% (Borderline prediabetes threshold).",
      "Liver and Kidney enzyme functions are optimal."
    ],
    recommendations: {
      lifestyle: [
        "Increase dietary soluble fiber (oats, flaxseeds, legumes) to assist LDL cholesterol clearance.",
        "Include iron-rich foods (spinach, lentils, red meat) paired with Vitamin C to support hemoglobin synthesis.",
        "Maintain 150 minutes of moderate aerobic exercise (brisk walking, swimming) per week."
      ],
      medical: [
        "Schedule a follow-up consultation with Dr. Aris Thorne in 4 weeks.",
        "Consider re-testing Lipid Panel in 60 days to evaluate dietary interventions.",
        "Continue daily Metformin 500mg as prescribed after breakfast."
      ],
      questionsForDoctor: [
        "Should I consider low-dose iron supplementation for mild anemia?",
        "Is statin therapy warranted for LDL levels, or can we attempt lifestyle modification for 60 days?"
      ]
    },
    biomarkers: [
      { id: "b1", name: "Hemoglobin", value: 11.2, unit: "g/dL", refRange: "12.0 - 15.5", status: "Low", statusType: "warning", trend: "down", category: "Hematology" },
      { id: "b2", name: "RBC Count", value: 4.1, unit: "million/mcL", refRange: "3.90 - 5.20", status: "Normal", statusType: "normal", trend: "stable", category: "Hematology" },
      { id: "b3", name: "WBC Count", value: 6.8, unit: "k/mcL", refRange: "4.5 - 11.0", status: "Normal", statusType: "normal", trend: "stable", category: "Hematology" },
      { id: "b4", name: "Platelet Count", value: 245, unit: "k/mcL", refRange: "150 - 450", status: "Normal", statusType: "normal", trend: "up", category: "Hematology" },
      { id: "b5", name: "Total Cholesterol", value: 224, unit: "mg/dL", refRange: "< 200", status: "High", statusType: "warning", trend: "up", category: "Lipids" },
      { id: "b6", name: "LDL Cholesterol", value: 142, unit: "mg/dL", refRange: "< 100", status: "High", statusType: "warning", trend: "up", category: "Lipids" },
      { id: "b7", name: "HDL Cholesterol", value: 58, unit: "mg/dL", refRange: "> 50", status: "Optimal", statusType: "normal", trend: "stable", category: "Lipids" },
      { id: "b8", name: "Triglycerides", value: 135, unit: "mg/dL", refRange: "< 150", status: "Normal", statusType: "normal", trend: "down", category: "Lipids" },
      { id: "b9", name: "HbA1c", value: 5.8, unit: "%", refRange: "< 5.7", status: "Borderline", statusType: "warning", trend: "down", category: "Metabolic" },
      { id: "b10", name: "Fasting Blood Sugar", value: 104, unit: "mg/dL", refRange: "70 - 99", status: "Elevated", statusType: "warning", trend: "stable", category: "Metabolic" }
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
    aiSummary: "Your thyroid gland function is fully balanced with TSH, Free T3, and Free T4 within ideal physiological boundaries. Electrolyte levels (Sodium, Potassium, Chloride) demonstrate excellent renal homeostasis.",
    keyFindings: [
      "TSH (Thyroid Stimulating Hormone) is 2.1 mIU/L (Normal: 0.4 - 4.0 mIU/L).",
      "Free T4 is 1.3 ng/dL (Normal: 0.8 - 1.8 ng/dL).",
      "Serum Potassium is 4.2 mEq/L (Normal: 3.5 - 5.0 mEq/L)."
    ],
    recommendations: {
      lifestyle: ["Maintain current balanced iodine and mineral intake.", "Stay well-hydrated with 2.5L water daily."],
      medical: ["Routine annual thyroid follow-up scheduled for May 2027."],
      questionsForDoctor: ["Are any seasonal electrolyte adjustments needed during summer?"]
    },
    biomarkers: [
      { id: "b11", name: "TSH", value: 2.1, unit: "mIU/L", refRange: "0.4 - 4.0", status: "Normal", statusType: "normal", trend: "stable", category: "Endocrine" },
      { id: "b12", name: "Free T3", value: 3.1, unit: "pg/mL", refRange: "2.3 - 4.2", status: "Normal", statusType: "normal", trend: "stable", category: "Endocrine" },
      { id: "b13", name: "Free T4", value: 1.3, unit: "ng/dL", refRange: "0.8 - 1.8", status: "Normal", statusType: "normal", trend: "stable", category: "Endocrine" },
      { id: "b14", name: "Serum Creatinine", value: 0.85, unit: "mg/dL", refRange: "0.59 - 1.04", status: "Normal", statusType: "normal", trend: "stable", category: "Renal" },
      { id: "b15", name: "BUN (Blood Urea Nitrogen)", value: 14, unit: "mg/dL", refRange: "7 - 20", status: "Normal", statusType: "normal", trend: "stable", category: "Renal" }
    ]
  },
  {
    id: "rep-2026-003",
    title: "Urgent Cardiac & Cardiac Marker Panel",
    labName: "St. Jude Emergency Care Lab",
    doctorName: "Dr. Marcus Vance",
    date: "2026-02-10",
    status: "Critical Flag Resolved",
    statusType: "normal",
    score: 88,
    fileSize: "3.1 MB",
    fileType: "PNG",
    ocrConfidence: "96.4%",
    aiSummary: "Cardiac biomarker assessment shows negative Troponin-I and normal High-Sensitivity CRP. Previous transient chest tightness was ruled out for acute myocardial injury.",
    keyFindings: [
      "Troponin-I < 0.01 ng/mL (Negative for acute myocardial injury).",
      "hs-CRP is 1.4 mg/L (Low cardiovascular risk threshold)."
    ],
    recommendations: {
      lifestyle: ["Avoid stress triggers.", "Maintain moderate physical activity."],
      medical: ["Keep Emergency SOS active on mobile device for immediate dispatch if chest symptoms recur."],
      questionsForDoctor: ["Would a stress ECG be beneficial as a preventive baseline?"]
    },
    biomarkers: [
      { id: "b16", name: "Troponin-I", value: 0.01, unit: "ng/mL", refRange: "< 0.04", status: "Normal", statusType: "normal", trend: "stable", category: "Cardiac" },
      { id: "b17", name: "hs-CRP", value: 1.4, unit: "mg/L", refRange: "< 3.0", status: "Normal", statusType: "normal", trend: "down", category: "Cardiac" }
    ]
  }
];

export const MOCK_BIOMARKER_HISTORIES = {
  "Glucose": [
    { date: "Jan 2026", value: 118, targetMax: 100 },
    { date: "Feb 2026", value: 112, targetMax: 100 },
    { date: "Mar 2026", value: 110, targetMax: 100 },
    { date: "Apr 2026", value: 108, targetMax: 100 },
    { date: "May 2026", value: 106, targetMax: 100 },
    { date: "Jun 2026", value: 105, targetMax: 100 },
    { date: "Jul 2026", value: 104, targetMax: 100 }
  ],
  "Hemoglobin": [
    { date: "Jan 2026", value: 10.8, targetMin: 12.0, targetMax: 15.5 },
    { date: "Feb 2026", value: 10.9, targetMin: 12.0, targetMax: 15.5 },
    { date: "Mar 2026", value: 11.0, targetMin: 12.0, targetMax: 15.5 },
    { date: "Apr 2026", value: 11.1, targetMin: 12.0, targetMax: 15.5 },
    { date: "May 2026", value: 11.0, targetMin: 12.0, targetMax: 15.5 },
    { date: "Jun 2026", value: 11.3, targetMin: 12.0, targetMax: 15.5 },
    { date: "Jul 2026", value: 11.2, targetMin: 12.0, targetMax: 15.5 }
  ],
  "Cholesterol": [
    { date: "Jan 2026", value: 240, targetMax: 200 },
    { date: "Feb 2026", value: 236, targetMax: 200 },
    { date: "Mar 2026", value: 232, targetMax: 200 },
    { date: "Apr 2026", value: 228, targetMax: 200 },
    { date: "May 2026", value: 225, targetMax: 200 },
    { date: "Jun 2026", value: 226, targetMax: 200 },
    { date: "Jul 2026", value: 224, targetMax: 200 }
  ],
  "HbA1c": [
    { date: "Jan 2026", value: 6.2, targetMax: 5.7 },
    { date: "Feb 2026", value: 6.1, targetMax: 5.7 },
    { date: "Mar 2026", value: 6.0, targetMax: 5.7 },
    { date: "Apr 2026", value: 5.9, targetMax: 5.7 },
    { date: "May 2026", value: 5.9, targetMax: 5.7 },
    { date: "Jun 2026", value: 5.8, targetMax: 5.7 },
    { date: "Jul 2026", value: 5.8, targetMax: 5.7 }
  ]
};

export const MOCK_MEDICINES = [
  {
    id: "med-1",
    name: "Metformin Hydrochloride",
    dosage: "500 mg",
    form: "Tablet",
    frequency: "Once Daily",
    timeSlot: "Morning",
    time: "08:00 AM",
    purpose: "Blood Sugar Balance",
    taken: true,
    pillsRemaining: 18,
    totalPills: 30,
    color: "emerald",
    instructions: "Take with meals & full glass of water"
  },
  {
    id: "med-2",
    name: "Atorvastatin Calcium",
    dosage: "10 mg",
    form: "Tablet",
    frequency: "Once Daily",
    timeSlot: "Night",
    time: "09:30 PM",
    purpose: "Cholesterol Control",
    taken: false,
    pillsRemaining: 4,
    totalPills: 30,
    color: "cyan",
    instructions: "Take before sleeping"
  },
  {
    id: "med-3",
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
  },
  {
    id: "med-4",
    name: "Ferrous Ascorbate (Iron)",
    dosage: "100 mg",
    form: "Caplet",
    frequency: "Once Daily",
    timeSlot: "Afternoon",
    time: "01:30 PM",
    purpose: "Hemoglobin Boost",
    taken: false,
    pillsRemaining: 22,
    totalPills: 30,
    color: "rose",
    instructions: "Do not consume with tea/coffee or milk"
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
    specialties: ["Internal Medicine", "Cardiology", "Pathology", "Pediatrics"],
    lat: 28.6210,
    lng: 77.2180,
    ayushmanBharat: true
  },
  {
    id: "hosp-3",
    name: "Community Health Centre (CHC) & Primary Clinic",
    type: "Government CHC (Free Essential Meds)",
    distanceKm: 4.5,
    etaMins: 12,
    rating: 4.5,
    reviewsCount: 190,
    address: "Tehsil Block Compound, Highway Junction",
    phone: "102 / 0522-2289100",
    emergencyOpen: true,
    icuAvailable: 2,
    specialties: ["General Physician", "Maternal Health", "Vaccination", "Basic Diagnostics"],
    lat: 28.6080,
    lng: 77.1950,
    ayushmanBharat: true
  },
  {
    id: "hosp-4",
    name: "Dr. Lal PathLabs & Apollo Diagnostics Centre",
    type: "NABL Accredited Pathology Lab",
    distanceKm: 0.8,
    etaMins: 3,
    rating: 4.9,
    reviewsCount: 540,
    address: "Civil Lines, Opposite Head Post Office",
    phone: "+91 1800 266 7000",
    emergencyOpen: false,
    icuAvailable: 0,
    specialties: ["Blood Tests (CBC)", "Thyroid Profile", "HbA1c Sugar", "Lipid Panel"],
    lat: 28.6190,
    lng: 77.2050,
    ayushmanBharat: false
  }
];

export const MOCK_EMERGENCY_CONTACTS = [
  {
    id: "c-1",
    name: "Dr. Rajesh Kumar",
    relation: "Primary Physician (Civil Hospital)",
    phone: "+91 98765 43210",
    email: "dr.rajesh@civilhospital.in",
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
  },
  {
    id: "c-3",
    name: "Ramesh Tiwari",
    relation: "Family Contact / Caregiver",
    phone: "+91 98123 45678",
    email: "ramesh.tiwari@example.com",
    isPrimary: false,
    notifyOnSOS: true
  }
];

export const MOCK_SOS_LOGS = [
  {
    id: "sos-log-101",
    timestamp: "2026-07-15 14:22:04",
    triggerType: "Manual SOS Button",
    location: "28.6139° N, 77.2090° E (742 Evergreen Terrace)",
    status: "Resolved",
    dispatchedTo: ["Dr. Aris Thorne", "Mark Vance", "St. Jude Emergency Dispatch"],
    responseDelaySec: 1.8,
    notes: "Patient reported acute dizziness. Emergency contacts confirmed receipt. Paramedics dispatched."
  },
  {
    id: "sos-log-102",
    timestamp: "2026-05-02 09:15:30",
    triggerType: "Test Alert (System Audit)",
    location: "28.6139° N, 77.2090° E",
    status: "Completed",
    dispatchedTo: ["Mark Vance"],
    responseDelaySec: 0.9,
    notes: "Routine quarterly SOS system test. Email and SMS notification delivery verified."
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: "n-1",
    title: "Report AI Structuring Ready",
    message: "Your Complete Blood Count (CBC) analysis has been processed by MedGuardian AI.",
    time: "10 mins ago",
    unread: true,
    type: "report",
    link: "/app/analysis"
  },
  {
    id: "n-2",
    title: "Medication Dose Due",
    message: "Ferrous Ascorbate 100 mg is scheduled for 01:30 PM.",
    time: "45 mins ago",
    unread: true,
    type: "medicine",
    link: "/app/medicines"
  },
  {
    id: "n-3",
    title: "Refill Alert: Atorvastatin",
    message: "Only 4 tablets left for Atorvastatin 10 mg. Re-order recommended.",
    time: "2 hours ago",
    unread: false,
    type: "warning",
    link: "/app/medicines"
  },
  {
    id: "n-4",
    title: "Biomarker Improvement",
    message: "Your HbA1c has trended down from 6.2% to 5.8% over the last 6 months!",
    time: "1 day ago",
    unread: false,
    type: "success",
    link: "/app/timeline"
  }
];
