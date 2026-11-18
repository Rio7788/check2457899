/**
 * ROYAL ARENA - NEW RELEASE ENTRY POPUP CONTROLLER
 * Edit the NEW_DROP_CONFIG object below anytime to announce a new game or movie.
 */

const NEW_DROP_CONFIG = {
  enabled: true,                  // Set to false to turn off the popup completely
  showOncePerVisit: true,         // true = shows once per browser visit | false = shows every refresh (good for testing)

  badge: "NOW AVAILABLE ON PS5",
  tag: "NEW ARRIVAL",
  title: "Grand Theft Auto VI",
  highlight: "GTA 6",             // Fallback stylized watermark if image fails to load
  subtitle: "Experience Vice City in ultra-crisp 4K HDR on PlayStation 5 at Royal Arena Badulla.",

  serviceType: "Gaming Session",  // Use "Gaming Session" or "Movie Package"
  bookingTitle: "Grand Theft Auto VI (GTA 6)",
  ctaText: "Reserve GTA 6 Slot",

  // Extracted direct image URL (For permanent reliability, save the image locally as "assets/images/gta6.png")
  image: "assets/images/gta6.jpg"
};

document.addEventListener("DOMContentLoaded", () => {
  if (!NEW_DROP_CONFIG.enabled) return;

  const storageKey = "ra_seen_drop_title";
  if (
    NEW_DROP_CONFIG.showOncePerVisit &&
    sessionStorage.getItem(storageKey) === NEW_DROP_CONFIG.title
  ) {
    return;
  }

  buildAndShowDropModal(storageKey);
});

function buildAndShowDropModal(storageKey) {
  const isMovie = NEW_DROP_CONFIG.serviceType === "Movie Package";
  const iconClass = isMovie ? "fa-solid fa-film" : "fa-solid fa-gamepad";
  const bookingUrl = `booking.html?service=${encodeURIComponent(
    NEW_DROP_CONFIG.serviceType
  )}&title=${encodeURIComponent(NEW_DROP_CONFIG.bookingTitle)}`;

  const coverMedia = NEW_DROP_CONFIG.image
    ? `<img src="${NEW_DROP_CONFIG.image}" alt="${NEW_DROP_CONFIG.title}" class="drop-cover-img" />
       <div class="drop-watermark" style="display: none;">${NEW_DROP_CONFIG.highlight}</div>`
    : `<div class="drop-watermark">${NEW_DROP_CONFIG.highlight}</div>`;

  const backdrop = document.createElement("div");
  backdrop.className = "drop-modal-backdrop";
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  backdrop.setAttribute("aria-labelledby", "dropModalTitle");

  backdrop.innerHTML = `
    <div class="drop-modal">
      <button type="button" class="drop-close" aria-label="Close announcement">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div class="drop-cover">
        ${coverMedia}
        <div class="drop-cover-overlay"></div>
        <div class="drop-cover-top">
          <span class="drop-badge">
            <i class="fa-solid fa-bolt"></i> ${NEW_DROP_CONFIG.badge}
          </span>
        </div>
        <div class="drop-cover-bottom">
          <span class="drop-tag">
            <i class="${iconClass}"></i> ${NEW_DROP_CONFIG.tag}
          </span>
        </div>
      </div>

      <div class="drop-body">
        <h2 id="dropModalTitle" class="drop-title">${NEW_DROP_CONFIG.title}</h2>
        <p class="drop-subtitle">${NEW_DROP_CONFIG.subtitle}</p>

        <div class="drop-actions">
          <a href="${bookingUrl}" class="btn btn-gold" style="width: 100%;">
            <i class="fa-regular fa-calendar-check"></i> ${NEW_DROP_CONFIG.ctaText}
          </a>
          <button type="button" class="drop-dismiss-link">
            Continue to Website
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  // Automatic fallback if external image token expires or fails
  const coverImg = backdrop.querySelector(".drop-cover-img");
  if (coverImg) {
    coverImg.addEventListener("error", () => {
      coverImg.style.display = "none";
      const watermark = backdrop.querySelector(".drop-watermark");
      if (watermark) watermark.style.display = "flex";
    });
  }

  const closeModal = () => {
    backdrop.classList.remove("open");
    document.body.style.overflow = "";
    if (NEW_DROP_CONFIG.showOncePerVisit) {
      sessionStorage.setItem(storageKey, NEW_DROP_CONFIG.title);
    }
    setTimeout(() => backdrop.remove(), 350);
  };

  setTimeout(() => {
    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  }, 550);

  backdrop.querySelector(".drop-close").addEventListener("click", closeModal);
  backdrop.querySelector(".drop-dismiss-link").addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener("keydown", function escHandler(e) {
    if (e.key === "Escape" && document.body.contains(backdrop)) {
      closeModal();
      document.removeEventListener("keydown", escHandler);
    }
  });
}
