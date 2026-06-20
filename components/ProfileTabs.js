// ==========================================================================
// components/ProfileTabs.js
// Renders the "My Uploads" / "My Saves" tab switcher on the profile page
// and loads + renders the right spot grid for whichever tab is active.
// ==========================================================================

import { getSpotsByOwner, getMySaves } from "../js/api.js";
import { spotCardHTML, attachSpotCardEvents } from "./SpotCard.js";
import { pinMark } from "./icons.js";

export function renderProfileTabs(container, userId) {
  container.innerHTML = `
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" aria-selected="true" data-tab="uploads">My Uploads</button>
      <button class="tab" role="tab" aria-selected="false" data-tab="saves">My Saves</button>
    </div>
    <div id="tab-content" class="spot-grid"></div>
  `;

  const tabs = container.querySelectorAll(".tab");
  const content = container.querySelector("#tab-content");

  async function loadTab(tab) {
    content.innerHTML = `<p class="field-hint">Loading...</p>`;
    const spots = tab === "uploads" ? await getSpotsByOwner(userId) : await getMySaves(userId);

    if (spots.length === 0) {
      content.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          ${pinMark()}
          <p>${tab === "uploads" ? "You haven't posted a spot yet." : "Nothing saved yet — tap the bookmark on any spot."}</p>
        </div>
      `;
      return;
    }

    content.innerHTML = spots.map(spotCardHTML).join("");
    content.querySelectorAll(".spot-card").forEach((cardEl) => {
      const spot = spots.find((s) => s.id === cardEl.dataset.spotId);
      attachSpotCardEvents(cardEl, spot);
    });
  }

  tabs.forEach((tabBtn) => {
    tabBtn.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
      tabBtn.setAttribute("aria-selected", "true");
      loadTab(tabBtn.dataset.tab);
    });
  });

  loadTab("uploads");
}
