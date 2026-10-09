(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themeButton = document.querySelector('.theme-toggle');
  function updateThemeLabel() { const dark = root.dataset.theme === 'dark'; themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`); document.querySelector('meta[name="theme-color"]').content = dark ? '#101310' : '#fafbf7'; }
  updateThemeLabel();
  themeButton.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('alpha-theme', root.dataset.theme); } catch (_) { /* Storage may be unavailable. */ }
    updateThemeLabel();
  });
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-nav');
  function closeMenu() { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  const showcase = document.querySelector('.app-showcase');
  const modeButtons = [...document.querySelectorAll('.mode-switch button')];
  modeButtons.forEach(button => button.addEventListener('click', () => {
    const isDriver = button.dataset.mode === 'driver';
    showcase.dataset.mode = button.dataset.mode;
    modeButtons.forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    document.querySelector('.phone-app-name').textContent = isDriver ? 'alpha plus' : 'alpha ride';
    document.querySelector('.passenger-content').hidden = isDriver;
    document.querySelector('.driver-content').hidden = !isDriver;
    document.querySelector('.tag-title').textContent = isDriver ? 'Your next opportunity.' : 'Your ride, sorted.';
  }));
  const rides = {
    standard: { category: 'THE EVERYDAY ONE', title: 'Comfort comes\nstandard.', description: 'Room to settle in. A car for your commute, your plans, and everything in between.', capacity: 'Up to 4 passengers', image: 'assets/car-real.png', alt: 'Silver sedan, front three-quarter view', word: 'STANDARD' },
    boda: { category: 'THE QUICK HOP', title: 'Small ride.\nBig possibilities.', description: 'For solo trips and quick moves across the city. Find your next Boda ride in Alpha.', capacity: 'Solo passenger', image: 'assets/boda.svg', alt: 'Illustration of an Alpha Boda motorcycle', word: 'BODA' },
    rickshaw: { category: 'A DIFFERENT WAY TO MOVE', title: 'Make room\nfor your plans.', description: 'An easygoing three-wheeler option for your everyday city journeys.', capacity: 'Three-wheeler', image: 'assets/rickshaw.svg', alt: 'Illustration of an Alpha Rickshaw', word: 'RICKSHAW' }
  };
  const tabs = [...document.querySelectorAll('[data-ride]')];
  function selectRide(tab) {
    const ride = rides[tab.dataset.ride];
    tabs.forEach(t => { const selected = t === tab; t.setAttribute('aria-selected', String(selected)); t.tabIndex = selected ? 0 : -1; });
    document.querySelector('#ride-panel').setAttribute('aria-labelledby', tab.id);
    document.querySelector('.ride-category').textContent = ride.category;
    const title = document.querySelector('#ride-title');
    title.replaceChildren(...ride.title.split('\n').flatMap((line, i) => i ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)]));
    document.querySelector('#ride-description').textContent = ride.description;
    document.querySelector('#ride-capacity').textContent = ride.capacity;
    const image = document.querySelector('#vehicle-image'); image.src = ride.image; image.alt = ride.alt;
    document.querySelector('.vehicle-word').textContent = ride.word;
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectRide(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (event.key === 'ArrowLeft') next = tabs[(i + tabs.length - 1) % tabs.length];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs[tabs.length - 1];
      if (next) { event.preventDefault(); selectRide(next); next.focus(); }
    });
  });
  // Progressive enhancement: content stays readable if scripts or observers fail.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    root.classList.add('js');
  }
  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.showcase-stage');
  const aura = document.querySelector('.cursor-aura');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0, x = 0, y = 0, trailX = 0, trailY = 0;
  function followPointer() {
    trailX += (x - trailX) * .16;
    trailY += (y - trailY) * .16;
    aura.style.transform = `translate3d(${trailX}px,${trailY}px,0)`;
    if (Math.abs(x - trailX) + Math.abs(y - trailY) > .2) frame = requestAnimationFrame(followPointer);
    else frame = 0;
  }
  function resetPointer() {
    root.classList.remove('pointer-active', 'pointer-link');
    stage.style.removeProperty('transform');
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }
  document.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
    x = event.clientX; y = event.clientY;
    if (!root.classList.contains('pointer-active')) { trailX = x; trailY = y; }
    root.classList.add('pointer-active');
    root.classList.toggle('pointer-link', !!event.target.closest('a,button,summary'));
    if (!frame) frame = requestAnimationFrame(followPointer);
    const card = event.target.closest('.feature, .ride-panel');
    if (card) { const box = card.getBoundingClientRect(); card.style.setProperty('--px', `${x - box.left}px`); card.style.setProperty('--py', `${y - box.top}px`); }
  }, { passive: true });
  hero.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
    const box = hero.getBoundingClientRect();
    const dx = (event.clientX - box.left) / box.width - .5;
    const dy = (event.clientY - box.top) / box.height - .5;
    hero.style.setProperty('--gx', `${dx * 70}px`);
    hero.style.setProperty('--gy', `${dy * 70}px`);
    stage.style.transform = `rotateX(${-dy * 5}deg) rotateY(${dx * 7}deg) translate3d(${dx * 12}px,${dy * 8}px,0)`;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => stage.style.removeProperty('transform'));
  document.documentElement.addEventListener('pointerleave', resetPointer);
  window.addEventListener('blur', resetPointer);
  reducedMotion.addEventListener('change', resetPointer);
  finePointer.addEventListener('change', resetPointer);
  const dialog = document.querySelector('#download-dialog');
  function showAvailability(title, message) {
    document.querySelector('#dialog-title').textContent = title;
    document.querySelector('#dialog-message').textContent = message;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else window.alert(message);
  }
  document.querySelectorAll('[data-call-soon]').forEach(button => button.addEventListener('click', () => {
    showAvailability('Coming soon', 'Phone booking and phone support are coming soon. This service is not available yet. We’ll share the contact details here when it launches.');
  }));
  document.querySelectorAll('[data-download]').forEach(button => button.addEventListener('click', () => {
    const app = button.dataset.download;
    const url = window.ALPHA_CONFIG?.[app]?.[button.dataset.store];
    // Only navigate to configured official store destinations.
    if (url) {
      try {
        const destination = new URL(url);
        if (destination.protocol === 'https:' && ['play.google.com', 'apps.apple.com'].includes(destination.hostname)) { window.location.assign(destination.href); return; }
      } catch (_) { /* Invalid config uses the availability message below. */ }
    }
    const name = app === 'driver' ? 'Alpha Plus' : 'Alpha Ride';
    showAvailability(name, `The ${button.dataset.store === 'ios' ? 'App Store' : 'Google Play'} download link for ${name} will be added when the app is released. Phone booking and phone support are also coming soon.`);
  }));
  document.querySelectorAll('.dialog-close, [data-dialog-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', e => { if (e.target === dialog) { const b = dialog.getBoundingClientRect(); if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) dialog.close(); } });
  document.querySelector('#year').textContent = String(new Date().getFullYear());
})();
