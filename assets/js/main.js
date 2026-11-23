/**
 * ROYAL ARENA - Core Interactive Controller
 * Handles mobile navigation, smooth page transitions, hero parallax,
 * and the 3-Step Animated Reservation Wizard with WhatsApp dispatch.
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initPageTransitions();
  initHeroParallax();
  initBookingWizard();
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
   3. Desktop Hero Floating Parallax
   -------------------------------------------------------------------------- */
function initHeroParallax() {
  const stage = document.querySelector(".hero-floating-stage");
  if (!stage || !window.matchMedia("(pointer: fine)").matches) return;

  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 14;
    const y = (e.clientY / window.innerHeight - 0.5) * 14;
    stage.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
}

/* --------------------------------------------------------------------------
   4. 3-Step Animated Booking Wizard & WhatsApp Dispatch
   -------------------------------------------------------------------------- */
function initBookingWizard() {
  const form = document.getElementById("reservationForm");
  if (!form) return;

  const fullNameInput = document.getElementById("fullName");
  const mobileInput = document.getElementById("mobileNumber");
  const serviceSelect = document.getElementById("serviceType");
  const durationGroup = document.getElementById("durationGroup");
  const durationSelect = document.getElementById("duration");
  const peopleSelect = document.getElementById("peopleCount");
  const titleInput = document.getElementById("selectionTitle");
  const titleLabel = document.getElementById("selectionTitleLabel");
  const dateInput = document.getElementById("preferredDate");
  const timeSlotSelect = document.getElementById("timeSlot");
  const notesInput = document.getElementById("additionalNotes");

  const panes = [...document.querySelectorAll(".wizard-pane")];
  const stepNodes = [...document.querySelectorAll(".step-node")];
  const trackFill = document.getElementById("wizardTrackFill");
  const successOverlay = document.getElementById("stepSuccessOverlay");
  const successText = document.getElementById("stepSuccessText");
  const finalDoneBox = document.getElementById("wizardFinalDone");
  const manualWhatsappLink = document.getElementById("manualWhatsappLink");
  const resetWizardBtn = document.getElementById("resetWizardBtn");

  // Live Ticket Elements
  const ticketStep1 = document.getElementById("ticketStep1");
  const ticketStep2 = document.getElementById("ticketStep2");
  const ticketStep3 = document.getElementById("ticketStep3");
  const ticketGuestValue = document.getElementById("ticketGuestValue");
  const ticketExpValue = document.getElementById("ticketExpValue");
  const ticketDateValue = document.getElementById("ticketDateValue");

  let currentStep = 1;
  let completedSteps = new Set();
  let isTransitioning = false;

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
      titleInput.placeholder = "e.g., Grand Theft Auto VI (GTA 6), Spider-Man 2";
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
      durationGroup.style.display = "none";
      peopleSelect.innerHTML = `
        <option value="Private Group (Up to 8 Persons)">Private Group (Up to 8 Persons)</option>
        <option value="Extended Group (8+ Persons)">Extended Group (8+ Persons)</option>
      `;
      titleLabel.innerHTML = '<i class="fa-solid fa-cake-candles"></i> Celebration Notes / Song & Game Preferences';
      titleInput.placeholder = "e.g., Guitar + JBL Karaoke + PS5 Setup (Rs. 5,500 Package)";
    }

    syncLiveTicket();
  }

  // Parse URL query parameters for seamless pre-selection
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

  // Show sleek Pre-selected banner on Step 1 if user came from a Game, Movie, or GTA 6 Popup
  if (preTitle || preService || preDuration || prePeople) {
    const prefillNotice = document.getElementById("prefillNotice");
    const prefillText = document.getElementById("prefillText");
    if (prefillNotice && prefillText) {
      const label = preTitle || preDuration || preService || "Selected Package";
      prefillText.textContent = `Pre-selected: ${label}`;
      prefillNotice.style.display = "inline-flex";
    }
  }

  // Sync Live Booking Ticket Sidebar
  function syncLiveTicket() {
    const nameVal = fullNameInput.value.trim();
    const mobileVal = mobileInput.value.trim();
    if (nameVal || mobileVal) {
      ticketGuestValue.textContent = [nameVal, mobileVal].filter(Boolean).join(" • ");
    } else {
      ticketGuestValue.textContent = "Pending...";
    }
    ticketStep1.classList.toggle("done", completedSteps.has(1));

    const svc = serviceSelect.value;
    const ppl = peopleSelect.value;
    const dur = svc === "Birthday Package" ? "VIP Setup (Rs. 5,500)" : durationSelect.value;
    const title = titleInput.value.trim();
    ticketExpValue.textContent = [svc, ppl, dur, title].filter(Boolean).join(" • ");
    ticketStep2.classList.toggle("done", completedSteps.has(2));

    const dt = dateInput.value;
    const tm = timeSlotSelect.value;
    ticketDateValue.textContent = dt ? `${dt} (${tm})` : "Pending...";
    ticketStep3.classList.toggle("done", completedSteps.has(3));
  }

  // Update Stepper Visuals
  function updateStepperUI() {
    stepNodes.forEach((node) => {
      const stepNum = Number(node.dataset.stepTarget);
      const isDone = completedSteps.has(stepNum);
      const isActive = stepNum === currentStep;

      node.classList.toggle("active", isActive);
      node.classList.toggle("completed", isDone);
      node.disabled = !(isDone || stepNum <= currentStep);
    });

    const progressPercent = ((currentStep - 1) / 2) * 100;
    if (trackFill) {
      trackFill.style.width = `${progressPercent}%`;
    }

    panes.forEach((pane) => {
      const paneStep = Number(pane.dataset.step);
      pane.classList.toggle("active", paneStep === currentStep);
    });

    syncLiveTicket();
  }

  // Show brief Animated Checkmark Celebration before advancing
  function completeStepAndAdvance(stepJustFinished, nextStep, labelText) {
    if (isTransitioning) return;
    isTransitioning = true;

    completedSteps.add(stepJustFinished);
    updateStepperUI();

    if (successOverlay && successText) {
      successText.textContent = labelText;
      successOverlay.classList.add("show");
      // Restart SVG stroke animation cleanly
      const svg = successOverlay.querySelector(".tick-svg");
      if (svg) {
        const clone = svg.cloneNode(true);
        svg.parentNode.replaceChild(clone, svg);
      }
    }

    setTimeout(() => {
      if (successOverlay) successOverlay.classList.remove("show");
      currentStep = nextStep;
      updateStepperUI();
      isTransitioning = false;
    }, 620);
  }

  // Step 1 Validation -> Step 2
  function handleStep1Next() {
    const nameVal = fullNameInput.value.trim();
    const mobileVal = mobileInput.value.trim();
    const digitsOnly = mobileVal.replace(/\D/g, "");
    const err1 = document.getElementById("errorStep1");

    if (!nameVal || digitsOnly.length < 9) {
      err1.classList.add("visible");
      if (!nameVal) fullNameInput.focus();
      else mobileInput.focus();
      return;
    }

    err1.classList.remove("visible");
    completeStepAndAdvance(1, 2, "Step 1 Complete");
  }

  // Step 2 Validation -> Step 3
  function handleStep2Next() {
    const err2 = document.getElementById("errorStep2");
    if (!serviceSelect.value || !peopleSelect.value) {
      err2.classList.add("visible");
      return;
    }
    err2.classList.remove("visible");
    completeStepAndAdvance(2, 3, "Step 2 Complete");
  }

  document.getElementById("nextToStep2").addEventListener("click", handleStep1Next);
  document.getElementById("nextToStep3").addEventListener("click", handleStep2Next);

  // Back Buttons
  document.querySelectorAll(".wizard-back").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (isTransitioning) return;
      currentStep = Number(btn.dataset.prev);
      updateStepperUI();
    });
  });

  // Clicking completed step circles on top progress bar
  stepNodes.forEach((node) => {
    node.addEventListener("click", () => {
      if (isTransitioning || node.disabled) return;
      const target = Number(node.dataset.stepTarget);
      if (finalDoneBox && finalDoneBox.style.display !== "none") return;
      currentStep = target;
      updateStepperUI();
    });
  });

  // Prevent Enter key in Step 1/2 from submitting early
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && currentStep < 3) {
      e.preventDefault();
      if (currentStep === 1) handleStep1Next();
      else if (currentStep === 2) handleStep2Next();
    }
  });

  // Live listeners for ticket sync
  [fullNameInput, mobileInput, durationSelect, peopleSelect, titleInput, dateInput, timeSlotSelect].forEach((el) => {
    el.addEventListener("input", syncLiveTicket);
    el.addEventListener("change", syncLiveTicket);
  });
  serviceSelect.addEventListener("change", updateServiceContext);

  // Final Step 3 Submit -> Mark Complete + Launch WhatsApp synchronously (mobile-safe)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const err3 = document.getElementById("errorStep3");
    const prefDate = dateInput.value;
    const timeSlot = timeSlotSelect.value;

    if (!prefDate || !timeSlot) {
      err3.classList.add("visible");
      return;
    }
    err3.classList.remove("visible");

    completedSteps.add(3);
    updateStepperUI();

    const fullName = fullNameInput.value.trim();
    const mobile = mobileInput.value.trim();
    const serviceType = serviceSelect.value;
    const duration =
      serviceType === "Birthday Package"
        ? "Full Birthday Setup (Rs. 5,500)"
        : durationSelect.value;
    const people = peopleSelect.value;
    const selectionTitle = titleInput.value.trim() || "To be decided at venue";
    const notes = notesInput.value.trim();

    const messageLines = [
      "*ROYAL ARENA - NEW RESERVATION*",
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
      "Sent via Royal Arena Badulla Official Portal"
    ].filter(Boolean);

    const encodedText = encodeURIComponent(messageLines.join("\n"));
    const whatsappUrl = `https://wa.me/94706821331?text=${encodedText}`;

    // Show completed confirmation view & open WhatsApp synchronously
    panes.forEach((p) => p.classList.remove("active"));
    if (manualWhatsappLink) manualWhatsappLink.href = whatsappUrl;
    if (finalDoneBox) finalDoneBox.style.display = "flex";

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });

  // Reset Wizard
  if (resetWizardBtn) {
    resetWizardBtn.addEventListener("click", () => {
      completedSteps.clear();
      currentStep = 1;
      finalDoneBox.style.display = "none";
      updateStepperUI();
    });
  }

  updateStepperUI();
}