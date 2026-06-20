// ==========================================================================
// js/utils/profanity.js
// A basic blocklist filter. This is a free, client-side first line of
// defense against casual abuse — NOT a substitute for the report button
// or admin moderation queue, and it's trivially bypassed by anyone
// motivated. If WhereLoc grows, swap `containsProfanity` for a call to a
// real moderation API (e.g. an AI moderation endpoint) without changing
// any call sites — they all go through this one function.
// ==========================================================================

// Keep this list short and clearly-offensive only, to minimize false
// positives on ordinary descriptions. Edit freely.
const BLOCKLIST = [
  "fuck", "shit", "bitch", "asshole", "cunt", "nigger", "nigga",
  "faggot", "retard", "whore", "slut",
];

const PATTERN = new RegExp(
  `\\b(${BLOCKLIST.map((w) => w.replace(/[aeiou]/g, "$&[\\W_]*")).join("|")})\\b`,
  "i"
);

export function containsProfanity(text) {
  if (!text) return false;
  return PATTERN.test(text);
}

// Returns a user-facing reason string if text should be blocked, or null
// if it's clean. Centralizing the message keeps the UI copy consistent.
export function checkSubmissionText(text) {
  if (containsProfanity(text)) {
    return "That text looks like it contains language we don't allow. Please rephrase.";
  }
  return null;
}
