/**
 * Utility functions for clean user display formatting
 */

export function formatDisplayName(name) {
  if (!name) return 'Patient';

  const trimmed = name.trim();

  // If user entered a multi-word full name (e.g. "Sakshi Bhatt"), preserve full name!
  if (trimmed.includes(' ') && !trimmed.includes('@')) {
    return trimmed
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // If name is an email prefix or string with numbers (e.g. "sakshi27" or "sakshi27@gmail.com")
  let clean = trimmed.split('@')[0].replace(/\d+/g, '').replace(/[._-]/g, ' ').trim();
  if (!clean) clean = trimmed.split('@')[0];

  return clean
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatReportTitle(report) {
  if (!report) return 'Blood Test Report';

  let title = report.title || report.file_name || report.fileName || '';
  if (!title) return 'Blood Test Report';

  // Remove file extensions like .pdf, .png, .jpg
  title = title.replace(/\.(pdf|png|jpg|jpeg|docx?)$/i, '');

  // If title is a long raw filename with underscores or hyphens
  if (title.includes('_') || title.includes('-') || title.length > 28) {
    const lower = title.toLowerCase();
    if (lower.includes('blood') || lower.includes('cbc') || lower.includes('hemoglobin') || lower.includes('hb')) {
      return 'Blood Test Report';
    }
    if (lower.includes('lipid') || lower.includes('cholesterol')) {
      return 'Lipid Profile Report';
    }
    if (lower.includes('glucose') || lower.includes('sugar') || lower.includes('diabetes')) {
      return 'Blood Glucose Report';
    }
    if (lower.includes('thyroid') || lower.includes('tsh')) {
      return 'Thyroid Profile Report';
    }
    if (lower.includes('kidney') || lower.includes('creatinine') || lower.includes('renal')) {
      return 'Renal Function Report';
    }
    if (lower.includes('liver') || lower.includes('lft') || lower.includes('sgpt')) {
      return 'Liver Function Report';
    }

    const clean = title.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (clean.length > 0 && clean.length <= 28) {
      return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    return 'Blood Test Report';
  }

  return title;
}
