# 🏥 MedGuardian AI — Clinical Health Intelligence & Emergency Portal

**Live Web Application**: [https://medical-ai-tan.vercel.app/](https://medical-ai-tan.vercel.app/)  
**Live Backend API Engine**: `https://medicalai-backend-5ycw.onrender.com/api`

---

## 🌟 Architecture & Highlights

**MedGuardian AI** is a modular, patient-centric AI health intelligence portal built with **React 18, Vite 8, Node.js, Express, MongoDB Atlas, and Google Gemini 2.5 Flash AI**.

### Core Functionalities
1. **Automated AI Report Parsing**: Extracts diagnostic lab biomarkers, reference ranges, vitals, and prescribed medications from PDF/image lab reports.
2. **Deduplication & Quality Gate**: SHA-256 file hashing prevents duplicate uploads; documents with zero medical parameters are rejected (`HTTP 422`).
3. **Longitudinal Health Trends**: Chronological trend charts tracking biomarker progressions over time using actual report dates.
4. **24/7 Spatial Hospital Locator**: Geolocation-based hospital finder via OpenStreetMap Overpass API with `AbortController` 3.5s timeout resilience and regional fallback caching.
5. **1-Tap Emergency SOS**: Emergency SOS dispatch broadcasting with live GPS tracking and 1-tap cancellation toggle.
6. **Multi-Lingual Engine**: Instant site-wide UI switching between English (EN), Hindi (HI), and Gujarati (GU).

---

## 📁 Repository Structure Overview

```
MedicalAI/
├── docs/                             # System Documentation (Architecture, Structure, API)
├── src/                              # Frontend React 18 Application Root
│   ├── components/
│   │   ├── shared/                   # Shared Layouts (Header, Sidebar, AppLayout, Route Guards)
│   │   └── ui/                       # Reusable UI Primitives (Button, Card, Modal, Badge, Cards)
│   ├── constants/                    # API Endpoints & App Constants
│   ├── context/                      # React Context Providers (HealthDataContext, ThemeContext)
│   ├── hooks/                        # Custom React Hooks (useAuth, useHealthData, useLanguage)
│   ├── pages/                        # Page Views (Dashboard, Upload, Analysis, Trends, SOS, etc.)
│   ├── routes/                       # AppRoutes Centralized Configuration
│   ├── services/                     # Frontend API HTTP Client Services
│   ├── styles/                       # CSS Stylesheets
│   └── utils/                        # Formatters, Parser, Translation Dictionary
├── server/                           # Backend Node.js Express REST Application Root
│   ├── src/
│   │   ├── config/                   # Mongoose Database Setup
│   │   ├── constants/                # Server Constants & Status Codes
│   │   ├── controllers/              # Express Controller Request Handlers
│   │   ├── middlewares/              # JWT Auth, Upload, Error Middlewares
│   │   ├── models/                   # Mongoose Database Models
│   │   ├── routes/                   # Express Routers
│   │   ├── services/                 # AI Service, OCR, SOS Alert, Email Service
│   │   ├── utils/                    # Server Helpers (Haversine distance)
│   │   └── validators/               # Input Validation Helpers
│   └── server.js                     # Root Server Entry Point
```

---

## 🚀 Quick Start Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Frontend Setup
```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Build for production
npm run build
```

### Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start backend server
npm start
```

---

## 📄 Documentation
For detailed system documentation, check out:
- [System Architecture Specification](docs/architecture.md)
- [Folder & Directory Structure Guide](docs/folder-structure.md)
- [REST API Reference Guide](docs/api-documentation.md)
