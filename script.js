/* ═══════════════════════════════════════════════════════════
   BUTTER & BLISS BAKERY — script.js
   Slideshow · Navigation · Scroll Reveals · Interactions
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     ⬇  EASY IMAGE MANAGEMENT
     Add, remove or rename image filenames here.
     Images must live in:  assets/images/
  ═══════════════════════════════════════════ */
  const cakeImages = [
    { src: 'assets/images/cake-1.jpeg', alt: 'Nut and dry fruit cake from Butter & Bliss Bakery' },
    { src: 'assets/images/cake-2.jpeg', alt: 'Chocolate chip cake from Butter & Bliss Bakery' },
    { src: 'assets/images/cake-3.jpeg', alt: 'Celebration cake from Butter & Bliss Bakery' },
    { src: 'assets/images/cake-4.jpeg', alt: 'Custom handmade cake from Butter & Bliss Bakery' },
    { src: 'assets/images/cake-5.jpeg', alt: 'Signature fresh bake from Butter & Bliss Bakery' },
  ];
  /* ═══════════════════════════════════════════ */


  /* ─────────────────────────────────────────
     1. SLIDESHOW
  ───────────────────────────────────────── */
  function initSlideshow() {
    const container = document.getElementById('slideshow');
    const dotsWrap  = document.getElementById('slideDots');
    const prevBtn   = document.getElementById('slidePrev');
    const nextBtn   = document.getElementById('slideNext');

    if (!container || cakeImages.length === 0) return;

    let current    = 0;
    let autoTimer  = null;
    const INTERVAL = 4500; // ms between auto-advances

    // Build slides
    cakeImages.forEach((img, i) => {
      const slide = document.createElement('div');
      slide.className = 'slide' + (i === 0 ? ' active' : '');
      slide.setAttribute('aria-hidden', i !== 0 ? 'true' : 'false');

      const image = document.createElement('img');
      image.src = img.src;
      image.alt = img.alt;
      image.loading = i === 0 ? 'eager' : 'lazy';

      slide.appendChild(image);
      container.appendChild(slide);

      // Dot
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to image ${i + 1}`);
      dot.setAttribute('role', 'listitem');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function getSlides() { return container.querySelectorAll('.slide'); }
    function getDots()   { return dotsWrap.querySelectorAll('.dot'); }

    function goTo(index) {
      const slides = getSlides();
      const dots   = getDots();

      slides[current].classList.remove('active');
      slides[current].setAttribute('aria-hidden', 'true');
      dots[current].classList.remove('active');

      current = (index + slides.length) % slides.length;

      slides[current].classList.add('active');
      slides[current].setAttribute('aria-hidden', 'false');
      dots[current].classList.add('active');
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(() => goTo(current + 1), INTERVAL);
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    // Controls
    prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

    // Pause on hover
    container.addEventListener('mouseenter', stopAuto);
    container.addEventListener('mouseleave', startAuto);

    // Swipe support (touch devices)
    let touchStartX = 0;
    container.addEventListener('touchstart',
      (e) => { touchStartX = e.changedTouches[0].screenX; },
      { passive: true }
    );
    container.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
        startAuto();
      }
    });

    // Keyboard navigation when focused
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { goTo(current - 1); startAuto(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); startAuto(); }
    });

    startAuto();
  }


  /* ─────────────────────────────────────────
     2. NAVIGATION — sticky header + active link
  ───────────────────────────────────────── */
  function initNav() {
    const header    = document.getElementById('nav-header');
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks  = document.querySelectorAll('.nav-link, .mobile-link');
    const sections  = document.querySelectorAll('section[id]');

    /* Scroll: header opacity + back-to-top */
    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Burger toggle */
    function closeMobileMenu() {
      mobileMenu.classList.remove('open');
      burgerBtn.classList.remove('open');
      burgerBtn.setAttribute('aria-expanded', 'false');
    }

    burgerBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      burgerBtn.classList.toggle('open', isOpen);
      burgerBtn.setAttribute('aria-expanded', String(isOpen));
    });

    /* Close mobile menu when a link is tapped */
    mobileMenu.querySelectorAll('a').forEach(link =>
      link.addEventListener('click', closeMobileMenu)
    );
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) closeMobileMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });

    /* Active nav link on scroll */
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
              const href = link.getAttribute('href');
              link.classList.toggle('active', href === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    sections.forEach(s => sectionObserver.observe(s));
  }


  /* ─────────────────────────────────────────
     3. SCROLL REVEAL
     Fades sections and cards into view as
     they enter the viewport.
  ───────────────────────────────────────── */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('[data-reveal]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el    = entry.target;
          const delay = parseInt(el.dataset.delay || '0', 10);

          setTimeout(() => el.classList.add('in-view'), delay);
          observer.unobserve(el);
        });
      },
      { threshold: 0.10, rootMargin: '0px 0px -56px 0px' }
    );

    revealEls.forEach(el => observer.observe(el));
  }


  /* ─────────────────────────────────────────
     4. SMOOTH SCROLL — anchor links
  ───────────────────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }


  /* ─────────────────────────────────────────
     5. FLOATING WHATSAPP BUTTON — show/hide
  ───────────────────────────────────────── */
  function initFab() {
    const fab = document.getElementById('fabWhatsapp');
    if (!fab) return;

    // Show the FAB only after scrolling past the hero CTA
    const heroSection = document.getElementById('home');
    const fabObserver = new IntersectionObserver(
      ([entry]) => {
        fab.style.opacity       = entry.isIntersecting ? '0' : '1';
        fab.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
      },
      { threshold: 0.2 }
    );
    if (heroSection) fabObserver.observe(heroSection);
  }



  /* ─────────────────────────────────────────
   HERO CAKE SLIDESHOW
───────────────────────────────────────── */
function initHeroSlideshow() {

  const container = document.querySelector('.hero-slideshow');
  const slides = document.querySelectorAll('.hero-slide');
  const prevBtn = document.querySelector('.hero-prev');
  const nextBtn = document.querySelector('.hero-next');
  const dots = document.querySelectorAll('.hero-dot');

  if (!container || slides.length === 0) {
    console.log('Hero slideshow elements not found');
    return;
  }

  let current = 0;
  let timer = null;

  function showSlide(index, direction = 1) {

    const nextIndex = (index + slides.length) % slides.length;

    if (nextIndex === current && slides.length > 1) return;

    const currentSlide = slides[current];
    const nextSlide = slides[nextIndex];

    // Reset all slides
    slides.forEach(slide => {
      slide.classList.remove(
        'active',
        'slide-from-left',
        'slide-from-right'
      );
    });

    // Position new slide outside the frame
    if (direction === 1) {
    nextSlide.classList.add('slide-from-right');
    } else {
    nextSlide.classList.add('slide-from-left');
    }

    // Force browser to apply the starting position
    void nextSlide.offsetWidth;

    // Remove the starting-position class
    // so the active slide can move into view
    nextSlide.classList.remove(
    'slide-from-left',
    'slide-from-right'
    );

    // Now activate the slide
    nextSlide.classList.add('active');

    current = nextIndex;

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function next() {
    showSlide(current + 1, 1);
    restartAuto();
  }

  function previous() {
    showSlide(current - 1, -1);
    restartAuto();
  }

  function restartAuto() {
    clearInterval(timer);

    timer = setInterval(() => {
      showSlide(current + 1, 1);
    }, 4000);
  }

  /* Arrow buttons */
  if (nextBtn) {
    nextBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      next();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      previous();
    });
  }

  /* Dots */
  dots.forEach((dot, index) => {
    dot.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const direction = index > current ? 1 : -1;

      showSlide(index, direction);
      restartAuto();
    });
  });

  /* Swipe on mobile */
  let startX = 0;

  container.addEventListener('touchstart', function (e) {
    startX = e.changedTouches[0].screenX;
  }, { passive: true });

  container.addEventListener('touchend', function (e) {

    const endX = e.changedTouches[0].screenX;
    const difference = startX - endX;

    if (Math.abs(difference) > 40) {
      if (difference > 0) {
        next();
      } else {
        previous();
      }
    }
  }, { passive: true });

  /* Start */
  slides.forEach((slide, i) => {
    slide.classList.remove(
      'active',
      'slide-from-left',
      'slide-from-right'
    );
  });

  slides[0].classList.add('active');

  if (dots.length > 0) {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === 0);
    });
  }

  restartAuto();
}




  /* ─────────────────────────────────────────
     6. INIT
  ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
  initSlideshow();
  initHeroSlideshow();
  initNav();
  initScrollReveal();
  initSmoothScroll();
  initFab();
});

})();
