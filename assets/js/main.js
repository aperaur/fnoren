/* main.js — fnoren Swiss Industrial v3.0 */

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
