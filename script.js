(() => {
  // Boot screen and fade-in only switch on once this script runs,
  // so the page stays readable if the script fails to load.
  document.documentElement.classList.add('js-ready');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Boot screen (once per session) ---------- */
  const boot = document.getElementById('boot');
  let seen = false;
  try { seen = sessionStorage.getItem('booted') === '1'; } catch (e) {}

  const finishBoot = () => {
    boot.classList.add('done');
    try { sessionStorage.setItem('booted', '1'); } catch (e) {}
  };

  if (seen || reduce) {
    boot.remove();
  } else {
    const lines = [...document.querySelectorAll('#bootLog li')];
    const count = document.getElementById('bootCount');
    const bar = document.getElementById('bootBar');
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const v = Math.round(p * 100);
      count.textContent = v;
      bar.style.width = v + '%';
      lines.forEach((li, i) => li.classList.toggle('on', p > i / lines.length));
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(finishBoot, 250);
    };
    requestAnimationFrame(tick);
    boot.addEventListener('click', finishBoot);
  }

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const isDark = () =>
    root.dataset.theme ? root.dataset.theme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Project filters ---------- */
  const chips = document.querySelectorAll('.chip');
  const cards = document.querySelectorAll('.card');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => { c.classList.toggle('active', c === chip); c.setAttribute('aria-selected', c === chip); });
    const f = chip.dataset.filter;
    cards.forEach((card) => card.classList.toggle('hidden', f !== 'all' && card.dataset.cat !== f));
  }));

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach((el) => {
      // Anything already on screen at load shows right away.
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      else revealIO.observe(el);
    });
  }

  /* ---------- Dock active section + HUD ---------- */
  const dockLinks = document.querySelectorAll('.dock a');
  const hudModule = document.getElementById('hudModule');
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      dockLinks.forEach((a) => a.classList.toggle('active', a.dataset.sec === id));
      hudModule.textContent = e.target.dataset.index + '/06';
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('.module').forEach((s) => sectionIO.observe(s));

  /* ---------- Bangkok clock ---------- */
  const clock = document.getElementById('hudClock');
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  const updateClock = () => { clock.textContent = fmt.format(new Date()) + ' ICT'; };
  updateClock();
  setInterval(updateClock, 30000);
})();
