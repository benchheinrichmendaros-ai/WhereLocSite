// ==========================================================================
// components/Toast.js
// Call showToast("message") from anywhere to flash a brief notification
// above the FAB. Auto-dismisses; only one toast shows at a time.
// ==========================================================================

let activeToast = null;

export function showToast(message, duration = 2400) {
  if (activeToast) activeToast.remove();

  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  activeToast = el;

  setTimeout(() => {
    el.remove();
    if (activeToast === el) activeToast = null;
  }, duration);
}
