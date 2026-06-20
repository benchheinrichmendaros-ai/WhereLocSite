// ==========================================================================
// components/Navbar.js
// Renders the top nav. Shows Log In/Sign Up when logged out, or an
// avatar + Profile/Log out when logged in.
// ==========================================================================

import { pinMark } from "./icons.js";
import { getCurrentUser, getCurrentProfile, logOut } from "../js/auth.js";

// Mounts the navbar into `container` (a DOM element).
export async function renderNavbar(container) {
  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;

  container.innerHTML = `
    <nav class="navbar">
      <div class="container" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
        <a href="index.html" class="navbar__brand">
          ${pinMark()}
          WhereLoc
        </a>
        <div class="navbar__actions">
          ${
            profile
              ? `
                <a href="profile.html" class="navbar__avatar" aria-label="Your profile">
                  <img src="${profile.avatar_url || placeholderAvatar()}" alt="" />
                </a>
                <button class="btn btn-ghost" id="nav-logout">Log out</button>
              `
              : `
                <a href="login.html" class="btn btn-ghost">Log in</a>
                <a href="signup.html" class="btn btn-primary">Sign up</a>
              `
          }
        </div>
      </div>
    </nav>
  `;

  const logoutBtn = container.querySelector("#nav-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await logOut();
      location.href = "index.html";
    });
  }
}

export function placeholderAvatar() {
  // Flat gray circle as a data URI — no network request needed for the
  // default avatar, per the "gray placeholder avatar" spec.
  return "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#D9D9D9"/><circle cx="32" cy="24" r="12" fill="#BDBDBD"/><ellipse cx="32" cy="54" rx="20" ry="16" fill="#BDBDBD"/></svg>`
  );
}
