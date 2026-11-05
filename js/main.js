/* ==========================================================
   Db4D Studio — main.js
   Everything you may want to edit is in SETTINGS below.
   ========================================================== */

const SETTINGS = {
  // Country code + number, no "+" and no spaces
  whatsappNumber: "2347084788749",
  email: "danielmathias769@gmail.com",

  // "Let's chat", hero and contact-section buttons (casual enquiry)
  emailSubject: "Project enquiry from the Db4D Studio website",
  generalMessage:
    "Hi Db4D Studio, I found your website and I'd like to talk about a project.\n\n" +
    "(Feel free to edit this message and tell me what you have in mind.)",

  // Package buttons. {name} becomes the package name (Starter, Growth...).
  // The price comes from data-price on each package card in index.html.
  // Text in [square brackets] is a placeholder the visitor replaces.
  packageEmailSubject: "{name} package enquiry from the Db4D Studio website",
  packageDetails:
    "\n\nAbout my project: [describe your project here]\n" +
    "Preferred timeline: [add a date or deadline here]\n\n" +
    "(Feel free to edit this message to say what you need.)"
};


/* ---------- Link builders ---------- */

/**
 * @param {string} message
 * @returns {string}
 */
function whatsappLink(message) {
  return "https://wa.me/" + SETTINGS.whatsappNumber + "?text=" + encodeURIComponent(message);
}

/**
 * @param {string} body
 * @param {string} subject
 * @returns {string}
 */
function emailLink(body, subject) {
  return (
    "mailto:" + SETTINGS.email +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(body)
  );
}

/**
 * Builds the message for a package enquiry.
 * @param {string} name
 * @param {string | undefined} price
 * @returns {string}
 */
function packageMessage(name, price) {
  return (
    "Hi Db4D Studio, I'm interested in the " + name + " package" +
    (price ? " (" + price + ")" : "") + "." +
    SETTINGS.packageDetails
  );
}

/**
 * Points every WhatsApp and email link inside `root` at the given message.
 * @param {ParentNode} root
 * @param {string} message
 * @param {string} subject
 */
function setContactLinks(root, message, subject) {
  root.querySelectorAll('[data-contact="whatsapp"]').forEach((link) => {
    link.href = whatsappLink(message);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
  root.querySelectorAll('[data-contact="email"]').forEach((link) => {
    link.href = emailLink(message, subject);
  });
}


/* ---------- Page links: general message ---------- */

setContactLinks(document, SETTINGS.generalMessage, SETTINGS.emailSubject);

const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ---------- Videos: one at a time, no right-click saving ---------- */

const videos = Array.from(document.querySelectorAll("video"));

/**
 * Pauses every video except the one given (or all, if none is given).
 * @param {HTMLVideoElement} [except]
 */
function pauseAllVideos(except) {
  videos.forEach((video) => {
    if (video !== except && !video.paused) video.pause();
  });
}

// "play" does not bubble, so listen in the capture phase
document.addEventListener(
  "play",
  (event) => {
    if (event.target instanceof HTMLVideoElement) pauseAllVideos(event.target);
  },
  true
);

videos.forEach((video) => {
  video.addEventListener("contextmenu", (event) => event.preventDefault());
});


/* ---------- Header logo: hide it if the file is missing ---------- */

document.querySelectorAll(".site-header__logo").forEach((img) => {
  if (!(img instanceof HTMLImageElement)) return;
  const hide = () => { img.hidden = true; };
  if (img.complete && img.naturalWidth === 0) hide();
  img.addEventListener("error", hide);
});


/* ---------- Carousel slider: edge fades and arrow buttons ---------- */

document.querySelectorAll(".slider").forEach((slider) => {
  const track = slider.querySelector(".slider__track");
  if (!(track instanceof HTMLElement)) return;

  // Shows the fade only on the side where more slides are hidden
  const update = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    slider.classList.toggle("is-at-start", track.scrollLeft <= 4);
    slider.classList.toggle("is-at-end", track.scrollLeft >= maxScroll - 4);
  };

  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  window.addEventListener("load", update);

  slider.querySelectorAll("[data-slider-dir]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.getAttribute("data-slider-dir") === "next" ? 1 : -1;
      track.scrollBy({
        left: direction * track.clientWidth * 0.8,
        behavior: calmMotion ? "auto" : "smooth"
      });
    });
  });

  update();
});


/* ---------- Pop-ups ---------- */

const contactDialog = /** @type {HTMLDialogElement | null} */ (document.getElementById("contact-dialog"));
const featuredDialog = /** @type {HTMLDialogElement | null} */ (document.getElementById("featured-dialog"));
const contextLine = document.getElementById("contact-dialog-context");

/**
 * Sets the contact pop-up's messages: general if no package is given,
 * otherwise a message that names the chosen package and its price.
 * @param {string | undefined} packageName
 * @param {string | undefined} price
 */
function prepareContactDialog(packageName, price) {
  if (!contactDialog || !contextLine) return;

  if (packageName) {
    setContactLinks(
      contactDialog,
      packageMessage(packageName, price),
      SETTINGS.packageEmailSubject.replace("{name}", packageName)
    );
    contextLine.textContent = "About the " + packageName + " package";
    contextLine.hidden = false;
  } else {
    setContactLinks(contactDialog, SETTINGS.generalMessage, SETTINGS.emailSubject);
    contextLine.textContent = "";
    contextLine.hidden = true;
  }
}

/**
 * @param {string | undefined} packageName
 * @param {string | undefined} price
 */
function openContactDialog(packageName, price) {
  pauseAllVideos();
  if (contactDialog && typeof contactDialog.showModal === "function") {
    prepareContactDialog(packageName, price);
    contactDialog.showModal();
  } else {
    // Very old browsers: go to the contact section instead
    window.location.hash = "contact";
  }
}

// One click listener for the whole page (also catches taps on icons inside buttons)
document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  // "Let's chat" and the package buttons
  const opener = target.closest("[data-contact-open]");
  if (opener instanceof HTMLElement) {
    const card = opener.closest(".package");
    openContactDialog(
      opener.dataset.packageEnquiry,
      card instanceof HTMLElement ? card.dataset.price : undefined
    );
    return;
  }

  // Featured thumbnail
  if (target.closest("[data-featured-open]")) {
    if (featuredDialog && typeof featuredDialog.showModal === "function") {
      pauseAllVideos();
      featuredDialog.showModal();
    } else {
      window.location.hash = "projects";
    }
    return;
  }

  // Close buttons
  if (contactDialog && target.closest("[data-contact-close]")) {
    contactDialog.close();
    return;
  }
  if (featuredDialog && target.closest("[data-featured-close]")) {
    featuredDialog.close();
    return;
  }

  // Choosing WhatsApp or Email closes the pop-up (the link still opens)
  if (contactDialog && target.closest("#contact-dialog a")) {
    contactDialog.close();
    return;
  }

  // "Back to top" and the logo: always scroll to the very top
  if (target.closest('a[href="#top"]')) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: calmMotion ? "auto" : "smooth" });
  }
});

// Close a pop-up when the dark area outside its box is tapped
[contactDialog, featuredDialog].forEach((dialog) => {
  if (!dialog) return;
  dialog.addEventListener("click", (event) => {
    const box = dialog.getBoundingClientRect();
    const outside =
      event.clientX < box.left || event.clientX > box.right ||
      event.clientY < box.top || event.clientY > box.bottom;
    if (outside) dialog.close();
  });
});
