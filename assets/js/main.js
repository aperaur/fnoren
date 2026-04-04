/* main.js — fnoren Swiss v2.0 */
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

});
