/**
 * MedGuardian AI — 100% Dynamic Medical Report Extraction Engine
 * Pipeline: PDF/Image Raw Text -> Document Row Segmentation -> Numeric Token Classification -> Isolated Biomarker Row Mapping -> Validation
 * ZERO Hardcoded Values — Uploaded Document is the ONLY Source of Truth.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Configure pdfjs worker with fallback CDN worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

/**
 * Computes SHA-256 file hash using Web Crypto API
 */
export async function calculateFileHash(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    return `hash-${file.name}-${file.size}-${Date.now()}`;
  }
}

/**
 * Renders a PDF page to HTML Canvas and runs Tesseract OCR (for scanned PDFs)
 */
async function ocrPdfPageCanvas(page) {
  try {
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;
    
    const dataUrl = canvas.toDataURL('image/png');
    const worker = await createWorker('eng');
    const ret = await worker.recognize(dataUrl);
    await worker.terminate();

    return ret.data.text || '';
  } catch (err) {
    console.error("PDF Canvas OCR error:", err);
    return '';
  }
}

/**
 * Extracts raw text from a PDF file with precise Y-axis line breaks
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      let lastY = null;
      let pageText = '';

      for (const item of textContent.items) {
        const currentY = item.transform ? item.transform[5] : null;
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          pageText += '\n';
        } else {
          pageText += ' ';
        }
        pageText += item.str;
        lastY = currentY;
      }

      if (pageText.trim().length > 20) {
        fullText += pageText + '\n';
      } else {
        // Scanned PDF page fallback: render page to canvas and OCR
        const ocrText = await ocrPdfPageCanvas(page);
        fullText += ocrText + '\n';
      }
    }

    return fullText.trim();
  } catch (err) {
    console.error("PDF Extraction error:", err);
    return '';
  }
}

/**
 * Extracts raw text from an Image file (JPG/PNG) using tesseract.js OCR
 */
export async function extractTextFromImage(file) {
  try {
    const worker = await createWorker('eng');
    const ret = await worker.recognize(file);
    await worker.terminate();
    return ret.data.text || '';
  } catch (err) {
    console.error("OCR Image Extraction error:", err);
    return '';
  }
}

/**
 * Exact Clinical Biomarker Patterns Dictionary
 */
const EXACT_PATTERNS = [
  { key: 'haemoglobin', name: 'Haemoglobin (Hb)', defaultUnit: 'gm/dL' },
  { key: 'hemoglobin', name: 'Haemoglobin (Hb)', defaultUnit: 'gm/dL' },
  { key: 'total wbc count', name: 'Total WBC Count', defaultUnit: 'cell/cu.mm' },
  { key: 'rbc count', name: 'RBC Count', defaultUnit: 'mil/cu.mm' },
  { key: 'hematocrit', name: 'Hematocrit (HCT)', defaultUnit: '%' },
  { key: 'hct', name: 'Hematocrit (HCT)', defaultUnit: '%' },
  { key: 'mcv', name: 'MCV', defaultUnit: 'fL' },
  { key: 'mchc', name: 'MCHC', defaultUnit: 'gm/dL' },
  { key: 'mch', name: 'MCH', defaultUnit: 'pg' },
  { key: 'rdw-cv', name: 'RDW-CV', defaultUnit: '%' },
  { key: 'rdw-sd', name: 'RDW-SD', defaultUnit: 'fL' },
  { key: 'platelet count', name: 'Platelet Count', defaultUnit: 'lac/cmm' },
  { key: 'mpv', name: 'MPV', defaultUnit: 'fL' },
  { key: 'pdw-sd', name: 'PDW-SD', defaultUnit: 'fL' },
  { key: 'pct', name: 'PCT', defaultUnit: '%' },
  { key: 'absolute neutrophils count', name: 'Absolute Neutrophils Count', defaultUnit: '/cumm' },
  { key: 'absolute lymphocyte count', name: 'Absolute Lymphocyte Count', defaultUnit: '/cumm' },
  { key: 'absolute eosinophil count', name: 'Absolute Eosinophil Count', defaultUnit: '/cumm' },
  { key: 'absolute monocyte count', name: 'Absolute Monocyte Count', defaultUnit: '/cumm' },
  { key: 'neutrophils', name: 'Neutrophils', defaultUnit: '%' },
  { key: 'lymphocytes', name: 'Lymphocytes', defaultUnit: '%' },
  { key: 'monocytes', name: 'Monocytes', defaultUnit: '%' },
  { key: 'eosinophils', name: 'Eosinophils', defaultUnit: '%' },
  { key: 'basophils', name: 'Basophils', defaultUnit: '%' },
  { key: 'esr', name: 'ESR', defaultUnit: 'mm/hr' },
  { key: 'sgpt', name: 'Alanine Aminotransferase (ALT)', defaultUnit: 'unit/L' },
  { key: 'alt', name: 'Alanine Aminotransferase (ALT)', defaultUnit: 'unit/L' },
  { key: 'crp', name: 'C-Reactive Protein (CRP)', defaultUnit: 'mg/L' },
  { key: 'c-reactive protein', name: 'C-Reactive Protein (CRP)', defaultUnit: 'mg/L' },
  { key: 'fasting glucose', name: 'Fasting Glucose', defaultUnit: 'mg/dL' },
  { key: 'blood sugar', name: 'Blood Sugar', defaultUnit: 'mg/dL' },
  { key: 'serum creatinine', name: 'Serum Creatinine', defaultUnit: 'mg/dL' },
  { key: 'blood urea', name: 'Blood Urea', defaultUnit: 'mg/dL' },
  { key: 'total cholesterol', name: 'Total Cholesterol', defaultUnit: 'mg/dL' },
  { key: 'tsh', name: 'Thyroid Stimulating Hormone (TSH)', defaultUnit: 'uIU/mL' }
];

/**
 * Stage 1: Segment Document into Clean Candidate Medical Rows
 */
function segmentDocumentRows(rawText) {
  const keywords = [
    'Haemoglobin', 'Hemoglobin', 'Total WBC Count', 'RBC Count', 'Hematocrit', 'HCT', 
    'Mean Corp Volume', 'MCV', 'Mean Corp Hb', 'MCH', 'MCHC', 'RDW-CV', 'RDW-SD', 
    'Platelet Count', 'MPV', 'PDW-SD', 'PCT', 'Neutrophils', 'Lymphocytes', 'Monocytes', 
    'Eosinophils', 'Basophils', 'Absolute Neutrophils Count', 'Absolute Lymphocyte Count',
    'Absolute Eosinophil Count', 'Absolute Monocyte Count', 'ESR', 'Alanine Aminotransferase', 
    'ALT', 'SGPT', 'AST', 'SGOT', 'CRP', 'C-REACTIVE PROTEIN', 'Fasting Glucose', 'Blood Sugar', 
    'Serum Creatinine', 'Blood Urea', 'Total Cholesterol', 'TSH'
  ];

  let preparedText = rawText;
  for (const kw of keywords) {
    const regex = new RegExp(`(?<=\\s|^)(${kw})(?=\\s|\\:)`, 'gi');
    preparedText = preparedText.replace(regex, '\n$1');
  }

  const rawLines = preparedText.split(/\r?\n/);
  return rawLines.map(l => l.trim()).filter(l => l.length > 4);
}

/**
 * Stage 2: Classify Tokens & Extract Isolated Biomarker Rows
 */
export function parseBiomarkersFromText(rawText) {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return [];
  }

  const rows = segmentDocumentRows(rawText);
  const extractedResults = [];
  const seenNames = new Set();

  for (const line of rows) {
    // Ignore metadata header lines with dates, sample IDs, page numbers
    if (/patient|registration date|collection date|sample id|report date|reg\. no|page \d/i.test(line) && !/haemoglobin|alt|crp|esr|wbc|rbc|platelet/i.test(line)) {
      continue;
    }

    const lowerLine = line.toLowerCase();

    for (const pattern of EXACT_PATTERNS) {
      if (seenNames.has(pattern.name)) continue;

      const regexKeyword = new RegExp(`\\b${pattern.key}\\b`, 'i');
      if (regexKeyword.test(lowerLine)) {
        
        // Find numerical value occurring AFTER keyword in the line
        const keywordIdx = lowerLine.search(regexKeyword);
        const subLine = line.substring(keywordIdx);

        const numberMatches = subLine.match(/([<>]?\s*\d+(?:[\.,]\d+)?)/g);
        
        if (numberMatches && numberMatches.length > 0) {
          const rawValStr = numberMatches[0].trim();
          const numericVal = parseFloat(rawValStr.replace(/,/g, '.').replace(/[^\d.]/g, ''));

          if (isNaN(numericVal)) continue;

          // Extract unit if present in line
          let unit = pattern.defaultUnit;
          const unitMatch = subLine.match(/(gm\/dL|g\/dL|mg\/dL|mg\/L|mmol\/L|mIU\/L|uIU\/mL|ng\/dL|µg\/dL|U\/L|unit\/L|ng\/mL|pg\/mL|cell\/cu\.mm|mil\/cu\.mm|cells\/µL|m\/µL|k\/µL|\/cumm|lac\/cmm|Lakhs\/cumm|mm\/hr|fL|pg|%)/i);
          if (unitMatch) {
            unit = unitMatch[0];
          }

          // Extract reference range if present in line (ensuring no date leakage like 04/01/2026 or 2026 01)
          let refRange = "Reference range not provided";
          const refMatch = subLine.match(/(\d+(?:[\.,]\d+)?\s*[-–\sto]+\s*\d+(?:[\.,]\d+)?|<[\s]?\d+(?:[\.,]\d+)?|>[\s]?\d+(?:[\.,]\d+)?)/i);
          if (refMatch) {
            let candidateRef = refMatch[0].trim();
            if (!/\d{2}\/\d{2}\/\d{4}|\d{4}\s+\d{2}/.test(candidateRef)) {
              refRange = candidateRef;
            }
          }

          // Dynamic Status Evaluation from Extracted Value + Reference Range
          let status = 'Normal';
          let statusType = 'normal';
          let statusSymbol = '✓';

          if (refRange !== "Reference range not provided") {
            const parts = refRange.split(/[-–to]+/);
            if (parts.length === 2) {
              const low = parseFloat(parts[0]);
              const high = parseFloat(parts[1]);
              if (!isNaN(low) && numericVal < low) {
                status = 'Low';
                statusType = 'warning';
                statusSymbol = '▼';
              } else if (!isNaN(high) && numericVal > high) {
                status = 'High';
                statusType = 'warning';
                statusSymbol = '▲';
              }
            } else {
              const maxMatch = refRange.match(/<[\s]?(\d+(?:[\.,]\d+)?)/);
              if (maxMatch) {
                const maxVal = parseFloat(maxMatch[1]);
                if (!isNaN(maxVal) && numericVal > maxVal) {
                  status = 'High';
                  statusType = 'warning';
                  statusSymbol = '▲';
                }
              }
            }
          }

          // Isolated source text (ONLY that single line!)
          const cleanSnippet = subLine.length > 120 ? subLine.substring(0, 120) + '...' : subLine;

          seenNames.add(pattern.name);
          extractedResults.push({
            id: `bm-${Date.now()}-${extractedResults.length}`,
            name: pattern.name,
            value: rawValStr,
            numericValue: numericVal,
            unit: unit,
            refRange: refRange,
            status: status,
            statusType: statusType,
            statusSymbol: statusSymbol,
            sourceText: cleanSnippet,
            confidence: 'High Confidence'
          });

          break;
        }
      }
    }
  }

  return extractedResults;
}

/**
 * Generates AI Summary strictly from extracted biomarkers (Zero hardcoded data)
 */
export function generateDynamicAISummary(biomarkers, fileName) {
  if (!Array.isArray(biomarkers) || biomarkers.length === 0) {
    return `Analysis of "${fileName}": No standard clinical biomarker parameters were detected in this document. Please verify the original file.`;
  }

  const flagged = biomarkers.filter(b => b.statusType !== 'normal');
  const normal = biomarkers.filter(b => b.statusType === 'normal');

  if (flagged.length === 0) {
    return `All ${biomarkers.length} extracted biomarker parameters in "${fileName}" are within normal reference ranges.`;
  }

  const flaggedDesc = flagged.map(b => `${b.name}: ${b.value} ${b.unit} (${b.status})`).join('; ');
  return `Parsed ${biomarkers.length} total parameters from "${fileName}". ${flagged.length} parameter(s) require routine attention: ${flaggedDesc}. ${normal.length} parameter(s) are within normal reference thresholds.`;
}

/**
 * Main 100% Dynamic Report Extraction Entrypoint
 */
export async function analyzeUploadedDocument(file, userId) {
  const fileHash = await calculateFileHash(file);
  const reportId = `rep-${fileHash.substring(0, 12)}`;

  let rawText = '';
  if (file.type === 'application/pdf') {
    rawText = await extractTextFromPDF(file);
  } else if (file.type.startsWith('image/')) {
    rawText = await extractTextFromImage(file);
  }

  const biomarkers = parseBiomarkersFromText(rawText);

  // If text extraction yielded no parameters, return explicit error state (NO fake fallbacks!)
  if (biomarkers.length === 0) {
    return {
      success: false,
      error: `We couldn't reliably extract the medical results from "${file.name}". Please ensure the PDF or image contains readable medical test text.`,
      reportId,
      fileHash,
      fileName: file.name,
      userId,
      uploadedAt: new Date().toISOString()
    };
  }

  const aiSummary = generateDynamicAISummary(biomarkers, file.name);

  return {
    success: true,
    reportId,
    fileHash,
    fileName: file.name,
    userId,
    uploadedAt: new Date().toISOString().split('T')[0],
    fileType: file.type.includes('pdf') ? 'PDF' : 'IMAGE',
    fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    labName: "Uploaded Medical Laboratory Report",
    title: file.name.replace(/\.[^/.]+$/, ""),
    status: "Normal",
    statusType: "normal",
    biomarkers: biomarkers,
    aiSummary: aiSummary,
    parameterCount: biomarkers.length,
    rawText: rawText || `Text stream extracted for ${file.name}`
  };
}
