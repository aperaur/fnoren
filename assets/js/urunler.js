/* urunler.js — urunler.json'dan dinamik ürün kartları */
const SHOPIER_BASE = "https://www.shopier.com/ShowProduct/api/?s=";

async function urunleriYukle(hedefId, limit = 0, kategori = null) {
  const hedef = document.getElementById(hedefId);
  if (!hedef) return;

  let veri;
  try {
    const resp = await fetch("/data/urunler.json");
    if (!resp.ok) throw new Error("Veri yüklenemedi");
    veri = await resp.json();
  } catch (e) {
    hedef.innerHTML = '<p style="color:var(--muted)">Ürünler yüklenirken hata oluştu.</p>';
    return;
  }

  let urunler = (veri.urunler || []).filter(u =>
    u.durum !== "deprecated" &&
    u.durum !== "DEPRECATED" &&
    (u.platform_links?.shopier)          // sadece Shopier'da olanlar
  );

  if (kategori) {
    const katMap = { mutfak: "K", banyo: "B", yasam: "E", aksesuar: "A" };
    const kod = katMap[kategori] || kategori;
    urunler = urunler.filter(u => u.kategori === kod);
  }

  if (limit > 0) urunler = urunler.slice(0, limit);

  hedef.innerHTML = "";
  urunler.forEach((u, i) => {
    const shopierUrl = `${SHOPIER_BASE}${u.platform_links.shopier}`;
    const fiyat      = u.fiyat || u.satis_fiyati_tl || 0;
    const stokAdet   = u.stok?.adet ?? null;
    const sonUrun    = u.son_urun || u.stok?.son_urun_badge;
    const ad         = u.ad_tr || u.ad || "Ürün";

    // Stok göstergesi
    let stokClass = "stok-ok", stokMetin = "Stokta";
    if (stokAdet === 0)       { stokClass = "stok-out";  stokMetin = "Tükendi"; }
    else if (stokAdet !== null && stokAdet <= 3) { stokClass = "stok-warn"; stokMetin = `Son ${stokAdet} adet`; }
    else if (sonUrun)         { stokClass = "stok-warn"; stokMetin = "Son ürün"; }

    const kart = document.createElement("div");
    kart.className = "urun-kart fade-in";
    kart.style.transitionDelay = `${i * 60}ms`;
    kart.innerHTML = `
      ${sonUrun ? '<span class="badge-son-urun">Son Ürün</span>' : ""}
      <div class="urun-img-wrap">
        <div class="urun-placeholder">◈</div>
      </div>
      <h3>${ad}</h3>
      <div class="urun-fiyat">${fiyat.toLocaleString("tr-TR")} <span>₺</span></div>
      <div class="stok-label">
        <span class="stok-dot ${stokClass}"></span>${stokMetin}
      </div>
      ${stokAdet !== 0 ? `<a href="${shopierUrl}" target="_blank" rel="noopener" class="btn btn-shopier">Shopier'dan Al →</a>` : '<span style="color:var(--error);font-size:0.8rem">Tükendi</span>'}
    `;
    hedef.appendChild(kart);
  });

  // Intersection Observer ile fade-in
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  hedef.querySelectorAll(".fade-in").forEach(el => obs.observe(el));
}

// Kategori filtresi
function kategoriFiltre(btn, kat) {
  document.querySelectorAll(".kat-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  urunleriYukle("urun-grid", 0, kat === "hepsi" ? null : kat);
}
