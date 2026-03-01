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

// ── ENTER + AUDIO ──
const audio = document.getElementById("audio");
const songs = ["1.mp3", "2.mp3", "3.mp3"];
let songIdx = Math.floor(Math.random() * songs.length);

document.getElementById("enter").addEventListener("click", function () {
  this.classList.add("hide");

  audio.src = songs[songIdx];
  audio.volume = 0.25;
  audio.play().catch(() => {});
});

audio.onended = function () {
  songIdx = (songIdx + 1) % songs.length;
  audio.src = songs[songIdx];
  audio.play().catch(() => {});
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
