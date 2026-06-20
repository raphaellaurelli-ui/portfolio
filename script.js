/* ============================================================
   LAURELLI_PROD — Shared JavaScript
   Utilisé par : index.html (FR) · en.html · es.html
   ============================================================ */

/* ── CURSOR GLOW ── */
document.addEventListener('mousemove', (e) => {
  const glow = document.getElementById('cursorGlow');
  if (glow) {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }
});

/* ── REVEAL ON SCROLL ── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── ANIMATED COUNTERS ── */
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = target / 40;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.round(current) + suffix;
        if (current >= target) clearInterval(timer);
      }, 35);
    });
    counterObs.unobserve(entry.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.about-stats').forEach(el => counterObs.observe(el));

/* ── COMPARE SLIDERS ── */
function initSlider(id) {
  const slider = document.getElementById(id);
  if (!slider) return;
  const after = document.getElementById(id + '-after');
  const divider = document.getElementById(id + '-div');
  let dragging = false;

  function setPos(x) {
    const rect = slider.getBoundingClientRect();
    let pct = Math.max(2, Math.min(98, ((x - rect.left) / rect.width) * 100));
    after.style.width = pct + '%';
    divider.style.left = pct + '%';
  }

  divider.addEventListener('mousedown', e => { dragging = true; e.preventDefault(); });
  slider.addEventListener('mousedown', e => { dragging = true; setPos(e.clientX); e.preventDefault(); });
  window.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });
  window.addEventListener('mouseup', () => { dragging = false; });
  divider.addEventListener('touchstart', e => { dragging = true; e.preventDefault(); }, { passive: false });
  slider.addEventListener('touchstart', e => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchmove', e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend', () => { dragging = false; });
}
['cs1','cs2','cs3','cs4','cs5','cs6'].forEach(initSlider);

/* ── SCROLL ANIMATIONS (service cards, equip, stats) ── */
const scrollObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .equip-category, .stat').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  scrollObs.observe(el);
});

/* ── VIDEO CONTROLS ── */
function toggleMute(videoId, btn) {
  const vid = document.getElementById(videoId);
  if (!vid) return;
  vid.muted = !vid.muted;
  btn.textContent = vid.muted ? '🔇' : '🔊';
}

function goFullscreen(videoId) {
  const vid = document.getElementById(videoId);
  if (!vid) return;
  if (vid.requestFullscreen) vid.requestFullscreen();
  else if (vid.webkitRequestFullscreen) vid.webkitRequestFullscreen();
  else if (vid.mozRequestFullScreen) vid.mozRequestFullScreen();
}

function lancerPleinEcran() {
  const video = document.getElementById("monClipMusical");
  if (!video) return;
  video.setAttribute("controls", "controls");
  video.play();
  if (video.requestFullscreen) video.requestFullscreen();
  else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
  else if (video.msRequestFullscreen) video.msRequestFullscreen();
}

document.addEventListener('fullscreenchange', stopperVideo);
document.addEventListener('webkitfullscreenchange', stopperVideo);

function stopperVideo() {
  if (!document.fullscreenElement && !document.webkitIsFullScreen) {
    const video = document.getElementById("monClipMusical");
    if (!video) return;
    video.pause();
    video.removeAttribute("controls");
  }
}

/* ── MODAL ── */
function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

const modalEl = document.getElementById('modal');
if (modalEl) {
  modalEl.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
}

/* ── FORMSPREE SUBMIT ── */
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const status = document.getElementById('formStatus');
    const sendingLabel = btn.dataset.sending || 'Sending...';
    const sendLabel    = btn.dataset.send    || btn.querySelector('span').textContent;

    btn.disabled = true;
    btn.querySelector('span').textContent = sendingLabel;
    status.className = 'form-status';
    status.style.display = 'none';

    try {
      const data = new FormData(this);
      const res = await fetch('https://formspree.io/f/xgvejqdw', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        this.reset();
        document.getElementById('modal').classList.add('open');
      } else {
        const json = await res.json();
        throw new Error(json.errors ? json.errors.map(e => e.message).join(', ') : 'Error');
      }
    } catch(err) {
      const fallbackMsg = btn.dataset.fallback || 'raphael.laurelli@gmail.com';
      status.className = 'form-status error';
      status.style.display = 'flex';
      status.innerHTML = `⚠ ${err.message} — <a href="mailto:raphael.laurelli@gmail.com" style="color:inherit;text-decoration:underline;margin-left:4px">${fallbackMsg}</a>`;
    } finally {
      btn.disabled = false;
      btn.querySelector('span').textContent = sendLabel;
    }
  });
}
