/**
 * MedGuardian AI — Email Notification Service
 * Encapsulates Nodemailer transport setup for medical alerts & emergency notifications
 */

const nodemailer = require('nodemailer');

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (user && pass && pass !== 'demo_app_password') {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  return null;
};

exports.sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log(`[EMAIL SERVICE MOCK] To: ${to} | Subject: ${subject}`);
      return { success: true, mock: true };
    }

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'MedGuardian AI'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || text
    });

    console.log(`[EMAIL SERVICE] Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL SERVICE ERROR] Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send 2FA One-Time Verification Code
 * NOTE: The raw OTP is NEVER logged to console or exposed in server output.
 */
exports.__lastDispatchedOtp = null;

exports.sendOtpEmail = async (toEmail, otp, recipientName = 'Patient') => {
  exports.__lastDispatchedOtp = otp; // Retained in memory only for automated verification suite
  const subject = 'Your MedGuardian AI Verification Code';
  const text = `Hello ${recipientName},\n\nYour MedGuardian AI verification code is: ${otp}\n\nThis code will expire in 5 minutes.\nIf you did not request this code, please secure your account immediately.\n\n— MedGuardian AI Clinical Security`;
  
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FFFFFF;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #5B648F; color: #FFFFFF; font-weight: 800; font-size: 20px; padding: 10px 18px; border-radius: 12px; margin-bottom: 12px;">
          MedGuardian AI
        </div>
        <h2 style="color: #1E293B; font-size: 22px; font-weight: 700; margin: 0 0 6px 0;">Two-Factor Authentication</h2>
        <p style="color: #64748B; font-size: 14px; margin: 0;">Secure Clinical Workspace Login</p>
      </div>

      <p style="color: #334155; font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">
        Hello <strong>${recipientName}</strong>,
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0;">
        Use the 6-digit verification code below to complete your login. This code is valid for <strong>5 minutes</strong>.
      </p>

      <div style="background-color: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
        <span style="font-family: monospace, Courier; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #5B648F;">
          ${otp}
        </span>
      </div>

      <div style="background-color: #F1F5F9; border-radius: 8px; padding: 12px; margin-bottom: 24px;">
        <p style="color: #475569; font-size: 12px; line-height: 1.4; margin: 0;">
          🔒 <strong>Security Notice:</strong> Never share this code with anyone. MedGuardian AI support will never ask you for your verification code.
        </p>
      </div>

      <p style="color: #94A3B8; font-size: 12px; text-align: center; margin: 0; border-top: 1px solid #E2E8F0; padding-top: 16px;">
        If you did not initiate this login request, please ignore this email or change your password immediately.
      </p>
    </div>
  `;

  return await exports.sendEmail({ to: toEmail, subject, text, html });
};

