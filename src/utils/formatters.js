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
