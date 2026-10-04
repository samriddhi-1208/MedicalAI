# 🏥 MedGuardian AI — Project Overview

> **MedGuardian AI** is a patient-centric, AI-assisted healthcare web application engineered to bridge the communication gap between complex diagnostic laboratory reports and everyday patients.

---

## 1. Problem Statement
Medical laboratory reports, clinical pathology summaries, and prescriptions are dense, filled with Latinate medical jargon, abbreviations, and complex reference ranges. For patients—especially in semi-urban communities and non-English-speaking regions—understanding what high creatinine, elevated HbA1c, or low platelets mean often leads to:
1. **Severe Health Anxiety**: Searching unverified internet forums for ambiguous medical symptoms.
2. **Delayed Intervention**: Failing to recognize critical lab values that require prompt medical consultation.
3. **Medication Mismanagement**: Confusion around meal relations (before/after food), dosing frequencies, and prescription durations.
4. **Emergency Panic**: Inability to quickly locate nearby accredited emergency trauma centers or trigger immediate alerts with live GPS coordinates.

---

## 2. The Solution: MedGuardian AI
MedGuardian AI provides a calm, accessible, privacy-conscious digital workspace where patients can:
* **Upload Medical Reports**: Ingest PDF, JPG, and PNG lab reports up to 15MB.
* **Instant Clinical Extraction & AI Summaries**: Extract structured biomarkers, vital signs, and prescriptions with clear plain-language explanations using Google Gemini AI, supported by a deterministic fallback clinical regex parser.
* **Longitudinal Trend Tracking**: Track health biomarkers over time without fabricated data.
* **Medication Adherence Management**: Monitor daily prescriptions with dosing schedules, meal relations, and supply refill alerts ($\le 5$ doses remaining).
* **24/7 Emergency Guidance & 1-Tap SOS**: Access immediate ambulance hotlines (108 in India), broadcast real-time GPS coordinates via Nodemailer email alerts, and view live nearby emergency hospitals using OpenStreetMap and Leaflet.
* **Trilingual Accessibility**: Full interface localization in English (EN), Hindi (HI), and Gujarati (GU).

---

## 3. Core Philosophy & Clinical Safety Guardrails

| Principle | How MedGuardian AI Enforces It |
| :--- | :--- |
| **No Automated Diagnosis** | The AI never provides definitive diagnoses or replaces licensed physicians. All outputs are presented as educational explanations. |
| **Zero Fabricated Data** | When a user has zero uploaded reports or zero medications, empty states are rendered. The system never injects fake medical values. |
| **Deterministic vs. Generative Separation** | Emergency workflows and reference ranges rely on deterministic logic and official helplines (108), never on ungrounded AI text generation. |
| **Source Grounding** | Every summarized insight provides a direct view into the raw extracted text so patients and doctors can verify the original source. |

---

## 4. Current Status vs. Future Roadmap

### ✅ Implemented & Verified in Codebase
* JWT Authentication (Signup, Login, Token persistence, Profile onboarding).
* PDF / Image parsing (Multer memory storage, `pdf-parse`, Google Gemini AI, Universal Clinical Extractor fallback).
* SHA-256 duplicate report detection.
* Interactive Medication Schedule with status tracking (Upcoming, Taken, Paused) and refill warnings.
* Interactive Leaflet + OpenStreetMap Hospital Finder with radius and specialty category filtering.
* 1-Tap SOS trigger with GPS acquisition and email notification dispatch via Nodemailer.
* Instant trilingual localization (English, Hindi, Gujarati).
* Light and Dark mode theme system with persistent storage.

### 🔮 Future Roadmap (Not in Current MVP)
* End-to-end Twilio SMS / WhatsApp emergency alerts (currently dispatches via Nodemailer email alerts and local dialer links).
* DICOM / X-ray radiology image analysis.
* Direct FHIR / HL7 hospital EHR electronic medical records integration.
* Doctor-patient telemedicine video consultations.
