# 🎯 MedGuardian AI — MVP & Requirements Specification

This document details the functional, supporting, security, non-functional, and future requirements of the MedGuardian AI application, structured in accordance with the 5 requirement categories.

---

## 1. User Personas

### Persona 1: Rajesh (52, Type-2 Diabetic Patient)
* **Location**: Vadodara, Gujarat (Semi-urban).
* **Language**: Gujarati / Hindi.
* **Goal**: Needs to upload quarterly blood test reports, understand whether HbA1c and fasting blood sugar levels are improving, and remember morning/night Metformin doses with meals.
* **Pain Point**: Finds hospital lab reports confusing and struggles with English-only health portals.

### Persona 2: Priya (29, Working Caregiver)
* **Location**: Anand, Gujarat.
* **Language**: English / Hindi.
* **Goal**: Manages medical documents and medications for her elderly mother.
* **Pain Point**: Needs a centralized history of reports and emergency access with one-tap location dispatch to family members in case of medical crisis.

---

## 2. Requirement Classification Matrix

| Category | Identifier | Description | Implemented Status |
| :--- | :--- | :--- | :--- |
| **Core MVP** | `REQ-CORE-01` | Medical Report Ingestion & Multi-Format Parsing (PDF/Images) | Implemented |
| **Core MVP** | `REQ-CORE-02` | Gemini AI Clinical Summaries & Dual-Engine Fallback Parsing | Implemented |
| **Core MVP** | `REQ-CORE-03` | Extracted Biomarker & Vital Signs Categorization | Implemented |
| **Core MVP** | `REQ-CORE-04` | Medication Schedule & Daily Adherence Tracking | Implemented |
| **Core MVP** | `REQ-CORE-05` | 1-Tap Emergency SOS with Geolocation & Email Alert Dispatch | Implemented |
| **Core MVP** | `REQ-CORE-06` | Interactive Leaflet/OpenStreetMap Hospital Finder | Implemented |
| **Supporting** | `REQ-SUPP-01` | Patient Profile Management & Baseline Health Metrics | Implemented |
| **Supporting** | `REQ-SUPP-02` | Multi-Lingual Localization (English, Hindi, Gujarati) | Implemented |
| **Supporting** | `REQ-SUPP-03` | Onboarding Flow & Profile Completion Route Guarding | Implemented |
| **Supporting** | `REQ-SUPP-04` | OpenStreetMap Nominatim Reverse Geocoding | Implemented |
| **Security** | `REQ-SEC-01` | User Registration & Cryptographic Password Hashing (bcryptjs) | Implemented |
| **Security** | `REQ-SEC-02` | JSON Web Token (JWT) Stateless Session Management & Expiration | Implemented |
| **Security** | `REQ-SEC-03` | Ephemeral In-Memory File Buffering (Zero Persistent Disk PHI) | Implemented |
| **Security** | `REQ-SEC-04` | SHA-256 Digest Duplicate Report Collision Detection | Implemented |
| **Security** | `REQ-SEC-05` | Strict File Size (15MB) and MIME Type Restrictions | Implemented |
| **Security** | `REQ-SEC-06` | Environment Variable Isolation & API Key Shielding | Implemented |
| **Security** | `REQ-SEC-07` | Email-Based Two-Factor Authentication (2FA) with bcrypt Hash & 5-min TTL | Implemented |
| **Non-Functional** | `REQ-NFR-01` | Zero Fabricated Data Integrity Policy | Implemented |
| **Non-Functional** | `REQ-NFR-02` | Responsive Fluid Layout (Mobile, Tablet, Desktop) | Implemented |
| **Non-Functional** | `REQ-NFR-03` | High Contrast & Accessible UI (WCAG 2.1 AA Tokens) | Implemented |
| **Non-Functional** | `REQ-NFR-04` | Dark / Light Theme Switching with Local Persistence | Implemented |
| **Non-Functional** | `REQ-NFR-05` | Cold-Start Resilience & Database Connection Self-Healing | Implemented |
| **Future Enhancement** | `REQ-FUT-01` | Hardware Security Keys & WebAuthn / FIDO2 Passkeys | Planned |
| **Future Enhancement** | `REQ-FUT-02` | Automated Voice Telephony Dispatch via Twilio Voice | Planned |
| **Future Enhancement** | `REQ-FUT-03` | Direct E-Prescription Transmission to Retail Pharmacies | Planned |
| **Future Enhancement** | `REQ-FUT-04` | Wearable Health Tracker Bluetooth Synchronization | Planned |
| **Future Enhancement** | `REQ-FUT-05` | Formal HIPAA / NABH / DISHA Compliance Certification | Planned |

---

## 3. Detailed Category Specifications

### Category 1: Core MVP Functionality
These requirements constitute the primary value proposition of MedGuardian AI:

* **REQ-CORE-01: Medical Report Ingestion**
  - Accepts user-uploaded medical reports in PDF, JPG, JPEG, and PNG formats up to 15MB.
  - Implements drag-and-drop file ingestion via `UploadModal.jsx`.
* **REQ-CORE-02: AI Clinical Summaries & Dual-Engine Fallback**
  - Primary: Invokes Google Gemini AI (`gemini-1.5-flash`) with structured medical extraction prompts.
  - Fallback: Deterministic regex-based Universal Clinical Extractor if the Gemini API is unavailable or unconfigured, ensuring zero downtime.
  - Generates patient-friendly explanations without providing definitive medical diagnoses.
* **REQ-CORE-03: Biomarker & Vital Signs Categorization**
  - Isolates lab parameters (e.g., HbA1c, Fasting Glucose, Lipid Profile, Platelet Count) with numerical values, clinical units, reference intervals, and status flags (`normal`, `high`, `low`).
  - Detects vital signs: Blood Pressure (systolic/diastolic), Heart Rate, Body Temperature, and SpO2.
* **REQ-CORE-04: Medication Schedule & Adherence**
  - Full CRUD operations on patient prescriptions (Medicine name, dose, frequency, meal relation).
  - Daily dosage tracking (Logged vs. Upcoming vs. Paused).
  - Visual refill warning when inventory reaches $\le 5$ units.
  - Adherence calculation percentage: $\frac{\text{Logged Doses Today}}{\text{Total Scheduled Doses Today}} \times 100$.
* **REQ-CORE-05: Emergency SOS & Guidance**
  - Prominent 1-Tap SOS dispatch mechanism.
  - Acquires browser geolocation (latitude and longitude coordinates).
  - Triggers automated alert emails via Nodemailer with direct Google Maps location links to designated emergency contacts.
  - Direct telephone dialer trigger to National Ambulance Helpline (`tel:108`).
* **REQ-CORE-06: Hospital & Healthcare Provider Finder**
  - Interactive Leaflet map powered by OpenStreetMap tiles.
  - Proximity search radius filters: 5km, 10km, 25km, 50km.
  - Medical specialty filters: Hospitals, Clinics, Physicians, Cardiologists, Pediatricians, Pharmacies, Labs.

---

### Category 2: Supporting Requirements
These requirements support usability, onboarding, and accessibility:

* **REQ-SUPP-01: Patient Profile & Health Baselines**
  - Stores height, weight, blood group, date of birth, and primary physician.
  - Automatically derives current age from date of birth.
* **REQ-SUPP-02: Multi-Lingual Localization (EN / HI / GU)**
  - Full interface localization across English, Hindi, and Gujarati (`src/utils/translations.js`).
  - Covers navigation bars, buttons, clinical table headers, and emergency indicators.
  - User language preference persisted in `localStorage`.
* **REQ-SUPP-03: Onboarding Route Guarding**
  - `OnboardingRoute.jsx` intercepts users who registered without completing their medical baseline profile, routing them to `/complete-profile`.
* **REQ-SUPP-04: OpenStreetMap Reverse Geocoding**
  - Queries Nominatim API to convert GPS coordinates into city, state, and pincode during profile creation.

---

### Category 3: Security Requirements
These requirements safeguard Protected Health Information (PHI) and control access:

* **REQ-SEC-01: Cryptographic Password Management**
  - Passwords hashed using `bcryptjs` with 10 salt rounds prior to persistence.
  - Complexity enforced on both client and server: $\ge 8$ characters, uppercase, lowercase, number, symbol.
* **REQ-SEC-02: JWT Stateless Access Control**
  - Issues signed HMAC SHA-256 tokens valid for 30 days upon successful authentication.
  - `authMiddleware.js` verifies token integrity and binds authenticated user identity to `req.user`.
* **REQ-SEC-03: Ephemeral In-Memory Processing**
  - File uploads handled strictly in memory via `multer.memoryStorage()`.
  - Zero patient PDFs or lab images saved to persistent public server disk storage.
* **REQ-SEC-04: SHA-256 Collision & Duplicate Detection**
  - Server computes SHA-256 cryptographic hash of incoming document buffers to prevent duplicate uploads and reduce redundant API calls.
* **REQ-SEC-05: Payload & MIME Type Restrictions**
  - Enforces 15MB file size limit and whitelisted MIME types (`application/pdf`, `image/jpeg`, `image/png`).
* **REQ-SEC-06: Credential Isolation**
  - All API keys, database connection URIs, and JWT secrets isolated in `.env` files with zero client-side exposure.
* **REQ-SEC-07: Email-Based Two-Factor Authentication (2FA)**
  - Mandatory 2FA verification requiring 6-digit cryptographically secure OTP prior to JWT issuance.
  - Plaintext OTP never stored: hashed via `bcryptjs` (10 rounds) before persistence (`otp_hash`).
  - Strict 5-minute Time-To-Live (TTL), 5-attempt brute-force protection, 60-second resend cooldown, and single-use code destruction.
  - Dispatched via Nodemailer with strict zero-logging policy.

---

### Category 4: Non-Functional Requirements
These requirements define architectural quality, performance, and user experience:

* **REQ-NFR-01: Zero Fabricated Data Integrity**
  - System never injects mock lab metrics or artificial patient records into the production interface. Empty states display clear, actionable upload calls-to-action.
* **REQ-NFR-02: Responsive Layout**
  - Seamless responsive experience across mobile devices ($<768\text{px}$), tablets ($768\text{px}-1024\text{px}$), and desktops ($>1024\text{px}$).
* **REQ-NFR-03: Accessibility & Design Token System**
  - Uses accessible design tokens: muted lavender primary (`#5B648F`), soft lavender secondary (`#DADCEC`), and sage green accent (`#B8D9CF`).
  - Button touch targets $\ge 42\text{px}$, visible focus states, and tri-modal status indicators (color + symbol + label).
* **REQ-NFR-04: Persistent Dark / Light Theme**
  - Complete theme toggle with CSS custom properties and `.dark` root styling, persisting across sessions.
* **REQ-NFR-05: Cold Start Resilience**
  - Dedicated `/health` and `/api/health` endpoints monitor database readiness (`readyState === 1`) to gracefully recover from free-tier cloud host idling.

---

### Category 5: Future Enhancements (Planned / Out of Scope)
These requirements represent planned expansions for future iterations:

* **REQ-FUT-01: Hardware Security Keys & WebAuthn / FIDO2 Passkeys**
  - Support for biometric authentication (TouchID, FaceID, Windows Hello) and YubiKeys.
* **REQ-FUT-02: Automated Telephony Dispatch**
  - Direct integration with Twilio Voice / Indian emergency dispatch APIs for automated spoken voice calls during SOS triggers.
* **REQ-FUT-03: E-Prescription Pharmacy Connectivity**
  - Direct transmission of digital prescriptions to local registered pharmacy networks.
* **REQ-FUT-04: Wearable Device Sync**
  - Web Bluetooth API integration to sync continuous heart rate, SpO2, and blood pressure from smart bands.
* **REQ-FUT-05: Formal Regulatory Compliance Certification**
  - Achieving full HIPAA (US), DISHA (India), and NABH compliance standards.
