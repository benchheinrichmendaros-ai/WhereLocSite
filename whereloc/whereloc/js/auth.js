// ==========================================================================
// js/auth.js
// Wraps Supabase Auth + the `users` profile row. Every page that needs to
// know "who is logged in" should import from here, not call supabase.auth
// directly, so the logic only lives in one place.
// ==========================================================================

import { supabase } from "./supabaseClient.js";

// Generates a fun fallback handle like "Wanderer#48213" for users who
// skip picking a username.
export function generateRandomHandle() {
  const adjectives = ["Wanderer", "Scout", "Nomad", "Drifter", "Rover", "Sprout"];
  const word = adjectives[Math.floor(Math.random() * adjectives.length)];
  const digits = Math.floor(10000 + Math.random() * 90000);
  return `${word}#${digits}`;
}

// Creates a new account with email + password. Does NOT create the
// `users` profile row yet — that happens in completeUsernameSetup()
// once the user has confirmed their email and picked a name.
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function logIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Returns the logged-in auth user, or null if no session.
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Returns this user's row from the `users` profile table, or null if
// they haven't finished onboarding (no row yet).
export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Real-time-ish duplicate check while the user types a username.
// Call this on input with a small debounce (see pages/username.html).
export async function isUsernameTaken(username) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

// Creates the `users` profile row for a freshly-confirmed auth user.
// Falls back to a random handle if the user left the field blank.
export async function completeUsernameSetup(username) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No authenticated user.");

  const finalUsername = (username || "").trim() || generateRandomHandle();

  const { data, error } = await supabase
    .from("users")
    .insert({ id: user.id, username: finalUsername })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Updates the username on an existing profile (separate from
// completeUsernameSetup, which only ever INSERTs the first time).
export async function updateUsername(newUsername) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No authenticated user.");
  const { data, error } = await supabase
    .from("users")
    .update({ username: newUsername })
    .eq("id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Redirect helper: send logged-out visitors to the login page, preserving
// where they were trying to go via a `next` query param.
export function requireAuthOrRedirect() {
  return getCurrentUser().then((user) => {
    if (!user) {
      const next = encodeURIComponent(location.pathname + location.search);
      location.href = `login.html?next=${next}`;
      return null;
    }
    return user;
  });
}
