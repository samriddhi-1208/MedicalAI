# 📡 MedGuardian AI — REST API Documentation

This document specifies all implemented HTTP endpoints on the MedGuardian AI backend server.

* **Base URL (Local)**: `http://localhost:5000/api`
* **Base URL (Production)**: `https://medicalai-backend-5ycw.onrender.com/api`
* **Authentication**: Bearer Token via header: `Authorization: Bearer <jwt_token>`

---

## 1. System Health Check

### `GET /health` or `GET /api/health`
Returns server heartbeat and system timestamp.
* **Auth Required**: No
* **Response `200 OK`**:
```json
{
  "status": "online",
  "system": "MedGuardian AI REST Engine",
  "timestamp": "2026-10-04T15:00:00.000Z"
}
```

---

## 2. Authentication & Profile Endpoints

### `POST /api/auth/signup` (Alias: `POST /api/auth/register`)
Creates a new patient account and returns a JWT token.
* **Auth Required**: No
* **Request Body**:
```json
{
  "name": "Alex Johnson",
  "email": "alex.johnson@example.com",
  "password": "SecurePassword123!"
}
```
* **Response `201 Created`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6701a2b3c4d5e6f7a8b9c0d1",
    "name": "Alex Johnson",
    "email": "alex.johnson@example.com",
    "profile_completed": false
  }
}
```
* **Response `400 Bad Request`**:
```json
{
  "error": "User with this email already exists."
}
```

---

### `POST /api/auth/login`
Authenticates user credentials and triggers the Two-Factor Authentication (2FA) challenge. **No JWT is issued at this stage.**
* **Auth Required**: No
* **Request Body**:
```json
{
  "email": "alex.johnson@example.com",
  "password": "SecurePassword123!"
}
```
* **Response `200 OK` (2FA Challenge Issued)**:
```json
{
  "twoFactorRequired": true,
  "message": "A 6-digit verification code has been sent to your email address.",
  "email": "alex.johnson@example.com",
  "cooldownSeconds": 60
}
```
* **Response `401 Unauthorized`**:
```json
{
  "error": "Incorrect password. Please check your credentials and try again."
}
```

---

### `POST /api/auth/verify-otp` (Alias: `POST /api/auth/verify-2fa`)
Verifies the 6-digit OTP sent to the user's email and issues the final JWT session token.
* **Auth Required**: No
* **Request Body**:
```json
{
  "email": "alex.johnson@example.com",
  "otp": "482915"
}
```
* **Response `200 OK` (JWT Session Issued)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6701a2b3c4d5e6f7a8b9c0d1",
    "name": "Alex Johnson",
    "email": "alex.johnson@example.com",
    "gender": "Female",
    "blood_group": "O+",
    "profile_completed": true
  }
}
```
* **Response `400 Bad Request` (Invalid Code)**:
```json
{
  "error": "Invalid verification code. 4 attempts remaining.",
  "attemptsRemaining": 4
}
```
* **Response `400 Bad Request` (Expired Code)**:
```json
{
  "error": "Verification code has expired. Please request a new code."
}
```
* **Response `429 Too Many Requests` (Lockout)**:
```json
{
  "error": "Maximum verification attempts exceeded. Please sign in again to request a new code."
}
```

---

### `POST /api/auth/resend-otp` (Alias: `POST /api/auth/resend-2fa`)
Invalidates the existing verification code and dispatches a fresh 6-digit OTP. Subject to a 60-second cooldown.
* **Auth Required**: No
* **Request Body**:
```json
{
  "email": "alex.johnson@example.com"
}
```
* **Response `200 OK`**:
```json
{
  "success": true,
  "message": "A new verification code has been sent to your email address.",
  "cooldownSeconds": 60
}
```
* **Response `429 Too Many Requests` (Cooldown Active)**:
```json
{
  "error": "Please wait 45 seconds before requesting a new code.",
  "cooldownSeconds": 45
}
```

---

### `GET /api/auth/me` (Alias: `GET /api/auth/profile`)
Retrieves the authenticated user's profile and medical baseline.
* **Auth Required**: Yes (`Bearer <token>`)
* **Response `200 OK`**:
```json
{
  "user": {
    "id": "6701a2b3c4d5e6f7a8b9c0d1",
    "name": "Alex Johnson",
    "email": "alex.johnson@example.com",
    "phone": "+91 98765 43210",
    "dob": "1994-06-15",
    "gender": "Female",
    "height": "165",
    "height_unit": "cm",
    "weight": "58",
    "weight_unit": "kg",
    "blood_group": "O+",
    "city": "Vadodara",
    "state": "Gujarat",
    "country": "India"
  }
}
```

---

### `PUT /api/auth/profile`
Updates demographic and physical measurements.
* **Auth Required**: Yes (`Bearer <token>`)
* **Request Body**:
```json
{
  "full_name": "Alex Johnson",
  "phone": "+91 98765 43210",
  "dob": "1994-06-15",
  "height": "165",
  "weight": "58",
  "bloodGroup": "O+",
  "city": "Vadodara",
  "allergies": "Penicillin",
  "existingConditions": "Asthma"
}
```
* **Response `200 OK`**: Returns updated user object.

---

## 3. Medical Report Endpoints

### `POST /api/reports/upload` (Alias: `POST /api/reports`)
Ingests medical lab report files (PDF, JPG, PNG) up to 15MB. Calculates SHA-256 hash, checks for duplicates, extracts text, calls Gemini AI / Universal Extractor, and stores structured findings.
* **Auth Required**: Yes (`Bearer <token>`)
* **Content-Type**: `multipart/form-data`
* **Form Field**: `report` or `file` (File buffer)
* **Response `201 Created` (New Report)**:
```json
{
  "report": {
    "id": "6701b3c4d5e6f7a8b9c0d2e3",
    "title": "Complete Blood Count",
    "fileName": "CBC_Report.pdf",
    "fileSize": "1.24 MB",
    "reportDate": "2026-09-28",
    "biomarkers": [
      {
        "name": "Hemoglobin",
        "value": "13.2",
        "unit": "g/dL",
        "refRange": "12.0 - 15.5",
        "status": "Normal"
      }
    ],
    "vitals": [],
    "extractedMedications": [],
    "clinicalSummary": "Hematological profile is optimal with normal hemoglobin and platelet counts."
  }
}
```
* **Response `200 OK` (Duplicate Detected)**:
```json
{
  "isDuplicate": true,
  "duplicate": true,
  "message": "Report has already been uploaded previously.",
  "report": { "id": "6701b3c4d5e6f7a8b9c0d2e3", "title": "CBC_Report.pdf" }
}
```

---

### `GET /api/reports`
Lists all uploaded reports for the authenticated user, ordered chronologically.
* **Auth Required**: Yes (`Bearer <token>`)
* **Response `200 OK`**: Array of report objects.

---

### `GET /api/reports/:id`
Retrieves a single report with complete biomarker and medication findings.
* **Auth Required**: Yes (`Bearer <token>`)

---

## 4. Medication Management Endpoints

### `GET /api/medicines`
Lists active prescription schedules for the authenticated user.
* **Auth Required**: Yes (`Bearer <token>`)
* **Response `200 OK`**:
```json
[
  {
    "_id": "6701c4d5e6f7a8b9c0d3e4f5",
    "name": "Metformin",
    "dose": "500 mg",
    "frequency": "Twice daily",
    "scheduled_time": "08:00 AM",
    "time_slot": "Morning",
    "meal_relation": "After meal",
    "total_pills": 60,
    "pills_remaining": 24,
    "is_taken": false,
    "is_paused": false
  }
]
```

---

### `POST /api/medicines`
Adds a new medication to the user's schedule.
* **Auth Required**: Yes (`Bearer <token>`)
* **Request Body**:
```json
{
  "name": "Metformin",
  "dose": "500 mg",
  "frequency": "Twice daily",
  "time": "08:00 AM",
  "timeSlot": "Morning",
  "mealRelation": "After meal",
  "duration_days": 30,
  "totalPills": 60
}
```
* **Response `201 Created`**: Returns created medication document.

---

### `PATCH /api/medicines/:id/taken` (Alias: `PUT /api/medicines/:id/take`)
Toggles the taken status for today and decrements remaining pill count.
* **Auth Required**: Yes (`Bearer <token>`)
* **Response `200 OK`**:
```json
{
  "success": true,
  "is_taken": true,
  "pills_remaining": 23
}
```

---

### `PATCH /api/medicines/:id/pause`
Toggles active vs. paused status of medication reminders.
* **Auth Required**: Yes (`Bearer <token>`)

---

### `DELETE /api/medicines/:id`
Permanently deletes a medication schedule.
* **Auth Required**: Yes (`Bearer <token>`)

---

## 5. Emergency SOS & Contacts Endpoints

### `POST /api/sos/trigger` (Aliases: `/api/sos`, `/api/emergency/trigger`)
Triggers an emergency SOS broadcast with GPS coordinates and dispatches email alerts to trusted contacts.
* **Auth Required**: Yes (`Bearer <token>`)
* **Request Body**:
```json
{
  "latitude": 22.3072,
  "longitude": 73.1812,
  "triggerType": "Manual SOS Button"
}
```
* **Response `200 OK`**:
```json
{
  "success": true,
  "sos": {
    "id": "6701d5e6f7a8b9c0d4e5f6a7",
    "status": "DISPATCHED",
    "timestamp": "2026-10-04T15:00:00.000Z"
  },
  "contactsNotified": 2
}
```

---

### `POST /api/sos/cancel`
Stands down an active emergency alert.
* **Auth Required**: Yes (`Bearer <token>`)
* **Response `200 OK`**: `{ "success": true, "status": "CANCELLED" }`

---

### `GET /api/sos/contacts`
Lists user's registered emergency contacts.
* **Auth Required**: Yes (`Bearer <token>`)

---

### `POST /api/sos/contacts`
Adds a new emergency contact.
* **Auth Required**: Yes (`Bearer <token>`)
* **Request Body**:
```json
{
  "name": "Dr. Rajesh Sharma",
  "relation": "Primary Physician",
  "phone": "+91 98765 43210",
  "email": "dr.sharma@example.com",
  "is_primary": true
}
```

---

### `DELETE /api/sos/contacts/:id`
Deletes an emergency contact.
* **Auth Required**: Yes (`Bearer <token>`)

---

## 6. Hospital Search & Geocoding Endpoints

### `GET /api/hospitals/nearby`
Queries OpenStreetMap / Nominatim for health facilities near specified coordinates.
* **Auth Required**: No
* **Query Parameters**:
  * `lat` (required): Latitude float (e.g. `22.3072`)
  * `lng` (required): Longitude float (e.g. `73.1812`)
  * `category` (optional): `Hospitals`, `Clinics`, `Cardiologist`, etc.
  * `radiusKm` (optional): Search radius integer (e.g. `25`)
* **Response `200 OK`**:
```json
[
  {
    "id": "hosp-101",
    "name": "Sterling Hospital",
    "type": "Multi-Specialty Hospital",
    "address": "Race Course Circle, Vadodara, Gujarat",
    "lat": 22.3125,
    "lng": 73.1789,
    "distanceKm": 1.2,
    "emergencyOpen": true,
    "phone": "+91 265 611 1111"
  }
]
```
