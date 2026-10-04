# 🤖 MedGuardian AI — AI & Clinical Intelligence Interview Questions

This guide contains technical interview questions and detailed answers regarding the artificial intelligence architecture, prompt engineering, fallback parsing, and clinical safety guardrails in MedGuardian AI.

---

### Q1: What specific role does Google Gemini AI play in MedGuardian AI?
**Answer:**
Google Gemini AI functions as a **structured data extractor and plain-language medical translator**:
1. **Extraction**: Diagnostic reports are unstructured text. Gemini parses the OCR text stream and extracts clinical entities: biomarkers (e.g. Hemoglobin, Fasting Blood Glucose), vital signs (e.g. Blood Pressure, SpO2), and prescribed medications.
2. **Translation**: Gemini translates clinical terminology into easily understandable patient summaries. For example, instead of leaving a patient confused by "Microcytic hypochromic anemia secondary to iron deficiency", it explains: *"Your red blood cells are smaller and paler than normal, commonly caused by low iron levels, which may cause fatigue."*
3. **Guardrail Enforcement**: Gemini is strictly instructed **never** to diagnose or prescribe treatments.

---

### Q2: How did you engineer the prompt to guarantee valid, structured JSON from Gemini?
**Answer:**
In `server/src/services/aiService.js`, we enforce strict output formatting:
* **System Prompt Constraints**: The model is instructed:
  > *"You are an expert clinical laboratory report and prescription analyzer AI. Analyze the following extracted document text from ({fileName}) and output ONLY a valid raw JSON object (no markdown, no code blocks, no trailing text) following this exact schema..."*
* **Explicit Schema Structure**: We provide a full TypeScript-like JSON template specifying keys: `patient`, `clinicalSummary`, `vitals`, `labResults`, and `medications`.
* **Sanitization Post-Processing**: When the model occasionally wraps responses in markdown code blocks (````json ... ````), our backend parser automatically cleans the text before passing it to `JSON.parse()`:
  ```javascript
  const sanitized = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  ```

---

### Q3: What happens if the Gemini API key is missing or the external API is offline?
**Answer:**
The application incorporates a **Universal Clinical Extractor** as an automatic fallback:
* In `aiService.js`, if `GEMINI_API_KEY` is not present, or if the external API returns a network error / rate limit (HTTP 429), the code seamlessly falls back to the deterministic regex engine.
* The Universal Clinical Extractor uses pre-compiled regular expressions matching over 40 standard medical parameters (HbA1c, Fasting Blood Sugar, Hemoglobin, WBC, Platelets, Creatinine, Bilirubin, Cholesterol, SGOT, SGPT) alongside their units and standard reference ranges.
* It extracts values, compares them against standard clinical cutoffs to determine status (`Normal`, `Elevated`, `Critical`), and compiles a structured clinical overview.
* This guarantees that the user always receives structured insights from their uploaded report, even in offline or zero-API-credit environments.

---

### Q4: Why is there an architectural separation between deterministic rules and generative AI?
**Answer:**
In healthcare software, using generative AI for life-critical decisions (such as emergency triage, medication dosing, or 108 emergency dispatches) poses severe risks:
1. **Hallucination Risk**: Large language models are probabilistic token predictors that can invent non-existent dosages or underestimate acute clinical emergencies.
2. **Determinism Guarantee**:
   * **Emergency Workflows**: 1-Tap SOS dispatches, National Ambulance Helpline links (108), and proximity hospital sorting are **100% deterministic**. They rely exclusively on browser GPS coordinates and verified OpenStreetMap GIS records.
   * **Medication Refill Alerts**: The threshold for low supply ($\le 5$ pills remaining) is computed using arithmetic, not generative AI.
   * **Generative Role**: Generative AI is restricted to summarization, plain-language explanations, and parsing assistance where human oversight is maintained.

---

### Q5: How does the system defend against medical hallucinations?
**Answer:**
1. **Source Grounding**: Every summarized parameter in `AIAnalysisPage.jsx` is mapped directly to its extracted numerical value, unit, and reference range.
2. **Raw Text Inspector**: The UI includes a "View Original Text" modal that renders the exact OCR text extracted from the user's PDF, allowing patients and physicians to verify the AI's claims against source documentation.
3. **Persistent Medical Disclaimers**: Every clinical card displays mandatory disclaimers noting that summaries are educational explanations and that patients must consult licensed physicians before making treatment decisions.
4. **Rejection of Non-Medical Documents**: If a document lacks medical tokens, the parser rejects it rather than hallucinating health metrics from irrelevant text.
