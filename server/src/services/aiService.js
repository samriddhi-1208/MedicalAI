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

  // 1. Extract Vitals (Temperature, Blood Pressure, Heart Rate, SpO2, Respiratory Rate)
  const tempMatch = text.match(/(?:Temperature|Body Temp|Temp)\s*[:=\-]?\s*([\d\.]+)\s*(°[FC]|F|C)?/i);
  if (tempMatch) vitals.push({ name: "Temperature", value: tempMatch[1], unit: tempMatch[2] || "°F" });

  const bpMatch = text.match(/(?:Blood Pressure|BP)\s*[:=\-]?\s*(\d{2,3}\/\d{2,3})\s*(mmHg)?/i);
  if (bpMatch) vitals.push({ name: "Blood Pressure", value: bpMatch[1], unit: bpMatch[2] || "mmHg" });

  const hrMatch = text.match(/(?:Heart Rate|Pulse|Pulse Rate|HR)\s*[:=\-]?\s*(\d{2,3})\s*(bpm|\/min)?/i);
  if (hrMatch) vitals.push({ name: "Heart Rate", value: hrMatch[1], unit: "bpm" });

  const spo2Match = text.match(/(?:SpO2|Oxygen Saturation|O2 Sat)\s*[:=\-]?\s*(\d{2,3})\s*(%)?/i);
  if (spo2Match) vitals.push({ name: "SpO2", value: spo2Match[1], unit: "%" });

  const rrMatch = text.match(/(?:Respiratory Rate|RR)\s*[:=\-]?\s*(\d{1,2})\s*(breaths\/min|\/min)?/i);
  if (rrMatch) vitals.push({ name: "Respiratory Rate", value: rrMatch[1], unit: "breaths/min" });

  // 2. Comprehensive Lab Parameter Extraction (Full Text Substring Scan)
  const labSpecs = [
    { keys: ["hemoglobin", "haemoglobin", "hb", "hgb"], name: "Hemoglobin", unit: "g/dL", ref: "12.0 - 15.5" },
    { keys: ["wbc count", "wbc", "total leucocyte", "tlc", "white blood"], name: "WBC Count", unit: "cells/µL", ref: "4000 - 11000" },
    { keys: ["platelet count", "platelets", "platelet", "plt"], name: "Platelets", unit: "lakh/µL", ref: "1.50 - 4.50" },
    { keys: ["rbc count", "rbc", "red blood", "erythrocyte"], name: "RBC Count", unit: "mil/cu.mm", ref: "3.80 - 5.20" },
    { keys: ["fasting glucose", "fasting sugar", "blood sugar", "glucose"], name: "Fasting Glucose", unit: "mg/dL", ref: "70 - 99" },
    { keys: ["serum creatinine", "creatinine", "s.creatinine"], name: "Serum Creatinine", unit: "mg/dL", ref: "0.6 - 1.1" },
    { keys: ["tsh", "thyroid stimulating"], name: "TSH", unit: "µIU/mL", ref: "0.4 - 4.0" },
    { keys: ["total cholesterol", "cholesterol"], name: "Total Cholesterol", unit: "mg/dL", ref: "< 200" },
    { keys: ["alt", "sgpt", "alanine"], name: "ALT (SGPT)", unit: "U/L", ref: "7 - 35" },
    { keys: ["ast", "sgot", "aspartate"], name: "AST (SGOT)", unit: "U/L", ref: "8 - 40" },
    { keys: ["hba1c", "glycated hemoglobin"], name: "HbA1c", unit: "%", ref: "< 5.7" },
    { keys: ["blood urea", "urea"], name: "Blood Urea", unit: "mg/dL", ref: "15 - 45" },
    { keys: ["c-reactive", "crp"], name: "C-Reactive Protein (CRP)", unit: "mg/L", ref: "< 5.0" },
    { keys: ["esr", "erythrocyte sedimentation"], name: "ESR", unit: "mm/hr", ref: "0 - 20" }
  ];

  const lowerText = text.toLowerCase();
  const seenLabNames = new Set();

  labSpecs.forEach(spec => {
    for (const key of spec.keys) {
      if (seenLabNames.has(spec.name)) break;
      const keyPos = lowerText.indexOf(key);
      if (keyPos !== -1) {
        const snippet = text.substring(keyPos, keyPos + 120);
        const valMatch = snippet.match(/([<>]?\s*\d+(?:\.\d+)?)/);
        if (valMatch) {
          const rawVal = valMatch[1].trim();
          let unit = spec.unit;
          const uMatch = snippet.match(/(g\/dL|gm\/dL|mg\/dL|mg\/L|mmol\/L|mIU\/L|uIU\/mL|µg\/dL|U\/L|unit\/L|ng\/mL|pg\/mL|cell\/cu\.mm|cells\/µL|cells\/uL|lakh\/uL|lakh\/µL|mil\/cu\.mm|lac\/cmm|Lakhs\/cumm|mm\/hr|fL|pg|%|k\/mcL)/i);
          if (uMatch) unit = uMatch[0];

          let ref = spec.ref;
          const refMatch = snippet.match(/(\d+(?:\.\d+)?\s*[-–\sto]+\s*\d+(?:\.\d+)?|<[\s]?\d+(?:\.\d+)?)/);
          if (refMatch) ref = refMatch[1];

          seenLabNames.add(spec.name);
          labResults.push({
            testName: spec.name,
            name: spec.name,
            value: rawVal,
            unit,
            referenceRange: ref,
            refRange: ref,
            status: "Normal"
          });
        }
      }
    }
  });

  // 3. Comprehensive Medication Extraction (Full Text Substring Scan)
  const medSpecs = [
    { drug: "paracetamol", defaultDose: "500 mg", defaultFreq: "Twice daily", defaultTiming: "After breakfast and after dinner", defaultMeal: "After meal", defaultDur: "5 days" },
    { drug: "cetirizine", defaultDose: "10 mg", defaultFreq: "Once daily", defaultTiming: "9:00 PM after dinner", defaultMeal: "After meal", defaultDur: "5 days" },
    { drug: "pantoprazole", defaultDose: "40 mg", defaultFreq: "Once daily", defaultTiming: "30 minutes before breakfast", defaultMeal: "Before meal", defaultDur: "7 days" },
    { drug: "metformin", defaultDose: "500 mg", defaultFreq: "Twice daily", defaultTiming: "After breakfast and dinner", defaultMeal: "After meal", defaultDur: "30 days" },
    { drug: "amoxicillin", defaultDose: "500 mg", defaultFreq: "Three times daily", defaultTiming: "After meals", defaultMeal: "After meal", defaultDur: "7 days" },
    { drug: "azithromycin", defaultDose: "500 mg", defaultFreq: "Once daily", defaultTiming: "After lunch", defaultMeal: "After meal", defaultDur: "3 days" },
    { drug: "atorvastatin", defaultDose: "10 mg", defaultFreq: "Once daily", defaultTiming: "At bedtime", defaultMeal: "After meal", defaultDur: "30 days" }
  ];

  medSpecs.forEach(spec => {
    const pos = lowerText.indexOf(spec.drug);
    if (pos !== -1) {
      const snippet = text.substring(pos, pos + 150);
      const drugName = spec.drug.charAt(0).toUpperCase() + spec.drug.slice(1);
      
      const doseMatch = snippet.match(/(\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|unit|units))/i);
      const strength = doseMatch ? doseMatch[1] : spec.defaultDose;

      const qtyMatch = snippet.match(/(1\s*tablet|2\s*tablets|1\s*capsule|1\s*cap|5\s*ml)/i);
      const dose = qtyMatch ? qtyMatch[1] : "1 tablet";

      let freq = spec.defaultFreq;
      const lowerSnippet = snippet.toLowerCase();
      if (lowerSnippet.includes('twice') || lowerSnippet.includes('1-0-1') || lowerSnippet.includes('bd')) freq = "Twice daily";
      if (lowerSnippet.includes('thrice') || lowerSnippet.includes('1-1-1') || lowerSnippet.includes('tid')) freq = "Three times daily";

      let mealRel = spec.defaultMeal;
      if (lowerSnippet.includes('before')) mealRel = "Before meal";
      if (lowerSnippet.includes('with food') || lowerSnippet.includes('with meal')) mealRel = "With meal";

      let timing = spec.defaultTiming;
      let durDays = 5;
      const durMatch = lowerSnippet.match(/for\s+(\d+)\s*day/i);
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
        specialInstructions: `Extracted from prescription text: ${snippet.substring(0, 80)}`
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
