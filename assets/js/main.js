/* main.js — genel animasyonlar ve scroll effects */

// Intersection Observer — fade-in
document.addEventListener("DOMContentLoaded", () => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".fade-in").forEach(el => obs.observe(el));

  // Nav scroll efekti
  const nav = document.querySelector("nav");
  window.addEventListener("scroll", () => {
    nav?.classList.toggle("scrolled", window.scrollY > 40);
  });
});
