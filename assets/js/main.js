/**
 * RA ROYAL ARENA - Core Interactive Controller
 * Handles mobile navigation, smooth page transitions,
 * and the 3-Step Booking Wizard with WhatsApp API dispatch.
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
   3. 3-Step Booking Wizard & WhatsApp Dispatch
   -------------------------------------------------------------------------- */
function initBookingForm() {
  const form = document.getElementById("reservationForm");
  if (!form) return;

  const fullNameInput = document.getElementById("fullName");
  const mobileInput = document.getElementById("mobileNumber");
  const serviceSelect = document.getElementById("serviceType");
  const durationGroup = document.getElementById("durationGroup");
  const durationSelect = document.getElementById("duration");
  const selectionTitleGroup = document.getElementById("selectionTitleGroup");
  const selectionTitleLabel = document.getElementById("selectionTitleLabel");
  const titleInput = document.getElementById("selectionTitle");
  const peopleSelect = document.getElementById("peopleCount");
  const dateInput = document.getElementById("preferredDate");
  const timeSlotSelect = document.getElementById("timeSlot");
  const notesInput = document.getElementById("additionalNotes");

  const stepperItems = [...document.querySelectorAll(".stepper-item")];
  const stepPanels = [...document.querySelectorAll(".wizard-step")];
  const stepperProgress = document.getElementById("stepperProgress");

  const step1Error = document.getElementById("step1Error");
  const step2Error = document.getElementById("step2Error");
  const formError = document.getElementById("formError");

  let currentStep = 1;
  const completedSteps = new Set();

  // Set minimum date to today
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  // Contextual UI updates based on selected Experience Category
  function updateServiceContext() {
    const type = serviceSelect.value;

    if (!type) {
      durationGroup.style.display = "none";
      selectionTitleGroup.style.display = "none";
      peopleSelect.innerHTML = `<option value="1 Person">1 Person</option>`;
      return;
    }

    selectionTitleGroup.style.display = "flex";

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
      selectionTitleLabel.innerHTML = '<i class="fa-solid fa-gamepad"></i> Preferred PS5 Game';
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
      selectionTitleLabel.innerHTML = '<i class="fa-solid fa-film"></i> Movie Title (or Custom Request)';
      titleInput.placeholder = "e.g., Interstellar, Inception, or Custom Request";
    } else {
      // Birthday Package
      durationGroup.style.display = "none";
      peopleSelect.innerHTML = `
        <option value="Private Group (Up to 8 Persons)">Private Group (Up to 8 Persons)</option>
        <option value="Extended Group (8+ Persons)">Extended Group (8+ Persons)</option>
      `;
      selectionTitleLabel.innerHTML = '<i class="fa-solid fa-cake-candles"></i> Celebration Notes / Song & Game Preferences';
      titleInput.placeholder = "e.g., Guitar + JBL Karaoke + PS5 Setup (Rs. 5,500 Package)";
    }
  }

  // Parse URL query parameters for seamless pre-selection from Home/Gaming/Movies pages
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

  serviceSelect.addEventListener("change", () => {
    step2Error.classList.remove("visible");
    updateServiceContext();
  });

  // Render Stepper Bar & Active Form Step
  function goToStep(targetStep) {
    currentStep = targetStep;

    stepPanels.forEach((panel) => {
      const panelStep = Number(panel.dataset.stepPanel);
      panel.classList.toggle("active", panelStep === currentStep);
    });

    stepperItems.forEach((item) => {
      const itemStep = Number(item.dataset.step);
      const isCompleted = completedSteps.has(itemStep);
      const isActive = itemStep === currentStep;

      item.classList.toggle("active", isActive);
      item.classList.toggle("completed", isCompleted && !isActive);
      item.setAttribute("aria-selected", String(isActive));
      item.disabled = !(isCompleted || itemStep <= currentStep);
    });

    // Progress line fills cleanly across completed / active steps
    const highestReached = Math.max(currentStep, ...completedSteps, 1);
    const fillPercent = ((highestReached - 1) / 2) * 100;
    if (stepperProgress) {
      stepperProgress.style.width = `${fillPercent}%`;
    }
  }

  // Step 1 Validation -> Step 2
  function handleStep1Next() {
    const fullName = fullNameInput.value.trim();
    const mobile = mobileInput.value.trim();

    if (!fullName || !mobile) {
      step1Error.classList.add("visible");
      if (!fullName) fullNameInput.focus();
      else mobileInput.focus();
      return;
    }

    step1Error.classList.remove("visible");
    completedSteps.add(1);
    goToStep(2);
  }

  // Step 2 Validation -> Step 3
  function handleStep2Next() {
    const selectedService = serviceSelect.value;

    if (!selectedService) {
      step2Error.classList.add("visible");
      serviceSelect.focus();
      return;
    }

    step2Error.classList.remove("visible");
    completedSteps.add(2);
    goToStep(3);
  }

  document.getElementById("step1NextBtn").addEventListener("click", handleStep1Next);
  document.getElementById("step2NextBtn").addEventListener("click", handleStep2Next);

  // Back Buttons
  document.querySelectorAll(".wizard-prev-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prevStep = Number(btn.dataset.prevStep);
      goToStep(prevStep);
    });
  });

  // Clickable Completed Step Circles
  stepperItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (item.disabled) return;
      const target = Number(item.dataset.step);
      goToStep(target);
    });
  });

  // Prevent Enter key on Step 1 & 2 inputs from submitting before Step 3
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && currentStep < 3) {
      e.preventDefault();
      if (currentStep === 1) handleStep1Next();
      else if (currentStep === 2) handleStep2Next();
    }
  });

  // Final Step 3 Submit -> Original WhatsApp API Format
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = fullNameInput.value.trim();
    const mobile = mobileInput.value.trim();
    const serviceType = serviceSelect.value;
    const duration =
      serviceType === "Birthday Package"
        ? "Full Birthday Setup (Rs. 5,500)"
        : durationSelect.value;
    const people = peopleSelect.value;
    const selectionTitle = titleInput.value.trim() || "To be decided at venue";
    const prefDate = dateInput.value;
    const timeSlot = timeSlotSelect.value;
    const notes = notesInput.value.trim();

    if (!prefDate || !timeSlot || !people) {
      formError.classList.add("visible");
      return;
    }
    formError.classList.remove("visible");

    completedSteps.add(3);
    goToStep(3);

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

  goToStep(1);
}