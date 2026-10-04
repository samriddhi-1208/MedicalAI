# ⚙️ MedGuardian AI — Backend Interview Questions & Deep-Dive Answers

This guide contains technical interview questions and detailed architectural answers based specifically on the MedGuardian AI backend codebase.

---

### Q1: Why did you use `multer.memoryStorage()` instead of `multer.diskStorage()` for medical file uploads?
**Answer:**
Modern cloud hosting platforms like Render, Vercel, and containerized Docker environments operate on **ephemeral filesystems**.
* If an application saves files to a local `./uploads` directory via `diskStorage`, those files are wiped whenever the container restarts or re-deploys.
* Furthermore, in multi-instance or serverless environments, file paths written on one instance are inaccessible to another instance.
* By using `multer.memoryStorage()`, uploaded files are retained directly in volatile memory buffers (`req.file.buffer`). The buffer is immediately passed to `pdf-parse` and SHA-256 hash algorithms, eliminating filesystem disk I/O, preventing file leakage, and guaranteeing portability across serverless and cloud container environments.

---

### Q2: How does the SHA-256 duplicate report detection work, and why is it important?
**Answer:**
Medical reports are often large PDFs. Processing them involves heavy OCR text extraction and billable Google Gemini AI API calls.
1. When a file buffer arrives in `reportsController.js`, we compute its SHA-256 hash before parsing:
   ```javascript
   const crypto = require('crypto');
   const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
   ```
2. We query the MongoDB `Report` collection matching both `user_id` and `file_hash`.
3. If a match is found, the backend returns early with `{ duplicate: true, report: existingDoc }`.
4. This prevents duplicate database records, saves AI token costs, and avoids confusing the patient with duplicate historical timeline points.

---

### Q3: How is authentication and password security implemented?
**Answer:**
1. **Password Hashing**: We use `bcryptjs` with 10 salt rounds. During registration, `bcrypt.hash(password, 10)` generates a salted hash before saving the user document. During login, `bcrypt.compare(password, user.password)` verifies credentials without decrypting the stored hash.
2. **Stateless JWTs**: Upon successful login, `generateToken(user._id)` issues an HMAC SHA-256 signed JSON Web Token with a 30-day expiration (`expiresIn: '30d'`).
3. **Middleware Authorization**: `authMiddleware.js` parses the `Authorization: Bearer <token>` header, verifies the signature using `jwt.verify(token, process.env.JWT_SECRET)`, fetches the user from MongoDB (excluding password), and binds it to `req.user`. If the token is expired or altered, it responds with `401 Unauthorized`.

---

### Q4: How does the backend mitigate Render free-tier cold-start latencies?
**Answer:**
Render spins down free-tier web services after 15 minutes of inactivity. When a new request arrives, container cold starts can take 30 to 50 seconds.
1. **Frontend Ping Warmup**: `LoginPage.jsx` fires a lightweight background fetch to `/health` on component mount and on password input focus, waking the container while the user is typing credentials.
2. **Mongoose State Guard**: If a query is dispatched before Mongoose has finished handshaking with MongoDB Atlas, Mongoose's default query buffering can cause requests to time out. In `authController.js`, we test `mongoose.connection.readyState === 1` before querying, ensuring socket readiness and sub-second response times once the container is active.

---

### Q5: How is the emergency SOS dispatch handled in the backend?
**Answer:**
When `POST /api/sos/trigger` is invoked with `{ latitude, longitude, triggerType }`:
1. `sosController.js` logs a new `SOSEvent` record in MongoDB capturing the patient's ID, coordinates, and timestamp.
2. It queries the `EmergencyContact` collection for all contacts registered to that user.
3. It calls `sosAlertService.dispatchSOSAlert()`, which formats an emergency payload featuring:
   * Patient name and emergency notes
   * Exact GPS coordinates
   * A direct Google Maps navigation hyperlink: `https://maps.google.com/?q=lat,lng`
4. The service passes the payload to `emailService.js`, which uses a Nodemailer SMTP transport to dispatch immediate alerts to each contact's email address.

---

### Q6: How does the global error handling middleware prevent security leaks?
**Answer:**
Uncaught exceptions in Express can inadvertently return stack traces, revealing database credentials, directory structures, and library versions to attackers.
* In `server/src/middlewares/errorHandler.js`, all errors passed via `next(err)` are captured centrally:
  ```javascript
  module.exports = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
      error: err.message || 'Server Internal Error',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  };
  ```
* In production, `stack` is strictly `null`, ensuring client responses receive clean, safe JSON error messages.

---

### Q7: How did you implement Email-based Two-Factor Authentication (2FA) and protect against brute-force attacks and replay attempts?
**Answer:**
MedGuardian AI implements a multi-layer cryptographic 2FA flow:
1. **Zero JWT Pre-Verification**: Upon verifying email and password in `authController.login`, the backend does **not** issue a JWT. Instead, it generates a cryptographically secure 6-digit OTP using `crypto.randomInt(100000, 1000000)`.
2. **One-Way Salting (`bcryptjs`)**: The server never persists plaintext OTPs. It hashes the code using `bcrypt.hash(otp, 10)` before storing `otp_hash` and sets a strict 5-minute expiry timestamp (`otp_expires_at`).
3. **Email Dispatch Without Console Leakage**: The OTP is dispatched to the user's email via Nodemailer (`emailService.sendOtpEmail`), adhering to a strict zero-logging policy where raw OTPs are never printed to console logs.
4. **Brute-Force Lockout**: In `authController.verifyOtp`, the server tracks `otp_attempts`. If 5 consecutive incorrect codes are entered, the OTP is permanently purged from storage, and the client receives a `429 Too Many Requests` response.
5. **Resend Cooldown & Invalidation**: Repeated calls to `/api/auth/resend-otp` are throttled to a 60-second cooldown. Crucially, generating a new code immediately overwrites and invalidates the previous code, preventing stale-code race conditions.
6. **Anti-Replay Destruction**: Upon successful verification, `otp_hash` and `otp_expires_at` are immediately set to `null` before signing the final JWT (`jwt.sign`), preventing code reuse.

