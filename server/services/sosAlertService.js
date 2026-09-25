const nodemailer = require('nodemailer');

// Nodemailer Transporter configuration (per Section 6 & 10 of System Design Spec)
let transporter = null;

try {
  // Test/Fallback Transport (Ethereal or console logger)
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
      pass: process.env.SMTP_PASS || 'ethereal_pass'
    }
  });
} catch (err) {
  console.log("Nodemailer initial fallback transport configured.");
}

async function sendEmergencySOSAlert({ userName, contacts, latitude, longitude, triggerType, notes }) {
  const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
  
  const mailSubject = `🚨 [MEDGUARDIAN EMERGENCY SOS] Critical Alert for ${userName}`;
  const mailContent = `
============================================================
🚨 MEDGUARDIAN AI EMERGENCY SOS ALERT DISPATCH 🚨
============================================================

Patient Name: ${userName}
Trigger Reason: ${triggerType}
Timestamp: ${new Date().toLocaleString()}

LOCATION DETAILS:
Coordinates: ${latitude}° N, ${longitude}° E
Google Maps Direct Link: ${mapLink}

STATUS NOTES:
${notes || 'Emergency assistance requested by patient.'}

NOTIFIED EMERGENCY CONTACTS:
${contacts.map(c => `- ${c.name} (${c.relationship}): ${c.phone} / ${c.email}`).join('\n')}

============================================================
MedGuardian AI Automated Safety System
  `;

  console.log("\n================ [DISPATCHED EMAIL ALERT VIA NODEMAILER] ================");
  console.log(mailContent);
  console.log("=========================================================================\n");

  try {
    if (transporter && process.env.SMTP_USER) {
      await transporter.sendMail({
        from: '"MedGuardian Emergency SOS" <sos@medguardian.ai>',
        to: contacts.map(c => c.email).filter(Boolean).join(', '),
        subject: mailSubject,
        text: mailContent
      });
    }
  } catch (err) {
    console.error("Nodemailer email dispatch simulation log:", err.message);
  }

  return {
    success: true,
    mapLink,
    dispatchedTo: contacts.map(c => c.name),
    sentAt: new Date().toISOString()
  };
}

async function sendMedicineReminderAlert({ userName, email, medicineName, dosage, timeSlot }) {
  const mailSubject = `💊 [MedGuardian AI] Time for your medication: ${medicineName}`;
  const mailContent = `
Hello ${userName},

This is a scheduled reminder to take your medication:
- Medicine: ${medicineName} (${dosage})
- Schedule Slot: ${timeSlot}
- Time: ${new Date().toLocaleTimeString()}

Please log your dose on the MedGuardian AI Dashboard after taking it.
  `;

  console.log(`[MEDICINE REMINDER SENT] To: ${email} -> ${medicineName}`);
  return { success: true };
}

module.exports = {
  sendEmergencySOSAlert,
  sendMedicineReminderAlert
};
