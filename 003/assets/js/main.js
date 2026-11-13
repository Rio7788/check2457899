/**
 * RA ROYAL ARENA - Core Interactive Controller
 * Handles mobile navigation, smooth page transitions, URL parameter pre-fill,
 * dynamic booking form options, and WhatsApp API reservation dispatch.
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initPageTransitions();
  initBookingForm();
});

/* --------------------------------------------------------------------------
   1. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobileMenuToggle");
  const drawer = document.getElementById("mobileDrawer");

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener("click", () => {
    const isOpen = drawer.classList.toggle("open");
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    toggleBtn.innerHTML = isOpen
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      drawer.classList.remove("open");
      document.body.style.overflow = "";
    });
  });
}

/* --------------------------------------------------------------------------
   2. Smooth Page Transitions
   -------------------------------------------------------------------------- */
function initPageTransitions() {
  const links = document.querySelectorAll('a[href$=".html"], a[href*=".html?"]');

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetUrl = link.getAttribute("href");
      if (!targetUrl || targetUrl.startsWith("#") || link.target === "_blank") return;

      e.preventDefault();
      document.body.classList.add("page-leaving");

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 240);
    });
  });
}

/* --------------------------------------------------------------------------
   3. Interactive Booking Form & WhatsApp Dispatch
   -------------------------------------------------------------------------- */
function initBookingForm() {
  const form = document.getElementById("reservationForm");
  if (!form) return;

  const serviceSelect = document.getElementById("serviceType");
  const durationGroup = document.getElementById("durationGroup");
  const durationSelect = document.getElementById("duration");
  const peopleSelect = document.getElementById("peopleCount");
  const titleInput = document.getElementById("selectionTitle");
  const titleLabel = document.getElementById("selectionTitleLabel");
  const dateInput = document.getElementById("preferredDate");

  // Set minimum date to today
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  // Contextual UI updates based on Service Type
  function updateServiceContext() {
    const type = serviceSelect.value;

    if (type === "Gaming Session") {
      durationGroup.style.display = "flex";
      durationSelect.innerHTML = `
        <option value="1 Hour PS5 Session">1 Hour PS5 Session</option>
        <option value="2 Hours PS5 Session">2 Hours PS5 Session</option>
      `;
      peopleSelect.innerHTML = `
        <option value="1 Person">1 Person</option>
        <option value="2 Persons">2 Persons</option>
        <option value="4 Persons">4 Persons</option>
      `;
      titleLabel.innerHTML = '<i class="fa-solid fa-gamepad"></i> Preferred PS5 Game';
      titleInput.placeholder = "e.g., Marvel's Spider-Man 2, GTA V";
    } else if (type === "Movie Package") {
      durationGroup.style.display = "flex";
      durationSelect.innerHTML = `
        <option value="2.5 Hours Private Screening">2.5 Hours Private Screening</option>
      `;
      peopleSelect.innerHTML = `
        <option value="1 Person">1 Person</option>
        <option value="2 Persons">2 Persons</option>
        <option value="4 Persons">4 Persons</option>
        <option value="8 Persons">8 Persons (VIP Group)</option>
      `;
      titleLabel.innerHTML = '<i class="fa-solid fa-film"></i> Movie Title (or Custom Request)';
      titleInput.placeholder = "e.g., Interstellar, Inception, or Custom Request";
    } else {
      // Birthday Package
      durationGroup.style.display = "none";
      peopleSelect.innerHTML = `
        <option value="Private Group (Up to 8 Persons)">Private Group (Up to 8 Persons)</option>
        <option value="Extended Group (8+ Persons)">Extended Group (8+ Persons)</option>
      `;
      titleLabel.innerHTML = '<i class="fa-solid fa-cake-candles"></i> Celebration Notes / Song & Game Preferences';
      titleInput.placeholder = "e.g., Guitar + JBL Karaoke + PS5 Setup (Rs. 5,500 Package)";
    }
  }

  // Parse URL query parameters for seamless pre-selection from Gaming/Movies/Home pages
  const params = new URLSearchParams(window.location.search);
  const preService = params.get("service");
  const preTitle = params.get("title");
  const preDuration = params.get("duration");
  const prePeople = params.get("people");

  if (preService && [...serviceSelect.options].some((o) => o.value === preService)) {
    serviceSelect.value = preService;
  }

  updateServiceContext();

  if (preDuration && [...durationSelect.options].some((o) => o.value === preDuration)) {
    durationSelect.value = preDuration;
  }
  if (prePeople && [...peopleSelect.options].some((o) => o.value === prePeople)) {
    peopleSelect.value = prePeople;
  }
  if (preTitle) {
    titleInput.value = preTitle;
  }

  serviceSelect.addEventListener("change", updateServiceContext);

  // Form Submission -> WhatsApp API
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const mobile = document.getElementById("mobileNumber").value.trim();
    const serviceType = serviceSelect.value;
    const duration = serviceType === "Birthday Package" ? "Full Birthday Setup (Rs. 5,500)" : durationSelect.value;
    const people = peopleSelect.value;
    const selectionTitle = titleInput.value.trim() || "To be decided at venue";
    const prefDate = document.getElementById("preferredDate").value;
    const timeSlot = document.getElementById("timeSlot").value;
    const notes = document.getElementById("additionalNotes").value.trim();

    const errorEl = document.getElementById("formError");
    if (!fullName || !mobile || !prefDate || !timeSlot) {
      errorEl.classList.add("visible");
      return;
    }
    errorEl.classList.remove("visible");

    const messageLines = [
      "*RA ROYAL ARENA - NEW RESERVATION*",
      "--------------------------------",
      `*Name:* ${fullName}`,
      `*Mobile:* ${mobile}`,
      `*Service:* ${serviceType}`,
      `*Package / Duration:* ${duration}`,
      `*Group Size:* ${people}`,
      `*Selection / Details:* ${selectionTitle}`,
      `*Preferred Date:* ${prefDate}`,
      `*Time Slot:* ${timeSlot}`,
      notes ? `*Extra Notes:* ${notes}` : null,
      "--------------------------------",
      "Sent via RA Royal Arena Badulla Official Portal"
    ].filter(Boolean);

    const encodedText = encodeURIComponent(messageLines.join("\n"));
    const whatsappUrl = `https://wa.me/94706821331?text=${encodedText}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });
}