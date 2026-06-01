/* cookie-consent.js — fnoren çerez consent banner + apply (KVKK + GDPR uyumlu) */
(function () {
  const CONSENT_KEY = "fnoren_consent";
  const VALID_VALUES = ["all", "necessary"];

  // Mevcut consent oku
  function getConsent() {
    const v = localStorage.getItem(CONSENT_KEY);
    return VALID_VALUES.includes(v) ? v : null;
  }

  // Consent uygula — GA + FB Pixel devre dışı/aktif
  window.applyConsent = function (value) {
    if (value === "all") {
      // GA + FB Pixel zaten yüklenmiş, opt-in kayıt edilebilir
      if (typeof gtag === "function") {
        gtag('consent', 'update', {
          'ad_storage': 'granted',
          'analytics_storage': 'granted',
          'ad_user_data': 'granted',
          'ad_personalization': 'granted'
        });
      }
      if (typeof fbq === "function") {
        fbq('consent', 'grant');
      }
    } else {
      // Yalnızca zorunlu — analitik + pazarlama kapalı
      if (typeof gtag === "function") {
        gtag('consent', 'update', {
          'ad_storage': 'denied',
          'analytics_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied'
        });
      }
      if (typeof fbq === "function") {
        fbq('consent', 'revoke');
      }
    }
  };

  // Sayfa yüklendiğinde mevcut consent uygula
  const existing = getConsent();
  if (existing) {
    window.applyConsent(existing);
    return; // banner gösterme
  }

  // Banner DOM
  function buildBanner() {
    const div = document.createElement("div");
    div.id = "cookie-banner";
    div.setAttribute("role", "dialog");
    div.setAttribute("aria-label", "Çerez tercihleri");
    div.style.cssText = "position:fixed;bottom:0;left:0;right:0;z-index:9998;background:rgba(20,20,22,0.97);color:#E1E5E9;padding:1.25rem var(--gutter, 1.5rem);border-top:1px solid rgba(255,255,255,0.12);font-family:var(--font-body, 'Inter', sans-serif);font-size:0.875rem;line-height:1.6;animation:cookieFade 0.4s ease";
    div.innerHTML = `
      <div style="max-width:1080px;margin:0 auto;display:flex;flex-direction:column;gap:1rem">
        <p style="margin:0;color:#E1E5E9">
          Site deneyimini iyileştirmek için zorunlu çerezler kullanırız. Analitik ve pazarlama çerezleri için
          <strong style="color:#fff">açık rıza</strong> gereklidir.
          <a href="/yasal/cerez.html" style="color:var(--accent, #E8652B);text-decoration:underline">Detay</a>
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
          <button id="cookie-all" style="background:#fff;color:#1a1a1a;border:none;padding:0.75rem 1.5rem;font-family:inherit;font-size:0.8125rem;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;flex:1;min-width:160px">Tümünü Kabul Et</button>
          <button id="cookie-necessary" style="background:transparent;color:#E1E5E9;border:1px solid rgba(255,255,255,0.3);padding:0.75rem 1.5rem;font-family:inherit;font-size:0.8125rem;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;flex:1;min-width:160px">Yalnızca Zorunlu</button>
        </div>
      </div>
    `;
    return div;
  }

  function inject() {
    if (document.getElementById("cookie-banner")) return;
    const banner = buildBanner();
    banner.setAttribute("aria-modal", "false"); // non-blocking, sayfaya devam edilebilir
    document.body.appendChild(banner);

    const styleEl = document.createElement("style");
    styleEl.textContent = "@keyframes cookieFade{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}";
    document.head.appendChild(styleEl);

    const btnAll = document.getElementById("cookie-all");
    const btnNec = document.getElementById("cookie-necessary");

    function closeBanner() {
      banner.style.transition = "opacity 0.3s, transform 0.3s";
      banner.style.opacity = "0";
      banner.style.transform = "translateY(20px)";
      setTimeout(() => banner.remove(), 300);
    }

    btnAll.addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "all");
      window.applyConsent("all");
      closeBanner();
    });
    btnNec.addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "necessary");
      window.applyConsent("necessary");
      closeBanner();
    });

    // A11y — focus trap (Sprint 4.5)
    // İlk button auto-focus (sayfa içeriği yarıştırmasın diye 200ms delay)
    setTimeout(() => btnNec.focus(), 200);

    // Esc → "necessary" varsayılan (GDPR opt-in mantığı: rıza yoksa reddet)
    banner.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        localStorage.setItem(CONSENT_KEY, "necessary");
        window.applyConsent("necessary");
        closeBanner();
      }
      // Tab cycle — banner içinde dolaş, dışına çıkma
      if (e.key === "Tab") {
        const focusable = [btnAll, btnNec];
        const current = document.activeElement;
        const idx = focusable.indexOf(current);
        if (e.shiftKey && idx === 0) {
          e.preventDefault();
          focusable[focusable.length - 1].focus();
        } else if (!e.shiftKey && idx === focusable.length - 1) {
          e.preventDefault();
          focusable[0].focus();
        }
      }
    });
  }

  // GA varsayılan consent state (Google Consent Mode v2) — script yüklendiğinde "denied"
  if (typeof gtag === "function") {
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'analytics_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'wait_for_update': 500
    });
  }

  // DOM hazır olunca banner ekle
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
