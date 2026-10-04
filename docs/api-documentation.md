# 📡 MedGuardian AI — REST API Documentation

Base API URL: `https://medicalai-backend-5ycw.onrender.com/api` (Production) or `http://localhost:5000/api` (Local)

---

## 1. Authentication Endpoints (`/api/auth`)

### POST `/api/auth/register` (or `/api/auth/signup`)
Registers a new patient user account.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!"
}
```

**Response (`201 Created`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u-101",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "bloodGroup": "O+",
    "age": 20
  }
}
```

---

### POST `/api/auth/login`
Authenticates user and returns JWT bearer token.

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```

**Response (`200 OK`):**
```json
{
  "message": "Sign in successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u-101",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "bloodGroup": "O+",
    "age": 20
  }
}
```

---

### GET `/api/auth/profile` (Protected)
Retrieves authenticated user profile data. Header required: `Authorization: Bearer <token>`

---

### PUT `/api/auth/profile` (Protected)
Updates physical health profile (height, weight, blood group, phone, etc.).

---

## 2. Medical Report Endpoints (`/api/reports`)

### POST `/api/reports/upload` (Protected)
Uploads a medical report file (PDF, PNG, JPG) for OCR text parsing and AI structured extraction.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`  
**Form Data:** `report` (file buffer) or `title`

**Response (`200 OK`):**
```json
{
  "report": {
    "id": "rep-101",
    "title": "Blood Test Report",
    "patientName": "Jane Doe",
    "reportDate": "2026-08-15",
    "biomarkersCount": 12,
    "medicationsCount": 2,
    "summary": "AI Report Summary..."
  }
}
```

---

### GET `/api/reports` (Protected)
Retrieves user-scoped report history.

---

## 3. Medication Endpoints (`/api/medicines`)

### GET `/api/medicines` (Protected)
Lists active tracked medications.

---

### POST `/api/medicines` (Protected)
Adds a new medication schedule.

---

### PATCH `/api/medicines/:id/taken` (Protected)
Logs dose as taken/untaken.

---

## 4. Emergency SOS Endpoints (`/api/sos`)

### POST `/api/sos/dispatch` (Protected)
Broadcasts an emergency SOS alert with live GPS coordinates.

**Request Body:**
```json
{
  "latitude": 22.2928,
  "longitude": 73.3682,
  "triggerType": "Manual SOS Button",
  "notes": "High-Intensity Emergency SOS Alert"
}
```

---

### POST `/api/sos/cancel` (Protected)
Deactivates active SOS alert state.

---

## 5. Hospital Locator Endpoints (`/api/hospitals`)

### GET `/api/hospitals/nearby?lat=...&lng=...&radiusKm=25`
Queries OpenStreetMap Overpass API for nearby 24/7 hospitals and specialty emergency centers.
