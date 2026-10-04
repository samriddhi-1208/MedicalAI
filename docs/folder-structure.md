# 📁 MedGuardian AI — Repository Directory & Folder Structure

```
MedicalAI/
├── docs/                             # System Documentation
│   ├── api-documentation.md          # Complete REST API Specification
│   ├── architecture.md               # System Architecture & Technical Specifications
│   └── folder-structure.md           # Folder Structure Documentation (This file)
├── public/                           # Static Web Assets (Favicons, Icons)
├── src/                              # Frontend React 18 Application Root
│   ├── assets/                       # Images & Graphic Assets
│   ├── components/                   # React UI Components
│   │   ├── shared/                   # Shared Layout & Route Guard Components
│   │   │   ├── AppLayout.jsx         # Main Dashboard Workspace Shell Layout
│   │   │   ├── Header.jsx            # Top Navigation Header with Language & Notifications
│   │   │   ├── Sidebar.jsx           # Collapsible Desktop Navigation Sidebar
│   │   │   ├── Navbar.jsx            # Public Marketing Navigation Bar
│   │   │   ├── Footer.jsx            # Public Footer Component
│   │   │   ├── MobileNav.jsx         # Mobile Navigation Drawer
│   │   │   ├── MobileBottomNav.jsx   # Mobile Sticky Bottom Action Bar
│   │   │   ├── ProtectedRoute.jsx    # Auth Guard Route Wrapper
│   │   │   └── OnboardingRoute.jsx   # Onboarding Guard Route Wrapper
│   │   └── ui/                       # Reusable UI Primitives
│   │       ├── AIInsightCard.jsx     # AI Summary & Advice Highlight Card
│   │       ├── Badge.jsx             # Status & Category Pill Badges
│   │       ├── Button.jsx            # Accessible Touch-Target Button Component
│   │       ├── Card.jsx              # Surface Container Card Component
│   │       ├── HealthMetricCard.jsx  # Vitals & Lab Biomarker Metric Card
│   │       ├── MedicationCard.jsx    # Medication Item Card with Action Toggles
│   │       ├── Modal.jsx             # Accessible Modal Dialog Component
│   │       ├── NotificationDropdown.jsx # Notifications Menu Dropdown
│   │       ├── ReportCard.jsx        # Diagnostic Report File Summary Card
│   │       └── SkeletonLoader.jsx    # Loading Skeleton Placeholders
│   ├── constants/                    # Frontend System Constants
│   │   ├── apiEndpoints.js           # REST Route API Endpoint Registry
│   │   └── constants.js              # Languages, Defaults, and App Config
│   ├── context/                      # React Context Global State Providers
│   │   ├── HealthDataContext.jsx     # Core Application Health State & Auth Provider
│   │   └── ThemeContext.jsx          # UI Theme Provider
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuth.js                # Custom Hook for Authentication State
│   │   ├── useHealthData.js          # Custom Hook for Health Data Context
│   │   └── useLanguage.js            # Custom Hook for Multi-Lingual Translation
│   ├── pages/                        # Page Views
│   │   ├── AIAnalysisPage.jsx        # Extracted Biomarkers & Clinical Analysis View
│   │   ├── DashboardPage.jsx         # Patient Home Workspace Overview Page
│   │   ├── EmergencySOSPage.jsx      # 1-Tap SOS Emergency Center View
│   │   ├── ForgotPasswordPage.jsx    # Password Reset Page
│   │   ├── HealthTimelinePage.jsx    # Longitudinal Health Trends View
│   │   ├── HospitalFinderPage.jsx    # 24/7 Spatial Geolocation Hospital Locator View
│   │   ├── LandingPage.jsx           # Public Marketing Landing Page
│   │   ├── LoginPage.jsx             # Patient Workspace Sign In View
│   │   ├── MedicineReminderPage.jsx  # Medication Manager & Scheduler View
│   │   ├── NotFoundPage.jsx          # 404 Route Fallback View
│   │   ├── OnboardingPage.jsx        # Patient Baseline Setup Page
│   │   ├── ProfilePage.jsx           # Patient Health Profile Settings Page
│   │   ├── ReportUploadPage.jsx      # Medical PDF/Image Drag & Drop Upload View
│   │   ├── SettingsPage.jsx          # Application Settings & Contact Manager View
│   │   └── SignupPage.jsx            # Account Registration Page
│   ├── routes/                       # Application Router
│   │   └── AppRoutes.jsx             # Centralized React Router Configuration
│   ├── services/                     # Frontend API HTTP Client Services
│   │   ├── api.js                    # Base Fetch HTTP Client
│   │   ├── authService.js            # Authentication Service Methods
│   │   ├── emergencyService.js       # Emergency SOS & Spatial Geolocation Service
│   │   ├── healthService.js          # Vitals & Trends Service Methods
│   │   ├── medicationService.js      # Medication Management Service Methods
│   │   └── reportService.js          # Report Upload & Extraction Service Methods
│   ├── styles/                       # CSS Stylesheets
│   │   ├── App.css                   # Custom Utility Styles
│   │   └── index.css                 # Tailwind CSS Configuration & Global Reset
│   ├── utils/                        # Reusable Helper Utilities
│   │   ├── clinicalMatcher.js        # Biomarker Reference Range Matcher
│   │   ├── formatters.js             # Date, Number, & Display Formatters
│   │   ├── reportParser.js           # Client Medical Report Parser & Normalizer
│   │   └── translations.js           # Multi-Lingual Translation Dictionary (EN/HI/GU)
│   ├── App.jsx                       # Top-Level Root Application Component
│   └── main.jsx                      # Vite Application Entry Point
│
├── server/                           # Backend Express REST Application Root
│   ├── config/                       # (Root Config Files)
│   ├── data/                         # Local Seed Data Fallback Store
│   │   └── medguardian_db.json
│   ├── src/                          # Server Source Directory
│   │   ├── config/                   # Database & Environment Config
│   │   │   ├── db.js                 # Mongoose Connection Setup
│   │   │   └── index.js              # Application Config Exports
│   │   ├── constants/                # System Constants & Status Codes
│   │   │   └── index.js
│   │   ├── controllers/              # REST Controller HTTP Request Handlers
│   │   │   ├── authController.js     # Auth, Signup, Login & Profile Handler
│   │   │   ├── hospitalsController.js # Spatial Hospital Search Handler
│   │   │   ├── medicinesController.js # Medication Tracker Handler
│   │   │   ├── reportsController.js  # Report Upload, Deduplication & Parse Handler
│   │   │   ├── sosController.js      # Emergency SOS Dispatch Handler
│   │   │   └── vitalsController.js   # Health Vitals & Trends Handler
│   │   ├── docs/                     # OpenAPI/Swagger Specifications
│   │   │   └── swaggerDocs.js
│   │   ├── middlewares/              # Express Middlewares
│   │   │   ├── authMiddleware.js     # JWT Bearer Token Middleware
│   │   │   ├── errorHandler.js       # Global Error Handler Middleware
│   │   │   └── uploadMiddleware.js   # Multer File Upload Middleware
│   │   ├── models/                   # Mongoose Database Schemas
│   │   │   ├── EmergencyContact.js
│   │   │   ├── Medicine.js
│   │   │   ├── MedicineLog.js
│   │   │   ├── Report.js
│   │   │   ├── ReportSummary.js
│   │   │   ├── ReportValue.js
│   │   │   ├── SOSEvent.js
│   │   │   └── User.js
│   │   ├── routes/                   # Express Router Handlers
│   │   │   ├── authRoutes.js
│   │   │   ├── hospitalsRoutes.js
│   │   │   ├── medicinesRoutes.js
│   │   │   ├── reportsRoutes.js
│   │   │   ├── sosRoutes.js
│   │   │   └── vitalsRoutes.js
│   │   ├── seed/                     # Initial Seeding Utility
│   │   │   └── seedData.js
│   │   ├── services/                 # Server Business Logic Services
│   │   │   ├── aiService.js          # Google Gemini 2.5 Flash AI Engine
│   │   │   ├── emailService.js       # Nodemailer Email Notification Service
│   │   │   ├── ocrService.js         # PDF Parsing & Extraction Engine
│   │   │   └── sosAlertService.js    # SOS Alert Dispatcher Service
│   │   ├── uploads/                  # Upload Directory Placeholder (.gitkeep)
│   │   ├── utils/                    # Server Utility Helpers
│   │   │   └── helpers.js            # Haversine Distance & Formatters
│   │   ├── validators/               # Input Validation Logic
│   │   │   ├── authValidator.js      # Password Complexity & Signup Validation
│   │   │   └── reportValidator.js    # Upload Buffer & Payload Validation
│   │   ├── app.js                    # Express Application Setup
│   │   └── index.js                  # Server Port Binding & Launch Entry
│   ├── .env.example                  # Server Environment Configuration Template
│   ├── package.json                  # Server Package Configuration
│   └── server.js                     # Root Server Entry Point
│
├── .env.example                      # Root Client Environment Template
├── index.html                        # HTML Web Page Entry Point
├── package.json                      # Root Package Configuration
├── README.md                         # Project Overview & Architecture Guide
├── tailwind.config.js                # Tailwind CSS Configuration
└── vite.config.js                    # Vite Build Tool Configuration
```
