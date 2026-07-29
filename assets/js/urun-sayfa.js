/* fnoren — statik ürün sayfası etkileşimleri (NJ-393)
 *
 * Kaynak: urun.html'in JS bloğundan birebir çıkarıldı. Fark: ürün verisi artık
 * runtime'da fetch edilmiyor — sayfa HTML'i zaten dolu geliyor (SEO). Bu dosya
 * yalnız etkileşimi taşır: galeri, lightbox, zoom, sticky CTA gövde sınıfı,
 * analytics view_item.
 *
 * Sayfa `window.FNOREN_URUN = {kod, ad, kat, fotolar}` tanımlar.
 */
(function () {
  "use strict";

  var U = window.FNOREN_URUN;
  if (!U) return;

  var lbCurrent = (U.fotolar && U.fotolar[0]) || "";

  // ── Ana foto değiştir (galeri şeridi) ──
  window.anaFoto = function (el, src) {
    var ana = document.getElementById("ana-foto");
    if (ana) ana.src = src;
    lbCurrent = src;
    document.querySelectorAll(".galeri-thumb").forEach(function (t) { t.classList.remove("active"); });
    el.classList.add("active");
  };

  // ── Lightbox ──
  window.openLightbox = function () {
    var lb = document.getElementById("lightbox");
    var img = document.getElementById("lightbox-img");
    if (!lb || !img) return;
    img.style.backgroundImage = "url('" + lbCurrent + "')";
    img.classList.remove("zoom");
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  window.closeLightbox = function (e) {
    if (e && e.target !== e.currentTarget && !e.target.classList.contains("lightbox-close")) return;
    var lb = document.getElementById("lightbox");
    if (lb) lb.classList.remove("open");
    document.body.style.overflow = "";
  };

  window.lightboxFoto = function (el, src, e) {
    e.stopPropagation();
    lbCurrent = src;
    var img = document.getElementById("lightbox-img");
    if (img) {
      img.style.backgroundImage = "url('" + src + "')";
      img.classList.remove("zoom");
    }
    document.querySelectorAll(".lightbox-thumb").forEach(function (t) { t.classList.remove("active"); });
    el.classList.add("active");
  };

  window.toggleZoom = function (e) {
    e.stopPropagation();
    var img = document.getElementById("lightbox-img");
    if (img) img.classList.toggle("zoom");
  };

  document.addEventListener("DOMContentLoaded", function () {
    // Var olmayan galeri fotosu -> düğmeyi gizle
    document.querySelectorAll(".galeri-thumb img, .lightbox-thumb img").forEach(function (img) {
      img.addEventListener("error", function () { img.parentElement.style.display = "none"; });
    });

    // Mousemove cursor-tracking lens zoom
    var lbImg = document.getElementById("lightbox-img");
    if (lbImg) {
      lbImg.addEventListener("mousemove", function (e) {
        var img = e.currentTarget;
        if (!img.classList.contains("zoom")) return;
        var rect = img.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        img.style.backgroundPosition = x + "% " + y + "%";
      });
    }

    // Mobil sticky CTA varsa gövdeye sınıf
    if (document.getElementById("mobile-sticky-cta")) {
      document.body.classList.add("has-msc");
    }

    // Analytics — view_item
    if (window.fnorenTrack) {
      window.fnorenTrack("view_item", {
        item_id: U.kod,
        item_name: U.ad,
        item_category: U.kat,
        item_brand: "Fnoren",
        currency: "TRY"
      });
    }
  });

  // ESC ile lightbox kapat
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var lb = document.getElementById("lightbox");
      if (lb) lb.classList.remove("open");
      document.body.style.overflow = "";
    }
  });
})();
