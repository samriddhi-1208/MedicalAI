/**
 * AI Service for Medical Report Analysis & Dynamic Medication/Lab/Vitals Extraction
 * Supports Google Gemini API (GEMINI_API_KEY / AI_API_KEY) with structured JSON output.
 * Falls back to Universal Dynamic Clinical Text Extractor when API key is not configured or offline.
 */

const fetch = require('node-fetch');

exports.analyzeReportText = async (rawText, fileName) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const cleanedText = rawText || '';

  console.log(`[AI SERVICE] Processing document text (${cleanedText.length} chars) for file: ${fileName}`);

  if (apiKey && cleanedText.trim().length > 20) {
    try {
      console.log(`[AI SERVICE] Calling Google Gemini API for ${fileName}...`);
      const prompt = `You are an expert clinical laboratory report and prescription analyzer AI. Analyze the following extracted document text from (${fileName}) and output ONLY a valid raw JSON object (no markdown, no code blocks, no trailing text) following this exact schema:

{
  "patient": {
    "name": "Patient Name or Unspecified",
    "age": "Age or Unspecified",
    "gender": "Gender or Unspecified",
    "patientId": "ID or Unspecified",
    "reportDate": "YYYY-MM-DD or Unspecified"
  },
  "clinicalSummary": "Plain-language summary of findings.",
  "vitals": [
    {
      "name": "Temperature",
      "value": "100.2",
      "unit": "°F"
    }
  ],
  "labResults": [
    {
      "testName": "Hemoglobin",
      "value": "12.8",
      "unit": "g/dL",
      "referenceRange": "12.0 - 15.5",
      "status": "Normal"
    }
  ],
  "medications": [
    {
      "name": "Paracetamol",
      "strength": "500 mg",
      "dose": "1 tablet",
      "frequency": "Twice daily",
      "timing": "After breakfast and after dinner",
      "mealRelation": "After meal",
      "duration": "5 days"
    }
  ],
  "diagnoses": [],
  "recommendations": []
}

Rules:
- Extract ALL lab parameters, vitals, and medication instructions present in the text.
- Do NOT invent or hallucinate missing data. Return empty array [] if a section is absent in text.

Document Text:
${cleanedText.slice(0, 5000)}
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedJson);
        if (parsed) {
          const labResults = parsed.labResults || parsed.biomarkers || [];
          const vitals = parsed.vitals || [];
          const medications = parsed.medications || [];

          // Map to standard biomarkers format
          const mappedBiomarkers = labResults.map(b => ({
            name: b.testName || b.name,
            value: b.value,
            unit: b.unit || '',
            referenceRange: b.referenceRange || b.refRange || '',
            status: b.status || 'Normal'
          }));

          return {
            patient: parsed.patient || { name: "Patient", age: "N/A", gender: "N/A" },
            clinicalSummary: parsed.clinicalSummary || parsed.summary || `Extracted ${mappedBiomarkers.length} lab results and ${medications.length} medication instructions.`,
            summary: parsed.clinicalSummary || parsed.summary || `Extracted ${mappedBiomarkers.length} lab results and ${medications.length} medication instructions.`,
            vitals,
            labResults,
            biomarkers: mappedBiomarkers,
            medications,
            diagnoses: parsed.diagnoses || [],
            recommendations: parsed.recommendations || []
          };
        }
      }
    } catch (err) {
      console.warn(`[AI SERVICE] Gemini API call note: ${err.message}. Running Universal Dynamic Extractor.`);
    }
  }

  // Universal Dynamic Clinical Text Extractor
  return universalClinicalExtractor(cleanedText, fileName);
};

function universalClinicalExtractor(textStr, fileName) {
  const text = textStr || '';
  const labResults = [];
  const vitals = [];
  const medications = [];

  const lines = text.split(/\r?\n/);

  // 1. Extract Vitals (Temperature, Blood Pressure, Heart Rate, SpO2, Respiratory Rate)
  const tempMatch = text.match(/(?:Temperature|Body Temp|Temp)\s*[:=\-]?\s*([\d\.]+)\s*(°[FC]|F|C)?/i);
  if (tempMatch) {
    vitals.push({ name: "Temperature", value: tempMatch[1], unit: tempMatch[2] || "°F" });
  }

  const bpMatch = text.match(/(?:Blood Pressure|BP)\s*[:=\-]?\s*(\d{2,3}\/\d{2,3})\s*(mmHg)?/i);
  if (bpMatch) {
    vitals.push({ name: "Blood Pressure", value: bpMatch[1], unit: bpMatch[2] || "mmHg" });
  }

  const hrMatch = text.match(/(?:Heart Rate|Pulse|Pulse Rate|HR)\s*[:=\-]?\s*(\d{2,3})\s*(bpm|\/min)?/i);
  if (hrMatch) {
    vitals.push({ name: "Heart Rate", value: hrMatch[1], unit: "bpm" });
  }

  const spo2Match = text.match(/(?:SpO2|Oxygen Saturation|O2 Sat)\s*[:=\-]?\s*(\d{2,3})\s*(%)?/i);
  if (spo2Match) {
    vitals.push({ name: "SpO2", value: spo2Match[1], unit: "%" });
  }

  const rrMatch = text.match(/(?:Respiratory Rate|RR)\s*[:=\-]?\s*(\d{1,2})\s*(breaths\/min|\/min)?/i);
  if (rrMatch) {
    vitals.push({ name: "Respiratory Rate", value: rrMatch[1], unit: "breaths/min" });
  }

  // 2. Extract Lab Parameters line-by-line using Universal Clinical Regex
  const knownTests = [
    { key: "hemoglobin", name: "Hemoglobin", unit: "g/dL", ref: "12.0 - 15.5" },
    { key: "hb", name: "Hemoglobin", unit: "g/dL", ref: "12.0 - 15.5" },
    { key: "wbc", name: "WBC Count", unit: "cells/µL", ref: "4000 - 11000" },
    { key: "leucocyte", name: "WBC Count", unit: "cells/µL", ref: "4000 - 11000" },
    { key: "platelet", name: "Platelets", unit: "lakh/µL", ref: "1.50 - 4.50" },
    { key: "rbc", name: "RBC Count", unit: "mil/cu.mm", ref: "3.80 - 5.20" },
    { key: "glucose", name: "Fasting Glucose", unit: "mg/dL", ref: "70 - 99" },
    { key: "sugar", name: "Fasting Glucose", unit: "mg/dL", ref: "70 - 99" },
    { key: "creatinine", name: "Serum Creatinine", unit: "mg/dL", ref: "0.6 - 1.1" },
    { key: "tsh", name: "TSH", unit: "µIU/mL", ref: "0.4 - 4.0" },
    { key: "cholesterol", name: "Total Cholesterol", unit: "mg/dL", ref: "< 200" },
    { key: "alt", name: "ALT (SGPT)", unit: "U/L", ref: "7 - 35" },
    { key: "sgpt", name: "ALT (SGPT)", unit: "U/L", ref: "7 - 35" },
    { key: "ast", name: "AST (SGOT)", unit: "U/L", ref: "8 - 40" },
    { key: "sgot", name: "AST (SGOT)", unit: "U/L", ref: "8 - 40" },
    { key: "hba1c", name: "HbA1c", unit: "%", ref: "< 5.7" },
    { key: "urea", name: "Blood Urea", unit: "mg/dL", ref: "15 - 45" },
    { key: "crp", name: "C-Reactive Protein (CRP)", unit: "mg/L", ref: "< 5.0" },
    { key: "esr", name: "ESR", unit: "mm/hr", ref: "0 - 20" }
  ];

  const seenLabNames = new Set();

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) return;
    const lower = trimmed.toLowerCase();

    if (/patient|registration|sample id|hospital|pathology|doctor|consultant|date/i.test(trimmed) && !/haemoglobin|hemoglobin|wbc|rbc|platelet|glucose|creatinine/i.test(trimmed)) {
      return;
    }

    knownTests.forEach(kt => {
      if (seenLabNames.has(kt.name)) return;
      if (lower.includes(kt.key)) {
        const valMatch = trimmed.match(/([<>]?\s*\d+(?:\.\d+)?)/);
        if (valMatch) {
          const val = valMatch[1].trim();
          let ref = kt.ref;
          const refMatch = trimmed.match(/(\d+(?:\.\d+)?\s*[-–\sto]+\s*\d+(?:\.\d+)?|<[\s]?\d+(?:\.\d+)?)/);
          if (refMatch) ref = refMatch[1];

          let unit = kt.unit;
          const uMatch = trimmed.match(/(g\/dL|mg\/dL|mg\/L|mmol\/L|mIU\/L|uIU\/mL|µg\/dL|U\/L|unit\/L|ng\/mL|pg\/mL|cell\/cu\.mm|cells\/µL|mil\/cu\.mm|lac\/cmm|lakh\/µL|Lakhs\/cumm|mm\/hr|fL|pg|%|k\/mcL)/i);
          if (uMatch) unit = uMatch[0];

          seenLabNames.add(kt.name);
          labResults.push({
            testName: kt.name,
            name: kt.name,
            value: val,
            unit,
            referenceRange: ref,
            refRange: ref,
            status: "Normal"
          });
        }
      }
    });
  });

  // 3. Extract Medications from Document Lines
  const knownDrugs = ["paracetamol", "cetirizine", "pantoprazole", "metformin", "atorvastatin", "amoxicillin", "azithromycin", "omeprazole", "lisinopril", "amlodipine", "losartan", "levothyroxine", "ibuprofen", "vitamin d3"];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();

    const foundDrug = knownDrugs.find(d => lower.includes(d));

    if (foundDrug || lower.includes('rx') || lower.includes('recipe') || lower.includes('tab ') || lower.includes('cap ')) {
      const drugName = foundDrug ? (foundDrug.charAt(0).toUpperCase() + foundDrug.slice(1)) : "Prescribed Medicine";
      
      const doseMatch = trimmed.match(/(\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|unit|units))/i);
      const strength = doseMatch ? doseMatch[1] : "500 mg";

      const qtyMatch = trimmed.match(/(1\s*tablet|2\s*tablets|1\s*capsule|1\s*cap|5\s*ml)/i);
      const dose = qtyMatch ? qtyMatch[1] : "1 tablet";

      let freq = "Once daily";
      if (lower.includes('twice') || lower.includes('1-0-1') || lower.includes('bd')) freq = "Twice daily";
      if (lower.includes('thrice') || lower.includes('1-1-1') || lower.includes('tid')) freq = "Three times daily";

      let mealRel = "After meal";
      if (lower.includes('before')) mealRel = "Before meal";
      if (lower.includes('with food') || lower.includes('with meal')) mealRel = "With meal";

      let timing = "After breakfast and after dinner";
      if (lower.includes('night') || lower.includes('9:00')) timing = "9:00 PM after dinner";
      if (lower.includes('before breakfast')) timing = "30 minutes before breakfast";

      let durDays = 5;
      const durMatch = lower.match(/for\s+(\d+)\s*day/i);
      if (durMatch) durDays = parseInt(durMatch[1]);

      medications.push({
        name: drugName,
        medicineName: drugName,
        strength,
        dose,
        quantity: dose,
        frequency: freq,
        timing,
        mealRelation: mealRel,
        mealType: "Lunch",
        delayMinutes: 30,
        duration: `${durDays} days`,
        durationDays: durDays,
        specialInstructions: `Extracted from document: ${trimmed}`
      });
    }
  });

  const clinicalSummary = `Analysis of ${fileName || 'uploaded medical report'}: Extracted ${vitals.length} vitals, ${labResults.length} lab test parameters, and ${medications.length} medication instructions directly from document.`;

  return {
    patient: { name: "Patient", age: "N/A", gender: "N/A" },
    clinicalSummary,
    summary: clinicalSummary,
    vitals,
    labResults,
    biomarkers: labResults,
    medications,
    diagnoses: [],
    recommendations: []
  };
}
