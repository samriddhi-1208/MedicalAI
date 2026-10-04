/**
 * MedGuardian AI — Auth Input Validator
 * Validates signup inputs and password complexity rules
 */

function validateSignupInput({ email, password, name }) {
  if (!email || !password || !name) {
    return { valid: false, message: 'Full name, email, and password are required.' };
  }

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return {
      valid: false,
      message: 'Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
    };
  }

  return { valid: true };
}

function validateLoginInput({ email, password }) {
  if (!email || !password) {
    return { valid: false, message: 'Email and password are required.' };
  }
  return { valid: true };
}

module.exports = {
  validateSignupInput,
  validateLoginInput
};
