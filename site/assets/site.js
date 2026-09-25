/* Shared behaviour for every page */
(() => {
  'use strict';

  // Mobile menu
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('site-nav');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
    });
    nav.addEventListener('click', e => {
      if (e.target.closest('a')) { btn.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }
    });
  }

  // Mark the current page in the nav
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
  });

  // Pause every looping animation on hidden tabs
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('paused', document.hidden);
  });

  // Entrance choreography for normal-flow sections; stagger delays retire after it plays
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add('in');
        io.unobserve(el);
        setTimeout(() => el.classList.add('done'), 1400);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in', 'done'));
  }

  // Doctor search on the doctors page: filter the list by the query
  const list = document.querySelector('[data-doctor-list]');
  const input = document.getElementById('doctor-q');
  if (list && input) {
    const params = new URLSearchParams(location.search);
    if (params.get('q')) input.value = params.get('q');
    const filter = () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      list.querySelectorAll('li').forEach(li => {
        const hit = !q || li.textContent.toLowerCase().includes(q);
        li.hidden = !hit;
        if (hit) shown++;
      });
      const status = document.getElementById('doctor-status');
      if (status) status.textContent = q ? `${shown} result${shown === 1 ? '' : 's'} for "${input.value.trim()}"` : '';
    };
    input.addEventListener('input', filter);
    filter();
  }
})();
