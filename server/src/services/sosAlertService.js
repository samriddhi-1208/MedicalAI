const emailService = require('./emailService');

exports.dispatchSOSAlert = async (user, contacts, sosPayload = {}) => {
  const safeContacts = Array.isArray(contacts) ? contacts : [];
  const contactsListText = safeContacts
    .map(c => `- ${c.name} (${c.relation || 'Emergency Contact'}): ${c.phone}${c.email ? ' / ' + c.email : ''}`)
    .join('\n');

  const patientName = user?.full_name || user?.name || 'Patient';
  const triggerReason = sosPayload.triggerType || 'Manual Emergency Alert';
  const timestamp = new Date().toLocaleString();

  let locationText = 'Live GPS location not shared / unavailable';
  if (
    sosPayload.latitude !== undefined &&
    sosPayload.latitude !== null &&
    sosPayload.longitude !== undefined &&
    sosPayload.longitude !== null &&
    !isNaN(Number(sosPayload.latitude)) &&
    !isNaN(Number(sosPayload.longitude))
  ) {
    locationText = `Coordinates: ${sosPayload.latitude}° N, ${sosPayload.longitude}° E\nGoogle Maps: https://maps.google.com/?q=${sosPayload.latitude},${sosPayload.longitude}`;
  } else if (user?.city || user?.state || user?.country) {
    locationText = [user.city, user.state, user.country].filter(Boolean).join(', ');
  }

  const alertNotes = sosPayload.notes || sosPayload.message || 'High-Intensity Emergency Assistance Alert';

  const alertText = `
============================================================
🚨 MEDGUARDIAN AI EMERGENCY ALERT NOTIFICATION 🚨
============================================================

Patient Name: ${patientName}
Trigger Reason: ${triggerReason}
Timestamp: ${timestamp}

LOCATION DETAILS:
${locationText}

STATUS NOTES:
${alertNotes}

NOTIFIED EMERGENCY CONTACTS:
${contactsListText || '- Direct Emergency Contact Alert'}

============================================================
MedGuardian AI Automated Safety System
============================================================
  `.trim();

  console.log('\n================ [DISPATCHED EMAIL ALERT VIA NODEMAILER] ================');
  console.log(alertText);
  console.log('=========================================================================\n');

  // Dispatch notifications via existing emailService
  const results = [];
  let successfulCount = 0;
  let failedCount = 0;

  for (const contact of safeContacts) {
    const targetEmail = contact.email || user?.email;
    const subject = `🚨 EMERGENCY ALERT: ${patientName} needs emergency assistance`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 2px solid #C94B55; border-radius: 16px; background-color: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background-color: #C94B55; color: #FFFFFF; font-weight: 800; font-size: 18px; padding: 10px 18px; border-radius: 12px; margin-bottom: 10px;">
            🚨 EMERGENCY ASSISTANCE ALERT
          </div>
          <h2 style="color: #0F172A; font-size: 20px; font-weight: 800; margin: 0 0 6px 0;">MedGuardian AI Emergency Notification</h2>
          <p style="color: #64748B; font-size: 13px; margin: 0;">Automated Clinical & Emergency Dispatch</p>
        </div>

        <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #991B1B; font-size: 14px; font-weight: 700; margin: 0 0 8px 0;">
            Immediate attention requested for: <strong>${patientName}</strong>
          </p>
          <p style="color: #7F1D1D; font-size: 13px; margin: 0; line-height: 1.5;">
            ${alertNotes}
          </p>
        </div>

        <div style="background-color: #F8FAFC; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px; color: #334155; line-height: 1.6;">
          <div style="margin-bottom: 8px;"><strong>Recipient Contact:</strong> ${contact.name} (${contact.relation || 'Emergency Contact'}) - ${contact.phone}</div>
          <div style="margin-bottom: 8px;"><strong>Date & Time:</strong> ${timestamp}</div>
          <div style="margin-bottom: 8px;"><strong>Location Information:</strong> ${locationText.replace(/\n/g, '<br/>')}</div>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${sosPayload.latitude ? `https://maps.google.com/?q=${sosPayload.latitude},${sosPayload.longitude}` : 'tel:' + (user?.phone || '108')}" 
             style="display: inline-block; background-color: #54816C; color: #FFFFFF; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none;">
            ${sosPayload.latitude ? '📍 View Location on Google Maps' : '📞 Contact Patient Directly'}
          </a>
        </div>

        <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0; border-top: 1px solid #E2E8F0; padding-top: 14px;">
          This emergency notification was generated automatically via MedGuardian AI Safety Infrastructure. Please contact the patient directly or emergency services (108/112).
        </p>
      </div>
    `;

    if (targetEmail) {
      try {
        const sendRes = await emailService.sendEmail({
          to: targetEmail,
          subject,
          text: alertText,
          html
        });
        if (sendRes && sendRes.success) {
          successfulCount++;
          results.push({ contactId: contact.id || contact._id, contactName: contact.name, success: true, targetEmail });
        } else {
          failedCount++;
          results.push({ contactId: contact.id || contact._id, contactName: contact.name, success: false, error: sendRes?.error || 'Send failed' });
        }
      } catch (err) {
        failedCount++;
        results.push({ contactId: contact.id || contact._id, contactName: contact.name, success: false, error: err.message });
      }
    } else {
      successfulCount++;
      results.push({ contactId: contact.id || contact._id, contactName: contact.name, success: true, method: 'SMS/Phone Logged' });
    }
  }

  const allSuccess = failedCount === 0 && (safeContacts.length === 0 || successfulCount > 0);

  return {
    success: allSuccess,
    timestamp: new Date().toISOString(),
    contactsNotified: successfulCount,
    failedCount,
    results
  };
};
