# ⚠️ MedGuardian AI — Edge Cases & Failure Resilience

This document catalogues the edge cases, boundary conditions, and failure scenarios handled by MedGuardian AI, along with the implemented mitigation mechanisms.

---

## 1. Medical Report Upload & Parsing Edge Cases

### 1.1 Non-Medical Document Uploaded
* **Scenario**: A user uploads an invoice, electric bill, or grocery receipt instead of a medical lab report.
* **Mitigation**:
  * During extraction, the parser evaluates whether recognized medical biomarkers, test results, or medications are present.
  * If zero medical entities are detected and the text does not contain clinical tokens, the system flags the report as unprocessable:
    > *"Medical report could not be processed. We couldn't extract reliable medical information from this document. The report was not saved. Please upload a clearer medical report."*
  * Prevents garbage data from polluting patient records.

### 1.2 Duplicate Report Upload
* **Scenario**: A user accidentally uploads the same PDF multiple times.
* **Mitigation**:
  * `reportsController.js` calculates the SHA-256 hash of the incoming buffer.
  * If an existing report matches the hash for that user, the API responds with `{ duplicate: true }`.
  * The frontend opens the **Duplicate Report Warning Modal**, preventing duplicate database records while offering a direct link to view the existing analysis.

### 1.3 Scanned Image PDF Without Selectable Text
* **Scenario**: A user uploads a scanned photocopy of a report where `pdf-parse` returns an empty string or fewer than 20 characters.
* **Mitigation**:
  * The OCR engine checks text length (`text.trim().length < 20`).
  * If standard text stream extraction fails, the backend falls back to buffer inspection and surfaces a clear message prompting the user to provide a higher-resolution scan or native PDF.

### 1.4 Oversized File ($>15\text{MB}$)
* **Scenario**: A user uploads a heavy multi-page scan exceeding 15MB.
* **Mitigation**:
  * Client-side validation catches the file immediately (`file.size > 15 * 1024 * 1024`) and displays a toast error before network transfer.
  * Server-side Multer middleware enforces `limits: { fileSize: 15 * 1024 * 1024 }` as an authoritative backstop.

---

## 2. AI Processing & Hallucination Mitigation

### 2.1 Gemini API Outage / Missing API Key
* **Scenario**: `GEMINI_API_KEY` is not provided in environment variables, or Google's API returns a 503/429 rate-limit error.
* **Mitigation**:
  * The application does **not crash**.
  * `aiService.js` catches the failure and delegates to the **Universal Clinical Extractor**.
  * The fallback regex engine deterministically extracts 40+ common lab tests (HbA1c, Hemoglobin, Fasting Sugar, WBC, Platelets, Creatinine, Lipid profiles) and generates a structured clinical overview.

### 2.2 Hallucination Prevention
* **Scenario**: An LLM invents diagnoses or non-existent health risks.
* **Mitigation**:
  * Gemini is prompted with strict constraints: output **raw JSON only**, with summary strictly derived from extracted findings.
  * The UI presents findings under "Plain-Language Summary" with an explicit disclaimer:
    > *"MedGuardian AI provides educational explanations. Never use AI output as a confirmed medical diagnosis without consulting a licensed physician."*
  * A **"View Original Report Text"** modal allows users and doctors to inspect raw OCR text to verify values against source data.

---

## 3. Medication & Refill Edge Cases

### 3.1 New User with Zero Scheduled Medications
* **Scenario**: A user visits the Medicines page for the first time.
* **Problem**: A naive adherence formula (`taken / total * 100`) produces `0 / 0 = NaN` or misleads the user with "0% Adherence".
* **Mitigation**:
  * `MedicineReminderPage.jsx` checks `totalCount > 0`.
  * If 0 medications exist, the adherence percentage card shows *"No medications scheduled today"* instead of `0%`, and renders a helpful empty state with an "Add Medicine" button.

### 3.2 Low Supply Refill Threshold
* **Scenario**: A patient runs dangerously low on prescription medication.
* **Mitigation**:
  * The application computes remaining doses dynamically.
  * Any medication with $\le 5$ pills remaining triggers a warning card with amber border:
    > *"⚠️ Metformin: Only 3 doses remaining in supply."*

---

## 4. Emergency SOS & Hospital Finder Edge Cases

### 4.1 Geolocation Permission Denied
* **Scenario**: A user blocks browser location access or uses a browser without GPS.
* **Mitigation**:
  * The UI gracefully captures the error and displays: *"Location access denied. Enable GPS permission or enter location manually."*
  * Provides an **"Enter Location Manually"** button allowing the user to search by city name (e.g. "Vadodara") or pincode via OpenStreetMap Nominatim.

### 4.2 Zero Nearby Hospitals within Small Radius
* **Scenario**: A user in a rural or semi-urban area searches within a 5km radius where no hospitals exist.
* **Mitigation**:
  * `HospitalFinderPage.jsx` catches the empty list and automatically expands the search radius progressively (to 15km, 25km, and 50km).
  * Prominently displays the 24/7 National Ambulance Hotline (108) so users always have immediate emergency access regardless of map query results.

### 4.3 SOS Stand-Down / Accidental Trigger
* **Scenario**: A user accidentally clicks the SOS button.
* **Mitigation**:
  * The SOS button enters an active state with an instant **"Cancel Alert"** button.
  * Clicking cancel calls `POST /api/sos/cancel`, marking the event as `CANCELLED` and returning the system to standby.

---

## 5. Hosting & Cold-Start Edge Cases

### 5.1 Render Free-Tier Container Cold Starts
* **Scenario**: Render spins down inactive containers after 15 minutes. The initial user request can take 30–50 seconds, risking Mongoose connection buffering timeouts.
* **Mitigation**:
  * `LoginPage.jsx` issues a background warmup fetch to `/health` on component mount and on input focus.
  * `authController.js` tests `mongoose.connection.readyState === 1` before querying to prevent query buffering drops during database socket handshakes.

---

## 6. Two-Factor Authentication (2FA) Edge Cases

### 6.1 Expired OTP Code ($>5$ Minutes)
* **Scenario**: A user opens their email several minutes after requesting an OTP and enters the expired code.
* **Mitigation**:
  * The backend verifies `Date.now() > new Date(otp_expires_at).getTime()`.
  * If expired, the server purges the OTP from memory and MongoDB, returning `400 Bad Request` with `{ error: "Verification code has expired. Please request a new code." }`.
  * The frontend displays an alert and guides the user to click "Resend Code".

### 6.2 Brute-Force Password Guessing on 6-Digit OTP
* **Scenario**: An attacker attempts to iterate through 6-digit combinations (`000000` to `999999`).
* **Mitigation**:
  * A strict ceiling of **5 attempts** is enforced per generated code.
  * Each incorrect attempt decrements the remaining attempts counter and returns `400 Bad Request` with `{ attemptsRemaining: N }`.
  * On the 5th failed attempt, the server permanently invalidates the active OTP (`otp_hash = null`, `otp_expires_at = null`) and responds with `429 Too Many Requests` lockout. The attacker cannot make further guesses without authenticating primary credentials again.

### 6.3 Rapid / Spam Clicks on "Resend Code"
* **Scenario**: A user clicks the "Resend Code" button repeatedly due to impatience or network latency.
* **Mitigation**:
  * Client-side: The resend button is disabled and replaced with a dynamic 60-second countdown timer (`Resend in 45s`).
  * Server-side: `resendOtp` inspects `otp_last_sent_at`. If fewer than 60 seconds have elapsed, it responds with `429 Too Many Requests` and `{ cooldownSeconds: remaining }`.

### 6.4 Delayed Email Arrival / Entering Previous Code After Resend
* **Scenario**: A user requests an initial OTP, doesn't see it immediately, clicks "Resend Code", and then receives the first email and enters that code.
* **Mitigation**:
  * Requesting a resend unconditionally invalidates and replaces the previous OTP.
  * Attempting to submit the older code fails with `400 Bad Request`, preventing stale code race conditions.

### 6.5 Replay Attacks with Already-Verified OTP
* **Scenario**: A malicious actor intercepts a previously submitted OTP and attempts to reuse it.
* **Mitigation**:
  * Upon successful verification, `otp_hash` and `otp_expires_at` are immediately set to `null` before issuing the JWT.
  * Any subsequent submission of that code is rejected with `400 Bad Request` ("No active verification code found").

### 6.6 Emergency SOS Trigger by Authenticated Patient
* **Scenario**: A patient experiencing a sudden medical crisis navigates to Emergency SOS.
* **Mitigation**:
  * Emergency SOS dispatch (`POST /api/sos/trigger`) relies on the user's active session token. It **never prompts for a secondary OTP challenge**.
  * The National Ambulance dialer (`tel:108`) operates natively via the mobile dialer protocol, guaranteeing immediate dispatch without authentication overhead.

