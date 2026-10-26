/* =====================================================================
   WBC.ART — site.js  (vanilla + GSAP/ScrollTrigger)
   ===================================================================== */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof gsap !== 'undefined';
  if (hasGsap && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
  /* never slow the clock down after a throttled (background) frame: reveals must always finish */
  if (hasGsap) gsap.ticker.lagSmoothing(0);
  var body = document.body;
  var isDesktop = function () { return window.innerWidth >= 992; };

  /* ---------- menu (INDEX button / hamburger / Esc / outside click) ---------- */
  var navbar = $('#navbar'), menu = $('#menu'), indexBtn = $('.index-btn');
  var dim = document.createElement('div'); dim.className = 'overlay-dim'; body.appendChild(dim);
  var open = false;
  function placeMenu() {
    var bar = $('.navbar-bar', navbar);
    menu.style.top = (Math.round(bar.getBoundingClientRect().bottom) - (isDesktop() ? 1 : -6)) + 'px';
  }
  function cols() { return $$('.menu-grid > *, .menu-mobile', menu).filter(function (el) { return el.offsetParent !== null; }); }
  function openMenu() {
    if (open || !menu) return; open = true;
    body.classList.add('menu-open'); navbar.classList.add('is-open');
    menu.hidden = false; placeMenu(); dim.style.display = 'block';
    if (!hasGsap) { dim.style.opacity = .5; return; }
    var c = cols();
    gsap.killTweensOf([menu, navbar, dim].concat(c));
    gsap.set([navbar, menu], { clearProps: 'opacity,y' });
    gsap.to(dim, { opacity: .5, duration: .5, ease: 'power1.out' });
    menu.style.height = ''; menu.style.overflow = 'hidden';
    var full = menu.offsetHeight;
    gsap.fromTo(menu, { height: 0 }, { height: full, duration: .5, ease: 'expo.out', onComplete: function () { menu.style.height = ''; menu.style.overflow = ''; } });
    gsap.fromTo(c, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .4, delay: .08, stagger: .05, ease: 'power1.out' });
  }
  function closeMenu() {
    if (!open) return; open = false;
    body.classList.remove('menu-open');
    var done = function () {
      menu.hidden = true; dim.style.display = 'none';
      if (!body.classList.contains('page-case') || !isDesktop()) navbar.classList.remove('is-open');
      if (body.classList.contains('page-case')) navbar.classList.remove('is-open');
      if (hasGsap) gsap.set([navbar, menu, dim], { clearProps: 'opacity,transform,y' });
    };
    if (!hasGsap) { done(); return; }
    var unit = isDesktop() && !body.classList.contains('page-case') ? [navbar, menu] : [menu];
    gsap.to(unit, { opacity: 0, y: -24, duration: .18, ease: 'power2.in', onComplete: done });
    gsap.to(dim, { opacity: 0, duration: .18, ease: 'power2.in' });
  }
  if (menu) {
    if (indexBtn) indexBtn.addEventListener('click', function (e) { e.stopPropagation(); openMenu(); });
    $$('.hamburger, .navbar-menu').forEach(function (h) { h.addEventListener('click', function (e) { e.stopPropagation(); open ? closeMenu() : openMenu(); }); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('click', function (e) { if (open && !navbar.contains(e.target) && !menu.contains(e.target)) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (open) placeMenu(); });
  }

  /* ---------- INDEX appears after scrolling; 3-column nav slides away ---------- */
  var topnav = $('.topnav'), navHidden = false;
  function onScroll() {
    var y = window.scrollY;
    if (indexBtn) indexBtn.classList.toggle('is-visible', y > 70);
    if (topnav) {
      var hide = y > 70;
      if (hide !== navHidden) {
        navHidden = hide; topnav.classList.toggle('is-hidden', hide);
        $$('ul', topnav).forEach(function (ul) {
          $$('li', ul).forEach(function (li, i) {
            setTimeout(function () { li.style.opacity = hide ? '0' : '1'; li.style.transform = hide ? 'translateX(20px)' : 'translateX(0)'; }, i * 100);
          });
        });
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- badge: drifts with the scroll velocity, springs back ---------- */
  var badge = $('.badge');
  if (badge && !reduce) {
    var pos = 0, vel = 0, lastY = window.scrollY, lastT = 0, raf = 0, CAP = 22;
    var step = function (t) {
      var dt = lastT ? Math.min((t - lastT) / 1000, 1 / 30) : 1 / 60; lastT = t;
      var y = window.scrollY, dy = y - lastY; lastY = y;
      if (dy) { var push = -dy * 1.3; if (push * pos > 0) push *= Math.max(0, 1 - Math.abs(pos) / CAP); vel += push; }
      vel += (-22 * pos - 7.3 * vel) * dt; pos += vel * dt;
      if (Math.abs(pos) < .05 && Math.abs(vel) < .05 && !dy) { pos = vel = 0; badge.style.translate = ''; raf = 0; lastT = 0; return; }
      badge.style.translate = '0 ' + (CAP * Math.tanh(pos / CAP)).toFixed(2) + 'px';
      raf = requestAnimationFrame(step);
    };
    window.addEventListener('scroll', function () { if (!raf && badge.offsetParent !== null) raf = requestAnimationFrame(step); }, { passive: true });
  }

  /* ---------- hero arches: three rows drifting sideways with the scroll ---------- */
  var pattern = $('.pattern');
  if (pattern) {
    var arch = '<svg viewBox="0 0 221 1579" fill="none" aria-hidden="true"><path d="M1.5 1578V700C1.5 470 30 190 110.5 2C191 190 219.5 470 219.5 700V1578" stroke="url(#archg)" stroke-width=".9"/><path d="M28 1578V720C28 520 52 300 110.5 140C169 300 193 520 193 720V1578" stroke="url(#archg)" stroke-width=".5" opacity=".55"/></svg>';
    var defs = '<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="archg" x1="110" y1="0" x2="110" y2="1579" gradientUnits="userSpaceOnUse"><stop stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs></svg>';
    pattern.insertAdjacentHTML('beforeend', defs);
    for (var r = 0; r < 3; r++) {
      var row = document.createElement('div'); row.className = 'pattern-row';
      row.innerHTML = new Array(21).join(arch);
      pattern.appendChild(row);
    }
    var rows = $$('.pattern-row', pattern);
    var drift = function () {
      var y = window.scrollY * .3;
      rows[0].style.transform = 'translateX(' + y + 'px)';
      rows[1].style.transform = 'translateX(' + (-y * .8) + 'px)';
      rows[2].style.transform = 'translateX(' + (y * .6) + 'px)';
    };
    if (!reduce) window.addEventListener('scroll', drift, { passive: true });
    drift();
  }

  /* ---------- hero headline: a 1px hairline traces every letter, then the fill floods in ---------- */
  var heroWrap = $('[data-reveal="hairline"]');
  var heroH1 = heroWrap && $('h1', heroWrap);
  var after = $$('[data-reveal="after-hero"]');
  if (heroWrap) {
    if (!hasGsap || reduce) {
      heroWrap.style.opacity = 1; after.forEach(function (el) { el.style.opacity = 1; });
    } else {
      gsap.set(after, { filter: 'blur(10px)', y: -20 });
      var start = function () {
        var NS = 'http://www.w3.org/2000/svg', lines = $$('span', heroH1);
        var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'hairline'); svg.setAttribute('aria-hidden', 'true');
        heroH1.appendChild(svg);
        var texts = lines.map(function (s) {
          var t = document.createElementNS(NS, 'text'); t.textContent = s.textContent;
          t.setAttribute('fill', '#fff'); t.setAttribute('fill-opacity', '0'); t.setAttribute('stroke', '#fff'); t.setAttribute('stroke-width', '1');
          svg.appendChild(t); return t;
        });
        var layout = function () {
          var hr = heroH1.getBoundingClientRect();
          svg.setAttribute('width', Math.ceil(hr.width)); svg.setAttribute('height', Math.ceil(hr.height));
          lines.forEach(function (s, i) {
            var probe = document.createElement('span'); probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
            s.appendChild(probe);
            var sr = s.getBoundingClientRect(), base = probe.getBoundingClientRect().top; s.removeChild(probe);
            var cs = getComputedStyle(s), t = texts[i];
            t.style.fontFamily = cs.fontFamily; t.style.fontSize = cs.fontSize; t.style.fontWeight = cs.fontWeight; t.style.letterSpacing = cs.letterSpacing;
            t.setAttribute('x', (sr.left - hr.left).toFixed(2)); t.setAttribute('y', (base - hr.top).toFixed(2));
            t.removeAttribute('textLength');
            if (Math.abs(t.getBoundingClientRect().width - sr.width) > 1) { t.setAttribute('textLength', sr.width.toFixed(2)); t.setAttribute('lengthAdjust', 'spacing'); }
            var dash = parseFloat(cs.fontSize) * 11; t.style.strokeDasharray = dash; t._dash = dash;
          });
        };
        layout();
        texts.forEach(function (t) { t.style.strokeDashoffset = t._dash; });
        lines.forEach(function (s) { s.style.color = 'transparent'; });
        gsap.set(heroWrap, { opacity: 1 });
        window.addEventListener('resize', layout);
        var DRAW = 1.8, ST = .18;
        gsap.timeline({ delay: .25, onComplete: function () { window.removeEventListener('resize', layout); lines.forEach(function (s) { s.style.color = ''; }); svg.remove(); } })
          .to(texts, { strokeDashoffset: 0, duration: DRAW, ease: 'power2.inOut', stagger: ST }, 0)
          .to(texts, { attr: { 'fill-opacity': 1 }, duration: .9, ease: 'power1.inOut', stagger: ST }, DRAW - .55)
          .to(texts, { attr: { 'stroke-opacity': 0 }, duration: .6, ease: 'power1.out', stagger: ST }, DRAW + .1)
          .to(after, { opacity: 1, filter: 'blur(0px)', y: 0, duration: .8, ease: 'power2.out', stagger: .1 }, DRAW + .4);
      };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
    }
  }

  /* ---------- scroll reveals ---------- */
  if (hasGsap && !reduce) {
    var once = function (el) { return { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }; };
    var delay = function (el) { return parseFloat(el.getAttribute('data-delay')) || 0; };
    $$('[data-reveal="fade-slow"]').forEach(function (el) { gsap.to(el, { opacity: 1, duration: 2, ease: 'power1.inOut', scrollTrigger: once(el) }); });
    $$('[data-reveal="fade-circ"]').forEach(function (el) { gsap.to(el, { opacity: 1, duration: 1, ease: 'circ.out', delay: delay(el), scrollTrigger: once(el) }); });
    $$('[data-reveal="fade-in"]').forEach(function (el) { gsap.to(el, { opacity: 1, duration: 1, ease: 'sine.out', delay: delay(el), scrollTrigger: once(el) }); });
    $$('[data-reveal="blur-slide"]').forEach(function (el) {
      gsap.set(el, { filter: 'blur(10px)', y: -20 });
      gsap.to(el, { opacity: 1, filter: 'blur(0px)', y: 0, duration: .8, ease: 'power2.out', delay: delay(el), scrollTrigger: once(el) });
    });
    $$('[data-reveal="clip-expo"]').forEach(function (el) {
      gsap.set(el, { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' });
      gsap.to(el, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 1.5, ease: 'expo.out', delay: delay(el), scrollTrigger: once(el) });
    });
    $$('[data-reveal="clip-bright"]').forEach(function (el) {
      gsap.set(el, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', filter: 'brightness(30%)' });
      gsap.to(el, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', filter: 'brightness(100%)', duration: 1.5, ease: 'power3.out', scrollTrigger: once(el) });
    });
    $$('[data-reveal="fade-scrub"]').forEach(function (el) {
      gsap.to(el, { opacity: 1, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 55%', scrub: true } });
    });
    $$('[data-reveal="rise"]').forEach(function (el) {
      gsap.set(el, { y: 60 });
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'expo.inOut', delay: delay(el), scrollTrigger: once(el) });
    });
    $$('[data-tilt]').forEach(function (el) {
      gsap.set(el, { transformPerspective: 800 });
      gsap.timeline({ repeat: -1 })
        .to(el, { rotateY: 10, skewY: -4, y: -20, duration: 3, ease: 'power1.inOut' })
        .to(el, { rotateY: 0, skewY: 0, y: 0, duration: 4, ease: 'power1.inOut' });
    });
    $$('[data-parallax]').forEach(function (el) {
      gsap.fromTo(el, { y: parseFloat(el.getAttribute('data-parallax')) }, { y: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom 60%', scrub: 1.2 } });
    });
  } else {
    $$('[data-reveal]').forEach(function (el) { el.style.opacity = 1; });
  }

  /* ---------- footer arches: outlines drift into place and the gradient lifts while scrolling in ---------- */
  if (hasGsap && !reduce) {
    $$('[data-arch]').forEach(function (a) {
      var st = { trigger: a, start: 'top bottom', end: 'bottom bottom', scrub: 1 };
      gsap.fromTo($('.arch-outline--outer', a), { y: 60 }, { y: 0, ease: 'none', scrollTrigger: st });
      gsap.fromTo($('.arch-outline--mid', a), { y: 30 }, { y: 0, ease: 'none', scrollTrigger: st });
      gsap.fromTo($('.arch-mid', a), { attr: { offset: .85 } }, { attr: { offset: .4 }, ease: 'none', scrollTrigger: st });
      gsap.fromTo($$('.arch-links > *', a), { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: .08, duration: .9, ease: 'power2.out', scrollTrigger: { trigger: a, start: 'top 60%', toggleActions: 'play none none none' } });
    });
    $$('.pillar').forEach(function (p) {
      gsap.fromTo(p, { y: 80, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom bottom', scrub: 1 } });
    });
  }

  /* ---------- fade slider: click = next, drag/flick, line dots, wraps around ---------- */
  $$('[data-slider]').forEach(function (root) {
    var vp = $('.slider-viewport', root), slides = $$('.slide', root), dots = $$('.slider-dot', root), count = $('.slider-count', root);
    var n = slides.length, cur = 0; if (n < 2) { if (slides[0]) slides[0].classList.add('is-active'); return; }
    function show(i) {
      cur = (i % n + n) % n;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === cur); s.style.opacity = ''; });
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === cur); });
      if (count) count.textContent = String(cur + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
    }
    var down = false, sx = 0, dx = 0, t0 = 0;
    vp.addEventListener('pointerdown', function (e) { if (e.button !== 0) return; down = true; sx = e.clientX; dx = 0; t0 = e.timeStamp; vp.setPointerCapture(e.pointerId); });
    vp.addEventListener('pointermove', function (e) {
      if (!down) return; dx = e.clientX - sx;
      if (Math.abs(dx) < 4) return;
      vp.classList.add('is-dragging');
      var p = Math.min(1, Math.abs(dx) / vp.clientWidth), nb = slides[((cur + (dx < 0 ? 1 : -1)) % n + n) % n];
      slides.forEach(function (s) { s.style.opacity = 0; });
      slides[cur].style.opacity = 1 - p; nb.style.opacity = p;
    });
    function release(e) {
      if (!down) return; down = false; vp.classList.remove('is-dragging');
      var w = vp.clientWidth, flick = dx / Math.max(1, e.timeStamp - t0);
      if (Math.abs(dx) < 4) show(cur + (e.clientX - vp.getBoundingClientRect().left < w * .2 ? -1 : 1));
      else if (dx < -w * .1 || flick < -.4) show(cur + 1);
      else if (dx > w * .1 || flick > .4) show(cur - 1);
      else show(cur);
    }
    vp.addEventListener('pointerup', release);
    vp.addEventListener('pointercancel', function () { down = false; vp.classList.remove('is-dragging'); show(cur); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); }); });
    vp.setAttribute('tabindex', '0');
    vp.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
    show(0);
  });

  /* ---------- lightbox for [data-lightbox] images ---------- */
  var lbImgs = $$('[data-lightbox] img');
  if (lbImgs.length) {
    var lb = document.createElement('div'); lb.className = 'lightbox'; lb.innerHTML = '<img alt=""><p class="lightbox-cap"></p>';
    body.appendChild(lb);
    var lbImg = $('img', lb), lbCap = $('.lightbox-cap', lb), lbIdx = 0;
    var lbShow = function (i) { lbIdx = (i + lbImgs.length) % lbImgs.length; var im = lbImgs[lbIdx]; lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt; lbCap.textContent = im.getAttribute('data-caption') || ''; };
    lbImgs.forEach(function (im, i) { im.addEventListener('click', function () { lbShow(i); lb.classList.add('is-open'); }); });
    lb.addEventListener('click', function () { lb.classList.remove('is-open'); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') lb.classList.remove('is-open');
      if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
      if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
    });
  }

  /* ---------- back to top ---------- */
  $$('[data-top]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }); });
})();
