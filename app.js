(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themeButton = document.querySelector('.theme-toggle');
  function updateThemeLabel() { themeButton.setAttribute('aria-label', `Switch to ${root.dataset.theme === 'dark' ? 'light' : 'dark'} theme`); }
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
    standard: { category: 'THE EVERYDAY ONE', title: 'Comfort comes\nstandard.', description: 'Room to settle in. A car for your commute, your plans, and everything in between.', capacity: 'Up to 4 passengers', image: 'assets/car.svg', alt: 'Illustration of an Alpha Standard car', word: 'STANDARD' },
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
  let pointerFrame;
  hero.addEventListener('pointermove', e => {
    if (reducedMotion.matches || e.pointerType !== 'mouse') return;
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      const box = hero.getBoundingClientRect();
      hero.style.setProperty('--gx', `${(e.clientX - box.left - box.width / 2) * .025}px`);
      hero.style.setProperty('--gy', `${(e.clientY - box.top - box.height / 2) * .025}px`);
    });
  });
  const dialog = document.querySelector('#download-dialog');
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
    document.querySelector('#dialog-title').textContent = name;
    document.querySelector('#dialog-message').textContent = `The ${button.dataset.store === 'ios' ? 'App Store' : 'Google Play'} download link for ${name} will be added when it is available. Call 8888 for ${app === 'driver' ? 'driver registration information' : 'ride booking and app availability'}.`;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else window.location.href = 'tel:8888';
  }));
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const b = dialog.getBoundingClientRect(); if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) dialog.close(); } });
  document.querySelector('#year').textContent = String(new Date().getFullYear());
})();
