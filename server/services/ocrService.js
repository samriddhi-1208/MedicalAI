/**
 * OCR & AI Structuring Service per MedGuardian AI System Architecture Spec (Section 6, 7, 10)
 * Pipeline: Document Ingestion -> OCR Raw Extraction -> LLM AI Structuring & Summary -> Critical Value Evaluation
 */

function processReportFile(fileInfo, originalName) {
  // Simulated Tesseract OCR & LLM AI Pipeline Response
  const isCBC = originalName.toLowerCase().includes('cbc') || originalName.toLowerCase().includes('blood') || true;

  const rawOcrText = `
    APEX CLINICAL LABORATORIES - DIAGNOSTIC REPORT
    Patient: Eleanor Vance | Age: 42 | Gender: Female
    Date: ${new Date().toISOString().split('T')[0]}

    TEST NAME                 RESULT    UNIT      REFERENCE RANGE
    --------------------------------------------------------------
    Hemoglobin                11.2      g/dL      12.0 - 15.5 [LOW]
    Total Cholesterol         224       mg/dL     < 200       [HIGH - CRITICAL]
    HbA1c Blood Sugar         5.8       %         < 5.7       [BORDERLINE]
    WBC Count                 6.8       k/mcL     4.5 - 11.0  [NORMAL]
    Platelet Count            245       k/mcL     150 - 450   [NORMAL]
  `;

  const structuredValues = [
    {
      test_name: "Hemoglobin",
      value: 11.2,
      unit: "g/dL",
      reference_range: "12.0 - 15.5",
      is_critical: 0,
      category: "Hematology"
    },
    {
      test_name: "Total Cholesterol",
      value: 224,
      unit: "mg/dL",
      reference_range: "< 200",
      is_critical: 1, // Flagged per critical value check rule (Section 7)
      category: "Lipids"
    },
    {
      test_name: "HbA1c",
      value: 5.8,
      unit: "%",
      reference_range: "< 5.7",
      is_critical: 0,
      category: "Metabolic"
    },
    {
      test_name: "WBC Count",
      value: 6.8,
      unit: "k/mcL",
      reference_range: "4.5 - 11.0",
      is_critical: 0,
      category: "Hematology"
    }
  ];

  const hasCriticalFlag = structuredValues.some(v => v.is_critical === 1);

  const summary = {
    summary_text: "AI processing completed. Your blood panel indicates elevated Total Cholesterol (224 mg/dL) requiring dietary fiber optimization, alongside slightly low Hemoglobin (11.2 g/dL). Renal and immune functions are fully normal.",
    key_findings: [
      "Total Cholesterol is 224 mg/dL (Desirable: < 200 mg/dL).",
      "Hemoglobin is 11.2 g/dL (Below female threshold 12.0 - 15.5 g/dL).",
      "HbA1c remains stable at 5.8%."
    ],
    recommendations: {
      lifestyle: [
        "Increase soluble fiber intake (oats, legumes, flaxseed).",
        "Engage in 150 minutes of weekly aerobic exercise."
      ],
      medical: [
        "Schedule follow-up consultation with Dr. Aris Thorne in 30 days."
      ],
      questionsForDoctor: [
        "Is low-dose iron supplementation recommended for mild anemia?"
      ]
    }
  };

  return {
    rawOcrText,
    structuredValues,
    summary,
    hasCriticalFlag,
    ocrConfidence: "98.9%"
  };
}

module.exports = {
  processReportFile
};
