// Realistic dataset for MedicalAI Patient Portal

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
    labName: "Diagnostic Pathology & Clinical Laboratories",
    doctorName: "Consulting Care Physician",
    date: "2026-08-11",
    status: "Attention Needed",
    statusType: "warning",
    score: 92,
    fileSize: "5.8 MB",
    fileType: "PDF",
    ocrConfidence: "99.4%",
    aiSummary: "Your Complete Blood Count (CBC) report shows Haemoglobin at 13.8 g/dL (Normal) and Total WBC Count at 8740 /uL (Normal). RDW CV is 15.1% (High), Neutrophils are 74.8% (High), and Lymphocytes are 18.4% (Low).",
    keyFindings: [
      "Haemoglobin (Hb) is 13.8 g/dL (Normal reference range: 12.0 - 15.0 g/dL).",
      "Total WBC Count is optimal at 8740 /uL (Reference: 4000 - 10000 /uL).",
      "RDW CV is 15.1% (High, reference: 11.5 - 14.0%).",
      "Neutrophils are elevated at 74.8% (Reference: 50 - 62%).",
      "Lymphocytes are 18.4% (Low, reference: 20 - 40%)."
    ],
    recommendations: {
      lifestyle: [
        "Maintain proper daily hydration (2.5 Liters of water).",
        "Ensure adequate rest and balanced antioxidant-rich nutrition."
      ],
      medical: [
        "Schedule a routine follow-up consultation with your care physician regarding elevated Neutrophils and RDW CV."
      ],
      questionsForDoctor: [
        "Are the elevated Neutrophils (74.8%) suggestive of recent mild physical stress or reactive inflammation?"
      ]
    },
    biomarkers: [
      { id: "b1", name: "Haemoglobin (Hb)", value: 13.8, unit: "g/dL", refRange: "12.0 - 15.0", status: "Normal", statusType: "normal", category: "Hematology", notes: "Optimal hemoglobin level." },
      { id: "b2", name: "RBC Count", value: 4.92, unit: "million/uL", refRange: "4.5 - 5.5", status: "Normal", statusType: "normal", category: "Hematology", notes: "Optimal red blood cell count." },
      { id: "b3", name: "Hematocrit (HCT)", value: 43.2, unit: "%", refRange: "40.0 - 54.0", status: "Normal", statusType: "normal", category: "Hematology", notes: "Normal packed cell volume." },
      { id: "b4", name: "MCV", value: 87.9, unit: "fL", refRange: "83.0 - 101.0", status: "Normal", statusType: "normal", category: "Hematology", notes: "Normal mean corpuscular volume." },
      { id: "b5", name: "MCH", value: 28.1, unit: "pg", refRange: "27.0 - 32.0", status: "Normal", statusType: "normal", category: "Hematology", notes: "Normal corpuscular hemoglobin." },
      { id: "b6", name: "MCHC", value: 31.9, unit: "g/dL", refRange: "31.5 - 34.5", status: "Normal", statusType: "normal", category: "Hematology", notes: "Normal corpuscular hemoglobin concentration." },
      { id: "b7", name: "RDW CV", value: 15.1, unit: "%", refRange: "11.5 - 14.0", status: "High", statusType: "warning", category: "Hematology", notes: "Elevated red cell distribution width." },
      { id: "b8", name: "Total WBC Count", value: 8740, unit: "/uL", refRange: "4000 - 10000", status: "Normal", statusType: "normal", category: "Hematology", notes: "Normal total white blood cell count." },
      { id: "b9", name: "Neutrophils", value: 74.8, unit: "%", refRange: "50 - 62", status: "High", statusType: "warning", category: "Hematology", notes: "Slightly elevated neutrophil percentage." },
      { id: "b10", name: "Lymphocytes", value: 18.4, unit: "%", refRange: "20 - 40", status: "Low", statusType: "warning", category: "Hematology", notes: "Slightly low lymphocyte percentage." }
    ]
  }
];

export const MOCK_BIOMARKER_HISTORIES = {
  "Haemoglobin (Hb)": [
    { date: "May 2026", value: 13.2, targetMin: 12.0, targetMax: 15.0 },
    { date: "Jun 2026", value: 13.5, targetMin: 12.0, targetMax: 15.0 },
    { date: "Jul 2026", value: 13.6, targetMin: 12.0, targetMax: 15.0 },
    { date: "Aug 2026", value: 13.8, targetMin: 12.0, targetMax: 15.0 }
  ],
  "Total WBC Count": [
    { date: "May 2026", value: 8100, targetMin: 4000, targetMax: 10000 },
    { date: "Jun 2026", value: 8300, targetMin: 4000, targetMax: 10000 },
    { date: "Jul 2026", value: 8500, targetMin: 4000, targetMax: 10000 },
    { date: "Aug 2026", value: 8740, targetMin: 4000, targetMax: 10000 }
  ]
};

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

export const MOCK_NOTIFICATIONS = [
  {
    id: "n-1",
    title: "CBC Report Parsed Successfully",
    message: "Your Complete Blood Count (CBC) report has been structured with 100% accuracy.",
    time: "Just now",
    unread: true,
    type: "report",
    link: "/app/analysis"
  }
];
