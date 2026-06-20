// ==========================================================================
// components/SearchBar.js
// Renders the search input and filter chip row. Calls `onChange(filters)`
// whenever the search text or active filters change, debounced on typing.
// ==========================================================================

import { iconSearch } from "./icons.js";
import { CATEGORIES, AGE_TAGS } from "../config.js";

export function renderSearchBar(container, onChange) {
  const state = { search: "", category: null, ageTag: null };

  container.innerHTML = `
    <div class="search-bar">
      ${iconSearch}
      <input type="text" id="search-input" placeholder="Search spots..." aria-label="Search spots" />
    </div>
    <div class="filter-row" id="filter-row" role="group" aria-label="Filter by category">
      ${CATEGORIES.map(
        (c) => `<button class="chip" data-type="category" data-value="${c.value}" aria-pressed="false">${c.label}</button>`
      ).join("")}
      ${AGE_TAGS.map(
        (a) => `<button class="chip" data-type="ageTag" data-value="${a.value}" aria-pressed="false">${a.label}</button>`
      ).join("")}
    </div>
  `;

  const input = container.querySelector("#search-input");
  let debounceTimer;
  input.addEventListener("input", (e) => {
    state.search = e.target.value.trim();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => onChange({ ...state }), 300);
  });

  container.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const { type, value } = chip.dataset;
      const isActive = chip.getAttribute("aria-pressed") === "true";

      // Clicking an active chip clears that filter; otherwise it becomes
      // the sole active filter of its type (single-select per type).
      container.querySelectorAll(`.chip[data-type="${type}"]`).forEach((c) =>
        c.setAttribute("aria-pressed", "false")
      );
      state[type] = isActive ? null : value;
      if (!isActive) chip.setAttribute("aria-pressed", "true");

      onChange({ ...state });
    });
  });
}
