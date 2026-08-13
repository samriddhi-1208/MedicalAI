/**
 * MedGuardian AI — Report Service Architecture
 * Handles report file uploads, OCR processing states, and AI findings.
 */

export const reportService = {
  getRecentReports: () => {
    return [
      {
        id: "rep-2023-001",
        title: "Comprehensive Metabolic Panel",
        labName: "Quest Diagnostics & Pathology",
        doctorName: "Dr. Emily Chen",
        date: "Oct 24, 2023",
        status: "Normal",
        statusType: "normal",
        fileType: "PDF",
        fileSize: "4.2 MB"
      },
      {
        id: "rep-2023-002",
        title: "Chest X-Ray & Imaging Report",
        labName: "City Hospital Radiometry",
        doctorName: "City Hospital Radiologist",
        date: "Oct 12, 2023",
        status: "Normal",
        statusType: "normal",
        fileType: "PDF",
        fileSize: "12.5 MB"
      }
    ];
  },

  getReportAnalysis: (reportId) => {
    return {
      reportInfo: {
        patientName: "Sarah Jenkins",
        reportType: "Complete Blood Count (CBC) & Metabolic Panel",
        date: "Oct 24, 2023",
        hospital: "City Hospital Diagnostics",
        source: "Digital Lab Upload"
      },
      aiSummary: "Your lab results are mostly within healthy normal ranges. A few biomarkers (Cholesterol LDL and RDW CV) require routine monitoring with your physician.",
      findings: [
        {
          name: "Cholesterol (LDL)",
          value: "135 mg/dL",
          refRange: "< 100 mg/dL",
          status: "Slightly Elevated",
          statusType: "warning",
          statusSymbol: "▲",
          notes: "Consider reducing saturated fats and reviewing routine lipid management."
        },
        {
          name: "Hemoglobin (Hb)",
          value: "13.8 g/dL",
          refRange: "12.0 - 15.0 g/dL",
          status: "Normal",
          statusType: "normal",
          statusSymbol: "✓",
          notes: "Healthy oxygen-carrying capacity."
        },
        {
          name: "Glucose (Fasting)",
          value: "95 mg/dL",
          refRange: "70 - 99 mg/dL",
          status: "Normal",
          statusType: "normal",
          statusSymbol: "✓",
          notes: "Optimal glycemic baseline."
        }
      ],
      disclaimer: "AI-generated information is for informational purposes only and should not replace professional medical advice."
    };
  }
};
