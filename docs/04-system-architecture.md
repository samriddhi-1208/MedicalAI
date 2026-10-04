# 🏗️ MedGuardian AI — System Architecture Specification

This document details the architectural topology, data flows, and subsystem integrations of MedGuardian AI.

---

## 1. High-Level Architecture Diagram

```
                              USER CLIENT VIEWPORT
               [Browser: Desktop / Tablet / Mobile Touch Screen]
                                       │
                  ┌────────────────────┴────────────────────┐
                  │        REACT 18 + VITE FRONTEND         │
                  │                                         │
                  │  AppRoutes.jsx ──► Protected Guards     │
                  │  HealthDataContext ──► Custom Hooks     │
                  │  Leaflet / OpenStreetMap Canvas         │
                  └────────────────────┬────────────────────┘
                                       │ HTTPS / JSON REST API
                                       │ (Bearer JWT Auth)
                                       ▼
                   ┌────────────────────────────────────────┐
                   │       NODE.JS + EXPRESS BACKEND        │
                   │                                        │
                   │  server.js ──► src/index.js (Cluster)  │
                   │  src/app.js (CORS, Express, Multer)    │
                   │  Middlewares: authMiddleware, ErrorHandler
                   └─────┬──────────────┬──────────────┬────┘
                         │              │              │
       Mongoose ODM / TCP│              │REST API Calls│SMTP Connection
                         ▼              ▼              ▼
           ┌───────────────────┐ ┌───────────────┐ ┌───────────────────┐
           │   MONGODB ATLAS   │ │ GOOGLE GEMINI │ │    NODEMAILER     │
           │  DATABASE CLUSTER │ │   AI ENGINE   │ │    SMTP SERVER    │
           │                   │ │               │ │                   │
           │ • Users           │ │ • Clinical    │ │ • Emergency SOS   │
           │ • Reports         │ │   Summaries   │ │   Email Dispatches│
           │ • ReportSummaries │ │ • Biomarkers  │ │ • Notifications   │
           │ • ReportValues    │ │ • Medications │ └───────────────────┘
           │ • Medicines       │ └───────────────┘
           │ • MedicineLogs    │
           │ • SOSEvents       │
           │ • Contacts        │
           └───────────────────┘
```

---

## 2. Detailed Subsystem Data Flows

### A. Authentication & Session Flow
```
[User Input: Email + Password]
            │
            ▼
[POST /api/auth/login] ──► [authController.js]
                                  │
                                  ├─► Check Mongoose readiness (readyState === 1)
                                  ├─► Query User model by normalized email
                                  ├─► bcrypt.compare(password, user.password)
                                  │
                                  ▼
[Sign JWT Token (30 Days)] ◄── [generateToken(user._id)]
            │
            ▼
[HTTP 200 OK: { token, user }]
            │
            ▼
[Frontend: HealthDataContext.jsx]
  ├─► localStorage.setItem('medguardian_jwt_token', token)
  ├─► localStorage.setItem('medguardian_user_profile', user)
  └─► Auto-attach `Authorization: Bearer <token>` to all subsequent requests
```

---

### B. Medical Report Ingestion & AI Diagnostic Flow
```
[User drops PDF/Image file on ReportUploadPage]
            │
            ▼
[POST /api/reports/upload] (Multipart/form-data)
            │
            ▼
[Multer memoryStorage] ──► Extracts file.buffer directly into memory
            │
            ▼
[SHA-256 Hash Calculation]
  │
  ├─► Query MongoDB Report collection for existing report with identical hash
  ├─► IF EXISTS: Return { duplicate: true, report: existingDoc }
  │              (Triggers Frontend Duplicate Warning Modal)
  │
  └─► IF NEW: Proceed to text extraction
            │
            ▼
[ocrService.js ──► pdf-parse] ──► Extracts raw ASCII/Unicode text
            │
            ▼
[aiService.js: Dual-Engine Processing Pipeline]
  │
  ├─► PRIMARY (If GEMINI_API_KEY is configured):
  │     Call Google Gemini API with clinical prompt and strict JSON schema.
  │
  └─► FALLBACK (If offline or Gemini unavailable):
        Call Universal Clinical Extractor (regex pattern matcher for 40+ biomarkers,
        blood pressure, vitals, and prescription formats).
            │
            ▼
[Database Persistence Transaction]
  ├─► Save Report document (file_name, file_hash, file_size, raw_text)
  ├─► Save ReportSummary document (clinical_summary, action_items)
  └─► Save ReportValue documents (testName, value, unit, referenceRange, status)
            │
            ▼
[HTTP 201 Created: { report, biomarkers, medications, summary }]
            │
            ▼
[Frontend: AIAnalysisPage.jsx displays formatted clinical findings]
```

---

### C. Medication Schedule & Refill Warning Flow
```
[User adds / confirms extracted medication]
            │
            ▼
[POST /api/medicines] ──► [medicinesController.js]
                                  │
                                  ├─► Validate dose, frequency, time slot
                                  └─► Mongoose: Save to Medicine collection
            │
            ▼
[Daily Schedule Display: MedicineReminderPage.jsx]
  ├─► Tracked list of daily doses (Morning, Afternoon, Evening, Night)
  ├─► Adherence Rate = (Logged Doses / Total Doses) * 100%
  └─► Refill Alert Threshold: If pillsRemaining <= 5, trigger Refill Warning Card
```

---

### D. Emergency Guidance & 1-Tap SOS Dispatch Flow
```
[User clicks 1-Tap SOS Button on EmergencySOSPage]
            │
            ▼
[Browser Geolocation API] ──► Acquires latitude & longitude coordinates
            │
            ▼
[POST /api/sos/trigger] ──► [sosController.js]
                                  │
                                  ├─► Log emergency event in SOSEvent collection
                                  ├─► Fetch user's registered EmergencyContacts
                                  │
                                  ▼
[sosAlertService.js ──► emailService.js]
  ├─► Build emergency dispatch payload with Google Maps direct link
  ├─► Dispatch Nodemailer alert to all primary emergency contact emails
  └─► Log dispatch confirmation to server audit trail
            │
            ▼
[HTTP 200 OK: { success: true, contactsNotified: N }]
            │
            ▼
[Frontend UI: Switches SOS button to ACTIVE state with cancellation option]
```

---

### E. Proximity Hospital Search Flow
```
[User provides Coordinates or City name]
            │
            ▼
[GET /api/hospitals/nearby?lat=...&lng=...&category=...&radiusKm=25]
            │
            ▼
[OpenStreetMap Nominatim / Overpass Engine]
  ├─► Query amenity=hospital, amenity=clinic, healthcare=doctor
  ├─► Compute Haversine distance from user coordinates
  └─► Filter and sort by proximity (km)
            │
            ▼
[Frontend: HospitalFinderPage.jsx]
  ├─► Render interactive Leaflet map canvas
  ├─► Plot user location marker (blue with pulse)
  └─► Plot facility markers (red for 24/7 ER, teal for clinics/labs)
```

---

## 3. Resilience & Cold-Start Strategy

1. **Memory Storage for Multer**:
   Many serverless and container hosts (Render, Vercel, Railway) operate on ephemeral filesystems where disk writes can fail or disappear after restarts. MedGuardian AI uses `multer.memoryStorage()`, keeping file buffers in memory for direct stream processing.

2. **Connection Guarding**:
   Before executing queries on Render cold starts, controller actions verify `mongoose.connection.readyState === 1`. This prevents Mongoose query buffering timeouts while the database socket handshakes.

3. **Dual API Mounting**:
   The backend mounts all controllers under both `/api/*` and root `/*` (e.g. `/api/auth` and `/auth`) ensuring resilience against misconfigured reverse proxies.
