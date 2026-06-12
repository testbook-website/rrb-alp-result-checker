const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzQa6-9FNZXCv9iEQpMTJw5HX2_1p3hAieBwrSSaVei3um8cixFa7luAVCJM4x4uNgBCw/exec";

// State
let rollNumbersDb = null;
let isDbLoading = false;

// DOM Elements
const checkerForm = document.getElementById('checkerForm');
const loaderState = document.getElementById('loaderState');
const qualifiedState = document.getElementById('qualifiedState');
const notQualifiedState = document.getElementById('notQualifiedState');
const submitBtn = document.getElementById('submitBtn');

// Result fields
const resQualName = document.getElementById('resQualName');
const resQualRoll = document.getElementById('resQualRoll');
const resQualZone = document.getElementById('resQualZone');

const resFailName = document.getElementById('resFailName');
const resFailRoll = document.getElementById('resFailRoll');
const resFailZone = document.getElementById('resFailZone');

// Confetti Canvas
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
let confettiActive = false;
let particles = [];
let animationFrameId = null;

// Initial Setup
window.addEventListener('load', () => {
  preloadDatabase();
  window.addEventListener('resize', resizeCanvas);
});

// Fetch data as early as possible
async function preloadDatabase() {
  if (isDbLoading || rollNumbersDb) return;
  isDbLoading = true;
  try {
    const response = await fetch('data/roll_numbers.json');
    if (!response.ok) throw new Error('Failed to load results database');
    rollNumbersDb = await response.json();
    console.log('Database loaded successfully:', Object.keys(rollNumbersDb));
  } catch (error) {
    console.error('Error preloading roll numbers database:', error);
  } finally {
    isDbLoading = false;
  }
}

// Form Submission
checkerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value.trim();
  const mobile = document.getElementById('mobile').value.trim();
  const zone = document.getElementById('zone').value;
  const rollNumber = document.getElementById('rollNumber').value.trim();

  // Basic Validation
  if (!name || mobile.length !== 10 || !zone || rollNumber.length !== 16) {
    alert("Please enter valid details in all fields.");
    return;
  }

  // Switch to Loader State
  switchState('loader');

  // Ensure database is loaded
  if (!rollNumbersDb) {
    try {
      await preloadDatabase();
    } catch (err) {
      // Fallback in case fetch fails
      alert("Error loading the results database. Please refresh and try again.");
      switchState('form');
      return;
    }
  }

  // Perform result check
  const zoneRolls = rollNumbersDb[zone] || [];
  const isQualified = zoneRolls.includes(rollNumber);
  const qualificationStatus = isQualified ? "Qualified" : "Not Qualified";

  // Prep result screens data
  if (isQualified) {
    resQualName.textContent = name;
    resQualRoll.textContent = rollNumber;
    resQualZone.textContent = zone;
  } else {
    resFailName.textContent = name;
    resFailRoll.textContent = rollNumber;
    resFailZone.textContent = zone;
  }

  // Record submission to Google Sheet in the background (CORS safe)
  const submissionData = {
    name: name,
    mobile: mobile,
    zone: zone,
    roll: rollNumber,
    status: qualificationStatus
  };

  // We perform the request and proceed to show the result without letting a slow Apps Script block the user
  try {
    if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.startsWith("YOUR_")) {
      // Send as text/plain to avoid pre-flight OPTIONS request (bypasses CORS restrictions)
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Submit data silently even if CORS isn't fully set up
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(submissionData)
      }).catch(err => console.warn('Background logging failed:', err));
    } else {
      console.log('Sheet URL not configured. Submission logs (local print):', submissionData);
    }
  } catch (error) {
    console.warn('Google Sheet logging error:', error);
  }

  // Visual delay for premium checking feel
  setTimeout(() => {
    if (isQualified) {
      switchState('qualified');
      startConfetti();
    } else {
      switchState('not-qualified');
    }
  }, 1000);
});

// State Switcher Utility
function switchState(state) {
  // Hide all
  checkerForm.classList.remove('active-state');
  loaderState.classList.remove('active-state');
  qualifiedState.classList.remove('active-state');
  notQualifiedState.classList.remove('active-state');
  
  // Stop confetti if exiting success state
  if (state !== 'qualified') {
    stopConfetti();
  }

  // Show selected
  if (state === 'form') {
    checkerForm.classList.add('active-state');
  } else if (state === 'loader') {
    loaderState.classList.add('active-state');
  } else if (state === 'qualified') {
    qualifiedState.classList.add('active-state');
  } else if (state === 'not-qualified') {
    notQualifiedState.classList.add('active-state');
  }
}

// Reset Form Functionality
function resetForm() {
  checkerForm.reset();
  // Set select back to default disabled placeholder
  document.getElementById('zone').selectedIndex = 0;
  switchState('form');
}

/* --- Confetti Engine --- */

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function startConfetti() {
  resizeCanvas();
  confettiActive = true;
  particles = [];
  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#eab308', '#a855f7', '#ff7849'];
  
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 5 + 3,
      d: Math.random() * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.05 + 0.02,
      tiltAngle: 0
    });
  }
  
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  updateConfetti();
}

function updateConfetti() {
  if (!confettiActive) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let activeParticles = 0;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.tiltAngle += p.tiltAngleIncremental;
    p.y += (Math.cos(p.d) + 2.5 + p.r / 2) / 2;
    p.x += Math.sin(p.tiltAngle) * 0.5;
    p.tilt = Math.sin(p.tiltAngle - i / 3) * 12;

    if (p.y < canvas.height + 20) {
      activeParticles++;
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    }
  }

  if (activeParticles > 0) {
    animationFrameId = requestAnimationFrame(updateConfetti);
  } else {
    confettiActive = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function stopConfetti() {
  confettiActive = false;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
