/**
 * ============================================================================
 * SPECIAL BIRTHDAY DELIVERY (PHILIPPINES ➔ UNITED KINGDOM)
 * Interactive Animated Experience for GitHub Pages
 * ============================================================================
 */

/* ============================================================================
   1. EASY CUSTOMIZATION CONFIGURATION
   Edit the fields below to personalize your birthday video & letter!
   ============================================================================ */
const BIRTHDAY_CONFIG = {
  // Path to your video file in the repo (or a direct .mp4 URL)
  // Matches the exact casing of 'Video.mp4' in the workspace for GitHub Pages (case-sensitive Linux servers)
  videoSrc: 'Video.mp4',

  // Duration of the paper airplane flight from Philippines to UK (in milliseconds)
  flightDurationMs: 4800,

  // Camera zoom settings (in SVG coordinate units on the 720x540 vector map)
  cameraStartWidth: 142,   // Zoomed in on the Philippines at takeoff
  cameraCruiseBoost: 68,   // Smoothly widens at mid-flight cruising altitude
  cameraEndWidth: 136,     // Zoomed in on the United Kingdom at landing

  // Birthday Letter Content
  letterHeading: 'Happy Birthday to you!',
  recipientSalutation: 'Dearest Birthday Star,',
  messageParagraphs: [
    'Across the oceans and thousands of miles from the Philippines all the way to the United Kingdom, this little paper airplane brings you the warmest birthday hugs and brightest wishes!',
    'May your year ahead be filled with sweet surprises, cozy moments, endless laughter, and dreams coming true. Have the most magical celebration today!'
  ],
  signoffText: 'With love from the Philippines,',
  senderSignature: 'Your Loved Ones 💙'
};

/* ============================================================================
   2. WEB AUDIO SYNTHESIZER (Zero External Audio Dependencies)
   ============================================================================ */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this.init();
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.25, delay = 0, maxGain = 0.12) {
    if (this.muted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(maxGain, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  // Gentle chime when plane lands in the UK and envelope pops up
  playLandingChime() {
    this.playTone(523.25, 'sine', 0.28, 0, 0.1);        // C5
    this.playTone(659.25, 'sine', 0.32, 0.11, 0.11);    // E5
    this.playTone(783.99, 'triangle', 0.45, 0.22, 0.12); // G5
  }

  // Soft paper pop + sparkle when envelope opens
  playEnvelopeOpen() {
    this.playTone(392.00, 'triangle', 0.18, 0, 0.1);    // G4
    this.playTone(587.33, 'sine', 0.25, 0.08, 0.11);    // D5
    this.playTone(880.00, 'sine', 0.4, 0.17, 0.12);     // A5
  }

  // Celebratory chime flourish when the birthday letter comes out
  playBirthdayChime() {
    const notes = [
      { f: 523.25, d: 0.00, len: 0.25 }, // C5
      { f: 659.25, d: 0.10, len: 0.25 }, // E5
      { f: 783.99, d: 0.20, len: 0.28 }, // G5
      { f: 1046.50, d: 0.32, len: 0.55 }, // C6
      { f: 1318.51, d: 0.46, len: 0.65 }  // E6
    ];
    notes.forEach((n) => this.playTone(n.f, 'sine', n.len, n.d, 0.11));
  }

  // Gentle music box notes for the built-in sample video
  playHappyBirthdayMelodyNote(stepIndex) {
    const melody = [
      392.00, 392.00, 440.00, 392.00, 523.25, 493.88,
      392.00, 392.00, 440.00, 392.00, 587.33, 523.25
    ];
    const freq = melody[stepIndex % melody.length];
    if (freq) {
      this.playTone(freq, 'sine', 0.36, 0, 0.08);
    }
  }
}

const soundFX = new SoundEngine();

/* ============================================================================
   3. BUILT-IN ANIMATED SAMPLE VIDEO PLAYER (Light Blue Pastel Theme)
   (Fallback if Video.mp4 fails to load)
   ============================================================================ */
class SampleBirthdayVideoPlayer {
  constructor({ container, canvas, playPauseBtn, progressTrack, progressFill, timeText, onEnded }) {
    this.container = container;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.playPauseBtn = playPauseBtn;
    this.progressTrack = progressTrack;
    this.progressFill = progressFill;
    this.timeText = timeText;
    this.onEnded = onEnded;

    this.durationMs = 6000;
    this.elapsedMs = 0;
    this.playing = false;
    this.lastFrameTime = null;
    this.rafId = null;
    this.lastNoteStep = -1;

    this.bindEvents();
    this.renderFrame(0);
  }

  bindEvents() {
    const toggle = () => {
      if (this.playing) this.pause();
      else this.play();
    };
    this.playPauseBtn.addEventListener('click', toggle);
    this.canvas.addEventListener('click', toggle);

    this.progressTrack.addEventListener('click', (e) => {
      const rect = this.progressTrack.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.elapsedMs = ratio * this.durationMs;
      this.lastNoteStep = Math.floor(this.elapsedMs / 500);
      this.updateUI();
      this.renderFrame(this.elapsedMs);
    });
  }

  play() {
    if (this.elapsedMs >= this.durationMs) {
      this.elapsedMs = 0;
      this.lastNoteStep = -1;
    }
    this.playing = true;
    this.playPauseBtn.textContent = '⏸';
    this.lastFrameTime = performance.now();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame((ts) => this.tick(ts));
  }

  pause() {
    this.playing = false;
    this.playPauseBtn.textContent = '▶';
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  reset() {
    this.pause();
    this.elapsedMs = 0;
    this.lastNoteStep = -1;
    this.updateUI();
    this.renderFrame(0);
  }

  tick(now) {
    if (!this.playing) return;
    const dt = now - (this.lastFrameTime || now);
    this.lastFrameTime = now;
    this.elapsedMs = Math.min(this.durationMs, this.elapsedMs + dt);

    const noteStep = Math.floor(this.elapsedMs / 480);
    if (noteStep !== this.lastNoteStep && noteStep < 12) {
      this.lastNoteStep = noteStep;
      soundFX.playHappyBirthdayMelodyNote(noteStep);
    }

    this.updateUI();
    this.renderFrame(this.elapsedMs);

    if (this.elapsedMs >= this.durationMs) {
      this.pause();
      if (typeof this.onEnded === 'function') {
        this.onEnded();
      }
    } else {
      this.rafId = requestAnimationFrame((ts) => this.tick(ts));
    }
  }

  updateUI() {
    const pct = (this.elapsedMs / this.durationMs) * 100;
    this.progressFill.style.width = `${pct.toFixed(1)}%`;
    const curSec = Math.floor(this.elapsedMs / 1000);
    const totSec = Math.floor(this.durationMs / 1000);
    this.timeText.textContent = `0:0${curSec} / 0:0${totSec}`;
  }

  renderFrame(t) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#eef7ff');
    grad.addColorStop(0.5, '#e0f1fe');
    grad.addColorStop(1, '#f0f9ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Floating pastel balloons
    const balloons = [
      { x: 110, baseY: 220, color: '#56b2f7', speed: 0.04, phase: 0 },
      { x: 185, baseY: 250, color: '#ffd166', speed: 0.035, phase: 1.5 },
      { x: 465, baseY: 240, color: '#8ce0b5', speed: 0.042, phase: 0.8 },
      { x: 535, baseY: 215, color: '#90cdf4', speed: 0.038, phase: 2.2 }
    ];

    balloons.forEach((b) => {
      const y = b.baseY - ((t * b.speed) % 160) + Math.sin(t * 0.004 + b.phase) * 8;
      const swayX = b.x + Math.cos(t * 0.003 + b.phase) * 10;

      ctx.beginPath();
      ctx.moveTo(swayX, y + 26);
      ctx.quadraticCurveTo(swayX + 6, y + 48, swayX - 2, y + 68);
      ctx.strokeStyle = '#9bbcd6';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(swayX, y, 22, 27, 0, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(swayX - 7, y - 8, 5, 8, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fill();
    });

    // Birthday Cake in Center
    const cx = w / 2;
    const cy = h / 2 + 38;

    ctx.beginPath();
    ctx.ellipse(cx, cy + 54, 105, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#b6ddfc';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#cbe7ff';
    ctx.beginPath();
    ctx.roundRect(cx - 75, cy - 2, 150, 54, 12);
    ctx.fill();
    ctx.strokeStyle = '#75bff8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#f4faff';
    ctx.beginPath();
    ctx.roundRect(cx - 54, cy - 46, 108, 46, 10);
    ctx.fill();
    ctx.strokeStyle = '#94cdfb';
    ctx.stroke();

    ctx.fillStyle = '#4aa8f0';
    for (let i = -42; i <= 42; i += 21) {
      ctx.beginPath();
      ctx.arc(cx + i, cy - 42, 11, 0, Math.PI);
      ctx.fill();
    }

    ctx.fillStyle = '#ffd166';
    ctx.fillRect(cx - 6, cy - 78, 12, 32);
    ctx.strokeStyle = '#f4a261';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 6, cy - 78, 12, 32);

    const flicker = Math.sin(t * 0.025) * 2.5;
    ctx.beginPath();
    ctx.ellipse(cx + flicker * 0.4, cy - 90, 8, 14 + Math.cos(t * 0.02) * 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ff9f1c';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx + flicker * 0.2, cy - 88, 4, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fff3b0';
    ctx.fill();

    ctx.fillStyle = '#247ec9';
    ctx.font = '700 28px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Happy Birthday! ✨', cx, 56);

    ctx.fillStyle = '#4f6d85';
    ctx.font = '600 15px Quicksand, sans-serif';
    ctx.fillText('🇵🇭 Special Video Delivery to the UK 🇬🇧', cx, 84);
  }
}

/* ============================================================================
   4. PASTEL LIGHT-BLUE CONFETTI ENGINE
   ============================================================================ */
class ConfettiController {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animId = null;
    this.colors = [
      '#56b2f7', '#8fd3fe', '#3192e3', '#bae4fd',
      '#ffd166', '#8ce0b5', '#a5b4fc', '#ffffff'
    ];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst() {
    this.stop();
    this.particles = [];
    const count = window.innerWidth < 600 ? 75 : 130;

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI) - Math.PI;
      const speed = 4 + Math.random() * 10;
      this.particles.push({
        x: this.canvas.width * (0.25 + Math.random() * 0.5),
        y: this.canvas.height * 0.55,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        vy: -Math.abs(Math.sin(angle) * speed) - (3 + Math.random() * 6),
        size: 6 + Math.random() * 7,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.18 + Math.random() * 0.08,
        drag: 0.985,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.05 + Math.random() * 0.06,
        shape: Math.random() > 0.35 ? 'rect' : 'circle',
        opacity: 1
      });
    }

    this.animate();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let activeCount = 0;
    for (const p of this.particles) {
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.x += p.vx + Math.sin(p.wobble) * 0.9;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;

      if (p.y > this.canvas.height - 60) {
        p.opacity -= 0.025;
      }

      if (p.opacity > 0 && p.y < this.canvas.height + 40) {
        activeCount++;
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          this.ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        }
        this.ctx.restore();
      }
    }

    if (activeCount > 0) {
      this.animId = requestAnimationFrame(() => this.animate());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

/* ============================================================================
   5. MAIN APPLICATION CONTROLLER
   ============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const mainStage = document.getElementById('mainStage');
  const mapFrame = document.getElementById('mapFrame');
  const worldMapSvg = document.getElementById('worldMapSvg');
  const vectorContinentsPath = document.getElementById('vectorContinentsPath');
  const vectorPhilippinesPath = document.getElementById('vectorPhilippinesPath');
  const vectorUkPath = document.getElementById('vectorUkPath');

  const flightStatusText = document.getElementById('flightStatusText');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');

  const flightGuidePath = document.getElementById('flightGuidePath');
  const flightTrailPath = document.getElementById('flightTrailPath');
  const paperAirplane = document.getElementById('paperAirplane');

  const interactionStage = document.getElementById('interactionStage');
  const envelopeWrapper = document.getElementById('envelopeWrapper');
  const envelope = document.getElementById('envelope');
  const clickPrompt = document.getElementById('clickPrompt');

  const contentDeck = document.getElementById('contentDeck');
  const videoFrameCard = document.getElementById('videoFrameCard');
  const birthdayVideo = document.getElementById('birthdayVideo');
  const skipVideoBtn = document.getElementById('skipVideoBtn');
  const replayVideoBtn = document.getElementById('replayVideoBtn');
  const frameCaptionText = document.getElementById('frameCaptionText');

  // Sample Fallback Video Player Elements
  const sampleVideoPlayerEl = document.getElementById('sampleVideoPlayer');
  const sampleVideoCanvas = document.getElementById('sampleVideoCanvas');
  const samplePlayPauseBtn = document.getElementById('samplePlayPauseBtn');
  const sampleProgressTrack = document.getElementById('sampleProgressTrack');
  const sampleProgressFill = document.getElementById('sampleProgressFill');
  const sampleTimeText = document.getElementById('sampleTimeText');

  const letterPaper = document.getElementById('letterPaper');
  const letterHeading = document.getElementById('letterHeading');
  const letterSalutation = document.getElementById('letterSalutation');
  const letterBody = document.getElementById('letterBody');
  const letterSignoff = document.getElementById('letterSignoff');
  const letterSignature = document.getElementById('letterSignature');

  const restartContainer = document.getElementById('restartContainer');
  const startOverBtn = document.getElementById('startOverBtn');
  const confettiCanvas = document.getElementById('confettiCanvas');

  const confetti = new ConfettiController(confettiCanvas);

  // State Tracking
  let appState = 'IDLE'; // IDLE | FLYING | LANDED | VIDEO_PLAYING | LETTER_REVEALED
  let flightAnimFrameId = null;
  let timers = [];
  let useSampleFallbackVideo = false;

  // Current Camera State (so window resizes keep the camera framed properly)
  let currentCameraFocus = { x: 557, y: 292, progress: 0, angleRad: -2.4 };

  const samplePlayer = new SampleBirthdayVideoPlayer({
    container: sampleVideoPlayerEl,
    canvas: sampleVideoCanvas,
    playPauseBtn: samplePlayPauseBtn,
    progressTrack: sampleProgressTrack,
    progressFill: sampleProgressFill,
    timeText: sampleTimeText,
    onEnded: () => {
      if (appState === 'VIDEO_PLAYING') {
        revealBirthdayLetter();
      }
    }
  });

  function scheduleTimeout(fn, delay) {
    const id = setTimeout(fn, delay);
    timers.push(id);
    return id;
  }

  function clearAllTimers() {
    timers.forEach((id) => clearTimeout(id));
    timers = [];
  }

  /* --------------------------------------------------------------------------
     Populate High-Detail Vector Map Paths from WRLD-EPS-02-8001.ai
     -------------------------------------------------------------------------- */
  function loadVectorMapPaths() {
    if (window.WORLD_MAP_VECTORS) {
      vectorContinentsPath.setAttribute('d', window.WORLD_MAP_VECTORS.continents || '');
      vectorPhilippinesPath.setAttribute('d', window.WORLD_MAP_VECTORS.philippines || '');
      vectorUkPath.setAttribute('d', window.WORLD_MAP_VECTORS.uk || '');
    }
  }

  /* --------------------------------------------------------------------------
     Camera-Follow Controller (Dynamically Tracks the Paper Airplane)
     -------------------------------------------------------------------------- */
  function updateCameraViewBox(planeX, planeY, progress, angleRad = 0) {
    currentCameraFocus = { x: planeX, y: planeY, progress, angleRad };

    const rect = mapFrame.getBoundingClientRect();
    const aspect = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 16 / 9;

    const startW = BIRTHDAY_CONFIG.cameraStartWidth || 142;
    const endW = BIRTHDAY_CONFIG.cameraEndWidth || 136;
    const cruiseBoost = BIRTHDAY_CONFIG.cameraCruiseBoost || 68;

    // Linearly blend base width from startW to endW, plus a smooth sine arch boost at mid-flight altitude
    const baseW = startW + (endW - startW) * progress;
    const altitudeArch = Math.sin(progress * Math.PI);
    const camW = baseW + altitudeArch * cruiseBoost;
    const camH = camW / Math.max(0.75, Math.min(2.4, aspect));

    // Subtle look-ahead offset in the direction of flight during mid-flight cruise
    const leadDistance = altitudeArch * 8;
    const focusX = planeX + Math.cos(angleRad) * leadDistance;
    const focusY = planeY + Math.sin(angleRad) * leadDistance;

    const vx = focusX - camW / 2;
    const vy = focusY - camH / 2;

    worldMapSvg.setAttribute(
      'viewBox',
      `${vx.toFixed(2)} ${vy.toFixed(2)} ${camW.toFixed(2)} ${camH.toFixed(2)}`
    );
  }

  window.addEventListener('resize', () => {
    updateCameraViewBox(
      currentCameraFocus.x,
      currentCameraFocus.y,
      currentCameraFocus.progress,
      currentCameraFocus.angleRad
    );
  });

  /* --------------------------------------------------------------------------
     Detect Whether Custom Video.mp4 Exists or Activate Sample Birthday Video
     -------------------------------------------------------------------------- */
  function activateSampleFallback() {
    if (useSampleFallbackVideo) return;
    useSampleFallbackVideo = true;
    birthdayVideo.style.display = 'none';
    sampleVideoPlayerEl.hidden = false;
  }

  birthdayVideo.addEventListener('error', activateSampleFallback);
  const videoSources = birthdayVideo.querySelectorAll('source');
  const videoSourceEl = videoSources[0];
  if (videoSources.length > 0) {
    videoSources[videoSources.length - 1].addEventListener('error', activateSampleFallback);
  }

  /* --------------------------------------------------------------------------
     Apply User Configuration to DOM
     -------------------------------------------------------------------------- */
  function applyConfiguration() {
    letterHeading.textContent = BIRTHDAY_CONFIG.letterHeading;
    letterSalutation.textContent = BIRTHDAY_CONFIG.recipientSalutation;
    letterBody.innerHTML = '';
    BIRTHDAY_CONFIG.messageParagraphs.forEach((paragraph) => {
      const p = document.createElement('p');
      p.textContent = paragraph;
      letterBody.appendChild(p);
    });
    letterSignoff.textContent = BIRTHDAY_CONFIG.signoffText;
    letterSignature.textContent = BIRTHDAY_CONFIG.senderSignature;

    if (videoSourceEl && BIRTHDAY_CONFIG.videoSrc) {
      videoSourceEl.setAttribute('src', BIRTHDAY_CONFIG.videoSrc);
      birthdayVideo.load();
    }
  }

  /* --------------------------------------------------------------------------
     Sound Mute / Unmute Toggle
     -------------------------------------------------------------------------- */
  soundToggleBtn.addEventListener('click', () => {
    const isMuted = soundFX.toggleMute();
    soundIcon.textContent = isMuted ? '🔇' : '🔊';
  });

  window.addEventListener('pointerdown', () => soundFX.init(), { once: true });

  /* --------------------------------------------------------------------------
     SCENE 1: Paper Airplane Flight with Camera Tracking (PH ➔ UK)
     -------------------------------------------------------------------------- */
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function buildPartialTrailD(pathEl, currentDistance, steps = 40) {
    if (currentDistance <= 0.5) return '';
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const d = (currentDistance * i) / steps;
      const pt = pathEl.getPointAtLength(d);
      pts.push(`${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`);
    }
    return `M ${pts.join(' L ')}`;
  }

  function startFlight() {
    clearAllTimers();
    if (flightAnimFrameId) cancelAnimationFrame(flightAnimFrameId);

    appState = 'FLYING';
    flightStatusText.textContent = '✈️ Departing from the Philippines 🇵🇭 to the United Kingdom 🇬🇧...';

    const totalLength = flightGuidePath.getTotalLength();
    const duration = BIRTHDAY_CONFIG.flightDurationMs || 4800;
    let startTime = null;

    // Position airplane at origin (Philippines: 557, 292)
    const startPt = flightGuidePath.getPointAtLength(0);
    const nextPt = flightGuidePath.getPointAtLength(2);
    const initialAngleRad = Math.atan2(nextPt.y - startPt.y, nextPt.x - startPt.x);
    const initialAngleDeg = (initialAngleRad * 180) / Math.PI;

    paperAirplane.style.opacity = '1';
    paperAirplane.setAttribute(
      'transform',
      `translate(${startPt.x.toFixed(2)}, ${startPt.y.toFixed(2)}) rotate(${initialAngleDeg.toFixed(1)}) scale(0.25)`
    );
    flightTrailPath.setAttribute('d', '');
    flightTrailPath.style.opacity = '1';

    // Focus camera tightly on the Philippines before takeoff
    updateCameraViewBox(startPt.x, startPt.y, 0, initialAngleRad);

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(rawProgress);

      const currentDist = easedProgress * totalLength;
      const pt = flightGuidePath.getPointAtLength(currentDist);

      // Compute tangent direction for natural airplane banking & rotation
      const lookAhead = Math.min(currentDist + 2.5, totalLength);
      const lookBehind = Math.max(currentDist - 2.5, 0);
      const p1 = flightGuidePath.getPointAtLength(lookBehind);
      const p2 = flightGuidePath.getPointAtLength(lookAhead);
      const angleRad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const angleDeg = (angleRad * 180) / Math.PI;

      // Subtle altitude scale boost at mid-flight arc
      const planeScale = 0.25 * (1 + Math.sin(rawProgress * Math.PI) * 0.28);

      paperAirplane.setAttribute(
        'transform',
        `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) rotate(${angleDeg.toFixed(1)}) scale(${planeScale.toFixed(3)})`
      );

      // Update camera to follow the airplane smoothly across the continents
      updateCameraViewBox(pt.x, pt.y, easedProgress, angleRad);

      // Draw progressive dashed trail behind the plane
      flightTrailPath.setAttribute('d', buildPartialTrailD(flightGuidePath, currentDist));

      if (rawProgress > 0.08 && rawProgress < 0.95) {
        flightStatusText.textContent = '✈️ Flying from Philippines 🇵🇭 to United Kingdom 🇬🇧...';
      }

      if (rawProgress < 1) {
        flightAnimFrameId = requestAnimationFrame(step);
      } else {
        onFlightLanded();
      }
    }

    // Hold camera on Philippines briefly so user sees the origin island before takeoff
    scheduleTimeout(() => {
      flightAnimFrameId = requestAnimationFrame(step);
    }, 650);
  }

  /* --------------------------------------------------------------------------
     SCENE 2: Landing in the United Kingdom & Envelope Popup
     -------------------------------------------------------------------------- */
  function onFlightLanded() {
    appState = 'LANDED';
    flightStatusText.textContent = '🇬🇧 Landed in the United Kingdom! Special envelope waiting...';
    soundFX.playLandingChime();

    // Softly blur and dim the background world map (focused on the UK)
    mainStage.classList.add('map-dimmed');

    // Show interaction overlay and pop up the envelope
    interactionStage.classList.add('active');
    scheduleTimeout(() => {
      envelopeWrapper.classList.add('visible');
    }, 150);
  }

  /* --------------------------------------------------------------------------
     SCENE 3: Opening Envelope & Video Frame Emergence
     -------------------------------------------------------------------------- */
  function openEnvelope() {
    if (appState !== 'LANDED') return;
    appState = 'VIDEO_PLAYING';

    soundFX.init();
    soundFX.playEnvelopeOpen();

    flightStatusText.textContent = '🎬 Opening your birthday surprise...';

    // Rotate 3D envelope flap open
    envelopeWrapper.classList.add('opened');

    // After flap opens, emerge the video frame from inside the envelope
    scheduleTimeout(() => {
      contentDeck.classList.add('active');
      envelopeWrapper.classList.add('docked');

      // Trigger reflow so transition animates smoothly from inside envelope
      void videoFrameCard.offsetWidth;
      videoFrameCard.classList.add('emerged');

      // Start playing the birthday video
      startVideoPlayback();
    }, 550);
  }

  envelope.addEventListener('click', openEnvelope);
  clickPrompt.addEventListener('click', openEnvelope);
  envelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEnvelope();
    }
  });

  function startVideoPlayback() {
    frameCaptionText.textContent = 'Playing your special birthday message...';
    replayVideoBtn.hidden = true;
    skipVideoBtn.hidden = false;

    if (useSampleFallbackVideo) {
      samplePlayer.reset();
      samplePlayer.play();
      return;
    }

    birthdayVideo.currentTime = 0;
    const playPromise = birthdayVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (birthdayVideo.networkState === HTMLMediaElement.NETWORK_NO_SOURCE || birthdayVideo.readyState === 0) {
          activateSampleFallback();
          samplePlayer.reset();
          samplePlayer.play();
        } else {
          frameCaptionText.textContent = 'Tap play on the video to watch your birthday message!';
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     SCENE 4: Video Ends ➔ Fold Frame to Side/Top & Reveal Birthday Letter
     -------------------------------------------------------------------------- */
  function revealBirthdayLetter() {
    if (appState === 'LETTER_REVEALED') return;
    appState = 'LETTER_REVEALED';

    if (useSampleFallbackVideo) {
      samplePlayer.pause();
    } else if (!birthdayVideo.paused) {
      birthdayVideo.pause();
    }

    flightStatusText.textContent = '🎂 Happy Birthday! Sent with love from PH to UK 💌';
    frameCaptionText.textContent = 'Birthday memory watched ✨';
    skipVideoBtn.hidden = true;
    replayVideoBtn.hidden = false;

    // 1. Fold the video frame (to the left side on desktop, or stacked to top on mobile)
    contentDeck.classList.add('letter-mode');
    videoFrameCard.classList.add('folded');

    // 2. Slide the birthday letter paper out from the envelope
    letterPaper.classList.add('visible');
    scheduleTimeout(() => {
      void letterPaper.offsetWidth;
      letterPaper.classList.add('emerged');

      // 3. Celebratory pastel light-blue confetti burst & birthday chime!
      confetti.burst();
      soundFX.playBirthdayChime();

      // 4. Reveal the "Start Over" button after the letter settles
      scheduleTimeout(() => {
        restartContainer.classList.add('visible');
      }, 650);
    }, 120);
  }

  // Trigger letter reveal automatically when native HTML5 video finishes
  birthdayVideo.addEventListener('ended', () => {
    if (appState === 'VIDEO_PLAYING') {
      revealBirthdayLetter();
    }
  });

  // Also allow clicking "Open Letter" button to fold frame and reveal letter anytime
  skipVideoBtn.addEventListener('click', () => {
    revealBirthdayLetter();
  });

  // Allow replaying the video while keeping the letter open
  replayVideoBtn.addEventListener('click', () => {
    if (useSampleFallbackVideo) {
      samplePlayer.reset();
      samplePlayer.play();
    } else {
      birthdayVideo.currentTime = 0;
      birthdayVideo.play().catch(() => {});
    }
  });

  /* --------------------------------------------------------------------------
     SCENE 5: Start Over (Reset Everything & Replay Journey)
     -------------------------------------------------------------------------- */
  function resetExperience() {
    clearAllTimers();
    confetti.stop();

    if (useSampleFallbackVideo) {
      samplePlayer.reset();
    } else {
      birthdayVideo.pause();
      birthdayVideo.currentTime = 0;
    }

    restartContainer.classList.remove('visible');
    letterPaper.classList.remove('emerged');

    scheduleTimeout(() => {
      letterPaper.classList.remove('visible');
      videoFrameCard.classList.remove('folded', 'emerged');
      contentDeck.classList.remove('letter-mode', 'active');

      envelopeWrapper.classList.remove('docked', 'opened', 'visible');
      interactionStage.classList.remove('active');
      mainStage.classList.remove('map-dimmed');

      interactionStage.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });

      scheduleTimeout(() => {
        startFlight();
      }, 450);
    }, 350);
  }

  startOverBtn.addEventListener('click', resetExperience);

  /* --------------------------------------------------------------------------
     Initialize Experience
     -------------------------------------------------------------------------- */
  loadVectorMapPaths();
  applyConfiguration();
  startFlight();
});
