/* ============================================================
   MEDIA CONFIG — template.
   Fill this in yourself, or use studio.html (no code needed) and
   it'll generate this whole file for you as part of a downloadable
   assets/ folder.
   ============================================================ */

const MEDIA = {

  // ---- WHO THIS IS FOR ---------------------------------------------
  recipientName: "Friend", // shows on the landing page: "happy birthday, ___"

  // ---- PHOTOS -------------------------------------------------
  photos: [
    // { src: "assets/photos/photo-01.jpg", caption: "" },
  ],

  // ---- AUDIO: Happy Birthday clip (plays when the candle is blown out) ----
  happyBirthdayAudio: {
    src: "", // e.g. "assets/audio/happy-birthday.mp3"
  },

  // ---- MUSIC PAGE -------------------------------------------------
  music: {
    featured: {
      title: "",
      artist: "",
      embedUrl: "", // a Spotify/YouTube embed URL -> shows as an embedded player
      audioSrc: "", // OR: path to your own mp3 in assets/audio/ -> shows as a full
                     // custom player (scrubber + play/pause) instead.
                     // If both are empty, it just shows the title/artist card.
    },
    tracklist: [
      // { title: "", artist: "" },
    ],
  },

  // ---- FLOWERS: affirmation notes ----------------------------------
  flowerNotes: [
    "",
  ],

  // ---- LETTER (read into the Cake finale) --------------------------
  letter: {
    body:
`Write the letter here.

It can be as long as you want — the card scrolls.`,
  },
};
