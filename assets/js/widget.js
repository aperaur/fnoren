/* widget.js — Alluka chat widget */
const ALLUKA_URL     = "https://aperaur-production.up.railway.app/api/chat/widget";
const ALLUKA_LICENSE = "";  // production'da set edilecek veya env'den inject

function widgetInit() {
  const toggle   = document.getElementById("chat-toggle");
  const panel    = document.getElementById("chat-panel");
  const msgs     = document.getElementById("chat-msgs");
  const input    = document.getElementById("chat-input");
  const sendBtn  = document.getElementById("chat-send");
  const closeBtn = document.getElementById("chat-close");

  if (!toggle || !panel) return;

  // Session ID
  let sessionId = localStorage.getItem("fnoren_session");
  if (!sessionId) {
    sessionId = "s_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("fnoren_session", sessionId);
  }

  // Geçmiş mesajları yükle (son 10)
  const gecmis = JSON.parse(localStorage.getItem("fnoren_chat") || "[]").slice(-10);
  gecmis.forEach(m => mesajEkle(m.text, m.type));

  // Hoş geldin (ilk kez)
  if (gecmis.length === 0) {
    mesajEkle("Merhaba! Fnoren ürünleri hakkında yardımcı olabilirim. Ne sormak istersiniz?", "bot");
  }

  toggle.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) input.focus();
  });

  closeBtn?.addEventListener("click", () => panel.classList.remove("open"));

  sendBtn.addEventListener("click", gonder);
  input.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); gonder(); } });

  async function gonder() {
    const metin = input.value.trim();
    if (!metin) return;
    input.value = "";
    mesajEkle(metin, "user");
    mesajEkle("...", "bot", "typing");

    try {
      const resp = await fetch(ALLUKA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ALLUKA_LICENSE ? { "X-License-Key": ALLUKA_LICENSE } : {})
        },
        body: JSON.stringify({ message: metin, session_id: sessionId })
      });

      const typing = msgs.querySelector(".typing");
      typing?.remove();

      if (!resp.ok) throw new Error("Sunucu yanıt vermedi");
      const data = await resp.json();
      mesajEkle(data.reply || "Yanıt alınamadı.", "bot");
    } catch (e) {
      const typing = msgs.querySelector(".typing");
      typing?.remove();
      mesajEkle("Şu an çevrimdışıyız, lütfen daha sonra tekrar deneyin.", "bot");
    }
  }

  function mesajEkle(text, tip, cssClass = "") {
    const div = document.createElement("div");
    div.className = `msg msg-${tip}${cssClass ? " " + cssClass : ""}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;

    // Geçmişe kaydet (typing hariç)
    if (!cssClass) {
      const gecmis = JSON.parse(localStorage.getItem("fnoren_chat") || "[]");
      gecmis.push({ text, type: tip });
      localStorage.setItem("fnoren_chat", JSON.stringify(gecmis.slice(-20)));
    }
  }
}

document.addEventListener("DOMContentLoaded", widgetInit);
