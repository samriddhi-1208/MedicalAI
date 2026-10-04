# 💼 MedGuardian AI — Project & Behavioral Interview Questions

This guide contains project-level, architectural trade-off, and behavioral interview questions designed to help explain MedGuardian AI in technical interviews.

---

### Q1: Can you give a 60-second elevator pitch for MedGuardian AI?
**Answer:**
"MedGuardian AI is a patient-first healthcare web application designed to eliminate medical jargon confusion for patients and caregivers. When patients receive laboratory test PDFs or prescriptions, the medical jargon and complex reference ranges often cause anxiety. 

With MedGuardian AI, users simply drag and drop their lab reports. Our dual-engine pipeline—combining Google Gemini AI with a deterministic clinical regex fallback—extracts structured biomarkers, vitals, and medication instructions, translating them into plain language. 

The platform also tracks longitudinal health trends without fake data, manages daily medication adherence with refill alerts, provides instant emergency guidance with 1-Tap SOS GPS dispatch, and locates nearby healthcare facilities using Leaflet and OpenStreetMap. Crucially, the entire interface is accessible in English, Hindi, and Gujarati, making healthcare understandable for regional communities."

---

### Q2: What were the three biggest technical challenges you faced, and how did you resolve them?
**Answer:**
1. **Handling File Uploads on Ephemeral Cloud Containers**:
   * *Problem*: Cloud platforms like Render wipe locally saved files upon container restarts.
   * *Solution*: We refactored Multer to use `memoryStorage()`, processing buffers in volatile RAM and executing OCR streams directly from memory without writing to disk.
2. **Eliminating Cold-Start Delays on Free-Tier Hosting**:
   * *Problem*: Initial queries to Render cold-started containers risked timing out while Mongoose was still handshaking with MongoDB Atlas.
   * *Solution*: We added a background warmup ping from the login page, coupled with an explicit `readyState === 1` guard check in `authController.js` to ensure the database connection is active before query dispatch.
3. **Designing a Consistent Light/Dark Theme Without CSS Ingestion Lag**:
   * *Problem*: In complex React apps, naive dark mode switching causes page flashes or requires redundant utility classes on every element.
   * *Solution*: We built a design system centered around six semantic CSS variables mapped to `:root` and `.dark`. When the toggle switches, the DOM instantly swaps palettes via pure CSS cascading without component re-mounting.

---

### Q3: What architectural trade-offs did you make, and why?
**Answer:**
1. **MongoDB Atlas vs. Relational PostgreSQL**:
   * *Trade-off*: We chose MongoDB because medical reports vary drastically. A Complete Blood Count contains 15 hematology parameters; a Renal Function Panel contains 6 chemistry parameters; a prescription contains medication objects with timing slots. MongoDB's flexible document model handles these polymorphic clinical schemas naturally.
2. **Leaflet + OpenStreetMap vs. Google Maps Platform**:
   * *Trade-off*: Google Maps offers street view and richer commercial places, but requires billing accounts and credit card commitments. For a public healthcare accessibility tool, Leaflet with OpenStreetMap provides free, reliable geospatial queries and tile rendering with zero vendor lock-in.
3. **React Context API vs. Redux Toolkit**:
   * *Trade-off*: We avoided Redux to keep bundle sizes minimal and compilation times under 1 second. Our partitioned Context API structure (`ThemeContext` and `HealthDataContext`) manages global state without over-complicating the codebase.

---

### Q4: If you had another month to scale this project, what would you prioritize?
**Answer:**
1. **SMS & WhatsApp Emergency Notifications via Twilio**:
   * Currently, emergency SOS alerts dispatch via Nodemailer emails and local `tel:108` links. Integrating Twilio would enable automated SMS and WhatsApp broadcast messages with live location pins to family members who may not monitor email in real-time.
2. **DICOM / Medical Imaging Support**:
   * Integrating an open-source DICOM viewer (such as Cornerstone.js) would allow patients to view X-rays and MRI scans alongside their clinical pathology reports.
3. **FHIR / HL7 Interoperability**:
   * Implementing the Fast Healthcare Interoperability Resources (FHIR) JSON standard would allow MedGuardian AI to export patient health records directly into hospital EHR systems.
