# 🧪 MedGuardian AI — Testing & Verification Strategy

This document outlines the testing methodologies, quality assurance procedures, and automated verification checks implemented for MedGuardian AI.

---

## 1. Testing Philosophy & Clinical Data Safety

> **Core Principle**: Real patient data is **never** used in testing environments. All verification relies on synthetic laboratory values and test fixtures.

* **No Real Emergency Dispatches**: During automated and manual testing, SOS triggers verify payload packaging and mock Nodemailer transports without sending emergency alerts to real phone numbers or 108 emergency dispatch centers.
* **Deterministic Test Inputs**: Synthetic blood reports (CBC, Lipid profiles, Diabetic panels) are used to test biomarker ranges, units, and status determinations.

---

## 2. Verification Levels & Methodologies

### 2.1 Static Analysis & Production Compilation
The primary gate for deployment is Vite's production bundling engine and Node's syntax compiler:

* **Frontend Build Command**:
  ```bash
  npm run build
  ```
  * **Scope**: Transforms 2,425+ modules via Vite Rolldown/ESBuild.
  * **Checks**: TypeScript/JSX syntax, import resolutions, CSS variable compilation, tree-shaking, and minification.
  * **Target**: 0 compilation errors, build time under 1.5 seconds.

* **Backend Syntax Audit**:
  ```bash
  node -c server.js && node -c src/index.js && node -c src/app.js
  ```
  * **Scope**: Validates CommonJS require linkages, route mappings, and controller exports.

---

### 2.2 Manual Functional Verification Workflows

The following manual test matrix validates end-to-end functionality across core user journeys:

| Test ID | Workflow / Journey | Test Steps | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **TC-01** | User Registration & Complexity | Enter invalid password (<8 chars or no symbol); then enter compliant password. | Displays real-time checklist errors until all 5 criteria are met; successful submit creates user. |
| **TC-02** | User Authentication & JWT | Submit valid credentials on `/login`. | Receives 200 OK with token; redirects to `/app/dashboard`; token stored in `localStorage`. |
| **TC-03** | Route Guarding | Attempt direct navigation to `/app/dashboard` without token. | `ProtectedRoute.jsx` intercepts and redirects immediately to `/login`. |
| **TC-04** | Onboarding Flow | Log in with user having `profile_completed: false`. | `OnboardingRoute.jsx` redirects to `/complete-profile`; completes 2-step setup. |
| **TC-05** | Report Upload & SHA-256 | Drop sample lab PDF on `/app/upload`. | 5-step progress stepper displays status; parses biomarkers; redirects to `/app/analysis`. |
| **TC-06** | Duplicate Detection | Upload the exact same PDF a second time. | Opens Duplicate Warning Modal; prevents duplicate DB entry; offers link to existing report. |
| **TC-07** | Non-Medical Document Reject | Upload an invoice or text file without medical entities. | Parser detects lack of medical tokens; rejects upload with friendly prompt to upload lab report. |
| **TC-08** | Medication Schedule & Logging | Add "Metformin 500mg"; click "Mark as Taken". | Card transitions to "Logged"; adherence percentage recalculates; status saved to DB. |
| **TC-09** | Refill Warning Threshold | Set pill count to 4; view medication card. | Displays amber refill alert: "⚠️ Only 4 doses remaining in supply." |
| **TC-10** | 1-Tap SOS Trigger | Click SOS button on `/app/sos`. | Acquires GPS coordinates; packages alert payload; shows "ACTIVE" with cancellation button. |
| **TC-11** | Hospital Map Proximity | Allow geolocation or enter "Vadodara"; select "Cardiologist". | Leaflet map centers on location; plots nearby cardiac facilities sorted by distance. |
| **TC-12** | Trilingual Switching | Toggle EN ➔ HI ➔ GU in top header. | All navigation labels, buttons, and headers update instantly without reload. |
| **TC-13** | Dark Mode Persistence | Toggle theme to Dark; refresh the browser. | Root `<html>` retains `.dark` class; canvas remains `#12141D`; toggle state persists. |

---

## 3. Responsive & Accessibility Testing Matrix

Interactive components are tested across three standard viewports:

| Viewport | Target Resolution | Key Verification Focus |
| :--- | :---: | :--- |
| **Desktop** | $1440 \times 900\text{px}$ | Collapsible sidebar (`w-64` vs `w-20`), multi-column grids, 2-column report analysis. |
| **Tablet** | $768 \times 1024\text{px}$ | Responsive navigation drawer, 2-column metric cards, responsive Leaflet map container. |
| **Mobile** | $375 \times 812\text{px}$ | Persistent 5-button bottom nav (`safe-area-bottom`), `.unit-input-group` alignment, minimum 42px touch targets. |

### Contrast & Accessibility Verification:
* Verified readable contrast on all light mode surfaces (`#1E202B` on `#F8F9FA` / `#FFFFFF` yields $\ge 12:1$ contrast ratio).
* Verified readable contrast on dark mode surfaces (`#F1F3F9` on `#12141D` / `#1C1F2E` yields $\ge 14:1$ contrast ratio).
* Focus indicators: Tested `focus-visible` styling (`outline: none; box-shadow: 0 0 0 2px var(--color-primary)`).
