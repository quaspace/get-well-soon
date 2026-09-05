/* ==========================================================================
   MANSHA GET WELL SOON - JAVASCRIPT CONTROLLER
   Features: Parallax Scroll Motion, Dynamic Canvas Particle Field, Interactive
   Rx Checklist, Virtual Hug Burst, Audio Synthesizer, & Wish Note Board
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. SCROLL MOTION & PARALLAX HEALTH ICONS CONTROLLER
  const parallaxIcons = document.querySelectorAll('.parallax-icon');
  let lastScrollY = window.scrollY;

  function updateParallax() {
    const scrollY = window.scrollY;

    parallaxIcons.forEach((icon) => {
      const speed = parseFloat(icon.getAttribute('data-speed')) || 0.2;
      const translateY = scrollY * speed;
      const rotate = (scrollY * speed * 0.15) % 360;
      
      icon.style.transform = `translate3d(0, ${translateY}px, 0) rotate(${rotate}deg)`;
    });

    lastScrollY = scrollY;
    requestAnimationFrame(updateParallax);
  }
  
  // Start parallax loop
  requestAnimationFrame(updateParallax);

  // 2. DYNAMIC HEALTH CANVAS BACKGROUND PARTICLES
  const canvas = document.getElementById('health-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  class HealthParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * (canvas ? canvas.width : 1000);
      this.y = Math.random() * (canvas ? canvas.height : 1000);
      this.size = Math.random() * 14 + 10;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.speedY = (Math.random() - 0.5) * 0.8;
      this.type = Math.floor(Math.random() * 4); // 0: Cross, 1: Heart, 2: Pill, 3: Sparkle
      this.opacity = Math.random() * 0.4 + 0.15;
      this.angle = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Scroll speed influence
      this.y -= (window.scrollY - lastScrollY) * 0.15;

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
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 3;
          this.y -= (dy / dist) * force * 3;
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
        ctx.roundRect(-this.size / 2, -this.size / 4, this.size, this.size / 2, 8);
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
    const count = Math.floor(window.innerWidth / 30);
    for (let i = 0; i < count; i++) {
      particles.push(new HealthParticle());
    }
  }

  function animateCanvas() {
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
    }
    requestAnimationFrame(animateCanvas);
  }

  resizeCanvas();
  animateCanvas();

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
      soundBtn.querySelector('.sound-icon').textContent = '🔊';
      soundBtn.querySelector('.sound-text').textContent = 'Playing Calm Ambient';
    } else {
      stopAmbientSynth();
      isPlayingSound = false;
      soundBtn.classList.remove('playing');
      soundBtn.querySelector('.sound-icon').textContent = '🎵';
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
      showToast("🎉 Yay Mansha! All doctor orders completed! 100% Healing Energy Activated! ✨");
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

  // 6. REMEDY PICKER HANDLER
  window.triggerRemedy = function(remedyType) {
    if (remedyType === 'tea') {
      showToast("🍵 Warm Chamomile Tea served with extra honey for Mansha!");
      triggerConfetti(['🍵', '🐝', '🍋', '✨']);
    } else if (remedyType === 'flowers') {
      showToast("💐 A fresh bouquet of blooming roses & peonies delivered!");
      triggerConfetti(['🌸', '🌹', '🌺', '🌷']);
    } else if (remedyType === 'teddy') {
      showToast("🧸 Cozy plushie comfort dispatched for Mansha!");
      triggerConfetti(['🧸', '✨', '🌟']);
    } else if (remedyType === 'sun') {
      showToast("☀️ Warm golden rays beaming down on Mansha!");
      triggerConfetti(['☀️', '✨', '💛']);
    }
  };

  // 7. MINI BOOSTER GAME HANDLER
  const startGameBtn = document.getElementById('start-game-btn');
  const gameOverlay = document.getElementById('game-start-overlay');
  const gameArea = document.getElementById('game-canvas-area');
  const gameScoreElem = document.getElementById('game-score');
  const energyBar = document.getElementById('energy-bar');
  const energyCounter = document.getElementById('energy-counter');
  
  let score = 0;
  let gameInterval = null;

  if (startGameBtn) {
    startGameBtn.addEventListener('click', startGame);
  }

  function startGame() {
    if (gameOverlay) gameOverlay.style.display = 'none';
    score = 0;
    updateScore(0);
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(spawnTarget, 800);
  }

  function spawnTarget() {
    if (!gameArea) return;

    const target = document.createElement('div');
    target.className = 'game-target';
    
    const items = ['💊', '🍋', '💖', '🌸', '🍵', '☀️', '🩹'];
    target.textContent = items[Math.floor(Math.random() * items.length)];

    const randomX = Math.random() * (gameArea.clientWidth - 50);
    target.style.left = `${randomX}px`;

    target.addEventListener('click', () => {
      score += 10;
      updateScore(score);
      
      // Floating score indicator
      const pop = document.createElement('div');
      pop.textContent = '+10 Boost!';
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

    if (currentEnergy === 100 && newScore >= 120) {
      clearInterval(gameInterval);
      showToast("🏆 Mansha's Health Meter is FULL 100%! You are amazing!");
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

  function updateWishEmptyState() {
    const noWishesMsg = document.getElementById('no-wishes-msg');
    const cards = wishesContainer ? wishesContainer.querySelectorAll('.wish-card') : [];
    if (noWishesMsg) {
      noWishesMsg.style.display = cards.length === 0 ? 'block' : 'none';
    }
  }

  function addWishCard(wish, index = null) {
    if (!wishesContainer) return;
    const card = document.createElement('div');
    const colorClasses = ['color-1', 'color-2', 'color-3'];
    const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];

    card.className = `wish-card glass-panel ${randomColor}`;
    card.innerHTML = `
      <div class="wish-card-header">
        <span class="wish-sender">From ${escapeHtml(wish.sender)}</span>
        <div class="wish-header-actions">
          <span class="wish-emoji">${wish.emoji}</span>
          <button class="delete-wish-btn" title="Remove Note">&times;</button>
        </div>
      </div>
      <p class="wish-text">"${escapeHtml(wish.message)}"</p>
      <span class="wish-date">${wish.date}</span>
    `;

    const deleteBtn = card.querySelector('.delete-wish-btn');
    deleteBtn.addEventListener('click', () => {
      card.remove();
      deleteWishFromStorage(wish);
      updateWishEmptyState();
      showToast("Note removed from board");
    });

    const noWishesMsg = document.getElementById('no-wishes-msg');
    if (noWishesMsg && noWishesMsg.parentNode === wishesContainer) {
      wishesContainer.insertBefore(card, noWishesMsg);
    } else {
      wishesContainer.prepend(card);
    }

    updateWishEmptyState();
  }

  function saveWishToStorage(wish) {
    const saved = JSON.parse(localStorage.getItem('mansha_wishes') || '[]');
    saved.unshift(wish);
    localStorage.setItem('mansha_wishes', JSON.stringify(saved));
  }

  function deleteWishFromStorage(wishToDelete) {
    let saved = JSON.parse(localStorage.getItem('mansha_wishes') || '[]');
    saved = saved.filter(w => !(w.sender === wishToDelete.sender && w.message === wishToDelete.message));
    localStorage.setItem('mansha_wishes', JSON.stringify(saved));
  }

  function loadSavedWishes() {
    const saved = JSON.parse(localStorage.getItem('mansha_wishes') || '[]');
    saved.forEach((wish, idx) => addWishCard(wish, idx));
    updateWishEmptyState();
  }

  loadSavedWishes();

  // UTILITIES: CONFETTI & TOAST
  function triggerConfetti(emojis = ['✨', '🌸', '🍵', '🩹', '⭐', '🍋']) {
    for (let i = 0; i < 30; i++) {
      const conf = document.createElement('div');
      conf.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      conf.style.position = 'fixed';
      conf.style.left = `${Math.random() * 100}vw`;
      conf.style.top = '-20px';
      conf.style.fontSize = `${Math.random() * 1.5 + 1.2}rem`;
      conf.style.zIndex = '3000';
      conf.style.pointerEvents = 'none';
      conf.style.transition = `all ${Math.random() * 2 + 2}s cubic-bezier(0.25, 1, 0.5, 1)`;

      document.body.appendChild(conf);

      setTimeout(() => {
        conf.style.transform = `translateY(105vh) rotate(${Math.random() * 720 - 360}deg)`;
        conf.style.opacity = '0';
      }, 50);

      setTimeout(() => conf.remove(), 4000);
    }
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(50px)';
    toast.style.background = '#2b2d42';
    toast.style.color = '#ffffff';
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
      if (targetDateDisplay) targetDateDisplay.textContent = "100% Fully Recovered! 🎉";
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
          showToast("📅 Recovery Target Date updated!");
        } else {
          alert("Invalid date format. Please use YYYY-MM-DD.");
        }
      }
    });
  }

  // 10. MOBILE BOTTOM DOCK SCROLL OBSERVER
  const dockItems = document.querySelectorAll('.dock-item');
  const pageSections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    let currentSectionId = 'hero';
    const scrollPos = window.scrollY + 220;

    pageSections.forEach((sec) => {
      if (scrollPos >= sec.offsetTop) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    dockItems.forEach((item) => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${currentSectionId}`) {
        item.classList.add('active');
      }
    });
  });

  // 11. INTERACTIVE VECTOR TEACUP STEAM PHYSICS CONTROLLER
  const stirVectorTeaBtn = document.getElementById('stir-vector-tea-btn');
  const svgTeacupInteractive = document.getElementById('svg-teacup-interactive');

  function stirTeacupPhysics() {
    if (svgTeacupInteractive) {
      svgTeacupInteractive.classList.add('steaming-boost');
      showToast("🍵 Warm Chamomile Tea stirred! Teacup steam physics velocity boosted! ✨");
      triggerConfetti(['🍵', '✨', '💨', '💖', '🌸']);
      setTimeout(() => {
        svgTeacupInteractive.classList.remove('steaming-boost');
      }, 4500);
    }
  }

  if (stirVectorTeaBtn) {
    stirVectorTeaBtn.addEventListener('click', stirTeacupPhysics);
  }
  if (svgTeacupInteractive) {
    svgTeacupInteractive.addEventListener('click', stirTeacupPhysics);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
});
