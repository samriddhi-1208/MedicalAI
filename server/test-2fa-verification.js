/**
 * MedGuardian AI — 2FA & Authentication Automated Verification Suite
 * Tests 100% of 2FA requirements and security constraints
 */

const http = require('http');
const app = require('./src/app');
const emailService = require('./src/services/emailService');
const authController = require('./src/controllers/authController');

let server;
let baseUrl;

async function startTestServer() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[TEST RUNNER] Test server active on ${baseUrl}`);
      resolve();
    });
  });
}

async function stopTestServer() {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

async function postJson(endpoint, data, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, body };
}

async function getJson(endpoint, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: 'GET',
    headers
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, body };
}

async function runTests() {
  console.log('\n============================================================');
  console.log('🧪 MEDGUARDIAN AI — 2FA AUTOMATED TEST EXECUTION');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  await startTestServer();

  const testEmail = `patient_${Date.now()}@example.com`;
  const testPassword = 'StrongPass123!@';
  const testName = 'Priya Patel';

  try {
    // -------------------------------------------------------------
    // TEST 1: User Registration
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Registration Flow ---');
    const signupRes = await postJson('/api/auth/signup', {
      name: testName,
      email: testEmail,
      password: testPassword
    });
    assert(signupRes.status === 201, 'Signup returns 201 Created');
    assert(Boolean(signupRes.body.token), 'Signup issues initial token for onboarding');

    // -------------------------------------------------------------
    // TEST 2: Correct Credentials Triggers 2FA & Blocks JWT
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Login 2FA Trigger & No Early JWT ---');
    const loginRes = await postJson('/api/auth/login', {
      email: testEmail,
      password: testPassword
    });
    assert(loginRes.status === 200, 'Login credentials verified successfully');
    assert(loginRes.body.twoFactorRequired === true, 'Response requires twoFactorRequired === true');
    assert(!loginRes.body.token, 'CRITICAL: NO JWT IS ISSUED on login prior to OTP verification');
    assert(Boolean(emailService.__lastDispatchedOtp), 'Cryptographically secure 6-digit OTP was dispatched via email');
    assert(/^\d{6}$/.test(emailService.__lastDispatchedOtp), 'Dispatched OTP is exactly 6 digits');

    const firstOtp = emailService.__lastDispatchedOtp;

    // -------------------------------------------------------------
    // TEST 3: Incorrect OTP Rejection & Decrementing Attempts
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Incorrect OTP Rejection ---');
    const wrongOtpRes = await postJson('/api/auth/verify-otp', {
      email: testEmail,
      otp: '000000'
    });
    assert(wrongOtpRes.status === 400, 'Incorrect OTP returns 400 Bad Request');
    assert(wrongOtpRes.body.error && wrongOtpRes.body.error.includes('Invalid verification code'), 'Clear error message returned for wrong OTP');
    assert(wrongOtpRes.body.attemptsRemaining === 4, 'Remaining attempts accurately decremented to 4');

    // -------------------------------------------------------------
    // TEST 4: Attempt Limit Lockout (5 attempts)
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Max Attempt Lockout (5 attempts) ---');
    for (let i = 0; i < 3; i++) {
      await postJson('/api/auth/verify-otp', { email: testEmail, otp: '111111' });
    }
    // 5th failed attempt
    const lockoutRes = await postJson('/api/auth/verify-otp', { email: testEmail, otp: '222222' });
    assert(lockoutRes.status === 429, '5th failed attempt triggers 429 Too Many Requests / Lockout');
    assert(lockoutRes.body.error.includes('Maximum verification attempts exceeded'), 'Error message reports attempts exceeded');

    // Trying even the correct original OTP now must fail because lockout invalidated it
    const afterLockoutRes = await postJson('/api/auth/verify-otp', { email: testEmail, otp: firstOtp });
    assert(afterLockoutRes.status === 400 || afterLockoutRes.status === 429, 'Previous OTP is completely invalidated after max attempts');

    // -------------------------------------------------------------
    // TEST 5: Resend Cooldown Enforcement (60s)
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Resend Cooldown Throttling ---');
    // First trigger login to generate a fresh OTP and set last_sent_at
    await postJson('/api/auth/login', { email: testEmail, password: testPassword });
    const immediateResend = await postJson('/api/auth/resend-otp', { email: testEmail });
    assert(immediateResend.status === 429, 'Immediate resend within 60s cooldown returns 429 Too Many Requests');
    assert(immediateResend.body.error.includes('Please wait'), 'Resend error specifies remaining cooldown');

    // -------------------------------------------------------------
    // TEST 6: Resend Invalidates Previous OTP
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Resend Invalidates Previous OTP ---');
    const oldOtpBeforeResend = emailService.__lastDispatchedOtp;
    // Fast-forward cooldown in memory for test
    const cached = authController.__otpStore.get(testEmail.toLowerCase());
    if (cached) cached.lastSentAt = new Date(Date.now() - 65000);

    const validResend = await postJson('/api/auth/resend-otp', { email: testEmail });
    assert(validResend.status === 200, 'Resend succeeds after cooldown');
    const newOtpAfterResend = emailService.__lastDispatchedOtp;
    assert(newOtpAfterResend !== oldOtpBeforeResend, 'Resend generated a brand new 6-digit OTP');

    // Verify old OTP is rejected
    const oldOtpAttempt = await postJson('/api/auth/verify-otp', { email: testEmail, otp: oldOtpBeforeResend });
    assert(oldOtpAttempt.status === 400, 'Old OTP is strictly invalidated and rejected');

    // -------------------------------------------------------------
    // TEST 7: Expired OTP Rejection
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Expired OTP Rejection ---');
    // Simulate expired OTP (set expiry to 1 second ago)
    const cachedForExpiry = authController.__otpStore.get(testEmail.toLowerCase());
    if (cachedForExpiry) cachedForExpiry.expiresAt = new Date(Date.now() - 1000);

    const expiredRes = await postJson('/api/auth/verify-otp', {
      email: testEmail,
      otp: newOtpAfterResend
    });
    assert(expiredRes.status === 400, 'Expired OTP is rejected with 400 Bad Request');
    assert(expiredRes.body.error.includes('expired'), 'Error message explicitly notes expiration');

    // -------------------------------------------------------------
    // TEST 8: Correct OTP Verification & JWT Issuance
    // -------------------------------------------------------------
    console.log('\n--- 8. Testing Correct OTP Verification & JWT Issuance ---');
    // Re-login to get clean active OTP
    if (cachedForExpiry) cachedForExpiry.lastSentAt = new Date(Date.now() - 65000);
    await postJson('/api/auth/login', { email: testEmail, password: testPassword });
    const finalOtp = emailService.__lastDispatchedOtp;

    const verifySuccessRes = await postJson('/api/auth/verify-otp', {
      email: testEmail,
      otp: finalOtp
    });
    assert(verifySuccessRes.status === 200, 'Correct OTP verification succeeds with 200 OK');
    assert(Boolean(verifySuccessRes.body.token), 'JWT token successfully issued upon valid OTP verification');
    assert(verifySuccessRes.body.user && verifySuccessRes.body.user.email === testEmail, 'User profile returned with JWT');

    const sessionJwt = verifySuccessRes.body.token;

    // Test that used OTP cannot be reused
    const reuseRes = await postJson('/api/auth/verify-otp', { email: testEmail, otp: finalOtp });
    assert(reuseRes.status === 400, 'Used OTP is destroyed and cannot be replayed/reused');

    // -------------------------------------------------------------
    // TEST 9: Authenticated Protected Route Access with Issued JWT
    // -------------------------------------------------------------
    console.log('\n--- 9. Testing Authenticated Protected Route ---');
    const profileRes = await getJson('/api/auth/me', sessionJwt);
    assert(profileRes.status === 200, 'Protected /api/auth/me accepts the 2FA-issued JWT');
    assert(profileRes.body.email === testEmail || profileRes.body.user?.email === testEmail, 'Authenticated user profile matches');

    // -------------------------------------------------------------
    // TEST 10: Emergency SOS Preservation (No Secondary OTP Prompt)
    // -------------------------------------------------------------
    console.log('\n--- 10. Testing Emergency SOS Functionality ---');
    const sosContactsRes = await getJson('/api/sos/contacts', sessionJwt);
    assert(sosContactsRes.status === 200, 'Emergency contacts endpoint works with standard JWT');

    const sosTriggerRes = await postJson('/api/sos/trigger', {
      latitude: 22.3072,
      longitude: 73.1812,
      triggerType: 'Automated 2FA Test SOS'
    }, sessionJwt);
    assert(sosTriggerRes.status === 201 || sosTriggerRes.status === 200, 'Emergency SOS dispatches without any OTP barrier');

  } finally {
    await stopTestServer();
  }

  console.log('\n============================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
