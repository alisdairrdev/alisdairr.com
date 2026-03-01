// ── CURSOR ──
const cur = document.getElementById("cursor");

document.addEventListener("mousemove", (e) => {
  cur.style.left = e.clientX + "px";
  cur.style.top  = e.clientY + "px";
});

function addBig(sel) {
  document.querySelectorAll(sel).forEach((el) => {
    el.addEventListener("mouseenter", () => cur.classList.add("big"));
    el.addEventListener("mouseleave", () => cur.classList.remove("big"));
  });
}
addBig("a, #enter, .linkbtn");

// ── AUDIO + ENTER ──
const audio = document.getElementById("audio");
const songs = ["1.mp3", "2.mp3", "3.mp3"];
let songIdx = Math.floor(Math.random() * songs.length);

// Visualiser bits
const canvas = document.getElementById("viz");
const ctx = canvas.getContext("2d", { alpha: true });

let audioCtx = null;
let analyser = null;
let dataArray = null;
let rafId = 0;
let mediaSrc = null;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function setupVisualizer() {
  if (audioCtx) return; // already setup

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256; // simple + smooth
  analyser.smoothingTimeConstant = 0.85;

  // Only create one media element source per audio element
  mediaSrc = audioCtx.createMediaElementSource(audio);
  mediaSrc.connect(analyser);
  analyser.connect(audioCtx.destination);

  dataArray = new Uint8Array(analyser.frequencyBinCount);
}

function drawBars() {
  if (!analyser || !dataArray) return;

  analyser.getByteFrequencyData(dataArray);

  const w = canvas.width;
  const h = canvas.height;

  // clear
  ctx.clearRect(0, 0, w, h);

  // style
  const bars = 28; // number of bars
  const gap = Math.max(1, Math.floor(w * 0.005));
  const barW = Math.floor((w - gap * (bars - 1)) / bars);

  // pick a slice of the spectrum (low-mid looks nicer)
  const start = 2;
  const end = Math.min(dataArray.length - 1, start + bars * 2);

  let i = 0;
  for (let x = 0; x < bars; x++) {
    const idx = start + x * 2;
    const v = dataArray[Math.min(idx, end)] / 255; // 0..1

    // bar height curve (less jumpy)
    const barH = Math.max(3, Math.floor((v ** 1.2) * (h * 0.92)));

    const px = x * (barW + gap);
    const py = h - barH;

    // simple two-layer bar for a “soft glow” feel
    ctx.fillStyle = "rgba(245,200,0,0.25)";
    ctx.fillRect(px, py, barW, barH);

    ctx.fillStyle = "rgba(245,200,0,0.85)";
    ctx.fillRect(px, py + 2, barW, Math.max(2, barH - 4));

    i++;
  }

  rafId = requestAnimationFrame(drawBars);
}

function playCurrent() {
  audio.src = songs[songIdx];
  audio.volume = 0.25;
  return audio.play();
}

document.getElementById("enter").addEventListener("click", function () {
  this.classList.add("hide");

  // WebAudio must be created/resumed in a user gesture
  setupVisualizer();
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});

  playCurrent()
    .then(() => {
      if (!rafId) drawBars();
    })
    .catch(() => {});
});

audio.onended = function () {
  songIdx = (songIdx + 1) % songs.length;
  playCurrent().catch(() => {});
};

// ── LANYARD ──
fetch("https://api.lanyard.rest/v1/users/751578620278866010")
  .then((r) => r.json())
  .then((d) => {
    if (!d.success) return;

    const p = d.data;
    const status = p.discord_status || "offline";
    const uname = p.discord_user.global_name || p.discord_user.username;

    document.getElementById("dot").className = "statusdot " + status;
    document.getElementById("handle").textContent = p.discord_user.username;

    // keep your stylized ending "r"
    document.getElementById("home-name").innerHTML = uname.replace(/r$/, "<em>r</em>");
  })
  .catch(() => {});
