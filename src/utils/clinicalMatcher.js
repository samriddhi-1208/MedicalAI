/**
 * AI Clinical Matcher Engine
 * Recommends medical specialties based on user report biomarkers without hardcoded fake doctor or hospital identities.
 */

export function getMatchedMedicalCare(reports) {
  try {
    const latestReport = Array.isArray(reports) && reports.length > 0 ? reports[0] : null;
    if (!latestReport) return null;

    const reportTitle = String(latestReport.title || '').toLowerCase();
    const biomarkers = Array.isArray(latestReport.biomarkers) ? latestReport.biomarkers : [];

    const hasCardiac = reportTitle.includes('cardiac') || reportTitle.includes('heart') || reportTitle.includes('lipid') || reportTitle.includes('cholesterol') || biomarkers.some(b => {
      const bName = String(b?.name || '').toLowerCase();
      return bName.includes('cholesterol') || bName.includes('triglyceride') || bName.includes('ldl') || bName.includes('troponin');
    });

    const hasDiabetic = reportTitle.includes('sugar') || reportTitle.includes('diabetes') || reportTitle.includes('hba1c') || biomarkers.some(b => {
      const bName = String(b?.name || '').toLowerCase();
      return bName.includes('hba1c') || bName.includes('glucose') || bName.includes('sugar');
    });

    if (hasCardiac) {
      return {
        condition: "Cardiovascular & Lipid Parameter Focus",
        recommendedCategory: "Cardiologist",
        advice: "Based on your extracted report values, consider consulting a General Physician or Cardiologist."
      };
    }

    if (hasDiabetic) {
      return {
        condition: "Glycemic & Metabolic Parameter Focus",
        recommendedCategory: "General Physician",
        advice: "Based on your extracted report values, consider consulting an Endocrinologist or General Physician."
      };
    }
  } catch (err) {
    console.error("Clinical matcher error", err);
  }

  return {
    condition: "General Clinical Overview",
    recommendedCategory: "General Physician",
    advice: "Based on your extracted report values, consider consulting a General Physician for routine clinical guidance."
  };
}
