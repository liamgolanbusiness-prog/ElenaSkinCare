/* ============================================
   Elena Aesthetic Studio – Interactions
   ============================================ */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* -------- Year in footer -------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------- Header scrolled state -------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 30) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');

    // Scroll progress bar
    const h = document.documentElement;
    const total = h.scrollHeight - h.clientHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    progressEl.style.setProperty('--p', pct.toFixed(2) + '%');

    // Back to top
    if (window.scrollY > 600) backTop.classList.add('is-visible');
    else backTop.classList.remove('is-visible');
  };
  const progressEl = document.querySelector('.scroll-progress > span');
  const backTop = document.getElementById('backTop');
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  /* -------- Mobile nav -------- */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const closeNav = () => {
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  const openNav = () => {
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('is-open') ? closeNav() : openNav();
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) closeNav();
  });

  /* -------- Reveal on scroll -------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          // small stagger when multiple in same batch
          setTimeout(() => e.target.classList.add('is-visible'), i * 60);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* -------- Counters -------- */
  const counters = document.querySelectorAll('[data-counter]');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const startTime = performance.now();
    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString('he-IL') + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && !prefersReduced) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          co.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => co.observe(el));
  } else {
    counters.forEach(el => {
      el.textContent = el.dataset.counter + (el.dataset.suffix || '');
    });
  }

  /* -------- 3D Tilt (desktop only) -------- */
  if (isFinePointer && !prefersReduced) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      const max = 8; // degrees
      let rect;
      const onEnter = () => { rect = el.getBoundingClientRect(); };
      const onMove = (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rx = (-y * max).toFixed(2);
        const ry = (x * max).toFixed(2);
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      };
      const onLeave = () => {
        el.style.transform = '';
        rect = null;
      };
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });
  }

  /* -------- Custom cursor -------- */
  if (isFinePointer && !prefersReduced) {
    const cursor = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    let mx = 0, my = 0, cx = 0, cy = 0;
    const lerp = (a, b, n) => a + (b - a) * n;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    const tick = () => {
      cx = lerp(cx, mx, 0.18);
      cy = lerp(cy, my, 0.18);
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    document.querySelectorAll('a, button, [data-tilt], summary').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    });
  }

  /* -------- Parallax orbs (subtle) -------- */
  if (!prefersReduced) {
    const orbs = document.querySelectorAll('.orb');
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          orbs.forEach((orb, i) => {
            const speed = (i + 1) * 0.06;
            orb.style.translate = `0 ${y * speed}px`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* -------- Smooth scroll for in-page anchors (close mobile if open) -------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const headerH = header.offsetHeight;
          const top = target.getBoundingClientRect().top + window.scrollY - headerH + 1;
          window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
          if (mobileNav.classList.contains('is-open')) closeNav();
        }
      }
    });
  });

  /* -------- Contact form (front-end demo handler) -------- */
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Basic validation
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      if (!name || phone.length < 7) {
        form.querySelector('input:invalid')?.focus();
        return;
      }
      // In production: send to a real endpoint or open WhatsApp pre-filled
      const msg = `שלום! שמי ${name}.%0A` +
                  `טלפון: ${phone}%0A` +
                  (form.service.value ? `מעוניינ/ת בטיפול: ${form.service.value}%0A` : '') +
                  (form.message.value ? `הודעה: ${encodeURIComponent(form.message.value)}` : '');
      // Show success in-page
      success.hidden = false;
      form.reset();
      // Open WhatsApp in a new tab as conversion fallback
      window.open(`https://wa.me/972559782323?text=${msg}`, '_blank', 'noopener');
      setTimeout(() => { success.hidden = true; }, 6000);
    });
  }

  /* -------- Image fallback for Unsplash failures -------- */
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.background = 'linear-gradient(135deg, #E8B4B0, #C9A875)';
      img.style.minHeight = '200px';
      img.removeAttribute('src');
      img.alt = '';
    }, { once: true });
  });

})();
