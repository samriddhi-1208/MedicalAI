# 🧠 MedGuardian AI — Core Technical Concepts Guide

This guide explains the foundational and architectural concepts used throughout the MedGuardian AI application. For each concept, this document provides a simple definition, explains why it was chosen, documents exactly where it is implemented in the codebase, and provides a concrete code or schema example.

---

## Table of Contents
1. [Frontend Concepts](#1-frontend-concepts)
   - React, Components, Props, State, Context API, React Router, Responsive UI, Dark/Light Theme, Localization
2. [Backend & Architecture Concepts](#2-backend--architecture-concepts)
   - REST API, HTTP Methods, Authentication vs Authorization, JWT, Middleware, Controllers, Services, MVC Pattern, CRUD Operations, API Error Handling, CORS, Environment Variables
3. [Database & Storage Concepts](#3-database--storage-concepts)
   - MongoDB, Mongoose, Models, Multer, Cloud Database
4. [AI, Document Processing & Medical Logic](#4-ai-document-processing--medical-logic)
   - PDF Extraction, OCR, SHA-256 Hashing, Gemini API, Prompt Engineering, Rule-Based Systems, AI Hallucination Mitigations
5. [Maps, Geolocation & Deployment](#5-maps-geolocation--deployment)
   - Leaflet, OpenStreetMap, Reverse Geocoding, Deployment Architecture

---

## 1. Frontend Concepts

### 1.1 React
* **Simple Definition**: An open-source JavaScript library developed by Meta for building component-based user interfaces with a declarative approach and a virtual DOM.
* **Why It Is Used**: Allows building modular, reactive interfaces where UI elements automatically update when underlying data changes, avoiding manual DOM manipulation.
* **Where It Is Used in MedGuardian**: The entire frontend SPA (`client/src/`) is powered by React 18 using Vite as the build tool.
* **Example**:
  ```jsx
  // client/src/main.jsx
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import App from './App.jsx';

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  ```

### 1.2 Components
* **Simple Definition**: Independent, reusable pieces of UI code that accept inputs and return React elements describing what should appear on screen.
* **Why It Is Used**: Eliminates duplicated HTML/CSS, makes testing modular, and keeps large user interfaces maintainable.
* **Where It Is Used in MedGuardian**:
  - Pages: `DashboardPage.jsx`, `ReportsPage.jsx`, `MedicinesPage.jsx`, `EmergencyPage.jsx`, `HospitalFinderPage.jsx`
  - Reusable UI: `Navbar.jsx`, `Sidebar.jsx`, `StatCard.jsx`, `UploadModal.jsx`, `PageHeader.jsx`, `EmptyState.jsx`
* **Example**:
  ```jsx
  // client/src/components/shared/StatCard.jsx
  export default function StatCard({ title, value, subtitle, icon: Icon, badge }) {
    return (
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted">{title}</span>
          {Icon && <Icon className="w-5 h-5 text-primary" />}
        </div>
        <div className="text-2xl font-bold mt-2 text-foreground">{value}</div>
        {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
      </div>
    );
  }
  ```

### 1.3 Props (Properties)
* **Simple Definition**: Read-only arguments passed from a parent React component down to a child component to configure its content and behavior.
* **Why It Is Used**: Enables one-way data flow and makes child components versatile and reusable with different data.
* **Where It Is Used in MedGuardian**:
  - `StatCard.jsx` accepts `title`, `value`, `icon`, `trend`
  - `UploadModal.jsx` accepts `isOpen`, `onClose`, `onSuccess`
  - `BiomarkerTable.jsx` accepts `biomarkers` array
* **Example**:
  ```jsx
  <UploadModal 
    isOpen={showModal} 
    onClose={() => setShowModal(false)} 
    onUploadSuccess={handleReportUploaded} 
  />
  ```

### 1.4 State
* **Simple Definition**: An internal data structure held within a React component that can change over time based on user interactions or network events, causing the component to re-render.
* **Why It Is Used**: Enables dynamic UIs where form fields update, tabs switch, modals open/close, and asynchronous network data displays.
* **Where It Is Used in MedGuardian**: Managed via the `useState` hook across all pages (e.g., `medicines`, `reports`, `loading`, `error`, `activeTab`).
* **Example**:
  ```jsx
  // client/src/pages/MedicinesPage.jsx
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  ```

### 1.5 Context API
* **Simple Definition**: A built-in React mechanism for sharing global state and functions across the entire component tree without having to pass props through intermediate components ("prop drilling").
* **Why It Is Used**: Manages application-wide cross-cutting concerns like user authentication sessions and active UI themes.
* **Where It Is Used in MedGuardian**:
  - `client/src/context/AuthContext.jsx`: Manages `user`, `token`, `login()`, `logout()`, `updateProfile()`.
  - `client/src/context/ThemeContext.jsx`: Manages `theme` ('light' | 'dark') and `toggleTheme()`.
* **Example**:
  ```jsx
  // client/src/context/ThemeContext.jsx
  const ThemeContext = createContext();

  export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    const toggleTheme = () => {
      const nextTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    };

    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }
  ```

### 1.6 React Router
* **Simple Definition**: A standard client-side routing library for React that maps URL paths to specific page components without causing full browser page reloads.
* **Why It Is Used**: Delivers an instantaneous Single Page Application (SPA) experience while preserving browser history, back/forward buttons, and deep linking.
* **Where It Is Used in MedGuardian**: `client/src/routes/AppRoutes.jsx`, including `ProtectedRoute.jsx` and `OnboardingRoute.jsx`.
* **Example**:
  ```jsx
  // client/src/routes/AppRoutes.jsx
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<SignupPage />} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
    <Route path="/emergency" element={<ProtectedRoute><EmergencyPage /></ProtectedRoute>} />
  </Routes>
  ```

### 1.7 Responsive UI
* **Simple Definition**: A frontend design technique ensuring that layout, typography, and controls adjust fluidly to fit any screen size or orientation (mobile, tablet, desktop).
* **Why It Is Used**: Ensures patients and caregivers in semi-urban areas can use the application on low-cost smartphones as effectively as on widescreen desktop computers.
* **Where It Is Used in MedGuardian**: Tailwind CSS responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) across all layout and page files (`Navbar.jsx`, `Sidebar.jsx`, grid systems).
* **Example**:
  ```jsx
  // Responsive grid: 1 column on mobile, 2 on tablet, 4 on desktop
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard title="Active Prescriptions" value="4" />
    <StatCard title="Total Reports" value="12" />
  </div>
  ```

### 1.8 Dark / Light Theme
* **Simple Definition**: A user interface mechanism that toggles visual styles between a high-contrast dark color scheme and a clean light color scheme.
* **Why It Is Used**: Improves accessibility for users with visual sensitivity, reduces eye strain in low-light environments, and saves battery life on OLED screens.
* **Where It Is Used in MedGuardian**: Implemented using Tailwind CSS `.dark` class selector and custom CSS variables defined in `client/src/styles/globals.css` using the verified lavender/sage palette.
* **Example**:
  ```css
  /* client/src/styles/globals.css */
  :root {
    --primary: 91 100 143;   /* #5B648F Muted Lavender */
    --background: 248 249 252;
  }
  .dark {
    --primary: 170 180 232;  /* #AAB4E8 Light Lavender */
    --background: 22 24 33;
  }
  ```

### 1.9 Localization (i18n)
* **Simple Definition**: The practice of designing software to support multiple natural languages and cultural preferences so that text strings are swapped dynamically based on user selection.
* **Why It Is Used**: Critical for healthcare equity in Gujarat, where older patients frequently read Gujarati or Hindi rather than English.
* **Where It Is Used in MedGuardian**:
  - `client/src/utils/translations.js`: Comprehensive dictionary with strings for English (`en`), Hindi (`hi`), and Gujarati (`gu`).
  - `client/src/components/shared/Navbar.jsx`: Language switcher dropdown storing preference in `localStorage`.
* **Example**:
  ```javascript
  // client/src/utils/translations.js
  export const translations = {
    en: { dashboard: "Dashboard", uploadReport: "Upload Report", emergency: "Emergency SOS" },
    hi: { dashboard: "डैशबोर्ड", uploadReport: "रिपोर्ट अपलोड करें", emergency: "आपातकालीन एसओएस" },
    gu: { dashboard: "ડેશબોર્ડ", uploadReport: "રિપોર્ટ અપલોડ કરો", emergency: "ઇમરજન્સી એસઓએસ" }
  };
  ```

---

## 2. Backend & Architecture Concepts

### 2.1 REST API (Representational State Transfer)
* **Simple Definition**: An architectural style for networked web applications that uses standard HTTP methods and stateless communication to exchange structured JSON representations of resources.
* **Why It Is Used**: Decouples the React frontend from the Node.js backend, allowing each to be modified, tested, and scaled independently.
* **Where It Is Used in MedGuardian**: Express routes defined under `server/src/routes/` (`/api/auth`, `/api/reports`, `/api/medicines`, `/api/emergency`).
* **Example**:
  ```http
  GET /api/reports HTTP/1.1
  Host: localhost:5000
  Authorization: Bearer <jwt_token>
  Accept: application/json
  ```

### 2.2 HTTP Methods
* **Simple Definition**: Standard verb request headers that specify the desired action to be performed on an identifiable resource.
* **Why It Is Used**: Creates an intuitive, predictable contract following uniform web conventions.
* **Where It Is Used in MedGuardian**:
  - `GET`: Fetch profile, list reports, retrieve medicines (`reportsController.getReports`)
  - `POST`: User signup, login, upload report, add medication (`authController.login`)
  - `PUT`: Update medication schedule or user profile (`medicinesController.updateMedicine`)
  - `DELETE`: Remove medication or report (`medicinesController.deleteMedicine`)

### 2.3 Authentication vs. Authorization
* **Simple Definition**:
  - **Authentication (AuthN)**: Verifying *who you are* (identity verification via email and password).
  - **Authorization (AuthZ)**: Verifying *what you have permission to do* (access control to specific records).
* **Why It Is Used**: Ensures patients can prove their identity and strictly prevents one patient from reading or deleting another patient's medical history.
* **Where It Is Used in MedGuardian**:
  - AuthN: `authController.login` checks email and validates bcrypt password hash.
  - AuthZ: `authMiddleware.js` extracts user ID from token; controllers query database strictly using `{ _id: req.params.id, userId: req.user._id }`.
* **Example**:
  ```javascript
  // server/src/controllers/medicinesController.js - AuthZ in action
  const medicine = await Medicine.findOneAndDelete({ 
    _id: req.params.id, 
    userId: req.user._id // Prevents unauthorized deletion across users
  });
  if (!medicine) return res.status(404).json({ error: "Medicine not found or unauthorized" });
  ```

### 2.4 JWT (JSON Web Token)
* **Simple Definition**: A compact, URL-safe standard (RFC 7519) format for securely transmitting digitally signed JSON claims between parties.
* **Why It Is Used**: Enables stateless server authentication. The server does not need to store active sessions in database memory; it verifies the HMAC SHA-256 signature on incoming requests.
* **Where It Is Used in MedGuardian**: `server/src/utils/generateToken.js`, `server/src/middlewares/authMiddleware.js`, and `client/src/services/api.js`.
* **Example**:
  ```javascript
  // server/src/utils/generateToken.js
  const jwt = require('jsonwebtoken');

  const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  };
  ```

### 2.5 Middleware
* **Simple Definition**: A function in Express that executes in the request-response lifecycle between receiving an incoming request and sending the final response. It has access to `req`, `res`, and the `next` function.
* **Why It Is Used**: Handles reusable cross-cutting concerns like logging, authentication, request validation, and error handling without cluttering business logic.
* **Where It Is Used in MedGuardian**:
  - `server/src/middlewares/authMiddleware.js`: Validates bearer token.
  - `server/src/middlewares/errorHandler.js`: Intercepts unhandled errors.
  - `server/src/middlewares/uploadMiddleware.js`: Multer in-memory file handling.
* **Example**:
  ```javascript
  // server/src/middlewares/authMiddleware.js
  const protect = async (req, res, next) => {
    let token = req.headers.authorization?.startsWith('Bearer') 
      ? req.headers.authorization.split(' ')[1] 
      : null;

    if (!token) return res.status(401).json({ error: 'Not authorized, no token' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (err) {
      res.status(401).json({ error: 'Token invalid or expired' });
    }
  };
  ```

### 2.6 Controllers
* **Simple Definition**: Modules responsible for parsing incoming HTTP requests, extracting query parameters/payloads, delegating data operations to services, and returning formatted HTTP responses.
* **Why It Is Used**: Separates HTTP transport concerns (status codes, headers, cookie parsing) from underlying data processing.
* **Where It Is Used in MedGuardian**:
  - `server/src/controllers/authController.js`
  - `server/src/controllers/reportsController.js`
  - `server/src/controllers/medicinesController.js`
  - `server/src/controllers/emergencyController.js`
* **Example**:
  ```javascript
  // server/src/controllers/medicinesController.js
  exports.getMedicines = async (req, res) => {
    try {
      const medicines = await Medicine.find({ userId: req.user._id }).sort({ createdAt: -1 });
      res.json(medicines);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  ```

### 2.7 Services
* **Simple Definition**: Dedicated business logic modules that execute complex computational workflows, communicate with third-party APIs, or perform complex data transformations independent of the HTTP layer.
* **Why It Is Used**: Maximizes code reusability and testability; business logic can be tested without mocking HTTP request and response objects.
* **Where It Is Used in MedGuardian**:
  - `server/src/services/aiService.js`: Interacts with Google Gemini AI.
  - `server/src/services/emailService.js`: Configures and sends emergency alert emails.
  - `server/src/services/clinicalExtractor.js`: Deterministic fallback parser for clinical reports.
* **Example**:
  ```javascript
  // server/src/services/emailService.js
  const sendEmergencyAlert = async (toEmail, locationData, patientName) => {
    const mapsLink = `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`;
    return transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `🚨 EMERGENCY: SOS Triggered by ${patientName}`,
      html: `<p>${patientName} triggered an SOS.</p><p>Location: <a href="${mapsLink}">View on Google Maps</a></p>`
    });
  };
  ```

### 2.8 MVC (Model-View-Controller) Pattern
* **Simple Definition**: A software architectural pattern that divides an application into three interconnected components: **Model** (data and validation), **View** (user interface presentation), and **Controller** (flow control and logic).
* **Why It Is Used**: Establishes separation of concerns, keeping presentation code isolated from database interactions.
* **Where It Is Used in MedGuardian**:
  - **Model**: Mongoose schemas in `server/src/models/` (`User.js`, `Report.js`, `Medicine.js`).
  - **View**: React components in `client/src/` (`pages/`, `components/`).
  - **Controller**: Express handlers in `server/src/controllers/` connecting the two via REST.

### 2.9 CRUD Operations
* **Simple Definition**: The four basic functions of persistent storage: **C**reate, **R**ead, **U**pdate, and **D**elete.
* **Why It Is Used**: Forms the standard data manipulation baseline for managing health records and medication schedules.
* **Where It Is Used in MedGuardian**:
  - `Medicine` model: Create new medication (`POST /api/medicines`), Read user medications (`GET /api/medicines`), Update dosage status (`PUT /api/medicines/:id`), Delete medicine (`DELETE /api/medicines/:id`).
  - `Report` model: Create new report via file upload (`POST /api/reports`), Read reports list (`GET /api/reports`), Delete report (`DELETE /api/reports/:id`).

### 2.10 API Error Handling
* **Simple Definition**: Structured mechanisms to intercept, log, and return clear diagnostic status codes and JSON error responses when operations fail.
* **Why It Is Used**: Prevents server crashes, prevents leakage of sensitive database credentials or stack traces to malicious actors, and provides meaningful feedback to users.
* **Where It Is Used in MedGuardian**: `server/src/middlewares/errorHandler.js` intercepts unhandled exceptions across all Express routes.
* **Example**:
  ```javascript
  // server/src/middlewares/errorHandler.js
  const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
      error: err.message || 'Server Internal Error',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  };
  ```

### 2.11 CORS (Cross-Origin Resource Sharing)
* **Simple Definition**: A browser security protocol using HTTP headers to permit or restrict resources requested from a domain outside the domain from which the first resource was served.
* **Why It Is Used**: Permits the React frontend running on `http://localhost:5173` (or production frontend URL) to communicate securely with the backend API on `http://localhost:5000`.
* **Where It Is Used in MedGuardian**: `server/server.js` using the `cors` npm package.
* **Example**:
  ```javascript
  // server/server.js
  const cors = require('cors');
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }));
  ```

### 2.12 Environment Variables
* **Simple Definition**: Dynamic key-value pairs stored in the operating system environment or a `.env` configuration file outside the application source code.
* **Why It Is Used**: Keeps sensitive API keys, database connection strings, and cryptographic secrets safe from being committed to public version control (Git).
* **Where It Is Used in MedGuardian**: Loaded via `dotenv` in `server/server.js`. Required variables documented in `.env.example`: `PORT`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `EMAIL_USER`, `EMAIL_PASS`.

---

## 3. Database & Storage Concepts

### 3.1 MongoDB
* **Simple Definition**: A source-available, NoSQL document-oriented database that stores records as flexible, JSON-like BSON (Binary JSON) documents.
* **Why It Is Used**: Ideal for medical documents where biomarkers, lab values, and vitals vary widely across different blood tests, lipid panels, and imaging reports.
* **Where It Is Used in MedGuardian**: Houses the database collections (`users`, `reports`, `medicines`) hosted locally or on MongoDB Atlas cloud.

### 3.2 Mongoose
* **Simple Definition**: An Object Data Modeling (ODM) library for MongoDB and Node.js that provides schema validation, type casting, middleware hooks, and business logic methods.
* **Why It Is Used**: Enforces structural consistency and validation constraints on NoSQL data without sacrificing MongoDB's document flexibility.
* **Where It Is Used in MedGuardian**: `server/src/config/db.js` initializes connection; all models in `server/src/models/` utilize Mongoose schemas.
* **Example**:
  ```javascript
  // server/src/config/db.js
  const mongoose = require('mongoose');

  const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  };
  ```

### 3.3 Models & Schemas
* **Simple Definition**: A Schema defines the blueprint and shape of documents within a collection; a Model is a compiled constructor compiled from the schema that provides an interface to query and manipulate the collection.
* **Why It Is Used**: Validates required fields, enforces default values, and prevents malformed data from reaching the database.
* **Where It Is Used in MedGuardian**:
  - `server/src/models/User.js`: User credentials, medical baseline profile, emergency contacts.
  - `server/src/models/Report.js`: Extracted lab biomarkers, vitals, AI summary, SHA-256 file hash.
  - `server/src/models/Medicine.js`: Medication name, dosage, schedule, meal timing, pills remaining.
* **Example**:
  ```javascript
  // server/src/models/Medicine.js
  const medicineSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, default: 'Once daily' },
    timing: [String],
    withMeal: { type: Boolean, default: true },
    pillsRemaining: { type: Number, default: 30 }
  }, { timestamps: true });
  ```

### 3.4 Multer
* **Simple Definition**: A Node.js middleware for handling `multipart/form-data`, primarily used for uploading binary files.
* **Why It Is Used**: Parses incoming file streams and validates payload limits before handing file buffers to parsing services.
* **Where It Is Used in MedGuardian**: `server/src/middlewares/uploadMiddleware.js`, configured with `memoryStorage()` and a 15MB size ceiling to keep processing ephemeral.
* **Example**:
  ```javascript
  // server/src/middlewares/uploadMiddleware.js
  const multer = require('multer');

  const upload = multer({
    storage: multer.memoryStorage(), // In-memory buffer; no disk footprint
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB ceiling
    fileFilter: (req, file, cb) => {
      const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
      allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'));
    }
  });
  ```

---

## 4. AI, Document Processing & Medical Logic

### 4.1 PDF Extraction (`pdf-parse`)
* **Simple Definition**: An algorithmic library that parses PDF document streams and extracts the underlying textual contents into a continuous string buffer.
* **Why It Is Used**: Converts native digital PDF reports directly into raw text without requiring heavy optical image recognition.
* **Where It Is Used in MedGuardian**: `server/src/services/aiService.js` and `reportsController.js`.
* **Example**:
  ```javascript
  const pdfParse = require('pdf-parse');
  const data = await pdfParse(fileBuffer);
  const rawText = data.text; // Extracted plain text
  ```

### 4.2 OCR (Optical Character Recognition)
* **Simple Definition**: A computer vision technology that converts images of typed, handwritten, or printed text (such as scanned lab papers or phone photos) into machine-readable text.
* **Why It Is Used**: Enables extraction of medical data from smartphone photos and scanned physical lab slips commonly used in semi-urban clinic workflows.
* **Where It Is Used in MedGuardian**:
  - Direct multimodal image processing via Google Gemini 1.5 Flash (`inlineData` base64 image buffers).
  - Architecture prepared for offline Tesseract OCR fallback.

### 4.3 SHA-256 Hashing
* **Simple Definition**: A cryptographic hash function that produces a unique, fixed 256-bit (64-character hexadecimal) digital fingerprint for any arbitrary input buffer.
* **Why It Is Used**: Provides deterministic duplicate detection. If a patient uploads the exact same medical report twice, the system identifies the matching hash, preventing duplicate database entries and unnecessary Gemini API charges.
* **Where It Is Used in MedGuardian**: `server/src/controllers/reportsController.js`.
* **Example**:
  ```javascript
  const crypto = require('crypto');
  const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

  const existingReport = await Report.findOne({ userId: req.user._id, fileHash });
  if (existingReport) {
    return res.status(409).json({ error: 'Duplicate report: This document has already been analyzed.' });
  }
  ```

### 4.4 Gemini API (`@google/generative-ai`)
* **Simple Definition**: Google's multimodal generative AI platform providing state-of-the-art reasoning across text, code, and images.
* **Why It Is Used**: Employs `gemini-1.5-flash` for high-speed, cost-effective extraction of unstructured medical terminology into standardized JSON schemas.
* **Where It Is Used in MedGuardian**: `server/src/services/aiService.js`.
* **Example**:
  ```javascript
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent([prompt, filePart]);
  ```

### 4.5 Prompt Engineering
* **Simple Definition**: The practice of carefully structuring, constraining, and phrasing natural language instructions to guide a Large Language Model toward producing reliable, accurate, and properly formatted output.
* **Why It Is Used**: Enforces strict JSON output schemas, grounds the model in patient safety, and prevents medical speculation.
* **Where It Is Used in MedGuardian**: `server/src/services/aiService.js` clinical analysis system prompt.
* **Key Principles Applied**:
  - Enforces JSON output format (`responseMimeType: "application/json"`).
  - System persona: Objective clinical explainer, not an attending physician.
  - Strict instruction: Include standard reference ranges; never diagnose illness.

### 4.6 Rule-Based Systems
* **Simple Definition**: Deterministic, logic-driven systems that execute predefined "if-then" conditions based on strict programmatic rules rather than probabilistic machine learning models.
* **Why It Is Used**: Critical for clinical safety where non-deterministic AI hallucination cannot be tolerated (e.g., triage protocols, emergency dialers, refill thresholds).
* **Where It Is Used in MedGuardian**:
  - `server/src/services/clinicalExtractor.js`: Regex rules for biomarker extraction when offline.
  - Refill alert logic: If `pillsRemaining <= 5`, trigger low-stock warning.
  - Emergency dialing: Direct `tel:108` shortcut routing.

### 4.7 AI Hallucination & Mitigation Strategies
* **Simple Definition**: A phenomenon where an LLM generates plausible-sounding but factually incorrect or fabricated information not supported by the input context.
* **Why It Is Used / Mitigated**: In healthcare, hallucinations can mislead patients or cause medical harm.
* **Where & How Mitigated in MedGuardian**:
  1. **Strict Grounding**: Prompt commands the model: *"Extract ONLY values explicitly present in the provided report. Do not speculate or invent numbers."*
  2. **Biomarker Schema Validation**: Server inspects returned JSON and verifies numerical values against realistic ranges before database persistence.
  3. **Dual-Engine Fallback**: If Gemini output fails JSON parsing or generates anomalies, the system falls back to the deterministic regex extractor.

---

## 5. Maps, Geolocation & Deployment

### 5.1 Leaflet
* **Simple Definition**: An open-source JavaScript mapping library for mobile-friendly interactive maps.
* **Why It Is Used**: Lightweight, free, and does not require expensive Google Maps JavaScript API keys.
* **Where It Is Used in MedGuardian**: `client/src/pages/HospitalFinderPage.jsx` using `react-leaflet`.
* **Example**:
  ```jsx
  <MapContainer center={[userLat, userLng]} zoom={13} className="h-96 w-full rounded-xl">
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Marker position={[hospital.lat, hospital.lng]}>
      <Popup>{hospital.name}</Popup>
    </Marker>
  </MapContainer>
  ```

### 5.2 OpenStreetMap (OSM)
* **Simple Definition**: A free, editable, crowdsourced map database of the world maintained by a global community of mappers.
* **Why It Is Used**: Provides free map tiles and geospatial point-of-interest data for healthcare facilities without proprietary vendor lock-in.
* **Where It Is Used in MedGuardian**: Tile provider in `HospitalFinderPage.jsx` and reverse-geocoding source in `ProfilePage.jsx`.

### 5.3 Reverse Geocoding (Nominatim)
* **Simple Definition**: The process of converting geographic coordinates (latitude and longitude) into a human-readable street address, neighborhood, city, or postal code.
* **Why It Is Used**: Auto-fills the user's city and district in Gujarat when they tap "Locate Me" during profile setup or SOS dispatch.
* **Where It Is Used in MedGuardian**: `client/src/pages/ProfilePage.jsx` via OSM Nominatim API (`https://nominatim.openstreetmap.org/reverse`).

### 5.4 Deployment Architecture
* **Simple Definition**: The hosting infrastructure, deployment pipelines, and operational environment where software runs and serves end users.
* **Why It Is Used**: Delivers global accessibility, high availability, and SSL/HTTPS encryption.
* **Where It Is Used in MedGuardian**:
  - **Frontend**: Single Page Application (SPA) built via `vite build` into static assets, deployable on Vercel, Netlify, or AWS S3 + CloudFront.
  - **Backend**: Containerized Node.js/Express service hosted on Render, Railway, or AWS ECS.
  - **Database**: MongoDB Atlas cloud cluster with automated backups and network IP access control.
