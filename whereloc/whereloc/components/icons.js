// ==========================================================================
// components/icons.js
// Tiny inline-SVG strings, kept in one file so the icon set stays
// consistent. `pinMark` is the signature shape used as the logo, the FAB,
// and every map marker — same mark everywhere a "spot" is represented.
// ==========================================================================

export const pinMark = (cls = "pin-mark") => `
<svg class="${cls}" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M12 1C6.477 1 2 5.477 2 11c0 7.5 10 16 10 16s10-8.5 10-16c0-5.523-4.477-10-10-10z" fill="currentColor"/>
  <circle cx="12" cy="11" r="3.6" fill="var(--color-white)"/>
</svg>`;

export const iconSearch = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
  <path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

export const iconStarFilled = `
<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
  <path d="M10 1.5l2.6 5.8 6.2.6-4.7 4.2 1.4 6.1L10 14.9 4.5 18.2l1.4-6.1L1.2 7.9l6.2-.6L10 1.5z"/>
</svg>`;

export const iconBookmark = (filled = false) => `
<svg width="18" height="18" viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M6 3.5h12a1 1 0 011 1V21l-7-4-7 4V4.5a1 1 0 011-1z" stroke-linejoin="round"/>
</svg>`;

export const iconNavigate = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M3 11l18-8-8 18-2.5-7.5L3 11z" stroke-linejoin="round" stroke-linecap="round"/>
</svg>`;

export const iconFlag = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M5 21V4h13l-3 4 3 4H5" stroke-linejoin="round" stroke-linecap="round"/>
</svg>`;

export const iconPlus = `
<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
</svg>`;

export const iconClose = `
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>
</svg>`;
