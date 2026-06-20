// ==========================================================================
// components/UploadForm.js
// Renders the "add a spot" form and handles submission. Image previews,
// the 5-image cap, and field validation all live here.
// ==========================================================================

import { CATEGORIES, AGE_TAGS, MAX_IMAGES_PER_SPOT, MAX_IMAGE_SIZE_MB } from "../config.js";
import { initMapPicker } from "./MapPicker.js";
import { createSpot } from "../js/api.js";
import { showToast } from "./Toast.js";

export function renderUploadForm(container) {
  let chosenFiles = [];
  let pickedLocation = null;

  container.innerHTML = `
    <form id="upload-form">
      <div class="field">
        <label>Photos (up to ${MAX_IMAGES_PER_SPOT})</label>
        <div class="image-picker" id="image-picker"></div>
        <input type="file" id="image-input" accept="image/*" multiple hidden />
        <p class="field-hint">Photo metadata (including GPS) is stripped automatically before upload.</p>
      </div>

      <div class="field">
        <label for="title">Title</label>
        <input type="text" id="title" required maxlength="80" placeholder="e.g. Quiet 3rd-floor library nook" />
      </div>

      <div class="field">
        <label for="description">Description</label>
        <textarea id="description" rows="4" required maxlength="600" placeholder="What makes this spot worth visiting?"></textarea>
      </div>

      <div class="field">
        <label for="category">Category</label>
        <select id="category" required>
          ${CATEGORIES.map((c) => `<option value="${c.value}">${c.label}</option>`).join("")}
        </select>
      </div>

      <div class="field">
        <label for="age-tag">Age accessibility</label>
        <select id="age-tag" required>
          ${AGE_TAGS.map((a) => `<option value="${a.value}">${a.label}</option>`).join("")}
        </select>
      </div>

      <div class="field">
        <label>Location</label>
        <div class="map-picker">
          <div id="map-picker-canvas"></div>
          <div class="map-picker__hint">
            <span>Tap or drag the pin to set the exact spot</span>
            <button type="button" class="btn btn-ghost" id="locate-btn" style="margin-left:auto;">Center on me</button>
          </div>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-block" id="submit-btn">Post spot</button>
    </form>
  `;

  // --- Image picker -------------------------------------------------
  const imagePicker = container.querySelector("#image-picker");
  const imageInput = container.querySelector("#image-input");

  function renderImageSlots() {
    const slots = [];
    chosenFiles.forEach((file, i) => {
      slots.push(`
        <div class="image-picker__slot">
          <img src="${URL.createObjectURL(file)}" alt="" />
          <button type="button" class="image-picker__remove" data-index="${i}" aria-label="Remove photo">&times;</button>
        </div>
      `);
    });
    if (chosenFiles.length < MAX_IMAGES_PER_SPOT) {
      slots.push(`<button type="button" class="image-picker__slot" id="add-image-slot" aria-label="Add photo">+</button>`);
    }
    imagePicker.innerHTML = slots.join("");

    imagePicker.querySelector("#add-image-slot")?.addEventListener("click", () => imageInput.click());
    imagePicker.querySelectorAll(".image-picker__remove").forEach((btn) =>
      btn.addEventListener("click", () => {
        chosenFiles.splice(Number(btn.dataset.index), 1);
        renderImageSlots();
      })
    );
  }

  imageInput.addEventListener("change", (e) => {
    const incoming = Array.from(e.target.files);
    for (const file of incoming) {
      if (chosenFiles.length >= MAX_IMAGES_PER_SPOT) break;
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        showToast(`${file.name} is over ${MAX_IMAGE_SIZE_MB}MB`);
        continue;
      }
      chosenFiles.push(file);
    }
    imageInput.value = "";
    renderImageSlots();
  });
  renderImageSlots();

  // --- Map picker -----------------------------------------------------
  const picker = initMapPicker("map-picker-canvas", {
    onChange: (latLng) => { pickedLocation = latLng; },
  });
  container.querySelector("#locate-btn").addEventListener("click", () => picker.recenterOnUser());

  // --- Submit -----------------------------------------------------------
  container.querySelector("#upload-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (chosenFiles.length === 0) {
      showToast("Add at least one photo");
      return;
    }
    const submitBtn = container.querySelector("#submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Posting...";

    try {
      const spot = await createSpot({
        title: container.querySelector("#title").value.trim(),
        description: container.querySelector("#description").value.trim(),
        category: container.querySelector("#category").value,
        ageTag: container.querySelector("#age-tag").value,
        lat: pickedLocation.lat,
        lng: pickedLocation.lng,
        images: chosenFiles,
      });
      showToast("Spot posted!");
      window.location.href = `spot.html?id=${spot.id}`;
    } catch (err) {
      showToast(err.message || "Couldn't post spot");
      submitBtn.disabled = false;
      submitBtn.textContent = "Post spot";
    }
  });

  // Leaflet sizes itself based on the container's dimensions at init
  // time; if the form was rendered inside a hidden/animating container,
  // nudge it once layout settles.
  setTimeout(() => picker.invalidateSize(), 200);
}
