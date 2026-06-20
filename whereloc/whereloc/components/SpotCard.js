// ==========================================================================
// components/SpotCard.js
// Renders one spot as a card. Used on the home feed and on profile tabs.
// Clicking the card body goes to the detail page; the action icons work
// in place without navigating away.
// ==========================================================================

import { iconBookmark, iconNavigate, iconFlag } from "./icons.js";
import { saveSpot, unsaveSpot, isSpotSaved, reportSpot } from "../js/api.js";
import { CATEGORIES } from "../config.js";
import { showToast } from "./Toast.js";

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

export function spotCardHTML(spot) {
  const cover = spot.image_urls?.[0];
  return `
    <article class="spot-card" data-spot-id="${spot.id}">
      <a href="spot.html?id=${spot.id}" class="spot-card__image">
        ${cover ? `<img src="${cover}" alt="${escapeHtml(spot.title)}" loading="lazy" />` : ""}
        ${spot.is_staff_pick ? `<span class="badge badge--staff-pick">Staff Pick</span>` : ""}
        ${spot.age_tag !== "all" ? `<span class="badge badge--age">${spot.age_tag}</span>` : ""}
      </a>
      <div class="spot-card__body">
        <span class="spot-card__category">
          <span class="cat-dot cat-dot--${spot.category}"></span>
          ${CATEGORY_LABEL[spot.category] || spot.category}
        </span>
        <a href="spot.html?id=${spot.id}">
          <h3 class="spot-card__title">${escapeHtml(spot.title)}</h3>
        </a>
        <p class="spot-card__desc">${escapeHtml(spot.description || "")}</p>
        <div class="spot-card__footer">
          <button class="icon-btn" data-action="navigate" aria-label="Open in Maps">${iconNavigate}</button>
          <div style="display:flex;gap:4px;">
            <button class="icon-btn" data-action="report" aria-label="Report this spot">${iconFlag}</button>
            <button class="icon-btn" data-action="save" aria-pressed="false" aria-label="Save spot">${iconBookmark(false)}</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

// Wires up the action buttons for one rendered card. Call this after
// inserting spotCardHTML(spot) into the DOM.
export async function attachSpotCardEvents(cardEl, spot) {
  const saveBtn = cardEl.querySelector('[data-action="save"]');
  const navBtn = cardEl.querySelector('[data-action="navigate"]');
  const reportBtn = cardEl.querySelector('[data-action="report"]');

  const saved = await isSpotSaved(spot.id);
  setSaveState(saveBtn, saved);

  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const currentlySaved = saveBtn.getAttribute("aria-pressed") === "true";
      if (currentlySaved) {
        await unsaveSpot(spot.id);
        setSaveState(saveBtn, false);
      } else {
        await saveSpot(spot.id);
        setSaveState(saveBtn, true);
        showToast("Saved");
      }
    } catch (err) {
      showToast(err.message?.includes("logged in") ? "Log in to save spots" : "Something went wrong");
    }
  });

  navBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // Universal maps deep link: works for both Google Maps and Apple
    // Maps depending on the device's default handler.
    window.open(`https://maps.google.com/?q=${spot.lat},${spot.lng}`, "_blank");
  });

  reportBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const reason = prompt("What's wrong with this spot? (e.g. closed, unsafe, inaccurate)");
    if (!reason) return;
    try {
      await reportSpot(spot.id, reason);
      showToast("Report sent — thank you");
    } catch (err) {
      showToast(err.message || "Couldn't send report");
    }
  });
}

function setSaveState(btn, saved) {
  btn.setAttribute("aria-pressed", String(saved));
  btn.innerHTML = iconBookmark(saved);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
