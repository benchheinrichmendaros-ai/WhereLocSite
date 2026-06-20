// ==========================================================================
// js/api.js
// Every Supabase query lives here. Pages and components call these
// functions instead of touching `supabase.from(...)` directly — keeps
// the data layer in one editable place if the schema changes later.
// ==========================================================================

import { supabase } from "./supabaseClient.js";
import { STORAGE_BUCKET, MAX_IMAGES_PER_SPOT } from "../config.js";
import { stripExifAndCompress } from "./utils/exif.js";
import { checkSubmissionText } from "./utils/profanity.js";
import { checkRateLimit } from "./utils/rateLimit.js";

// -------------------------------------------------------------------------
// Spots
// -------------------------------------------------------------------------

// Fetches spots for the home feed. `filters` can include:
// { search, category, ageTag, limit, offset }
export async function getSpots(filters = {}) {
  let query = supabase
    .from("spots")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.ageTag) query = query.eq("age_tag", filters.ageTag);
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getSpotById(id) {
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getSpotsByOwner(ownerId) {
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// Uploads photos (EXIF-stripped) then inserts the spot row.
// `images` is a FileList/array of File objects, already chosen by the
// user via the image picker (max enforced both here and in the UI).
export async function createSpot({ title, description, category, ageTag, lat, lng, images }) {
  const textError = checkSubmissionText(`${title} ${description}`);
  if (textError) throw new Error(textError);

  const rate = await checkRateLimit("spot_upload");
  if (!rate.allowed) throw new Error(rate.message);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to post a spot.");

  const imageUrls = await uploadSpotImages(user.id, images);

  const { data, error } = await supabase
    .from("spots")
    .insert({
      owner_id: user.id,
      title,
      description,
      category,
      age_tag: ageTag,
      lat,
      lng,
      image_urls: imageUrls,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSpot(id, updates) {
  const { data, error } = await supabase
    .from("spots")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSpot(id) {
  const { error } = await supabase.from("spots").delete().eq("id", id);
  if (error) throw error;
}

// Strips EXIF from each file, uploads to Storage, returns public URLs.
async function uploadSpotImages(userId, files) {
  const fileArray = Array.from(files).slice(0, MAX_IMAGES_PER_SPOT);
  const urls = [];

  for (const file of fileArray) {
    const cleaned = await stripExifAndCompress(file);
    const path = `spots/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, cleaned, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (error) throw error;
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    urls.push(pub.publicUrl);
  }
  return urls;
}

// -------------------------------------------------------------------------
// Saves
// -------------------------------------------------------------------------

export async function saveSpot(spotId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to save a spot.");
  const { error } = await supabase
    .from("saves")
    .insert({ user_id: user.id, spot_id: spotId });
  if (error) throw error;
}

export async function unsaveSpot(spotId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in.");
  const { error } = await supabase
    .from("saves")
    .delete()
    .eq("user_id", user.id)
    .eq("spot_id", spotId);
  if (error) throw error;
}

export async function isSpotSaved(spotId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from("saves")
    .select("id")
    .eq("user_id", user.id)
    .eq("spot_id", spotId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

// Returns the full spot rows a user has saved (joins through `saves`).
export async function getMySaves(userId) {
  const { data, error } = await supabase
    .from("saves")
    .select("spot_id, spots(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => row.spots);
}

// -------------------------------------------------------------------------
// Reviews — intentionally never select/return a user_id (see schema)
// -------------------------------------------------------------------------

export async function getReviewsForSpot(spotId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("spot_id", spotId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addReview(spotId, rating, comment) {
  const textError = checkSubmissionText(comment);
  if (textError) throw new Error(textError);

  const rate = await checkRateLimit("review");
  if (!rate.allowed) throw new Error(rate.message);

  const { error } = await supabase
    .from("reviews")
    .insert({ spot_id: spotId, rating, comment });
  if (error) throw error;
}

// -------------------------------------------------------------------------
// Reports — write-only for normal users (RLS blocks reading them back)
// -------------------------------------------------------------------------

export async function reportSpot(spotId, reason) {
  const rate = await checkRateLimit("report");
  if (!rate.allowed) throw new Error(rate.message);

  const { error } = await supabase
    .from("reports")
    .insert({ spot_id: spotId, reason });
  if (error) throw error;
}

// -------------------------------------------------------------------------
// Profile
// -------------------------------------------------------------------------

export async function updateAvatar(file) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in.");

  const cleaned = await stripExifAndCompress(file);
  const path = `avatars/${user.id}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, cleaned, { contentType: "image/jpeg", upsert: true });
  if (uploadError) throw uploadError;

  const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  // Cache-bust so the new avatar shows immediately everywhere it's used.
  const url = `${pub.publicUrl}?t=${Date.now()}`;

  const { data, error } = await supabase
    .from("users")
    .update({ avatar_url: url })
    .eq("id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
