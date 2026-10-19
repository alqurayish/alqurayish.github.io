(() => {
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.progress');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const desktop = window.matchMedia('(min-width: 960px)');

  // Mobile navigation
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  navLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  desktop.addEventListener('change', () => setMenu(false));

  // Header state and reading progress
  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progress.style.setProperty('--progress', ratio.toFixed(4));
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  // Highlight the section currently in view
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  // Scroll reveals, staggered within each parent
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const groups = new Map();
    reveals.forEach((el) => {
      const i = groups.get(el.parentElement) || 0;
      el.style.setProperty('--stagger', `${Math.min(i, 4) * 80}ms`);
      groups.set(el.parentElement, i + 1);
    });
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // Approach tabs (WAI-ARIA tabs pattern)
  document.querySelectorAll('[data-tabs]').forEach((root) => {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    const select = (index, focus) => {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[i].hidden = !active;
      });
      if (focus) tabs[index].focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i, false));
      tab.addEventListener('keydown', (e) => {
        const keys = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        select((keys[e.key] + tabs.length) % tabs.length, true);
      });
    });
    select(0, false);
  });

  // Print: expand case studies so they appear on paper
  const opened = [];
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('details.case:not([open])').forEach((d) => { d.open = true; opened.push(d); });
  });
  window.addEventListener('afterprint', () => {
    opened.splice(0).forEach((d) => { d.open = false; });
  });
  document.querySelectorAll('[data-print]').forEach((btn) => btn.addEventListener('click', () => window.print()));

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Count-up for hero stats
  const counters = document.querySelectorAll('[data-count]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const countIo = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const el = entry.target;
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const start = performance.now();
        const duration = 1400;
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = `${Math.round(target * eased)}${suffix}`;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countIo.observe(el));
  }

  // Pointer spotlight on glass cards
  if (finePointer) {
    document.querySelectorAll('.pillar, .role-body, .product, .skill-card, .cred-block, .glance, .contact-inner, .hero-stats').forEach((card) => {
      card.classList.add('spot');
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  // Subtle 3D tilt on the portrait
  const frame = document.querySelector('.portrait-frame');
  if (frame && finePointer && !reduceMotion) {
    frame.addEventListener('pointermove', (e) => {
      const r = frame.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      frame.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg)`;
    });
    frame.addEventListener('pointerleave', () => { frame.style.transform = ''; });
  }
})();
