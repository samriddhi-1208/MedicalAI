# 🏛️ MedGuardian AI — System Architecture & Technical Specification

## Overview
**MedGuardian AI** is a full-stack, multi-lingual clinical health intelligence and emergency assistance platform. It allows users to upload medical laboratory reports (PDF/images), extract structured biomarkers, vitals, and medications using **Google Gemini 2.5 Flash AI**, track longitudinal health trends, manage daily medication schedules, discover nearby healthcare facilities via spatial geolocation, and broadcast 1-tap emergency SOS dispatches.

---

## High-Level System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|  React 18 + Vite SPA | Tailwind CSS | React Router v6 | Context API (State)      |
|  Services: authService, reportService, medicationService, emergencyService        |
+-----------------------------------------------------------------------------------+
                                         |
                                 REST API (JSON / JWT)
                                         |
+-----------------------------------------------------------------------------------+
|                                 SERVER LAYER                                      |
|  Node.js + Express REST API Server                                                |
|  Middlewares: Auth Middleware (JWT), Upload Middleware (Multer), Error Handler    |
|  Controllers: Auth, Reports, Medicines, SOS, Hospitals, Vitals                    |
|  Services: AI Extraction Service, OCR Service, SOS Dispatcher, Email Service      |
|  Validators: Auth & Report Validators                                             |
+-----------------------------------------------------------------------------------+
                  |                                      |
       External Integrations                       Database Layer
                  |                                      |
   +------------------------------+       +------------------------------+
   | Google Gemini 2.5 Flash API  |       | MongoDB Atlas (Cloud NoSQL)  |
   | OpenStreetMap Overpass API   |       | Mongoose ODM Data Models     |
   | OSM Nominatim Geocoding API  |       +------------------------------+
   +------------------------------+
```

---

## 🔑 Key Subsystems & Design Principles

### 1. Multi-Tenant User Isolation & Security
- **Authentication**: JWT stateless bearer tokens (`Authorization: Bearer <token>`).
- **Data Isolation**: Database queries enforce server-side user context (`user_id: req.user.id`).
- **Input Validation**: Client and server-side complexity rules for passwords and file formats.

### 2. Medical Document Extraction Pipeline
- **Buffer Ingestion**: Multer processes incoming PDF, PNG, JPG files into memory buffers.
- **Idempotent SHA-256 Hashing**: Prevents redundant processing of duplicate documents.
- **OCR & Parsing**: `pdf-parse` extracts raw document text.
- **Structured AI Mapping**: Passes extracted text to **Google Gemini 2.5 Flash AI** with strict JSON schemas.
- **Quality Gate**: Rejects non-medical or blank files with HTTP 422 to prevent dirty database writes.

### 3. Spatial Geolocation & Emergency Fallback
- **Spatial Searching**: OpenStreetMap Overpass API queries surrounding GPS radiuses (`around: 25000m`).
- **Timeout Protection**: `AbortController` 3.5s hard timeout falls back to a verified regional hospital dataset for zero empty states.
- **Helpline Integration**: Direct speed-dial to India's National 108 Emergency Ambulance Service.

### 4. Multi-Lingual Site-Wide Localization
- Native site-wide UI switching between **English (EN)**, **Hindi (HI)**, and **Gujarati (GU)**.
