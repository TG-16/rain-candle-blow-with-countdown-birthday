/* ================================================================
   BIRTHDAY SURPRISE — SCRIPT.JS
   ★ FIXES in this version:
     1. Music now correctly resumes after candles are blown out
     2. Music swapped to a clean <audio> element — just drop in your file
     3. Countdown replaced with live days/hours/minutes/seconds
        ticking to April 24, 2027
   ================================================================ */

/* ================================================================
   ★ MUSIC CONFIGURATION — edit these to match your audio file
   ================================================================
   HOW TO USE YOUR OWN MUSIC:
   1. Put your mp3/ogg file in the same folder as this script.
   2. Change MUSIC_SRC to your filename, e.g. 'my-song.mp3'
   3. Adjust the timing values (in seconds) to match your track:
      - LOOP_START : where the soft holding-loop begins
      - LOOP_END   : where it wraps back to LOOP_START
      - PAUSE_POINT: where music resumes after blow (same as LOOP_END usually)
   ================================================================ */
const MUSIC_SRC = "lidu_lidyaye.mp3"; // ← CHANGE THIS to your filename
const LOOP_START = 33; // seconds — loop region start
const LOOP_END = 41; // seconds — loop region end
const PAUSE_POINT = 21; // seconds — resume from here after blow

/* ================================================================
   ★ COUNTDOWN TARGET DATE — set to April 24, 2027
   ================================================================ */
const COUNTDOWN_TARGET = new Date("2027-04-24T00:00:00");

/* ================================================================
   ★ MUSIC ENGINE — clean <audio> element
   Swap your file by changing MUSIC_SRC above. That's all.
   ================================================================ */
const bgMusic = new Audio(MUSIC_SRC);
bgMusic.preload = "auto";

/* Start music from the beginning, then set up the waiting loop */
async function startMusic() {
  try {
    bgMusic.currentTime = 0;
    await bgMusic.play();
    bgMusic.addEventListener("timeupdate", onMusicTimeUpdate);
  } catch (e) {
    console.warn("Music autoplay blocked — will retry.", e);
  }
}

/* Loop the section between LOOP_START and LOOP_END while waiting */
function onMusicTimeUpdate() {
  if (bgMusic.currentTime >= LOOP_END) {
    bgMusic.currentTime = LOOP_START;
  }
}

/* ★ THE FIX: remove loop listener then snap & play from PAUSE_POINT */
function resumeMusicAfterBlow() {
  bgMusic.removeEventListener("timeupdate", onMusicTimeUpdate);
  bgMusic.currentTime = PAUSE_POINT;
  bgMusic.play().catch((e) => console.warn("Resume failed:", e));
}

/* ================================================================
   ★ WELCOME OVERLAY — Step 1 & 2
   ================================================================ */
const welcomeOverlay = document.getElementById("welcome-overlay");
const particleCanvas = document.getElementById("particle-canvas");
const pCtx = particleCanvas.getContext("2d");
let particles = [];
let animFrameWelcome;

function resizeCanvas() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createParticles() {
  const colors = ["#f6c94e", "#f4a0b0", "#c59af7", "#7dd3fc", "#ffffff"];
  for (let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 1 + Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.5,
      alpha: 0.3 + Math.random() * 0.7,
    });
  }
}
createParticles();

function animateParticles() {
  pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.y < -10) {
      p.y = particleCanvas.height + 10;
      p.x = Math.random() * particleCanvas.width;
    }
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    pCtx.fillStyle = p.color;
    pCtx.globalAlpha = p.alpha;
    pCtx.fill();
  });
  pCtx.globalAlpha = 1;
  animFrameWelcome = requestAnimationFrame(animateParticles);
}
animateParticles();

/* Tap → start music → show age dialog */
welcomeOverlay.addEventListener("click", async () => {
  welcomeOverlay.classList.add("fade-out");
  await startMusic();
  setTimeout(() => {
    welcomeOverlay.style.display = "none";
    cancelAnimationFrame(animFrameWelcome);
    setupScreen.classList.remove("hidden");
  }, 700);
});

/* ================================================================
   EXISTING DOM REFERENCES (unchanged)
   ================================================================ */
const initBtn = document.getElementById("initBtn");
const ageInput = document.getElementById("ageInput");
const setupScreen = document.getElementById("setup-screen");
const stage = document.getElementById("stage");
const cakeSurface = document.getElementById("cake-surface");
const meterFill = document.getElementById("meter-fill");
const statusText = document.getElementById("statusText");
const sparkContainer = document.getElementById("spark-container");

let audioContext;
let analyser;
let dataArray;
let hasCelebrated = false;

/* ================================================================
   EXISTING: initBtn click handler (unchanged)
   ================================================================ */
initBtn.addEventListener("click", async () => {
  const age = parseInt(ageInput.value) || 21;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") await audioContext.resume();
    setupScreen.classList.add("hidden");
    stage.classList.remove("hidden");
    dropCandles(age);
    listenToBlow(stream);
  } catch (err) {
    alert("We need microphone access to let you blow out the candles!");
    console.error("Mic Error:", err);
  }
});

/* ================================================================
   EXISTING: dropCandles (unchanged)
   ================================================================ */
function dropCandles(count) {
  const ellipseWidth = 340;
  const ellipseHeight = 100;
  const centerX = ellipseWidth / 2;
  const centerY = ellipseHeight / 2;

  for (let i = 0; i < count; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "candle-wrapper";

    const radius = Math.sqrt(Math.random()) * 0.85;
    const angle = Math.random() * 2 * Math.PI;

    const x = centerX + radius * (ellipseWidth / 2) * Math.cos(angle);
    const y = centerY + radius * (ellipseHeight / 2) * Math.sin(angle);

    wrapper.style.left = `${x - 5}px`;
    wrapper.style.top = `${y - 50}px`;

    const fallDuration = 0.8 + Math.random() * 0.7;
    wrapper.style.setProperty("--fall-duration", `${fallDuration}s`);

    wrapper.innerHTML = `
            <div class="candle-body">
                <div class="flame"></div>
                <div class="smoke"></div>
            </div>
        `;
    cakeSurface.appendChild(wrapper);
  }
}

/* ================================================================
   EXISTING: listenToBlow (unchanged)
   ================================================================ */
function listenToBlow(stream) {
  const source = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);

  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  function checkAudioLevels() {
    if (hasCelebrated) return;
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let volume = sum / bufferLength;
    meterFill.style.width = `${Math.min(volume * 1.5, 100)}%`;
    if (volume > 45) {
      blowOutCandles();
    }
    requestAnimationFrame(checkAudioLevels);
  }

  setTimeout(() => {
    checkAudioLevels();
  }, 1500);
}

/* ================================================================
   EXISTING: blowOutCandles (unchanged)
   ================================================================ */
function blowOutCandles() {
  const activeFlames = document.querySelectorAll(".flame:not(.out)");

  if (activeFlames.length > 0) {
    const count = Math.min(
      activeFlames.length,
      Math.floor(Math.random() * 3) + 1,
    );
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * activeFlames.length);
      activeFlames[index].classList.add("out");
    }
    const remainingFlames = document.querySelectorAll(".flame:not(.out)");
    if (remainingFlames.length === 0 && !hasCelebrated) {
      triggerCelebration();
    }
  }
}

/* ================================================================
   EXISTING: triggerCelebration
   ★ EXTENDED — resumeMusicAfterBlow, confetti, live countdown added
   ================================================================ */
function triggerCelebration() {
  hasCelebrated = true;
  statusText.innerHTML = "🎉 Happy Birthday! 🎉";
  meterFill.style.background = "#e74c3c";

  // --- EXISTING: spark explosion (unchanged) ---
  const colors = [
    "#f1c40f",
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#9b59b6",
    "#ffffff",
  ];
  for (let i = 0; i < 80; i++) {
    const spark = document.createElement("div");
    spark.classList.add("spark");
    spark.style.setProperty(
      "--spark-color",
      colors[Math.floor(Math.random() * colors.length)],
    );
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 300;
    spark.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
    spark.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
    sparkContainer.appendChild(spark);
    setTimeout(() => spark.remove(), 1200);
  }

  // ★ Resume music after blow (fixed)
  resumeMusicAfterBlow();

  // ★ Confetti
  launchConfetti();

  // ★ Live countdown
  setTimeout(showCountdown, 1400);
}

/* ================================================================
   ★ CONFETTI
   ================================================================ */
function launchConfetti() {
  const colors = [
    "#f6c94e",
    "#f4a0b0",
    "#c59af7",
    "#7dd3fc",
    "#2ecc71",
    "#e74c3c",
    "#ffffff",
  ];
  for (let i = 0; i < 130; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = `${Math.random() * 100}vw`;
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.setProperty("--cf-dur", `${1.8 + Math.random() * 2.2}s`);
    el.style.setProperty("--cf-delay", `${Math.random() * 1.2}s`);
    el.style.setProperty("--cf-rot", `${-360 + Math.random() * 720}deg`);
    el.style.width = `${6 + Math.random() * 8}px`;
    el.style.height = `${9 + Math.random() * 7}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4500);
  }
}

/* ================================================================
   ★ LIVE COUNTDOWN to April 24, 2027
   Ticks every second. Shows days, hours, minutes, seconds.
   ================================================================ */
let countdownInterval = null;

function showCountdown() {
  const section = document.getElementById("countdown-section");
  section.classList.remove("hidden");
  requestAnimationFrame(() => section.classList.add("reveal"));
  renderCountdown();
  countdownInterval = setInterval(renderCountdown, 1000);
}

function renderCountdown() {
  const now = new Date();
  const diff = COUNTDOWN_TARGET - now;

  if (diff <= 0) {
    ["cd-days", "cd-hours", "cd-minutes", "cd-seconds"].forEach((id) => {
      document.getElementById(id).textContent = "00";
    });
    clearInterval(countdownInterval);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById("cd-days").textContent = String(days).padStart(
    2,
    "0",
  );
  document.getElementById("cd-hours").textContent = String(hours).padStart(
    2,
    "0",
  );
  document.getElementById("cd-minutes").textContent = String(minutes).padStart(
    2,
    "0",
  );
  document.getElementById("cd-seconds").textContent = String(seconds).padStart(
    2,
    "0",
  );
}
