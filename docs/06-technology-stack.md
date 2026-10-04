# 💻 MedGuardian AI — Technology Stack Specification

This document details every technology, library, runtime, and external service utilized across the MedGuardian AI application, accompanied by engineering justifications for each selection.

---

## 1. Frontend Technology Stack

| Technology | Version | Purpose in Application | Architectural Justification |
| :--- | :---: | :--- | :--- |
| **React** | `18.2.0` | UI Component Framework | Declarative component model, virtual DOM for rendering dynamic biomarker tables, robust Context API for state management. |
| **Vite** | `8.2.0` | Build Tool & Dev Server | Fast hot module replacement (HMR) and optimized Rolldown/ESBuild production bundles compiling in under 1 second. |
| **React Router** | `7.x` | Client-Side Routing | Declarative routing supporting nested layout routes (`/app/*`), protected route guards, and 404 fallbacks. |
| **Tailwind CSS** | `4.x` | Utility-First Styling | Rapid responsive styling paired with CSS custom properties for instant light/dark theme switching. |
| **Context API** | Native | State Management | Lightweight global state for auth, theme, and health data without the boilerplate of Redux or Zustand. |
| **Lucide React** | `^1.16` | Iconography | Lightweight, accessible SVG icons with consistent stroke weights. |
| **Recharts** | `^2.15` | Longitudinal Health Charts | Declarative SVG charting library for rendering biomarker progression timelines with smooth area fills and custom KaTeX tooltips. |
| **Leaflet** | `1.9.4` | Interactive Maps | Lightweight open-source mapping engine rendering OpenStreetMap tiles without costly proprietary API keys (e.g. Google Maps SDK). |
| **React Hot Toast**| `^2.6` | User Feedback Toasts | Non-intrusive micro-notifications for upload status, medication logging, and network errors. |

---

## 2. Backend Technology Stack

| Technology | Version | Purpose in Application | Architectural Justification |
| :--- | :---: | :--- | :--- |
| **Node.js** | `v18+` / `v20+` | Server Runtime Environment | Non-blocking, event-driven I/O model optimized for streaming file uploads and concurrent asynchronous API requests. |
| **Express.js** | `4.18.2` | Web Framework | Minimalist routing framework with robust middleware pipelines for CORS, JWT validation, and error handling. |
| **MongoDB Atlas**| Cloud | Primary NoSQL Database | Flexible schema-less document database well-suited for varied medical biomarker payloads and report formats. |
| **Mongoose** | `8.2.0` | Object Document Mapper (ODM)| Schema enforcement, model validation, query hooks, and relationship management between Users, Reports, and Medications. |
| **Multer** | `1.4.5` | Multipart Form Ingestion | Memory storage engine (`multer.memoryStorage()`) ensuring reliable buffer ingestion on ephemeral cloud containers (Render). |
| **pdf-parse** | `^1.1.1` | PDF Text Extractor | Fast Node.js library for extracting unformatted text streams directly from PDF buffers without external C++ binary dependencies. |
| **jsonwebtoken** | `^9.0.2`| Stateless Session Auth | Issues cryptographic HS256 signed bearer tokens carrying user identity claims valid for 30 days. |
| **bcryptjs** | `^2.4.3` | Password Hashing | One-way salted password hashing (10 salt rounds) preventing plaintext credential exposure. |
| **Nodemailer** | `^6.9.10`| SMTP Email Dispatcher | Transports emergency SOS alerts and system notifications to registered family contacts. |
| **CORS** | `^2.8.5` | Cross-Origin Policy | Configures cross-origin resource sharing headers for secure client-server communication. |

---

## 3. External Integrations & Services

### 1. Google Gemini AI Engine
* **Protocol**: HTTPS REST API (`generativelanguage.googleapis.com`).
* **Purpose**: Analyzes raw OCR text streams and outputs structured JSON containing clinical summaries, biomarker assessments, and medication instructions.
* **Resilience Strategy**: If the API key is unconfigured or the service is unreachable, the system automatically falls back to the deterministic Universal Clinical Extractor regex engine.

### 2. OpenStreetMap & Nominatim
* **Protocol**: HTTPS REST API / Tile CDN (`tile.openstreetmap.org`, `nominatim.openstreetmap.org`).
* **Purpose**: Provides map tiles, reverse geocoding for profile location auto-fills, and proximity queries for nearby hospitals and clinics.
* **Resilience Strategy**: Free, open-access GIS data with zero vendor lock-in or recurring billing dependencies.

### 3. Nodemailer SMTP Transporter
* **Protocol**: SMTP over TLS / SSL (Port 587 / 465).
* **Purpose**: Dispatches emergency SOS alerts with live Google Maps coordinate links to trusted emergency contacts.
