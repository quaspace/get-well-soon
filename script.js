/* ==========================================================================
   MANSHA GET WELL SOON - JAVASCRIPT CONTROLLER
   Features: Parallax Scroll Motion, Dynamic Canvas Particle Field, Interactive
   Rx Checklist, Virtual Hug Burst, Audio Synthesizer, & Wish Note Board
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. SCROLL MOTION & PARALLAX HEALTH ICONS CONTROLLER
  const parallaxIcons = document.querySelectorAll('.parallax-icon');
  let lastScrollY = window.scrollY;
  let targetScrollY = window.scrollY;
  let currentScrollY = window.scrollY;
  let parallaxRafId = null;

  // Passive scroll listener — just stores the target, no work done here
  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
    if (!parallaxRafId) {
      parallaxRafId = requestAnimationFrame(updateParallax);
    }
  }, { passive: true });

  function updateParallax() {
    const diff = targetScrollY - currentScrollY;

    if (Math.abs(diff) > 0.1) {
      // Lerp toward target
      currentScrollY += diff * 0.12;

      parallaxIcons.forEach((icon) => {
        const speed = parseFloat(icon.getAttribute('data-speed')) || 0.2;
        const translateY = currentScrollY * speed;
        const rotate = (currentScrollY * speed * 0.15) % 360;
        icon.style.transform = `translate3d(0, ${translateY}px, 0) rotate(${rotate}deg)`;
      });

      // Keep scroll influence consistent for canvas particles
      lastScrollY = currentScrollY;

      parallaxRafId = requestAnimationFrame(updateParallax);
    } else {
      // Close enough — snap and stop looping
      currentScrollY = targetScrollY;
      lastScrollY = currentScrollY;
      parallaxRafId = null;
    }
  }

  // 2. DYNAMIC HEALTH CANVAS BACKGROUND PARTICLES (High-Performance & Viewport Aware)
  const canvas = document.getElementById('health-canvas');
  const bgContainer = document.getElementById('motion-bg-container');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let mouse = { x: null, y: null, radius: 140 };
  let isCanvasVisible = true;
  let canvasRafId = null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 250);
  }, { passive: true });

  let mouseTicking = false;
  window.addEventListener('mousemove', (e) => {
    if (!mouseTicking) {
      requestAnimationFrame(() => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouseTicking = false;
      });
      mouseTicking = true;
    }
  }, { passive: true });

  class HealthParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * (canvas ? canvas.width : 1000);
      this.y = Math.random() * (canvas ? canvas.height : 1000);
      this.size = Math.random() * 10 + 8;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.speedY = (Math.random() - 0.5) * 0.6;
      this.type = Math.floor(Math.random() * 4); // 0: Cross, 1: Heart, 2: Pill, 3: Sparkle
      this.opacity = Math.random() * 0.35 + 0.15;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Scroll speed influence
      this.y -= (window.scrollY - lastScrollY) * 0.1;

      // Wrap boundaries
      if (canvas) {
        if (this.x < -30) this.x = canvas.width + 30;
        if (this.x > canvas.width + 30) this.x = -30;
        if (this.y < -30) this.y = canvas.height + 30;
        if (this.y > canvas.height + 30) this.y = -30;
      }

      // Mouse interactive reaction
      if (mouse.x && mouse.y) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 1) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 2.2;
          this.y -= (dy / dist) * force * 2.2;
        }
      }
    }

    draw() {
      if (!ctx) return;
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);

      if (this.type === 0) {
        // Medical Cross
        ctx.fillStyle = '#ff758f';
        ctx.fillRect(-this.size / 6, -this.size / 2, this.size / 3, this.size);
        ctx.fillRect(-this.size / 2, -this.size / 6, this.size, this.size / 3);
      } else if (this.type === 1) {
        // Heart
        ctx.fillStyle = '#ff4d6d';
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, this.size, 0, this.size);
        ctx.bezierCurveTo(0, this.size, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
        ctx.fill();
      } else if (this.type === 2) {
        // Pill Capsule
        ctx.fillStyle = '#81c784';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-this.size / 2, -this.size / 4, this.size, this.size / 2, 6);
        } else {
          ctx.rect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        }
        ctx.fill();
      } else {
        // Healing Sparkle
        ctx.fillStyle = '#ffb703';
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(20, Math.max(8, Math.floor(window.innerWidth / 85)));
    for (let i = 0; i < count; i++) {
      particles.push(new HealthParticle());
    }
  }

  function animateCanvas() {
    canvasRafId = null;
    if (!isCanvasVisible || document.hidden) return;

    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
    }
    canvasRafId = requestAnimationFrame(animateCanvas);
  }

  function resumeCanvas() {
    if (!canvasRafId && isCanvasVisible && !document.hidden) {
      canvasRafId = requestAnimationFrame(animateCanvas);
    }
  }

  // Modern IntersectionObserver: Pause canvas when hero is scrolled out of view
  if (bgContainer && 'IntersectionObserver' in window) {
    const bgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isCanvasVisible = entry.isIntersecting;
        if (isCanvasVisible) {
          resumeCanvas();
        } else if (canvasRafId) {
          cancelAnimationFrame(canvasRafId);
          canvasRafId = null;
        }
      });
    }, { threshold: 0.05 });
    bgObserver.observe(bgContainer);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (canvasRafId) {
        cancelAnimationFrame(canvasRafId);
        canvasRafId = null;
      }
    } else {
      resumeCanvas();
    }
  });

  resizeCanvas();
  resumeCanvas();

  // 3. AUDIO SYNTHESIZER (SOOTHING AMBIENT MUSIC)
  const soundBtn = document.getElementById('sound-toggle-btn');
  let audioCtx = null;
  let isPlayingSound = false;
  let synthNodes = [];

  function toggleSound() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!isPlayingSound) {
      audioCtx.resume();
      startAmbientSynth();
      isPlayingSound = true;
      soundBtn.classList.add('playing');
      soundBtn.querySelector('.sound-text').textContent = 'Playing Calm Ambient';
    } else {
      stopAmbientSynth();
      isPlayingSound = false;
      soundBtn.classList.remove('playing');
      soundBtn.querySelector('.sound-text').textContent = 'Ambient Sound';
    }
  }

  function startAmbientSynth() {
    const freqs = [261.63, 329.63, 392.00, 523.25]; // C major chord frequencies
    synthNodes = freqs.map((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.04, audioCtx.currentTime + 3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      return { osc, gain };
    });
  }

  function stopAmbientSynth() {
    synthNodes.forEach(({ osc, gain }) => {
      if (gain) {
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
      }
      setTimeout(() => osc.stop(), 1000);
    });
    synthNodes = [];
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', toggleSound);
  }

  // 4. PRESCRIPTION CHECKLIST LOGIC & CELEBRATION
  const rxChecklist = document.getElementById('rx-checklist');
  const rxProgressBar = document.getElementById('rx-progress-bar');
  const rxStatusText = document.getElementById('rx-status-text');

  if (rxChecklist) {
    rxChecklist.addEventListener('change', updateRxProgress);
  }

  function updateRxProgress() {
    const checkboxes = rxChecklist.querySelectorAll('input[type="checkbox"]');
    const total = checkboxes.length;
    let checkedCount = 0;

    checkboxes.forEach((cb) => {
      if (cb.checked) checkedCount++;
    });

    const percent = Math.round((checkedCount / total) * 100);
    rxProgressBar.style.width = `${percent}%`;
    rxStatusText.textContent = `${checkedCount} of ${total} checked`;

    if (checkedCount === total) {
      triggerConfetti();
      showToast("Yay Mansha! All doctor orders completed! 100% Healing Energy Activated!");
    }
  }

  // 5. VIRTUAL HUG MODAL CONTROLLER
  const hugMainBtn = document.getElementById('hug-main-btn');
  const hugQuickBtn = document.getElementById('hug-quick-btn');
  const hugModal = document.getElementById('hug-modal');
  const modalClose = document.getElementById('modal-close');

  function openHugModal() {
    if (hugModal) {
      hugModal.classList.add('active');
      triggerConfetti();
    }
  }

  window.closeModal = function() {
    if (hugModal) {
      hugModal.classList.remove('active');
    }
  };

  if (hugMainBtn) hugMainBtn.addEventListener('click', openHugModal);
  if (hugQuickBtn) hugQuickBtn.addEventListener('click', openHugModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);

  // 7. MINI BOOSTER GAME HANDLER
  const startGameBtn = document.getElementById('start-game-btn');
  const gameOverlay = document.getElementById('game-start-overlay');
  const gameArea = document.getElementById('game-canvas-area');
  const gameScoreElem = document.getElementById('game-score');
  const energyBar = document.getElementById('energy-bar');
  const energyCounter = document.getElementById('energy-counter');
  
  let score = 0;
  let gameInterval = null;
  let currentIntervalMs = 800; // Tracks active spawn interval so thresholds are only applied once

  if (startGameBtn) {
    startGameBtn.addEventListener('click', startGame);
  }

  function startGame() {
    if (gameOverlay) gameOverlay.style.display = 'none';
    score = 0;
    currentIntervalMs = 800;
    updateScore(0);
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(spawnTarget, currentIntervalMs);
  }

  function spawnTarget() {
    if (!gameArea) return;

    const target = document.createElement('div');
    target.className = 'game-target';
    
    const svgSymbols = [
      `<svg viewBox="0 0 24 24" width="34" height="34" fill="#ff4d6d"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
      `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#81c784" stroke-width="2.5"><path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>`,
      `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#ff758f" stroke-width="2.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`,
      `<svg viewBox="0 0 24 24" width="34" height="34" fill="#ffb703"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      `<svg viewBox="0 0 24 24" width="34" height="34" fill="#a855f7"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    ];
    target.innerHTML = svgSymbols[Math.floor(Math.random() * svgSymbols.length)];

    const randomX = Math.random() * (gameArea.clientWidth - 50);
    target.style.left = `${randomX}px`;

    target.addEventListener('click', () => {
      score += 10;
      updateScore(score);
      
      // Floating score indicator
      const pop = document.createElement('div');
      pop.textContent = '+10 Heart Boost!';
      pop.style.position = 'absolute';
      pop.style.left = target.style.left;
      pop.style.top = target.style.top;
      pop.style.color = '#ff4d6d';
      pop.style.fontWeight = 'bold';
      pop.style.pointerEvents = 'none';
      pop.style.transition = 'all 0.6s ease';
      gameArea.appendChild(pop);

      setTimeout(() => {
        pop.style.transform = 'translateY(-30px)';
        pop.style.opacity = '0';
      }, 50);

      setTimeout(() => pop.remove(), 600);
      target.remove();
    });

    gameArea.appendChild(target);

    // Remove when animation finishes
    setTimeout(() => {
      if (target.parentNode) target.remove();
    }, 3500);
  }

  function updateScore(newScore) {
    if (gameScoreElem) gameScoreElem.textContent = newScore;
    const currentEnergy = Math.min(100, 75 + Math.floor(newScore / 5));
    if (energyBar) energyBar.style.width = `${currentEnergy}%`;
    if (energyCounter) energyCounter.textContent = `${currentEnergy}%`;

    // Difficulty scaling — only escalate when threshold is first crossed
    if (newScore >= 100 && gameInterval && currentIntervalMs !== 400) {
      currentIntervalMs = 400;
      clearInterval(gameInterval);
      gameInterval = setInterval(spawnTarget, currentIntervalMs);
    } else if (newScore >= 50 && newScore < 100 && gameInterval && currentIntervalMs !== 600) {
      currentIntervalMs = 600;
      clearInterval(gameInterval);
      gameInterval = setInterval(spawnTarget, currentIntervalMs);
    }

    if (currentEnergy === 100 && newScore >= 120) {
      clearInterval(gameInterval);
      gameInterval = null;
      showToast("Mansha's Health Meter is FULL 100%! You are amazing!");
      triggerConfetti();
    }
  }

  // 8. WISHES FORM & LOCALSTORAGE BOARD
  const wishForm = document.getElementById('wish-form');
  const wishesContainer = document.getElementById('wishes-container');

  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sender = document.getElementById('sender-name').value.trim();
      const emoji = document.getElementById('wish-emoji').value;
      const message = document.getElementById('wish-message').value.trim();

      if (!sender || !message) return;

      const newWish = { sender, emoji, message, date: 'Just Now' };
      addWishCard(newWish);
      saveWishToStorage(newWish);

      wishForm.reset();
      showToast("💌 Your wishing note has been pinned for Mansha!");
      triggerConfetti(['💌', '💖', '✨']);
    });
  }

  function addWishCard(wish) {
    if (!wishesContainer) return;
    const card = document.createElement('div');
    const colorClasses = ['color-1', 'color-2', 'color-3'];
    const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];

    card.className = `wish-card glass-panel ${randomColor}`;
    card.innerHTML = `
      <div class="wish-card-header">
        <span class="wish-sender">From ${escapeHtml(wish.sender)}</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="wish-emoji">${wish.emoji}</span>
          <button class="delete-wish-btn" title="Delete note" style="background: rgba(255,77,109,0.15); border: none; color: #ff4d6d; width: 22px; height: 22px; border-radius: 50%; font-size: 0.9rem; cursor: pointer;">&times;</button>
        </div>
      </div>
      <p class="wish-text">"${escapeHtml(wish.message)}"</p>
      <span class="wish-date">${wish.date}</span>
    `;

    card.querySelector('.delete-wish-btn').addEventListener('click', () => {
      card.remove();
      deleteWishFromStorage(wish);
      toggleEmptyState();
    });

    const emptyMsg = document.getElementById('no-wishes-msg');
    if (emptyMsg && emptyMsg.parentNode === wishesContainer) {
      wishesContainer.insertBefore(card, emptyMsg);
    } else {
      wishesContainer.prepend(card);
    }

    toggleEmptyState();
  }

  function saveWishToStorage(wish) {
    const saved = JSON.parse(localStorage.getItem('mansha_wishes') || '[]');
    saved.unshift(wish);
    localStorage.setItem('mansha_wishes', JSON.stringify(saved));
  }

  function deleteWishFromStorage(wish) {
    let saved = JSON.parse(localStorage.getItem('mansha_wishes') || '[]');
    saved = saved.filter(w => !(w.sender === wish.sender && w.message === wish.message));
    localStorage.setItem('mansha_wishes', JSON.stringify(saved));
  }

  function toggleEmptyState() {
    const emptyMsg = document.getElementById('no-wishes-msg');
    if (!emptyMsg) return;
    const cards = wishesContainer ? wishesContainer.querySelectorAll('.wish-card') : [];
    emptyMsg.style.display = cards.length === 0 ? 'block' : 'none';
  }

  function loadSavedWishes() {
    const saved = JSON.parse(localStorage.getItem('mansha_wishes') || '[]');
    saved.forEach(addWishCard);
    toggleEmptyState();
  }

  loadSavedWishes();

  // Section reveal observer
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('section').forEach(sec => {
    sec.classList.add('section-reveal');
    revealObserver.observe(sec);
  });

  // Quranic section ambient glow boost
  const quranObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('quranic-in-view', entry.isIntersecting);
    });
  }, { threshold: 0.2 });
  const quranSection = document.getElementById('quranic-healing');
  if (quranSection) quranObserver.observe(quranSection);


  // UTILITIES: CONFETTI & TOAST (Lightweight & Hardware Accelerated)
  function triggerConfetti() {
    const colors = ['#ff4d6d', '#ff758f', '#ff85a2', '#ffb3c6', '#ffccd5', '#ffb703'];
    const count = window.innerWidth < 768 ? 14 : 22;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const conf = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const useHeart = Math.random() < 0.5;
        if (useHeart) {
          conf.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="${color}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
        } else {
          conf.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="#FFD700"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
        }
        const dur = (Math.random() * 1.5 + 1.8).toFixed(2);
        conf.style.position = 'fixed';
        conf.style.left = `${Math.random() * 96 + 2}vw`;
        conf.style.top = '-20px';
        conf.style.zIndex = '3000';
        conf.style.pointerEvents = 'none';
        conf.style.transition = `transform ${dur}s cubic-bezier(0.25, 1, 0.5, 1), opacity ${dur}s ease-in`;

        document.body.appendChild(conf);

        requestAnimationFrame(() => {
          conf.style.transform = `translate3d(0, 105vh, 0) rotate(${Math.random() * 540 - 270}deg)`;
          conf.style.opacity = '0';
        });

        setTimeout(() => conf.remove(), dur * 1000 + 200);
      }, i * 35);
    }
  }

  function showToast(msg, emoji = '✨') {
    const toast = document.createElement('div');
    toast.textContent = emoji + ' ' + msg;
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(50px)';
    toast.style.background = 'linear-gradient(135deg, #0e2619 0%, #1a3f2a 100%)';
    toast.style.color = '#ffe57f';
    toast.style.border = '1.5px solid rgba(255,215,0,0.5)';
    toast.style.padding = '14px 28px';
    toast.style.borderRadius = '50px';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
    toast.style.fontWeight = '600';
    toast.style.fontSize = '0.95rem';
    toast.style.zIndex = '4000';
    toast.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 50);

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(50px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // 9. MANSHA'S RECOVERY COUNTDOWN TIMER CONTROLLER
  const timerDays = document.getElementById('timer-days');
  const timerHours = document.getElementById('timer-hours');
  const timerMinutes = document.getElementById('timer-minutes');
  const timerSeconds = document.getElementById('timer-seconds');
  const targetDateDisplay = document.getElementById('target-date-display');
  const customizeTimerBtn = document.getElementById('customize-timer-btn');

  let recoveryTargetDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const savedTarget = localStorage.getItem('mansha_target_date');
  if (savedTarget) {
    recoveryTargetDate = new Date(savedTarget);
  }

  function updateCountdown() {
    const now = new Date();
    const diff = recoveryTargetDate - now;

    if (targetDateDisplay) {
      targetDateDisplay.textContent = recoveryTargetDate.toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric'
      });
    }

    if (diff <= 0) {
      if (timerDays) timerDays.textContent = '00';
      if (timerHours) timerHours.textContent = '00';
      if (timerMinutes) timerMinutes.textContent = '00';
      if (timerSeconds) timerSeconds.textContent = '00';
      if (targetDateDisplay) targetDateDisplay.textContent = "100% Fully Recovered!";
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    if (timerDays) timerDays.textContent = String(d).padStart(2, '0');
    if (timerHours) timerHours.textContent = String(h).padStart(2, '0');
    if (timerMinutes) timerMinutes.textContent = String(m).padStart(2, '0');
    if (timerSeconds) timerSeconds.textContent = String(s).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  if (customizeTimerBtn) {
    customizeTimerBtn.addEventListener('click', () => {
      const input = prompt("Enter target recovery date (YYYY-MM-DD):", recoveryTargetDate.toISOString().split('T')[0]);
      if (input) {
        const newDate = new Date(input + "T00:00:00");
        if (!isNaN(newDate.getTime())) {
          recoveryTargetDate = newDate;
          localStorage.setItem('mansha_target_date', newDate.toISOString());
          updateCountdown();
          showToast("Recovery Target Date updated!");
        } else {
          alert("Invalid date format. Please use YYYY-MM-DD.");
        }
      }
    });
  }

  // 10. MOBILE BOTTOM DOCK SCROLL OBSERVER (Zero-Jank IntersectionObserver)
  const dockItems = document.querySelectorAll('.dock-item');
  const pageSections = document.querySelectorAll('section[id]');

  if ('IntersectionObserver' in window) {
    const dockObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          dockItems.forEach((item) => {
            if (item.getAttribute('href') === `#${id}`) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '-20% 0px -55% 0px', threshold: 0.05 });

    pageSections.forEach((sec) => dockObserver.observe(sec));
  }

  // Dock smooth scroll — override default anchor jump with smooth scrollIntoView
  dockItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const href = item.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // 11. MANSHA REPEAT VISIT TRACKER & SPECIAL SURPRISE MODAL
  const visitBadge = document.getElementById('mansha-visit-badge');
  const visitCounterText = document.getElementById('visit-counter-text');
  const repeatWatchBanner = document.getElementById('repeat-watch-banner');
  const repeatWatchText = document.getElementById('repeat-watch-text');
  const repeatModal = document.getElementById('repeat-visit-modal');
  const repeatModalCount = document.getElementById('repeat-modal-count');
  const repeatModalClose = document.getElementById('repeat-modal-close');
  const repeatModalBtn = document.getElementById('repeat-modal-btn');

  // Read and increment visit counter (preset starting count to 8 so Mansha immediately sees her milestone)
  let visitCount = parseInt(localStorage.getItem('mansha_visit_count'), 10);
  if (isNaN(visitCount) || visitCount < 8) {
    visitCount = 8; // She already watched 8-9 times!
  } else {
    visitCount += 1;
  }
  localStorage.setItem('mansha_visit_count', visitCount);

  // Update UI with visit count
  if (visitBadge && visitCounterText) {
    visitBadge.style.display = 'inline-flex';
    visitCounterText.textContent = `Mansha's Visit #${visitCount} ✨`;
  }

  if (repeatWatchBanner && repeatWatchText) {
    repeatWatchBanner.style.display = 'flex';
    repeatWatchText.innerHTML = `Mansha, you've watched this <strong>${visitCount} times</strong>! Each visit sends extra healing energy & love from Arsalan!`;
  }

  // Auto-trigger the special VIP surprise modal once per session
  const modalShownSession = sessionStorage.getItem('mansha_repeat_modal_shown');
  if (!modalShownSession && repeatModal) {
    setTimeout(() => {
      if (repeatModalCount) {
        repeatModalCount.textContent = `${visitCount} times`;
      }
      repeatModal.classList.add('active');
      sessionStorage.setItem('mansha_repeat_modal_shown', 'true');
      triggerConfetti();
    }, 1200);
  }

  function closeRepeatModal() {
    if (repeatModal) {
      repeatModal.classList.remove('active');
    }
  }

  if (repeatModalClose) repeatModalClose.addEventListener('click', closeRepeatModal);
  if (repeatModal) {
    repeatModal.addEventListener('click', (e) => {
      if (e.target === repeatModal) {
        closeRepeatModal();
      }
    });
  }
  if (repeatModalBtn) {
    repeatModalBtn.addEventListener('click', () => {
      closeRepeatModal();
      showToast("💖 Arsalan: 'You are so welcome Mansha! Keep smiling!'", "💌");
      triggerConfetti();
    });
  }

  // 12. BEHIND THE SCENES: DUAL-LENS SWITCHER & 3D HOLOGRAPHIC SEAL CONTROLLER
  window.switchLens = function(lens) {
    const tabSoul = document.getElementById('tab-soul');
    const tabCode = document.getElementById('tab-code');
    const viewSoul = document.getElementById('view-soul');
    const viewCode = document.getElementById('view-code');

    if (lens === 'soul') {
      if (tabSoul) tabSoul.classList.add('active');
      if (tabCode) tabCode.classList.remove('active');
      if (viewSoul) viewSoul.classList.add('active');
      if (viewCode) viewCode.classList.remove('active');
    } else {
      if (tabCode) tabCode.classList.add('active');
      if (tabSoul) tabSoul.classList.remove('active');
      if (viewCode) viewCode.classList.add('active');
      if (viewSoul) viewSoul.classList.remove('active');
    }
  };

  // 3D Hologram Seal Card Flip
  const holoCard = document.getElementById('holo-seal-card');
  const holoInner = document.getElementById('holo-card-inner');

  if (holoCard && holoInner) {
    holoCard.addEventListener('click', (e) => {
      // Don't flip back immediately if clicking the button
      if (e.target.closest('#smile-back-btn')) return;
      holoInner.classList.toggle('is-flipped');
    });

    // 3D Parallax Tilt on Mouse Move (Desktop, RAF Throttled)
    let holoTicking = false;
    let lastHoloE = null;

    holoCard.addEventListener('mousemove', (e) => {
      lastHoloE = e;
      if (!holoTicking) {
        requestAnimationFrame(() => {
          if (lastHoloE) {
            const rect = holoCard.getBoundingClientRect();
            const x = lastHoloE.clientX - rect.left - rect.width / 2;
            const y = lastHoloE.clientY - rect.top - rect.height / 2;
            const isFlipped = holoInner.classList.contains('is-flipped');
            const flipY = isFlipped ? 180 : 0;
            holoInner.style.transform = `rotateY(${flipY + x * 0.08}deg) rotateX(${-y * 0.08}deg)`;
          }
          holoTicking = false;
        });
        holoTicking = true;
      }
    }, { passive: true });

    holoCard.addEventListener('mouseleave', () => {
      const isFlipped = holoInner.classList.contains('is-flipped');
      holoInner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    });
  }

  // Smile Back Confetti Button inside Seal
  window.sendSmileBack = function(e) {
    e.stopPropagation();
    showToast("💖 Mansha's smile sent to Arsalan! Warm hug received!", "🌸");
    triggerConfetti();
  };

  // Interactive Comfort Pills & Floating Comfort Orbs Handler
  window.handleComfortPill = function(type) {
    if (type === 'lemon') {
      const rxSec = document.getElementById('prescription');
      if (rxSec) rxSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast("Steaming Hot Honey Lemon with ginger brewed for Mansha! Soothes the throat instantly!", "🍵");
      triggerConfetti();
    } else if (type === 'glow') {
      const radSec = document.getElementById('radiance-note');
      if (radSec) radSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast("Gentle reminder: Mansha, your beauty & radiant smile are eternal. Pimples fade in days!", "🌸");
      triggerConfetti();
    } else if (type === 'hug') {
      showToast("Sending Mansha the biggest, warmest, coziest hug from Arsalan! Turn tears into smiles!", "🧸");
      triggerConfetti();
      const heroCard = document.querySelector('.hero-glass-card');
      if (heroCard) {
        heroCard.style.transform = 'scale(1.025)';
        heroCard.style.boxShadow = '0 32px 85px rgba(255, 77, 109, 0.45), 0 0 35px rgba(255, 183, 3, 0.4)';
        setTimeout(() => {
          heroCard.style.transform = '';
          heroCard.style.boxShadow = '';
        }, 600);
      }
    } else if (type === 'rx') {
      const rxSec = document.getElementById('prescription');
      if (rxSec) rxSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast("Dr. Arsalan's Comfort Rx: Hot lemon tea, warm soup, chamomile & zero worries!", "📖");
      triggerConfetti();
    }
  };

  document.querySelectorAll('.comfort-pill-chip, .hero-float-orb').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const comfort = el.getAttribute('data-comfort');
      if (comfort && window.handleComfortPill) {
        window.handleComfortPill(comfort);
      }
    });
  });

  // 3D Parallax Tilt & Specular Glare on Hero Glass Card (Desktop, RAF Throttled)
  const heroCardElement = document.querySelector('.hero-glass-card');
  if (heroCardElement && window.matchMedia('(pointer: fine)').matches) {
    let heroTicking = false;
    let lastHeroE = null;

    heroCardElement.addEventListener('mousemove', (e) => {
      lastHeroE = e;
      if (!heroTicking) {
        requestAnimationFrame(() => {
          if (lastHeroE) {
            const rect = heroCardElement.getBoundingClientRect();
            const x = lastHeroE.clientX - rect.left;
            const y = lastHeroE.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -3.5;
            const rotateY = ((x - centerX) / centerX) * 3.5;
            
            heroCardElement.style.setProperty('--card-mouse-x', `${(x / rect.width) * 100}%`);
            heroCardElement.style.setProperty('--card-mouse-y', `${(y / rect.height) * 100}%`);
            heroCardElement.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, -4px, 0)`;
          }
          heroTicking = false;
        });
        heroTicking = true;
      }
    }, { passive: true });

    heroCardElement.addEventListener('mouseleave', () => {
      heroCardElement.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
    });
  }

  // Hero Alchemy Pill Smooth Scroll & Highlight
  const alchemyTrigger = document.getElementById('alchemy-pill-trigger');
  if (alchemyTrigger) {
    alchemyTrigger.addEventListener('click', () => {
      const btsSec = document.getElementById('behind-the-scenes');
      if (btsSec) {
        btsSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast("✨ Welcome to Behind The Scenes by Arsalan!", "⚡");
      }
    });
  }

  // Dismiss Mobile PC Reminder Note
  window.dismissMobileNotice = function() {
    const pcNotice = document.getElementById('mobile-pc-notice');
    if (pcNotice) {
      pcNotice.style.setProperty('display', 'none', 'important');
      showToast("Enjoy Mansha's healing sanctuary on mobile! 🌸", "📱");
    }
  };

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
});
