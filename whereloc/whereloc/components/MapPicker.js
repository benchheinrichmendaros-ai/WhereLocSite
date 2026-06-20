// ==========================================================================
// components/MapPicker.js
// Wraps Leaflet + OpenStreetMap (free, no API key) to let the user choose
// a spot's location by tapping the map and dragging a pin. The "use my
// location" button only RECENTERS the map view as a convenience — it
// never sets the spot's coordinates automatically. The user must still
// place/confirm the pin themselves, per the privacy requirement that
// spot locations are always a deliberate, manual choice.
//
// Assumes the Leaflet UMD script + CSS are already loaded on the page
// (see pages/upload.html <head>), so the global `L` is available.
// ==========================================================================

const DEFAULT_CENTER = [40.7128, -74.006]; // fallback center if geolocation is unavailable/denied
const DEFAULT_ZOOM = 15;

export function initMapPicker(containerId, { initialLat, initialLng, onChange } = {}) {
  const startLat = initialLat ?? DEFAULT_CENTER[0];
  const startLng = initialLng ?? DEFAULT_CENTER[1];

  const map = L.map(containerId).setView([startLat, startLng], DEFAULT_ZOOM);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const marker = L.marker([startLat, startLng], { draggable: true }).addTo(map);

  function emitChange() {
    const { lat, lng } = marker.getLatLng();
    onChange?.({ lat, lng });
  }

  marker.on("dragend", emitChange);
  map.on("click", (e) => {
    marker.setLatLng(e.latlng);
    emitChange();
  });

  // Fire once on init so callers always have a starting value.
  emitChange();

  return {
    getLatLng: () => marker.getLatLng(),
    recenterOnUser() {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], DEFAULT_ZOOM);
        // Note: the marker (and therefore the saved spot location) is
        // intentionally NOT moved here — recentering is just a view
        // convenience. The user still drags/taps to place the pin.
      });
    },
    invalidateSize: () => map.invalidateSize(),
  };
}
