/* ==========================================================================
   MANSHA'S CARE SPACE - HANDCRAFTED MOBILE APP CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 0. SEGMENTED TAB SWITCHER
  const segTabs = document.querySelectorAll('.seg-tab');
  const tabViews = document.querySelectorAll('.tab-view');

  segTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      segTabs.forEach(t => t.classList.remove('active'));
      tabViews.forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      const targetView = document.getElementById(targetId);
      if (targetView) {
        targetView.classList.add('active');
      }
    });
  });

  // 1. AUDIO SYNTHESIZER
  const soundBtn = document.getElementById('sound-toggle-btn');
  let audioCtx = null;
  let isPlayingSound = false;
  let synthNodes = [];

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (!isPlayingSound) {
        audioCtx.resume();
        startSynth();
        isPlayingSound = true;
        soundBtn.querySelector('.audio-icon').textContent = '🔊';
        soundBtn.querySelector('.audio-label').textContent = 'Playing Ambient';
      } else {
        stopSynth();
        isPlayingSound = false;
        soundBtn.querySelector('.audio-icon').textContent = '🎵';
        soundBtn.querySelector('.audio-label').textContent = 'Ambient Sound';
      }
    });
  }

  function startSynth() {
    const freqs = [261.63, 329.63, 392.00];
    synthNodes = freqs.map((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.03, audioCtx.currentTime + 2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      return { osc, gain };
    });
  }

  function stopSynth() {
    synthNodes.forEach(({ osc, gain }) => {
      if (gain) gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      setTimeout(() => osc.stop(), 500);
    });
    synthNodes = [];
  }

  // 2. CHECKLIST PROGRESS
  const rxChecklist = document.getElementById('rx-checklist');
  const rxProgressBar = document.getElementById('rx-progress-bar');
  const rxStatusText = document.getElementById('rx-status-text');

  if (rxChecklist) {
    rxChecklist.addEventListener('change', () => {
      const checkboxes = rxChecklist.querySelectorAll('input[type="checkbox"]');
      let checkedCount = 0;
      checkboxes.forEach(cb => { if (cb.checked) checkedCount++; });

      const percent = Math.round((checkedCount / checkboxes.length) * 100);
      if (rxProgressBar) rxProgressBar.style.width = `${percent}%`;
      if (rxStatusText) rxStatusText.textContent = `${checkedCount} of ${checkboxes.length} done`;

      if (checkedCount === checkboxes.length) {
        showToast("🎉 All goals completed! Healing Energy 100% ✨");
        triggerConfetti();
      }
    });
  }

  // 3. MODAL CONTROLLER
  const hugMainBtn = document.getElementById('hug-main-btn');
  const hugModal = document.getElementById('hug-modal');
  const modalClose = document.getElementById('modal-close');

  function openModal() {
    if (hugModal) {
      hugModal.classList.add('active');
      triggerConfetti();
    }
  }

  window.closeModal = function() {
    if (hugModal) hugModal.classList.remove('active');
  };

  if (hugMainBtn) hugMainBtn.addEventListener('click', openModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);

  // 4. REMEDY PICKER
  window.triggerRemedy = function(type) {
    if (type === 'tea') {
      showToast("☕ Fresh Chamomile Tea served for Mansha!");
    } else if (type === 'flowers') {
      showToast("🌸 Fresh Peonies Bouquet delivered!");
    } else if (type === 'teddy') {
      showToast("🧸 Cozy Plushie Comfort dispatched!");
    } else if (type === 'sun') {
      showToast("☀️ Warm Sunshine Rays beaming down!");
    }
    triggerConfetti();
  };

  // 5. MINI BOOSTER GAME
  const startGameBtn = document.getElementById('start-game-btn');
  const gameOverlay = document.getElementById('game-start-overlay');
  const gameArea = document.getElementById('game-canvas-area');
  const gameScoreElem = document.getElementById('game-score');
  
  let score = 0;
  let gameInterval = null;

  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      if (gameOverlay) gameOverlay.style.display = 'none';
      score = 0;
      if (gameScoreElem) gameScoreElem.textContent = '0';
      if (gameInterval) clearInterval(gameInterval);
      gameInterval = setInterval(spawnTarget, 900);
    });
  }

  function spawnTarget() {
    if (!gameArea) return;
    const target = document.createElement('div');
    target.className = 'game-target';
    const items = ['💊', '🍋', '💖', '🌸', '🍵', '☀️'];
    target.textContent = items[Math.floor(Math.random() * items.length)];

    const randomX = Math.random() * (gameArea.clientWidth - 40);
    target.style.left = `${randomX}px`;

    target.addEventListener('click', () => {
      score += 10;
      if (gameScoreElem) gameScoreElem.textContent = score;
      target.remove();
    });

    gameArea.appendChild(target);
    setTimeout(() => { if (target.parentNode) target.remove(); }, 3200);
  }

  // 6. COUNTDOWN TIMER
  const timerDays = document.getElementById('timer-days');
  const timerHours = document.getElementById('timer-hours');
  const timerMinutes = document.getElementById('timer-minutes');
  const timerSeconds = document.getElementById('timer-seconds');
  const targetDateDisplay = document.getElementById('target-date-display');
  const customizeTimerBtn = document.getElementById('customize-timer-btn');

  let targetDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const savedTarget = localStorage.getItem('mansha_target_date');
  if (savedTarget) targetDate = new Date(savedTarget);

  function updateTimer() {
    const diff = targetDate - new Date();

    if (targetDateDisplay) {
      targetDateDisplay.textContent = targetDate.toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric'
      });
    }

    if (diff <= 0) {
      if (timerDays) timerDays.textContent = '00';
      if (timerHours) timerHours.textContent = '00';
      if (timerMinutes) timerMinutes.textContent = '00';
      if (timerSeconds) timerSeconds.textContent = '00';
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

  setInterval(updateTimer, 1000);
  updateTimer();

  if (customizeTimerBtn) {
    customizeTimerBtn.addEventListener('click', () => {
      const input = prompt("Enter target date (YYYY-MM-DD):", targetDate.toISOString().split('T')[0]);
      if (input) {
        const newDate = new Date(input + "T00:00:00");
        if (!isNaN(newDate.getTime())) {
          targetDate = newDate;
          localStorage.setItem('mansha_target_date', newDate.toISOString());
          updateTimer();
          showToast("📅 Target date updated!");
        }
      }
    });
  }

  // 7. WISHES FORM & LOCALSTORAGE
  const wishForm = document.getElementById('wish-form');
  const wishesContainer = document.getElementById('wishes-container');

  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sender = document.getElementById('sender-name').value.trim();
      const emoji = document.getElementById('wish-emoji').value;
      const message = document.getElementById('wish-message').value.trim();

      if (!sender || !message) return;

      const newWish = { sender, emoji, message, date: 'Today' };
      addWishCard(newWish);
      saveWish(newWish);

      wishForm.reset();
      showToast("💌 Note pinned to board!");
      triggerConfetti();
    });
  }

  function addWishCard(wish) {
    if (!wishesContainer) return;
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.innerHTML = `
      <div class="wish-card-header">
        <span class="wish-sender">From ${escapeHtml(wish.sender)}</span>
        <div class="wish-header-actions">
          <span>${wish.emoji}</span>
          <button class="delete-wish-btn" title="Delete">&times;</button>
        </div>
      </div>
      <p class="wish-text">"${escapeHtml(wish.message)}"</p>
      <span class="wish-date">${wish.date}</span>
    `;

    card.querySelector('.delete-wish-btn').addEventListener('click', () => {
      card.remove();
      deleteWish(wish);
      toggleEmptyState();
    });

    const emptyBox = document.getElementById('no-wishes-msg');
    if (emptyBox && emptyBox.parentNode === wishesContainer) {
      wishesContainer.insertBefore(card, emptyBox);
    } else {
      wishesContainer.prepend(card);
    }

    toggleEmptyState();
  }

  function saveWish(w) {
    const saved = JSON.parse(localStorage.getItem('mansha_wishes') || '[]');
    saved.unshift(w);
    localStorage.setItem('mansha_wishes', JSON.stringify(saved));
  }

  function deleteWish(w) {
    let saved = JSON.parse(localStorage.getItem('mansha_wishes') || '[]');
    saved = saved.filter(item => !(item.sender === w.sender && item.message === w.message));
    localStorage.setItem('mansha_wishes', JSON.stringify(saved));
  }

  function toggleEmptyState() {
    const emptyBox = document.getElementById('no-wishes-msg');
    const cards = wishesContainer ? wishesContainer.querySelectorAll('.wish-card') : [];
    if (emptyBox) emptyBox.style.display = cards.length === 0 ? 'block' : 'none';
  }

  function loadWishes() {
    const saved = JSON.parse(localStorage.getItem('mansha_wishes') || '[]');
    saved.forEach(addWishCard);
    toggleEmptyState();
  }

  loadWishes();

  // TOAST & CONFETTI
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.position = 'fixed';
    toast.style.bottom = '75px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#1a1d20';
    toast.style.color = '#ffffff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '50px';
    toast.style.fontSize = '0.88rem';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '3000';
    toast.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)';

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }

  function triggerConfetti() {
    const emojis = ['🌸', '✨', '🍵', '☀️', '💖'];
    for (let i = 0; i < 16; i++) {
      const conf = document.createElement('div');
      conf.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      conf.style.position = 'fixed';
      conf.style.left = `${Math.random() * 100}vw`;
      conf.style.top = '-20px';
      conf.style.fontSize = '1.2rem';
      conf.style.zIndex = '3000';
      conf.style.pointerEvents = 'none';
      conf.style.transition = `all ${Math.random() * 1.5 + 1.5}s ease-out`;

      document.body.appendChild(conf);
      setTimeout(() => {
        conf.style.transform = `translateY(105vh) rotate(${Math.random() * 360}deg)`;
        conf.style.opacity = '0';
      }, 30);
      setTimeout(() => conf.remove(), 2800);
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
});
