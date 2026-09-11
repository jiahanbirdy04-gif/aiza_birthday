(function () {
  "use strict";

  // ---------------------------------------------------------------
  // Recipient name (from media.js, injected into the landing title)
  // ---------------------------------------------------------------
  function recipientName() {
    return (window.MEDIA && MEDIA.recipientName) || "friend";
  }

  function initName() {
    const el = document.getElementById("landing-name");
    if (el) el.textContent = recipientName();
  }

  // ---------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------
  function showView(name) {
    document.querySelectorAll(".view").forEach((el) => el.classList.remove("is-active"));
    const target = document.getElementById("view-" + name);
    if (target) {
      // restart the entrance animation each time
      target.style.animation = "none";
      // force reflow
      void target.offsetWidth;
      target.style.animation = "";
      target.classList.add("is-active");
    }
    if (name === "flowers") animateQuotes();
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-goto]");
    if (!btn) return;
    showView(btn.getAttribute("data-goto"));
  });

  // ---------------------------------------------------------------
  // Photos: vertical feed
  // ---------------------------------------------------------------
  function initPhotos() {
    const feed = document.getElementById("photo-feed");
    if (!feed) return;
    const photos = (window.MEDIA && MEDIA.photos) || [];
    if (!photos.length) {
      feed.innerHTML = `<div class="photo-fallback">no photos added yet</div>`;
      return;
    }
    photos.forEach((p, i) => {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.alt = p.caption || `Photo ${i + 1}`;
      img.src = p.src;
      img.onerror = () => {
        const fb = document.createElement("div");
        fb.className = "photo-fallback";
        fb.textContent = "photo didn't load";
        img.replaceWith(fb);
      };
      feed.appendChild(img);
    });
  }

  // ---------------------------------------------------------------
  // Music: custom pink player
  // ---------------------------------------------------------------
  function fmtTime(sec) {
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function initMusic() {
    const card = document.getElementById("music-card");
    if (!card) return;
    const music = (window.MEDIA && MEDIA.music) || { featured: {}, tracklist: [] };
    const f = music.featured || {};
    const tracklist = music.tracklist || [];

    const tracklistHTML = tracklist.length
      ? `<ul class="tracklist">${tracklist
          .map(
            (t) => `<li><span class="t-title">${t.title || ""}</span><span class="t-artist">${t.artist || ""}</span></li>`
          )
          .join("")}</ul>`
      : "";

    if (f.audioSrc) {
      // real, fully custom playable audio
      card.innerHTML = `
        <div class="scrubber">
          <input type="range" id="music-seek" min="0" max="100" value="0" step="0.1" aria-label="Seek">
        </div>
        <div class="player-controls">
          <button id="music-prev" aria-label="Restart"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zM20 6v12l-8.5-6z"/></svg></button>
          <button id="music-play" class="play-btn" aria-label="Play"><svg id="music-play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>
          <button id="music-next" aria-label="Next"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zM4 6v12l8.5-6z"/></svg></button>
        </div>
        <p class="music-title">${f.title || "Untitled"}</p>
        <p class="music-artist">${f.artist || ""}</p>
        ${tracklistHTML}
      `;
      const audio = document.getElementById("feature-audio");
      audio.src = f.audioSrc;
      const seek = document.getElementById("music-seek");
      const playBtn = document.getElementById("music-play");
      const playIcon = document.getElementById("music-play-icon");

      audio.addEventListener("loadedmetadata", () => { seek.max = audio.duration || 100; });
      audio.addEventListener("timeupdate", () => { if (!seek.matches(":active")) seek.value = audio.currentTime; });
      seek.addEventListener("input", () => { audio.currentTime = seek.value; });

      playBtn.addEventListener("click", () => {
        if (audio.paused) {
          audio.play().catch(() => {});
          playIcon.innerHTML = `<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>`;
        } else {
          audio.pause();
          playIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
        }
      });
      document.getElementById("music-prev").addEventListener("click", () => { audio.currentTime = 0; });
    } else if (f.embedUrl) {
      card.innerHTML = `
        <iframe src="${f.embedUrl}" style="width:100%;min-height:152px;border:none;border-radius:10px;" allow="autoplay; encrypted-media" loading="lazy"></iframe>
        <p class="music-title" style="margin-top:14px;">${f.title || "Untitled"}</p>
        <p class="music-artist">${f.artist || ""}</p>
        ${tracklistHTML}
      `;
    } else {
      card.innerHTML = `
        <div class="player-controls">
          <button class="play-btn" disabled aria-label="No audio yet"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>
        </div>
        <p class="music-title">${f.title || "Untitled"}</p>
        <p class="music-artist">${f.artist || ""}</p>
        ${tracklistHTML}
      `;
    }
  }

  // ---------------------------------------------------------------
  // Flowers: quote pills + rose bouquet
  // ---------------------------------------------------------------
  function initFlowers() {
    const stack = document.getElementById("quote-stack");
    const notes = (window.MEDIA && MEDIA.flowerNotes) || [];
    if (stack) {
      stack.innerHTML = notes.map((n) => `<div class="quote-pill">${n}</div>`).join("");
    }
    const wrap = document.getElementById("bouquet-wrap");
    if (wrap && !wrap.dataset.built) {
      wrap.innerHTML = roseBouquetSVG();
      wrap.dataset.built = "1";
    }
  }

  function animateQuotes() {
    const pills = document.querySelectorAll(".quote-pill");
    pills.forEach((el, i) => {
      el.classList.remove("is-shown");
      void el.offsetWidth;
      el.style.animationDelay = `${i * 130}ms`;
      requestAnimationFrame(() => el.classList.add("is-shown"));
    });
  }

  function roseBlossom(cx, cy, r, color, colorDeep) {
    // layered swirl petals approximating a rose bloom
    let rings = "";
    const layers = [
      { rr: r, rot: 0 },
      { rr: r * 0.72, rot: 24 },
      { rr: r * 0.46, rot: -18 },
      { rr: r * 0.24, rot: 10 },
    ];
    layers.forEach((l, i) => {
      rings += `<circle cx="${cx}" cy="${cy}" r="${l.rr}" fill="${i % 2 === 0 ? color : colorDeep}" opacity="${0.92 - i * 0.06}" transform="rotate(${l.rot} ${cx} ${cy})"/>`;
    });
    // petal notches for texture
    let petals = "";
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const px = cx + Math.cos(a) * r * 0.62;
      const py = cy + Math.sin(a) * r * 0.62;
      petals += `<ellipse cx="${px}" cy="${py}" rx="${r * 0.38}" ry="${r * 0.26}" fill="${colorDeep}" opacity="0.5" transform="rotate(${(a * 180) / Math.PI} ${px} ${py})"/>`;
    }
    return `<g stroke="#5C1A1A" stroke-width="0.6">${petals}${rings}<circle cx="${cx}" cy="${cy}" r="${r * 0.16}" fill="${colorDeep}"/></g>`;
  }

  function leafShape(x, y, len, rot) {
    return `<path d="M${x} ${y} Q${x - len * 0.4} ${y - len * 0.3} ${x} ${y - len} Q${x + len * 0.4} ${y - len * 0.3} ${x} ${y} Z" fill="#5C7A4E" stroke="#3E5735" stroke-width="0.8" transform="rotate(${rot} ${x} ${y})"/>`;
  }

  function roseBouquetSVG() {
    const roses = [
      { cx: 110, cy: 96, r: 26, c: "#C24444", d: "#8C2A2A" },
      { cx: 158, cy: 88, r: 24, c: "#B23A3A", d: "#7E2222" },
      { cx: 84, cy: 122, r: 22, c: "#CB5252", d: "#932E2E" },
      { cx: 186, cy: 118, r: 22, c: "#B23A3A", d: "#7E2222" },
      { cx: 134, cy: 68, r: 21, c: "#C24444", d: "#8C2A2A" },
      { cx: 60, cy: 150, r: 18, c: "#CB5252", d: "#932E2E" },
      { cx: 210, cy: 148, r: 18, c: "#B23A3A", d: "#7E2222" },
      { cx: 135, cy: 132, r: 20, c: "#A83232", d: "#701E1E" },
    ];
    const roseMarkup = roses.map((r) => roseBlossom(r.cx, r.cy, r.r, r.c, r.d)).join("");
    const leaves = [
      leafShape(70, 168, 34, -20),
      leafShape(220, 164, 32, 18),
      leafShape(135, 172, 30, 2),
      leafShape(100, 178, 26, -8),
      leafShape(190, 176, 26, 10),
    ].join("");

    return `
    <svg viewBox="0 0 300 340" width="100%" height="100%" style="display:block" xmlns="http://www.w3.org/2000/svg">
      ${leaves}
      ${roseMarkup}
      <g>
        <path d="M50 200 L250 200 L206 330 Q150 350 94 330 Z" fill="var(--kraft)" stroke="#8A6A3E" stroke-width="2"/>
        <path d="M50 200 L150 256 L250 200" fill="none" stroke="#8A6A3E" stroke-width="1.2" opacity="0.5"/>
        <path d="M94 330 L150 256 L206 330" fill="none" stroke="#8A6A3E" stroke-width="1.2" opacity="0.5"/>
        <rect x="120" y="208" width="60" height="16" rx="8" fill="#B23A3A" transform="rotate(-3 150 216)"/>
        <path d="M150 216 C 132 206, 114 210, 114 226 C 114 237, 130 239, 141 228" fill="none" stroke="#8C2A2A" stroke-width="4" stroke-linecap="round"/>
        <path d="M150 216 C 168 206, 186 210, 186 226 C 186 237, 170 239, 159 228" fill="none" stroke="#8C2A2A" stroke-width="4" stroke-linecap="round"/>
        <circle cx="150" cy="218" r="4.5" fill="#7E2222"/>
      </g>
    </svg>`;
  }

  // ---------------------------------------------------------------
  // Finale: cake, candle blow, birthday audio, then letter
  // ---------------------------------------------------------------
  function cakeSVG() {
    return `
    <svg viewBox="0 0 220 200" width="100%" height="100%" style="display:block" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="184" rx="74" ry="8" fill="#221D17" opacity="0.08"/>
      <g class="sparkle">
        <path d="M150 46 L153 54 L161 57 L153 60 L150 68 L147 60 L139 57 L147 54 Z" fill="#E5A93B"/>
      </g>
      <g class="flame" id="flame">
        <path d="M110 40 C 104 50 102 58 110 66 C 118 58 116 50 110 40 Z" fill="#C08B85"/>
      </g>
      <rect x="106" y="64" width="8" height="20" fill="#F8F0E1" stroke="#221D17" stroke-width="1.4"/>
      <path d="M62 92 Q66 86 70 92 Q74 86 78 92 Q82 86 86 92 Q90 86 94 92 Q98 86 102 92 Q106 86 110 92 Q114 86 118 92 Q122 86 126 92 Q130 86 134 92 Q138 86 142 92 Q146 86 150 92 Q154 86 158 92"
            fill="none" stroke="#221D17" stroke-width="1.4"/>
      <rect x="62" y="92" width="96" height="34" rx="3" fill="#F8F0E1" stroke="#221D17" stroke-width="1.4"/>
      <text x="110" y="114" text-anchor="middle" font-family="Caveat, cursive" font-size="15" fill="#221D17">Happy Birthday</text>
      <path d="M40 126 Q45 119 50 126 Q55 119 60 126 Q65 119 70 126 Q75 119 80 126 Q85 119 90 126 Q95 119 100 126 Q105 119 110 126 Q115 119 120 126 Q125 119 130 126 Q135 119 140 126 Q145 119 150 126 Q155 119 160 126 Q165 119 170 126 Q175 119 180 126"
            fill="none" stroke="#221D17" stroke-width="1.4"/>
      <rect x="40" y="126" width="140" height="46" rx="3" fill="#F8F0E1" stroke="#221D17" stroke-width="1.4"/>
      <ellipse cx="110" cy="176" rx="80" ry="8" fill="#F8F0E1" stroke="#221D17" stroke-width="1.4"/>
    </svg>`;
  }

  function initFinale() {
    const cakeCard = document.getElementById("cake-card");
    const letterCard = document.getElementById("letter-card");
    const letterBody = document.getElementById("letter-body");
    const hint = document.getElementById("finale-hint");
    if (!cakeCard) return;

    if (letterBody) {
      const body = (window.MEDIA && MEDIA.letter && MEDIA.letter.body) || "";
      letterBody.textContent = body;
    }

    cakeCard.innerHTML = `
      <button class="candle-tap" id="candle-tap" aria-label="Blow out the candle">
        <div class="cake-wrap">${cakeSVG()}</div>
      </button>
      <p class="view-subtitle italic" style="margin-top:10px;margin-bottom:0;">tap this blow the candles</p>
    `;

    const tapBtn = document.getElementById("candle-tap");
    let blown = false;
    tapBtn.addEventListener("click", () => {
      if (blown) return;
      blown = true;
      const flame = document.getElementById("flame");
      if (flame) flame.classList.add("is-out");
      if (hint) hint.textContent = `happy birthday, ${recipientName()} 🤍`;

      const audio = document.getElementById("hbd-audio");
      const src = window.MEDIA && MEDIA.happyBirthdayAudio && MEDIA.happyBirthdayAudio.src;
      if (audio && src) {
        audio.src = src;
        audio.play().catch(() => {});
      }

      setTimeout(() => {
        letterCard.style.display = "block";
        void letterCard.offsetWidth;
        letterCard.classList.add("is-in");
      }, 500);
    });
  }

  // ---------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initName();
    initPhotos();
    initMusic();
    initFlowers();
    initFinale();
  });
})();
