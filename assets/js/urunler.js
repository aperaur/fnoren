/* urunler.js — fnoren Swiss Industrial v3.2 — PIM-aligned NJ-329 */
const SHOPIER_BASE = "https://www.shopier.com/ShowProduct/api/?s=";
const HB_STORE     = "https://www.hepsiburada.com/magaza/fnoren";
const UC_KODLAR    = ["FNB001", "FNB005", "FNB007"];   // 3B modeli hazır ürünler (NJ-392)

async function urunleriYukle(hedefId, limit = 0, kategori = null) {
  const hedef = document.getElementById(hedefId);
  if (!hedef) return;

  let veri;
  try {
    const resp = await fetch("data/urunler.json");
    if (!resp.ok) throw new Error("Veri yüklenemedi");
    veri = await resp.json();
  } catch (e) {
    hedef.innerHTML = '<p style="color:var(--muted)">Ürünler yüklenirken hata oluştu.</p>';
    return;
  }

  // NJ-392 Recak: aktif ürün platform linki olmasa da vitrinde durur
  // (stok/link yoksa satın alma butonları zaten koşullu gizli)
  let urunler = (veri.urunler || []).filter(u => u.durum === "aktif");

  if (kategori) {
    const katMap = { mutfak: "K", banyo: "B", giris: "E", aksesuar: "A" };
    const kod = katMap[kategori] || kategori;
    urunler = urunler.filter(u => u.kategori === kod);
  }

  if (limit > 0) urunler = urunler.slice(0, limit);

  hedef.innerHTML = "";

  // Analytics — view_item_list (Sprint 6)
  if (window.fnorenTrack) {
    window.fnorenTrack("view_item_list", {
      item_list_id: kategori || "all",
      item_list_name: kategori ? `Kategori: ${kategori}` : "Tüm Ürünler",
      items: urunler.slice(0, 10).map((u, idx) => ({
        item_id: u.base_kod,
        item_name: u.ad_tr || u.ad,
        item_category: u.kategori,
        item_brand: "Fnoren",
        index: idx
      }))
    });
  }

  urunler.forEach((u, i) => {
    const pl       = u.platform_links || {};
    const shopUrl  = pl.shopier ? `${SHOPIER_BASE}${pl.shopier}` : null;
    const hbUrl    = pl.hepsiburada || null;
    const ad       = u.ad_tr || u.ad || "Ürün";
    const seri     = u.seri || u.ad || "";
    const baseKod  = u.base_kod || "";
    const kisa     = u.aciklama_tr || "";
    const cb       = "?v=nj392g";

    const kart = document.createElement("div");
    kart.className = "urun-kart fade-in";
    kart.style.transitionDelay = `${i * 80}ms`;
    kart.onclick = () => {
      if (window.fnorenTrack) {
        window.fnorenTrack("select_item", {
          item_id: baseKod,
          item_name: ad,
          item_category: u.kategori,
          item_list_id: kategori || "all",
          item_brand: "Fnoren"
        });
      }
      window.location.href = `urun.html?kod=${baseKod}`;
    };
    const buttons = [];
    if (hbUrl)  buttons.push(`<a href="${hbUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-hb" onclick="event.stopPropagation()">Hepsiburada'da Gör →</a>`);
    if (shopUrl) buttons.push(`<a href="${shopUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-shopier" onclick="event.stopPropagation()">Shopier'da Gör →</a>`);
    kart.innerHTML = `
      <span class="card-mark-tl"></span>
      <span class="card-mark-br"></span>
      <div class="urun-img-wrap">
        ${UC_KODLAR.includes(baseKod) ? '<span class="uc-rozet mono">3B</span>' : ''}
        <img src="assets/img/products/${baseKod}.jpg${cb}" alt="${ad}" loading="lazy" width="400" height="400">
      </div>
      <span class="label mono meta-num" style="display:block;margin-bottom:0.25rem;font-size:0.625rem">${baseKod}</span>
      <h3>${ad}</h3>
      <span class="label meta-tri" style="display:block;margin-top:0.125rem;font-size:0.5625rem">${seri}</span>
      ${kisa ? `<p style="margin:0.5rem 0 0;font-size:0.8125rem;color:var(--muted);line-height:1.45">${kisa}</p>` : ''}
      <div class="stok-badge stok-badge--ok" style="margin:0.75rem 0">
        <span class="stok-dot stok-ok"></span>
        Satışta
      </div>
      ${buttons.join("")}
    `;
    hedef.appendChild(kart);
  });

  // Intersection Observer ile fade-in
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  hedef.querySelectorAll(".fade-in").forEach(el => obs.observe(el));
}

// "Yakında" vitrini — kod atanmamış tasarımlar, 3B stilize model kartları (NJ-392 Recak: model kullan)
async function yakindaYukle(hedefId) {
  const hedef = document.getElementById(hedefId);
  if (!hedef) return;

  let veri;
  try {
    const resp = await fetch("data/yakinda.json");
    if (!resp.ok) return;
    veri = await resp.json();
  } catch (e) { return; }

  const modeller = veri.modeller || [];
  if (!modeller.length) return;

  const bolum = document.getElementById("yakinda-bolum");
  if (bolum) bolum.hidden = false;

  if (!document.getElementById("mv-modul")) {
    const mv = document.createElement("script");
    mv.id = "mv-modul";
    mv.type = "module";
    mv.src = "assets/3d/model-viewer.min.js?v=nj392g";
    document.head.appendChild(mv);
  }

  hedef.innerHTML = "";
  modeller.forEach((m, i) => {
    const kart = document.createElement("div");
    kart.className = "urun-kart urun-kart--yakinda fade-in";
    kart.style.transitionDelay = `${i * 60}ms`;
    kart.innerHTML = `
      <span class="card-mark-tl"></span>
      <span class="card-mark-br"></span>
      <div class="urun-img-wrap yakinda-viewer">
        <model-viewer src="${m.dosya}?v=nj392g" camera-controls auto-rotate disable-zoom
          rotation-per-second="9deg" tone-mapping="commerce" interaction-prompt="none"
          loading="lazy" camera-orbit="${m.az} 72deg 115%" field-of-view="30deg"
          environment-image="neutral" exposure="1.0" style="background:${m.fon}"
          alt="${m.ad} — 3B önizleme"></model-viewer>
      </div>
      <h3>${m.ad}</h3>
      <span class="label meta-tri" style="display:block;margin-top:0.125rem;font-size:0.5625rem">304 paslanmaz çelik</span>
      <div class="stok-badge stok-badge--soon" style="margin:0.75rem 0 0">
        <span class="stok-dot stok-soon"></span>
        Yakında
      </div>
    `;
    hedef.appendChild(kart);
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  hedef.querySelectorAll(".fade-in").forEach(el => obs.observe(el));
}

// Kategori filtresi — URL sync ile
function kategoriFiltre(btn, kat) {
  document.querySelectorAll(".kat-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  urunleriYukle("urun-grid", 0, kat === "hepsi" ? null : kat);

  // NJ-393: Yakında bölümü yalnız "Hepsi" görünümünde (kategori altında karışma fix)
  const yb = document.getElementById("yakinda-bolum");
  if (yb) {
    if (kat === "hepsi") {
      const grid = document.getElementById("yakinda-grid");
      if (grid && grid.children.length) yb.hidden = false;
      else yakindaYukle("yakinda-grid");
    } else {
      yb.hidden = true;
    }
  }

  // URL state — geri butonu çalışır, paylaşılabilir
  const url = new URL(window.location.href);
  if (kat === "hepsi") {
    url.searchParams.delete("kategori");
  } else {
    url.searchParams.set("kategori", kat);
  }
  window.history.replaceState({}, "", url.toString());

  // Title update
  document.title = kat === "hepsi" ? "Ürünler — Fnoren" : `${kat.charAt(0).toUpperCase()+kat.slice(1)} — Fnoren`;
}
