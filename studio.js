/* ============================================================
   studio.js — collects everything the user adds and packages it
   into a downloadable folder (zip) that matches the site's
   assets/ structure, plus a ready-to-use assets/media.js.
   ============================================================ */

(function () {
  "use strict";

  const DEFAULT_FLOWER_NOTES = [
    "You make every room warmer just by being in it.",
    "Twenty-one years of you, and the world's better for all of them.",
    "Here's to the person who always shows up for everyone else — today's for you.",
    "Still the easiest person to laugh with, no matter how far apart we are.",
    "So proud of who you're becoming. Keep going.",
  ];

  let photoFiles = []; // File[]
  let audioFile = null;

  /* ---------------- Photos ---------------- */

  const photoInput = document.getElementById("photo-input");
  const photoThumbs = document.getElementById("photo-thumbs");

  photoInput.addEventListener("change", () => {
    photoFiles = photoFiles.concat(Array.from(photoInput.files));
    photoInput.value = "";
    renderPhotoThumbs();
  });

  function renderPhotoThumbs() {
    photoThumbs.innerHTML = "";
    photoFiles.forEach((file, i) => {
      const div = document.createElement("div");
      div.className = "thumb";
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      const btn = document.createElement("button");
      btn.textContent = "\u2715";
      btn.setAttribute("aria-label", "Remove photo");
      btn.addEventListener("click", () => {
        photoFiles.splice(i, 1);
        renderPhotoThumbs();
      });
      div.appendChild(img);
      div.appendChild(btn);
      photoThumbs.appendChild(div);
    });
  }

  /* ---------------- Audio ---------------- */

  const audioInput = document.getElementById("audio-input");
  const audioPreview = document.getElementById("audio-preview");

  audioInput.addEventListener("change", () => {
    audioFile = audioInput.files[0] || null;
    if (audioFile) {
      audioPreview.src = URL.createObjectURL(audioFile);
      audioPreview.style.display = "block";
    } else {
      audioPreview.style.display = "none";
    }
  });

  const featAudioInput = document.getElementById("feat-audio-input");
  const featAudioPreview = document.getElementById("feat-audio-preview");
  let featAudioFile = null;

  featAudioInput.addEventListener("change", () => {
    featAudioFile = featAudioInput.files[0] || null;
    if (featAudioFile) {
      featAudioPreview.src = URL.createObjectURL(featAudioFile);
      featAudioPreview.style.display = "block";
    } else {
      featAudioPreview.style.display = "none";
    }
  });

  /* ---------------- Tracklist ---------------- */

  const tracklistRows = document.getElementById("tracklist-rows");
  const addTrackBtn = document.getElementById("add-track");

  function addTrackRow(title, artist) {
    const row = document.createElement("div");
    row.className = "track-row";
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = "Track title";
    titleInput.className = "track-title-input";
    titleInput.value = title || "";
    const artistInput = document.createElement("input");
    artistInput.type = "text";
    artistInput.placeholder = "Artist";
    artistInput.className = "track-artist-input";
    artistInput.value = artist || "";
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "\u2715";
    removeBtn.addEventListener("click", () => row.remove());
    row.appendChild(titleInput);
    row.appendChild(artistInput);
    row.appendChild(removeBtn);
    tracklistRows.appendChild(row);
  }

  addTrackBtn.addEventListener("click", () => addTrackRow("", ""));
  for (let i = 0; i < 3; i++) addTrackRow("", "");

  /* ---------------- Flower notes ---------------- */

  const flowerNoteInputs = document.getElementById("flower-note-inputs");
  DEFAULT_FLOWER_NOTES.forEach((note, i) => {
    const label = document.createElement("label");
    label.textContent = "Note " + (i + 1);
    const input = document.createElement("input");
    input.type = "text";
    input.className = "flower-note-input";
    input.value = note;
    flowerNoteInputs.appendChild(label);
    flowerNoteInputs.appendChild(input);
  });

  /* ---------------- Generate ---------------- */

  const generateBtn = document.getElementById("generate-btn");
  const statusEl = document.getElementById("status");

  generateBtn.addEventListener("click", async () => {
    generateBtn.disabled = true;
    statusEl.textContent = "Packing everything up\u2026";

    try {
      const zip = new JSZip();
      const photosFolder = zip.folder("assets/photos");
      const audioFolder = zip.folder("assets/audio");

      const photoEntries = [];
      photoFiles.forEach((file, i) => {
        const ext = extOf(file.name) || "jpg";
        const name = "photo-" + String(i + 1).padStart(2, "0") + "." + ext;
        photosFolder.file(name, file);
        photoEntries.push("assets/photos/" + name);
      });

      let audioPath = "";
      if (audioFile) {
        const ext = extOf(audioFile.name) || "mp3";
        audioPath = "assets/audio/happy-birthday." + ext;
        audioFolder.file("happy-birthday." + ext, audioFile);
      }

      let featAudioPath = "";
      if (featAudioFile) {
        const ext = extOf(featAudioFile.name) || "mp3";
        featAudioPath = "assets/audio/featured-track." + ext;
        audioFolder.file("featured-track." + ext, featAudioFile);
      }

      const tracklist = Array.from(document.querySelectorAll(".track-row"))
        .map((row) => ({
          title: row.querySelector(".track-title-input").value.trim(),
          artist: row.querySelector(".track-artist-input").value.trim(),
        }))
        .filter((t) => t.title);

      const flowerNotes = Array.from(document.querySelectorAll(".flower-note-input"))
        .map((i) => i.value.trim())
        .filter(Boolean);

      const mediaJs = buildMediaJs({
        recipientName: document.getElementById("recipient-name").value.trim() || "Friend",
        photoEntries: photoEntries,
        audioPath: audioPath,
        featuredTitle: document.getElementById("feat-title").value.trim() || "Untitled",
        featuredArtist: document.getElementById("feat-artist").value.trim(),
        featuredEmbed: document.getElementById("feat-embed").value.trim(),
        featAudioPath: featAudioPath,
        tracklist: tracklist,
        flowerNotes: flowerNotes.length ? flowerNotes : DEFAULT_FLOWER_NOTES,
        letterBody: document.getElementById("letter-text").value || "",
      });

      zip.file("assets/media.js", mediaJs);

      statusEl.textContent = "Zipping\u2026";
      const blob = await zip.generateAsync({ type: "blob" }, function (meta) {
        statusEl.textContent = "Zipping\u2026 " + Math.round(meta.percent) + "%";
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "noy-birthday-content.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      statusEl.textContent = "Done \u2014 check your downloads. Drag the assets folder into your repo next.";
    } catch (err) {
      statusEl.textContent = "Something went wrong \u2014 try again, or with fewer/smaller files.";
      console.error(err);
    } finally {
      generateBtn.disabled = false;
    }
  });

  function extOf(filename) {
    const m = /\.([a-zA-Z0-9]+)$/.exec(filename || "");
    return m ? m[1].toLowerCase() : "";
  }

  function buildMediaJs(d) {
    const photosArr = d.photoEntries
      .map(function (p) { return "    { src: " + JSON.stringify(p) + ', caption: "" },'; })
      .join("\n");

    const tracklistArr = d.tracklist
      .map(function (t) {
        return "      { title: " + JSON.stringify(t.title) + ", artist: " + JSON.stringify(t.artist) + " },";
      })
      .join("\n");

    const notesArr = d.flowerNotes.map(function (n) { return "    " + JSON.stringify(n) + ","; }).join("\n");

    return "/* ============================================================\n" +
      "   MEDIA CONFIG \u2014 generated by studio.html\n" +
      "   ============================================================ */\n\n" +
      "const MEDIA = {\n\n" +
      "  recipientName: " + JSON.stringify(d.recipientName) + ",\n\n" +
      "  photos: [\n" +
      (photosArr || "    // no photos added yet") + "\n" +
      "  ],\n\n" +
      "  happyBirthdayAudio: {\n" +
      "    src: " + JSON.stringify(d.audioPath) + ",\n" +
      "  },\n\n" +
      "  music: {\n" +
      "    featured: {\n" +
      "      title: " + JSON.stringify(d.featuredTitle) + ",\n" +
      "      artist: " + JSON.stringify(d.featuredArtist) + ",\n" +
      "      embedUrl: " + JSON.stringify(d.featuredEmbed) + ",\n" +
      "      audioSrc: " + JSON.stringify(d.featAudioPath) + ",\n" +
      "    },\n" +
      "    tracklist: [\n" +
      (tracklistArr || "      // no tracks added yet") + "\n" +
      "    ],\n" +
      "  },\n\n" +
      "  flowerNotes: [\n" +
      notesArr + "\n" +
      "  ],\n\n" +
      "  letter: {\n" +
      "    body: " + JSON.stringify(d.letterBody) + ",\n" +
      "  },\n" +
      "};\n\n" +
      "// explicit, in case anything ever references window.MEDIA directly\n" +
      "window.MEDIA = MEDIA;\n";
  }
})();
