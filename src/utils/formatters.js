/**
 * Utility functions for clean user display formatting
 */

export function formatDisplayName(name) {
  if (!name) return 'Patient';
  // If name is email or contains numbers (e.g., sakshi27 or sakshi27@gmail.com)
  let clean = name.split('@')[0].replace(/\d+/g, '').replace(/[._-]/g, ' ').trim();
  if (!clean) clean = name.split('@')[0];
  // Capitalize words: "sakshi bhatt" -> "Sakshi Bhatt", "sakshi" -> "Sakshi"
  return clean
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
