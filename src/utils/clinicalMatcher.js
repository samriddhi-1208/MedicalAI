/**
 * AI Clinical Matcher Engine
 * Dynamically pairs patient lab report diagnostics with the relevant specialist doctor and specialized hospital.
 */

export function getMatchedMedicalCare(reports) {
  try {
    const latestReport = Array.isArray(reports) && reports.length > 0 ? reports[0] : null;
    const reportTitle = String(latestReport?.title || '').toLowerCase();
    const biomarkers = Array.isArray(latestReport?.biomarkers) ? latestReport.biomarkers : [];

    const hasCardiac = reportTitle.includes('cardiac') || reportTitle.includes('heart') || biomarkers.some(b => {
      const bName = String(b?.name || '').toLowerCase();
      return b?.category === 'Cardiac' || bName.includes('troponin') || bName.includes('crp');
    });

    const hasEndocrine = reportTitle.includes('thyroid') || reportTitle.includes('tsh') || biomarkers.some(b => {
      const bName = String(b?.name || '').toLowerCase();
      return b?.category === 'Endocrine' || bName.includes('tsh') || bName.includes('t4');
    });

    const hasRenal = reportTitle.includes('kidney') || reportTitle.includes('renal') || reportTitle.includes('kft') || biomarkers.some(b => {
      const bName = String(b?.name || '').toLowerCase();
      return b?.category === 'Renal' || bName.includes('creatinine') || bName.includes('bun');
    });

    const hasMetabolic = reportTitle.includes('sugar') || reportTitle.includes('diabetes') || reportTitle.includes('hba1c') || biomarkers.some(b => {
      const bName = String(b?.name || '').toLowerCase();
      return b?.category === 'Metabolic' || bName.includes('hba1c') || bName.includes('glucose');
    });

    if (hasCardiac) {
      return {
        condition: "Cardiac & Cardiovascular Health",
        hospitalName: "St. Jude Heart & Emergency Trauma Institute",
        doctorName: "Dr. Marcus Vance, MD",
        doctorRole: "Consulting Cardiologist & Cardiac ICU Head",
        phone: "+91 98765 11223",
        email: "dr.vance@stjudeheart.org",
        specialty: "24/7 Cardiac Emergency & Cath Lab",
        address: "Civic Expressway, Sector 9 (0.8 km)"
      };
    }

    if (hasEndocrine) {
      return {
        condition: "Thyroid & Endocrine Health",
        hospitalName: "MetroDiagnostics Thyroid & Hormone Specialty Clinic",
        doctorName: "Dr. Elena Rostova, MD",
        doctorRole: "Endocrinology Specialist",
        phone: "+91 98123 77889",
        email: "dr.elena@metrothyroid.org",
        specialty: "Thyroid & Metabolic Hormone Health",
        address: "Civil Lines Diagnostic Hub (1.1 km)"
      };
    }

    if (hasRenal) {
      return {
        condition: "Renal & Kidney Function Health",
        hospitalName: "Max Nephrology & Dialysis Super-Specialty Centre",
        doctorName: "Dr. Kavita Nambiar, MD",
        doctorRole: "Head of Nephrology & Dialysis",
        phone: "+91 98334 55667",
        email: "dr.nambiar@maxnephro.org",
        specialty: "Renal ICU & Hemodialysis",
        address: "Ring Road Medical Complex (2.4 km)"
      };
    }

    if (hasMetabolic) {
      return {
        condition: "Diabetic & Glycemic Health",
        hospitalName: "Apollo Sugar & Endocrine Hospital",
        doctorName: "Dr. Sameer Verma, MD",
        doctorRole: "Consulting Diabetologist & Endocrinologist",
        phone: "+91 98555 44332",
        email: "dr.verma@apollosugar.org",
        specialty: "Glycemic Control & Diabetic ICU",
        address: "Central Market Road (1.5 km)"
      };
    }
  } catch (err) {
    console.error("Clinical matcher safe fallback", err);
  }

  // Default General Medical Care
  return {
    condition: "General Internal Medicine",
    hospitalName: "District Civil Hospital & Trauma Centre (PM-JAY)",
    doctorName: "Dr. Rajesh Kumar, MD",
    doctorRole: "Primary Physician & Clinical Head",
    phone: "+91 98765 43210",
    email: "dr.rajesh@civilhospital.in",
    specialty: "Trauma ICU & General Medicine",
    address: "Station Road, Near Bus Stand (1.2 km)"
  };
}
