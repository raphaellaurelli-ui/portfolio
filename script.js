/* ============================================================
   LAURELLI_PROD — Cinema & Color Grading Portfolio JS
   Shared by: index.html (FR) · en.html (EN) · es.html (ES)
   ============================================================ */

/* ── OPTICAL RETICLE (DESKTOP FINE POINTER) ── */
(() => {
  const reticle = document.getElementById('reticle');
  if (!reticle || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let mx = -100, my = -100, rx = -100, ry = -100, rafId = null;

  function renderReticle() {
    rx += (mx - rx) * 0.24;
    ry += (my - ry) * 0.24;
    reticle.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    if (Math.abs(mx - rx) > 0.2 || Math.abs(my - ry) > 0.2) {
      rafId = requestAnimationFrame(renderReticle);
    } else {
      rafId = null;
    }
  }

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    reticle.classList.add('visible');
    if (!rafId) rafId = requestAnimationFrame(renderReticle);
  });

  document.addEventListener('mouseleave', () => reticle.classList.remove('visible'));
  document.addEventListener('mousedown', () => reticle.classList.add('down'));
  document.addEventListener('mouseup', () => reticle.classList.remove('down'));

  const interactiveSelector = 'a, button, input, select, textarea, .compare-slider, .service-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) reticle.classList.add('hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) reticle.classList.remove('hover');
  });
})();

/* ── SCROLL PROGRESS, NAV STATE & HERO PARALLAX ── */
(() => {
  const nav = document.getElementById('siteNav');
  const bar = document.getElementById('scrollProgress');
  const heroVideo = document.querySelector('.hero-video');

  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    }
    if (heroVideo && y < window.innerHeight) {
      const scale = 1.04 + (y / window.innerHeight) * 0.08;
      heroVideo.style.transform = `scale(${scale.toFixed(3)})`;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── LIVE 24FPS TIMECODE TELEMETRY ── */
(() => {
  const tc = document.getElementById('heroTimecode');
  if (!tc) return;
  let frames = 0;
  setInterval(() => {
    frames++;
    const f = frames % 24;
    const totalSec = Math.floor(frames / 24);
    const s = totalSec % 60;
    const m = Math.floor(totalSec / 60) % 60;
    const pad = (n) => String(n).padStart(2, '0');
    tc.textContent = `01:${pad(m)}:${pad(s)}:${pad(f)}`;
  }, 1000 / 24);
})();

/* ── MOBILE DRAWER ── */
const mobileDrawer = document.getElementById('mobileDrawer');
function openDrawer() {
  if (!mobileDrawer) return;
  mobileDrawer.classList.add('open');
  mobileDrawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  if (!mobileDrawer) return;
  mobileDrawer.classList.remove('open');
  mobileDrawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
if (mobileDrawer) {
  mobileDrawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });
}

/* ── REVEAL ON SCROLL ── */
(() => {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  targets.forEach((el) => obs.observe(el));
})();

/* ── SMART VIEWPORT VIDEO PLAYBACK ── */
(() => {
  const videos = document.querySelectorAll('video[data-autoplay-visible]');
  if (!videos.length) return;
  const vidObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const vid = entry.target;
      if (entry.isIntersecting) {
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, { threshold: 0.12 });
  videos.forEach((v) => vidObs.observe(v));
})();

/* ── FRAME-SYNCED COMPARE SLIDERS ── */
function initSlider(card) {
  const slider = card.querySelector('.compare-slider');
  const after = card.querySelector('.layer-after');
  const divider = card.querySelector('.compare-divider');
  const presetBtns = card.querySelectorAll('.preset-btn');
  const videos = card.querySelectorAll('video');
  if (!slider || !after || !divider) return;

  let dragging = false;
  let currentPct = 50;

  function applyPct(pct) {
    currentPct = Math.max(0, Math.min(100, pct));
    after.style.width = currentPct + '%';
    divider.style.left = currentPct + '%';
    slider.setAttribute('aria-valuenow', Math.round(currentPct));
    presetBtns.forEach((btn) => {
      const target = Number(btn.dataset.pct);
      btn.classList.toggle('active', Math.abs(currentPct - target) < 2);
    });
  }

  function setPosFromClientX(clientX) {
    const rect = slider.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    applyPct(Math.max(2, Math.min(98, pct)));
  }

  slider.addEventListener('pointerdown', (e) => {
    dragging = true;
    slider.setPointerCapture(e.pointerId);
    setPosFromClientX(e.clientX);
  });
  slider.addEventListener('pointermove', (e) => {
    if (dragging) setPosFromClientX(e.clientX);
  });
  slider.addEventListener('pointerup', () => { dragging = false; });
  slider.addEventListener('pointercancel', () => { dragging = false; });

  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); applyPct(currentPct - 5); }
    if (e.key === 'ArrowRight') { e.preventDefault(); applyPct(currentPct + 5); }
  });

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => applyPct(Number(btn.dataset.pct)));
  });

  // Synchronize Before/After playback frames when both videos exist
  if (videos.length === 2) {
    const [vidA, vidB] = videos;
    const syncObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        vidA.play().catch(() => {});
        vidB.play().catch(() => {});
      } else {
        vidA.pause();
        vidB.pause();
      }
    }, { threshold: 0.15 });
    syncObs.observe(slider);

    vidA.addEventListener('timeupdate', () => {
      if (!vidB.paused && Math.abs(vidA.currentTime - vidB.currentTime) > 0.08) {
        try { vidB.currentTime = vidA.currentTime; } catch (_) {}
      }
    });
  }
}

document.querySelectorAll('.compare-card').forEach(initSlider);

/* ── GALLERY SOUND, FULLSCREEN & CINEMA LIGHTBOX ── */
const ICON_MUTED = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
const ICON_UNMUTED = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';

function toggleMute(videoId, btn) {
  const vid = document.getElementById(videoId);
  if (!vid) return;
  vid.muted = !vid.muted;
  btn.innerHTML = vid.muted ? ICON_MUTED : ICON_UNMUTED;
  btn.setAttribute('aria-pressed', String(!vid.muted));
}

function goFullscreen(videoId) {
  const vid = document.getElementById(videoId);
  if (!vid) return;
  if (vid.requestFullscreen) vid.requestFullscreen();
  else if (vid.webkitRequestFullscreen) vid.webkitRequestFullscreen();
}

const cinemaModal = document.getElementById('cinemaModal');
const cinemaVideo = document.getElementById('cinemaModalVideo');
const cinemaTitle = document.getElementById('cinemaModalTitle');

function openCinemaModal(src, title) {
  if (!cinemaModal || !cinemaVideo) return;
  if (cinemaTitle) cinemaTitle.textContent = title || '';
  cinemaVideo.src = src;
  cinemaModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  cinemaVideo.play().catch(() => {});
}

function closeCinemaModal() {
  if (!cinemaModal || !cinemaVideo) return;
  cinemaVideo.pause();
  cinemaVideo.removeAttribute('src');
  cinemaVideo.load();
  cinemaModal.classList.remove('open');
  document.body.style.overflow = '';
}

if (cinemaModal) {
  cinemaModal.addEventListener('click', (e) => {
    if (e.target === cinemaModal) closeCinemaModal();
  });
}

/* ── SERVICE CARD -> BOOKING PRE-SELECT ── */
document.querySelectorAll('.service-action[data-service-index]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const select = document.getElementById('f-service');
    const booking = document.getElementById('booking');
    const idx = Number(btn.dataset.serviceIndex);
    if (select && select.options[idx]) {
      select.selectedIndex = idx;
    }
    if (booking) {
      booking.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ── SUCCESS MODAL ── */
function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('open');
}

const modalEl = document.getElementById('modal');
if (modalEl) {
  modalEl.addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeCinemaModal();
    closeDrawer();
  }
});

/* ── FORMSPREE BOOKING SUBMIT ── */
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const status = document.getElementById('formStatus');
    const sendingLabel = btn.dataset.sending || 'Sending...';
    const sendLabel = btn.dataset.send || btn.querySelector('span').textContent;

    btn.disabled = true;
    btn.querySelector('span').textContent = sendingLabel;
    status.className = 'form-status';
    status.style.display = 'none';

    try {
      const data = new FormData(this);
      const res = await fetch('https://formspree.io/f/mvzjpkzq', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        this.reset();
        document.getElementById('modal').classList.add('open');
      } else {
        const json = await res.json();
        throw new Error(json.errors ? json.errors.map((err) => err.message).join(', ') : 'Error');
      }
    } catch (err) {
      const fallbackMsg = btn.dataset.fallback || 'raphael@laurelliprod.fr';
      status.className = 'form-status error';
      status.style.display = 'flex';
      status.innerHTML = `⚠ ${err.message} — <a href="mailto:raphael@laurelliprod.fr" style="color:inherit;text-decoration:underline;margin-left:4px">${fallbackMsg}</a>`;
    } finally {
      btn.disabled = false;
      btn.querySelector('span').textContent = sendLabel;
    }
  });
}
