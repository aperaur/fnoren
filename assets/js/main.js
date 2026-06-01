/* main.js — fnoren Swiss Industrial v3.0 */

// Analytics — fnorenTrack helper (Sprint 6 — GA4 + Meta Pixel wrapper)
// Consent Mode v2 uyumlu: gtag('consent', 'default', 'denied') sayesinde
// kullanıcı "Yalnızca Zorunlu" seçtiyse event'ler anonim/ping olarak
// işlenir; "Tümünü Kabul" seçtiyse tam veri toplanır.
window.fnorenTrack = function (eventName, params) {
  params = params || {};
  try {
    if (typeof gtag === "function") {
      gtag("event", eventName, params);
    }
    if (typeof fbq === "function") {
      const fbMap = {
        view_item: "ViewContent",
        select_item: "ViewContent",
        generate_lead: "Lead",
        contact: "Contact",
        add_to_cart: "AddToCart",
        begin_checkout: "InitiateCheckout"
      };
      const fbEvent = fbMap[eventName];
      if (fbEvent) {
        const fbParams = {};
        if (params.item_id) fbParams.content_ids = [params.item_id];
        if (params.item_name) fbParams.content_name = params.item_name;
        if (params.item_category) fbParams.content_category = params.item_category;
        if (params.value) fbParams.value = params.value;
        if (params.currency) fbParams.currency = params.currency;
        fbq("track", fbEvent, fbParams);
      }
    }
  } catch (e) { /* silent fail — analytics olmasa da site çalışır */ }
};

// A11y — skip-to-content + ana içerik detect (Sprint 4.1)
(function () {
  function injectSkip() {
    if (document.querySelector(".skip-to-content")) return;
    const skip = document.createElement("a");
    skip.href = "#main";
    skip.className = "skip-to-content";
    skip.textContent = "İçeriğe atla";
    document.body.insertBefore(skip, document.body.firstChild);

    // Ana içerik ID — sayfa türüne göre ilk anlamlı section
    if (!document.getElementById("main")) {
      const main = document.querySelector("section.hero, section.section, section.faq-hero, section.uretim-hero, section.legal-page, .about-page");
      if (main) main.id = "main";
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectSkip);
  } else {
    injectSkip();
  }
})();

document.addEventListener("DOMContentLoaded", () => {

  // Intersection Observer — fade-in + reveal
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".fade-in, .reveal").forEach(el => obs.observe(el));

  // Grid glow — mouse-following warm grid highlight
  const glow = document.getElementById("grid-glow");
  const glowLines = document.getElementById("grid-glow-lines");
  if (!glow || !glowLines) return;

  let glowTimeout;
  document.addEventListener("mousemove", (e) => {
    const x = e.clientX + "px";
    const y = e.clientY + "px";
    glow.style.setProperty("--mouse-x", x);
    glow.style.setProperty("--mouse-y", y);
    glowLines.style.setProperty("--mouse-x", x);
    glowLines.style.setProperty("--mouse-y", y);

    glow.classList.add("active");
    glowLines.classList.add("active");

    clearTimeout(glowTimeout);
    glowTimeout = setTimeout(() => {
      glow.classList.remove("active");
      glowLines.classList.remove("active");
    }, 2000);
  });

});
