// ===== VIGNOVATE - site.js =====
// Interactions only. All content is plain static HTML (no framework, no build step, no data files).
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

(function initHeader() {
  const header = $('#siteHeader');
  const bar = $('#headerBar');
  let last = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    bar.classList.toggle('scrolled', y > 24);
    if (y > 120 && y > last) header.classList.add('hidden');
    else header.classList.remove('hidden');
    last = y;
  }, { passive: true });

  // mobile menu
  const menu = $('#mobileMenu');
  const open = () => menu.classList.remove('closed');
  const close = () => menu.classList.add('closed');
  $('#menuOpen')?.addEventListener('click', open);
  $('#menuClose')?.addEventListener('click', close);
  $$('.mobile-menu-overlay, [data-menu-close]').forEach((n) => n.addEventListener('click', close));

  // active nav highlight via IntersectionObserver
  const navLinks = $$('#primaryNav a[data-section]');
  const sections = navLinks.map((a) => document.getElementById(a.dataset.section)).filter(Boolean);
  if (sections.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navLinks.forEach((a) => a.classList.toggle('active', a.dataset.section === id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
  }
})();

(function initScrollProgress() {
  const bar = $('#scrollBar');
  if (!bar) return;
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

(function initReveal() {
  const seen = new WeakSet();
  const reveal = (node) => {
    if (seen.has(node)) return;
    seen.add(node);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0', 10);
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    io.observe(node);
  };
  const scan = () => $$('.reveal:not(.is-visible)').forEach((n) => { if (!seen.has(n)) reveal(n); });
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();

(function initBeforeAfter() {
  const slider = $('#baSlider');
  if (!slider) return;
  const before = $('#baBefore');
  const handle = $('#baHandle');
  let pos = 50, dragging = false;
  const update = (clientX) => {
    const r = slider.getBoundingClientRect();
    const p = ((clientX - r.left) / r.width) * 100;
    pos = Math.max(0, Math.min(100, p));
    before.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
    handle.style.left = pos + '%';
  };
  slider.addEventListener('mousedown', (e) => { dragging = true; update(e.clientX); });
  window.addEventListener('mousemove', (e) => { if (dragging) update(e.clientX); });
  window.addEventListener('mouseup', () => { dragging = false; });
  slider.addEventListener('touchstart', (e) => update(e.touches[0].clientX), { passive: true });
  slider.addEventListener('touchmove', (e) => update(e.touches[0].clientX), { passive: true });
})();

(function initFloatingWA() {
  const wa = $('#floatingWa');
  if (!wa) return;
  const tooltip = $('#waTooltip');
  let shown = false;
  window.addEventListener('scroll', () => {
    const s = window.scrollY > 400;
    wa.classList.toggle('hidden', !s);
    if (s && !shown) { shown = true; setTimeout(() => tooltip?.classList.add('show'), 1500); }
  }, { passive: true });
  $('#waDismiss')?.addEventListener('click', (e) => { e.preventDefault(); tooltip?.classList.remove('show'); });
})();

(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

(function initHeroParallax() {
  const stage = $('#heroStage');
  if (!stage) return;
  const cards = $$('[data-depth]', stage);
  if (!cards.length) return;
  stage.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) / r.width;
    const dy = (e.clientY - cy) / r.height;
    cards.forEach((c) => {
      const depth = parseFloat(c.dataset.depth || '1');
      c.style.transform = `translate(${dx * depth * 18}px, ${dy * depth * 18}px)`;
    });
  });
})();

// ---- footer year ----
(function initYear() { const y = $('#year'); if (y) y.textContent = new Date().getFullYear(); })();

// ---- stats count-up (markup is static; this only animates the numbers) ----
(function initStats() {
  const nodes = $$('#statsGrid .stat-num');
  if (!nodes.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const parent = node.closest('[data-target]');
      const target = parseInt(parent.dataset.target, 10);
      const suffix = parent.dataset.suffix || '';
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 1500, 1);
        node.innerHTML = Math.round(target * (1 - Math.pow(1 - p, 3))) + `<span style="color:var(--accent-400)">${suffix}</span>`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(node);
    });
  }, { threshold: 0.4 });
  nodes.forEach((n) => io.observe(n));
})();

// ---- portfolio filter (cards are static; this only shows/hides them) ----
(function initPortfolioFilter() {
  const bar = $('#portfolioFilters'), grid = $('#portfolioGrid');
  if (!bar || !grid) return;
  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    const f = btn.dataset.filter;
    $$('button', bar).forEach((b) => {
      const on = b === btn;
      b.setAttribute('aria-pressed', on);
      b.style.background = on ? 'var(--primary-900)' : 'var(--primary-50)';
      b.style.color = on ? '#fff' : 'var(--primary-600)';
      b.style.boxShadow = on ? 'var(--shadow-card)' : 'none';
    });
    $$('[data-type]', grid).forEach((c) => { c.style.display = (f === 'All' || c.dataset.type === f) ? '' : 'none'; });
  });
})();

// ---- FAQ accordion (items are static) ----
(function initFAQ() {
  const list = $('#faqList');
  if (!list) return;
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-q');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    const ans = item.querySelector('.faq-a');
    const wasOpen = ans.classList.contains('open');
    $$('.faq-a', list).forEach((x) => x.classList.remove('open'));
    $$('.faq-item', list).forEach((x) => x.classList.remove('open'));
    $$('.faq-q', list).forEach((q) => q.setAttribute('aria-expanded', 'false'));
    if (!wasOpen) { ans.classList.add('open'); item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  });
})();

// ---- contact form ----
// Sends via Web3Forms when a real access key is set in the hidden "access_key" input.
// With the placeholder key it falls back to opening the visitor's email app (mailto), so the form is never a dead end.
(function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;
  const fields = $('#formFields'), success = $('#formSuccess'), errorBox = $('#formError'), submit = $('#cfSubmit'), retry = $('#cfRetry');
  const submitHTML = submit.innerHTML;
  const spinner = 'Sending...';
  const EMAIL = 'vignovate@gmail.com';

  const showErr = (input, msg) => {
    input.style.borderColor = 'var(--color-danger)';
    input.setAttribute('aria-invalid', 'true');
    let hint = input.parentElement.querySelector('.field-error');
    if (!hint) { hint = document.createElement('p'); hint.className = 'field-error'; hint.style.cssText = 'margin-top:0.375rem;font-size:0.75rem;color:var(--color-danger)'; input.parentElement.appendChild(hint); }
    hint.textContent = msg;
  };
  const clearErr = (input) => { input.style.borderColor = ''; input.removeAttribute('aria-invalid'); const h = input.parentElement.querySelector('.field-error'); if (h) h.remove(); };

  const validate = () => {
    const f = { name: $('#cf-name'), email: $('#cf-email'), company: $('#cf-company'), phone: $('#cf-phone'), message: $('#cf-message') };
    Object.values(f).forEach(clearErr);
    let ok = true;
    if (!f.name.value.trim()) { showErr(f.name, 'Please enter your name'); ok = false; }
    if (!f.email.value.trim()) { showErr(f.email, 'Please enter your business email'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) { showErr(f.email, 'Please enter a valid email address'); ok = false; }
    if (!f.company.value.trim()) { showErr(f.company, 'Please enter your company name'); ok = false; }
    if (f.phone.value.trim() && !/^[+]?[\d\s\-()]{8,}$/.test(f.phone.value.trim())) { showErr(f.phone, 'Please enter a valid phone number'); ok = false; }
    if (!f.message.value.trim()) { showErr(f.message, 'Please tell us a little about your project'); ok = false; }
    return ok;
  };
  const reset = () => { fields.style.display = 'flex'; success.style.display = 'none'; errorBox.style.display = 'none'; submit.disabled = false; submit.innerHTML = submitHTML; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submit.disabled || !validate()) return;
    const data = new FormData(form);
    if (data.get('botcheck')) return;
    submit.disabled = true; submit.textContent = spinner;

    if (data.get('access_key') === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      const body = ['Name: ' + data.get('name'), 'Email: ' + data.get('email'), 'Company: ' + data.get('company'),
        'Phone: ' + (data.get('phone') || '-'), 'Service: ' + data.get('service'), '', data.get('message')].join('\n');
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('New enquiry from VIGNOVATE website') + '&body=' + encodeURIComponent(body);
      submit.disabled = false; submit.innerHTML = submitHTML;
      return;
    }
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: data });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Submission failed');
      fields.style.display = 'none'; success.style.display = 'flex'; form.reset();
      setTimeout(() => { if (success.style.display === 'flex') reset(); }, 6000);
    } catch (err) {
      fields.style.display = 'none'; errorBox.style.display = 'flex'; submit.disabled = false; submit.innerHTML = submitHTML;
    }
  });
  if (retry) retry.addEventListener('click', reset);
})();
