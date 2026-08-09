/**
 * OCR & LLM Structuring Service
 * Simulates optical character recognition & biomarker extraction
 */

exports.processReportFile = async (fileObj) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        labName: "Apex Clinical Laboratories",
        doctorName: "Dr. Aris Thorne",
        date: new Date().toISOString().split('T')[0],
        ocrConfidence: "98.9%",
        status: "Attention Needed",
        statusType: "warning",
        score: 84,
        biomarkers: [
          { name: "Hemoglobin", value: 11.2, unit: "g/dL", refRange: "12.0 - 15.5", status: "Low", statusType: "warning", trend: "down", category: "Hematology" },
          { name: "Total Cholesterol", value: 224, unit: "mg/dL", refRange: "< 200", status: "High", statusType: "warning", trend: "up", category: "Lipids" },
          { name: "HbA1c", value: 5.8, unit: "%", refRange: "< 5.7", status: "Stable", statusType: "normal", trend: "stable", category: "Metabolic" },
          { name: "WBC Count", value: 6.8, unit: "k/mcL", refRange: "4.5 - 11.0", status: "Normal", statusType: "normal", trend: "stable", category: "Hematology" }
        ],
        aiSummary: "AI report analysis complete. Total Cholesterol is measured at 224 mg/dL (High), while Hemoglobin is slightly low at 11.2 g/dL. Renal panel and white blood cells remain optimal.",
        keyFindings: [
          "Total Cholesterol measured at 224 mg/dL (Desirable: < 200 mg/dL).",
          "Hemoglobin measured at 11.2 g/dL (Reference: 12.0 - 15.5 g/dL).",
          "HbA1c Blood Sugar measured at 5.8% (Stable)."
        ],
        recommendations: {
          lifestyle: ["Increase soluble fiber intake (oats, legumes).", "Maintain 150 minutes of weekly aerobic exercise."],
          medical: ["Schedule follow-up consultation with Dr. Aris Thorne in 30 days."]
        }
      });
    }, 1200);
  });
};
